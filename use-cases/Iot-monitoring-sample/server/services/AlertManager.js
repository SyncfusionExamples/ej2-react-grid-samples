/**
 * Alert Manager v3
 *
 * Threshold-crossing alert logic with hysteresis and noise reduction.
 *
 * For each device + alert type the manager tracks a small finite state:
 *
 *   - 'NORMAL'    – last reading was below the threshold (or in the
 *                   hysteresis band while recovering)
 *   - 'EXCEEDED'  – we have already raised an alert for the current
 *                   excursion; suppress further alerts until the value
 *                   drops back into the hysteresis band
 *
 * A new alert is raised ONLY on a NORMAL → EXCEEDED transition.
 * Sub-sequent readings that remain in the EXCEEDED state are ignored.
 * When the reading drops back below the threshold, the state returns
 * to NORMAL, ready to fire again on the next crossing.
 *
 * The hysteresis band (`HYSTERESIS`) keeps a small buffer around the
 * threshold so that values that flap right around the threshold do
 * not create a stream of alerts.
 *
 *   enter EXCEEDED :  reading >  threshold + HYSTERESIS
 *   leave EXCEEDED :  reading <= threshold - HYSTERESIS
 *
 * Example (threshold = 80, HYSTERESIS = 2):
 *   70 72 75 78  →  state stays NORMAL, no alert
 *   82          →  NORMAL → EXCEEDED, alert created
 *   84 85 83 86 →  state stays EXCEEDED, no new alert
 *   76          →  EXCEEDED → NORMAL, alert state cleared
 *   81          →  NORMAL → EXCEEDED, NEW alert created
 */

const HYSTERESIS = 2 // +/- this many units around the threshold

// How long to suppress duplicate alerts for the same (device, alertType)
// once a transition has been recorded. Acts as a final safety net in
// case of clock skew / out-of-order updates.
const DEDUP_WINDOW_MS = 5000

// Periodic cleanup of stale dedup keys.
const CLEANUP_INTERVAL_MS = 60000

export class AlertManager {
  constructor() {
    /**
     * Map<deviceId, Map<alertType, state>>
     * state = 'NORMAL' | 'EXCEEDED'
     */
    this.deviceStateMap = new Map()

    /**
     * Map<deviceId+alertType, timestamp> — last time we emitted an alert
     * for this pair. Used as a final dedup safety net.
     */
    this.lastEmittedAt = new Map()

    this.cleanupTimer = setInterval(() => this.cleanupStaleEntries(), CLEANUP_INTERVAL_MS)
  }

  /**
   * Initialise a device's state when it joins the system.
   * Without this the first reading would be misinterpreted as a crossing.
   */
  seedDevice(deviceId, alertType) {
    if (!this.deviceStateMap.has(deviceId)) {
      this.deviceStateMap.set(deviceId, new Map())
    }
    const inner = this.deviceStateMap.get(deviceId)
    if (!inner.has(alertType)) {
      inner.set(alertType, { state: 'NORMAL' })
    }
  }

  /**
   * Check whether a new alert should be emitted for a (device, alertType)
   * pair given the latest reading.
   *
   * Returns { shouldEmit, isClearTransition }.
   *  - shouldEmit=true and isClearTransition=false  → create a new alert
   *  - shouldEmit=false and isClearTransition=true → silent state reset
   *  - shouldEmit=false and isClearTransition=false → no-op
   */
  evaluate(device, alertType, threshold) {
    const value = this._extractValue(device, alertType)
    if (value == null || !Number.isFinite(value)) {
      return { shouldEmit: false, isClearTransition: false }
    }

    const deviceId = device.deviceId
    this.seedDevice(deviceId, alertType)
    const slot = this.deviceStateMap.get(deviceId).get(alertType)

    const upper = threshold + HYSTERESIS
    const lower = threshold - HYSTERESIS

    const currentlyExceeded = value > upper
    const isRecovery = value <= lower

    if (slot.state === 'NORMAL') {
      if (currentlyExceeded) {
        // Crossing event. Final dedup safety net: if we've emitted
        // an alert for this pair within DEDUP_WINDOW_MS, skip.
        if (this._recentlyEmitted(deviceId, alertType)) {
          slot.state = 'EXCEEDED'
          return { shouldEmit: false, isClearTransition: false }
        }
        slot.state = 'EXCEEDED'
        this.lastEmittedAt.set(this._dedupKey(deviceId, alertType), Date.now())
        return { shouldEmit: true, isClearTransition: false }
      }
      return { shouldEmit: false, isClearTransition: false }
    }

    // slot.state === 'EXCEEDED'
    if (isRecovery) {
      slot.state = 'NORMAL'
      return { shouldEmit: false, isClearTransition: true }
    }

    // Still exceeded — suppress noise.
    return { shouldEmit: false, isClearTransition: false }
  }

  /**
   * Get the relevant numeric value for an alert type.
   * Currently supports TEMPERATURE_THRESHOLD and BATTERY_LOW.
   */
  _extractValue(device, alertType) {
    switch (alertType) {
      case 'TEMPERATURE_THRESHOLD':
        return Number(device.readingValue)
      case 'BATTERY_LOW':
        return Number(device.batteryLevel)
      default:
        return null
    }
  }

  _dedupKey(deviceId, alertType) {
    return `${deviceId}::${alertType}`
  }

  _recentlyEmitted(deviceId, alertType) {
    const key = this._dedupKey(deviceId, alertType)
    const ts = this.lastEmittedAt.get(key)
    if (!ts) return false
    return Date.now() - ts < DEDUP_WINDOW_MS
  }

  /**
   * Remove dedup keys that are older than the dedup window.
   */
  cleanupStaleEntries() {
    const cutoff = Date.now() - DEDUP_WINDOW_MS
    for (const [key, ts] of this.lastEmittedAt) {
      if (ts < cutoff) this.lastEmittedAt.delete(key)
    }
  }

  /**
   * Drop all state for a device (e.g. when it leaves the fleet).
   */
  clearDevice(deviceId) {
    this.deviceStateMap.delete(deviceId)
  }

  /**
   * Drop everything (e.g. on a fleet reset).
   */
  clearAll() {
    this.deviceStateMap.clear()
    this.lastEmittedAt.clear()
  }

  /**
   * Stop the cleanup timer.
   */
  dispose() {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
      this.cleanupTimer = null
    }
  }
}
