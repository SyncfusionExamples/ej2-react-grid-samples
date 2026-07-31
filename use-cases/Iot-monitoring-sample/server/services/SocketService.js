/**
 * Socket Service
 *
 * Pushes incremental device updates to connected clients.
 *
 * Key changes from the previous version:
 *  - Status is DERIVED from readingValue vs threshold. It is no longer
 *    randomised, so the status does not flap on every poll.
 *  - Alerts are emitted only on threshold-CROSSING transitions, as
 *    decided by the AlertManager. Repeated readings that remain in
 *    the exceeded state are silently ignored.
 *  - Updates are throttled to once every ~3 seconds. The interval is
 *    stable (no random jitter per tick) to keep server load predictable.
 *  - The summary update is debounced: at most one summary_update is
 *    emitted per polling cycle.
 */

// Keep cadence snappy enough for visible "live" cells without flooding
// the client (Dashboard flushes socket buffer every ~200ms).
const TICK_INTERVAL_MS = 1500
const UPDATE_FRACTION = 0.15 // update ~15% of devices per tick

// Helper used to derive a status from a reading — must match the
// logic used by DeviceService.du service.
function deriveStatus(readingValue, threshold) {
  if (readingValue == null || threshold == null) return 'Normal'
  if (readingValue > threshold + 2) return 'Critical'
  if (readingValue > threshold) return 'Warning'
  return 'Normal'
}

export class SocketService {
  constructor(io, deviceService, alertManager) {
    this.io = io
    this.deviceService = deviceService
    this.alertManager = alertManager
    this.updateInterval = null
  }

  initialize() {
    this.io.on('connection', (socket) => {
      console.log(`[Socket] client connected: ${socket.id}`)

      socket.on('disconnect', () => {
        console.log(`[Socket] client disconnected: ${socket.id}`)
      })

      socket.on('subscribe_device_updates', () => {
        // Reserved for future use — currently every connected client
        // receives updates.
      })

      socket.on('unsubscribe_device_updates', () => {
        // Reserved for future use.
      })
    })

    // Seed the AlertManager state for every existing device so the
    // very first reading is not misinterpreted as a crossing.
    for (const device of this.deviceService.getDevices()) {
      const candidates = this.deviceService.checkForAnomalies(device)
      for (const c of candidates) {
        this.alertManager.seedDevice(device.deviceId, c.alertType)
      }
    }
  }

  startDeviceUpdates() {
    if (this.updateInterval) return // already running

    this.updateInterval = setInterval(() => {
      this._tick().catch((err) => {
        console.error('[Socket] tick error:', err)
      })
    }, TICK_INTERVAL_MS)
  }

  stopDeviceUpdates() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval)
      this.updateInterval = null
    }
  }

  async _tick() {
    const devices = this.deviceService.getDevices()
    if (devices.length === 0) return

    const updateCount = Math.max(1, Math.floor(devices.length * UPDATE_FRACTION))
    let didMutateSummary = false
    let batteryShifted = false

    for (let i = 0; i < updateCount; i++) {
      const randomIndex = Math.floor(Math.random() * devices.length)
      const device = devices[randomIndex]
      if (!device) continue

      const oldBattery = device.batteryLevel
      const oldStatus = device.status

      // Simulate a realistic sensor reading — small drift around the
      // current value, with occasional excursions. Critical: the
      // status is *derived*, not random.
      // const drift = (Math.random() - 0.5) * 1.5
      // const excursionChance = 0.05 // 5% chance of a spike
      // const spike = Math.random() < excursionChance
      //   ? device.threshold * (0.15 + Math.random() * 0.15) * (Math.random() < 0.5 ? 1 : -1)
      //   : 0

      // device.readingValue = Math.max(
      //   0,
      //   Math.round((device.readingValue + drift + spike) * 100) / 100
      // )

      const threshold = device.threshold;

      const r = Math.random();

      if (r < 0.70) {
          // Normal (70%)
          device.readingValue =
              threshold * (0.55 + Math.random() * 0.30);
      }
      else if (r < 0.90) {
          // Warning (20%)
          device.readingValue =
              threshold * (0.92 + Math.random() * 0.07);
      }
      else {
          // Critical (10%)
          device.readingValue =
              threshold * (1.05 + Math.random() * 0.20);
      }

      device.readingValue =
          Math.round(device.readingValue * 100) / 100;

      device.status = deriveStatus(device.readingValue, threshold);
      device.status = deriveStatus(device.readingValue, device.threshold)

      // Signal strength: small random walk
      device.signalStrength = Math.max(
        0,
        Math.min(100, device.signalStrength + Math.round((Math.random() - 0.5) * 4))
      )

      // Realistic gradual battery drain
      const drainRate = 0.1 + Math.random() * 0.4
      device.batteryLevel = Math.max(0, Math.round((device.batteryLevel - drainRate) * 100) / 100)
      device.lastUpdated = new Date().toISOString()

      // Emit per-device delta
      this.io.emit('device_update', {
        deviceId: device.deviceId,
        status: device.status,
        readingValue: device.readingValue,
        signalStrength: device.signalStrength,
        batteryLevel: device.batteryLevel,
        lastUpdated: device.lastUpdated,
      })

      // Anomaly detection via AlertManager (threshold-crossing state machine)
      const candidates = this.deviceService.checkForAnomalies(device)
      for (const candidate of candidates) {
        const decision = this.alertManager.evaluate(device, candidate.alertType, candidate.threshold)
        if (decision.shouldEmit) {
          const alertRecord = this.deviceService.persistAlert({
            deviceId: device.deviceId,
            deviceName: device.deviceName,
            location: device.location,
            sensorType: device.sensorType,
            alertType: candidate.alertType,
            severity: candidate.alertType === 'TEMPERATURE_THRESHOLD' ? 'High' : 'High',
            message: this.deviceService.buildAlertMessage(device, candidate.alertType),
          })
          this.io.emit('anomaly_detected', alertRecord)
        }
        // Clear transitions are intentionally silent — we don't fire a
        // toast for "back to normal" to avoid alert noise.
      }

      if (Math.abs(oldBattery - device.batteryLevel) > 0.5) batteryShifted = true
      if (oldStatus !== device.status) didMutateSummary = true
    }

    // Debounced summary update: at most one per tick, only when the
    // summary has actually changed.
    if (didMutateSummary || batteryShifted) {
      this.io.emit('summary_update', this.deviceService.getSummary())
    }
  }
}
