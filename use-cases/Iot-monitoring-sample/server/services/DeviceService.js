/**
 * Device Service
 * Enhanced Custom Binding server-side data layer.
 *
 * Features:
 *   - Paging, sorting, filtering and searching happen here. The Grid
 *     never receives a full dataset.
 *   - Predicate tree parsing for multi-select checkbox filters
 *     (handles nested OR/AND conditions correctly)
 *   - Status is derived from readingValue vs threshold (plus hysteresis band)
 *   - Anomaly detection delegates to AlertManager
 *
 * Filtering order: Filter → Search → Sort → Skip/Take (Virtualization)
 * This ensures correct total counts for virtual scroll engine
 */

import { Alert } from '../models/Device.js'

// ------------------------------------------------------------------
// Predicate evaluation — handles single predicates
// ------------------------------------------------------------------

/**
 * Evaluate a single predicate against an item.
 * Supports operators: equal, notequal, contains, startswith, endswith,
 * greaterthan, greaterthanorequal, lessthan, lessthanorequal
 */
function evaluatePredicate(item, predicate) {
  const { field, operator, value, matchCase } = predicate

  let itemValue = item[field]
  let filterValue = value

  if (typeof itemValue === 'string') {
    itemValue = matchCase ? itemValue : itemValue.toLowerCase()
    filterValue = matchCase ? String(filterValue) : String(filterValue ?? '').toLowerCase()
  } else if (typeof itemValue === 'number') {
    filterValue = Number(filterValue)
  }

  switch (operator) {
    case 'equal':
      return itemValue == filterValue
    case 'notequal':
      return itemValue != filterValue
    case 'contains':
      return typeof itemValue === 'string' && itemValue.includes(filterValue)
    case 'startswith':
      return typeof itemValue === 'string' && itemValue.startsWith(filterValue)
    case 'endswith':
      return typeof itemValue === 'string' && itemValue.endsWith(filterValue)
    case 'greaterthan':
      return itemValue > filterValue
    case 'greaterthanorequal':
      return itemValue >= filterValue
    case 'lessthan':
      return itemValue < filterValue
    case 'lessthanorequal':
      return itemValue <= filterValue
    default:
      return true
  }
}

// ------------------------------------------------------------------
// Predicate tree evaluation — handles complex nested structures
// ------------------------------------------------------------------

/**
 * Recursively evaluate a Syncfusion where tree (preserved structure with nested groups/conditions).
 * Handles:
 *   - Leaf nodes: { field, operator, value, matchCase }
 *   - Nested groups: { predicates: [...], condition: 'and'|'or' }
 *   - Multi-select filters: multiple values OR'd within a group, then AND'd with other groups
 *
 * Example multi-select filter on 'severity' with values ['High', 'Critical']:
 *   {
 *     predicates: [
 *       { field: 'severity', operator: 'equal', value: 'High' },
 *       { field: 'severity', operator: 'equal', value: 'Critical' }
 *     ],
 *     condition: 'or'
 *   }
 *
 * When combined with another column filter on 'deviceName':
 *   [
 *     { predicates: [...severity filter...], condition: 'or' },
 *     { field: 'deviceName', operator: 'contains', value: 'Sensor' }
 *   ]
 * These are AND'd at the top level.
 */
function evaluateWhereTree(item, node) {
  if (!node || typeof node !== 'object') return true

  // Nested group: evaluate all child predicates, combine via condition
  if (Array.isArray(node.predicates) && node.predicates.length > 0) {
    const condition = node.condition || 'and'
    const results = node.predicates.map((child) => evaluateWhereTree(item, child))

    if (condition === 'or') {
      // OR: at least one child must be true
      return results.some((r) => r === true)
    } else {
      // AND (default): all children must be true
      return results.every((r) => r === true)
    }
  }

  // Leaf node: single predicate
  if (node.field !== undefined) {
    return evaluatePredicate(item, node)
  }

  return true
}

/**
 * Apply column filters to data using where tree (complex nested predicates).
 * Order of operations:
 *   1. Apply column filters (from where tree or flat filters)
 *   2. Apply global search
 *   3. Apply sorting
 *   4. Apply skip/take (for paging or virtualization)
 *
 * This method returns the filtered & sorted data.
 * The caller must handle skip/take for virtualization.
 */
function applyFilters(data, filters, whereTree) {
  if (!filters || filters.length === 0) {
    // If whereTree is provided, use it for evaluation (preserves grouping/nesting)
    if (whereTree && whereTree.length > 0) {
      return data.filter((item) => {
        // whereTree is an array of predicates/groups at the top level
        // These are implicitly AND-combined
        const results = whereTree.map((node) => evaluateWhereTree(item, node))
        return results.every((r) => r === true)
      })
    }
    return data
  }

  if (whereTree && whereTree.length > 0) {
    // Prefer whereTree over flat filters (preserves grouping semantics)
    return data.filter((item) => {
      const results = whereTree.map((node) => evaluateWhereTree(item, node))
      return results.every((r) => r === true)
    })
  }

  // Fallback to flat filters (backward compatibility)
  // Filters are evaluated in order, with `predicate` controlling combination:
  //   - 'or'  => accumulated OR passed
  //   - default or 'and' => accumulated AND passed
  return data.filter((item) => {
    let result = false
    for (let i = 0; i < filters.length; i++) {
      const pred = filters[i]
      const passed = evaluatePredicate(item, pred)
      if (i === 0) {
        result = passed
      } else if (pred.predicate === 'or') {
        result = result || passed
      } else {
        result = result && passed
      }
    }
    return result
  })
}

// ------------------------------------------------------------------
// Status derivation
// ------------------------------------------------------------------

/**
 * Derive a device's status from its current readingValue vs threshold.
 * Uses a small hysteresis band to keep the status from flapping right
 * around the threshold.
 */
function deriveStatus(readingValue, threshold) {
  if (readingValue == null || threshold == null) return 'Normal'
  if (readingValue > threshold + 2) return 'Critical'
  if (readingValue > threshold) return 'Warning'
  return 'Normal'
}

// ------------------------------------------------------------------
// DeviceService
// ------------------------------------------------------------------

export class DeviceService {
  constructor() {
    this.devices = []
    this.alerts = []
    this.alertIdCounter = 1
  }

  setDevices(devices) {
    this.devices = devices
  }

  getDevices() {
    return this.devices
  }

  // ------------------------------------------------------------------
  // Custom Binding — devices grid with virtual scroll support
  // ------------------------------------------------------------------
  /**
   * Get paginated, filtered, sorted, searched devices.
   * Supports virtual scroll requests for large datasets.
   *
   * Filter order:
   *   1. Apply column filters (where tree with multi-predicate support)
   *   2. Apply global search
   *   3. Apply sorting
   *   4. Apply skip/take (virtualization or regular paging)
   *
   * Returns { result: [...], count: totalAfterFilterButBeforePaging }
   * The count is used by the virtual scroll engine to know the total filtered size.
   */
  getDevicesForGrid(
    skip = 0,
    take = 12,
    sortBy = '',
    sortDirection = 'ascending',
    searchValue = '',
    filters = [],
    whereTree = null,
    virtualScroll = false
  ) {
    let data = [...this.devices]

    // 1. FILTER: Apply column filters (where tree for multi-select support)
    if ((filters && filters.length > 0) || (whereTree && whereTree.length > 0)) {
      data = applyFilters(data, filters, whereTree)
    }

    // 2. SEARCH: Apply global search
    if (searchValue && searchValue.trim()) {
      const q = searchValue.toLowerCase()
      data = data.filter(
        (d) =>
          d.deviceId.toLowerCase().includes(q) ||
          d.deviceName.toLowerCase().includes(q) ||
          d.location.toLowerCase().includes(q) ||
          d.sensorType.toLowerCase().includes(q) ||
          d.status.toLowerCase().includes(q)
      )
    }

    // 3. SORT: Apply sorting
    if (sortBy) {
      data.sort((a, b) => {
        let av = a[sortBy]
        let bv = b[sortBy]
        if (typeof av === 'string') {
          av = av.toLowerCase()
          bv = bv.toLowerCase()
        }
        if (av < bv) return sortDirection === 'ascending' ? -1 : 1
        if (av > bv) return sortDirection === 'ascending' ? 1 : -1
        return 0
      })
    }

    // 4. VIRTUALIZATION/PAGING: Apply skip/take
    // totalCount is the size after filtering but before paging
    // This is required by the virtual scroll engine
    const totalCount = data.length
    const result = data.slice(skip, skip + take)

    return { result, count: totalCount }
  }

  getDeviceById(deviceId) {
    return this.devices.find((d) => d.deviceId === deviceId)
  }

  updateDevice(deviceId, updatedFields) {
    const idx = this.devices.findIndex((d) => d.deviceId === deviceId)
    if (idx === -1) return null
    this.devices[idx] = { ...this.devices[idx], ...updatedFields }
    // Re-derive status if readingValue or threshold changed
    const d = this.devices[idx]
    d.status = deriveStatus(d.readingValue, d.threshold)
    return d
  }

  getSummary() {
    const totalDevices = this.devices.length
    const onlineDevices = this.devices.filter((d) => d.status !== 'Critical').length
    const criticalDevices = this.devices.filter((d) => d.status === 'Critical').length
    const avgBattery = this.devices.length
      ? Math.round(
          (this.devices.reduce((s, d) => s + (d.batteryLevel || 0), 0) / this.devices.length) * 100
        ) / 100
      : 0
    return { totalDevices, onlineDevices, criticalDevices, avgBattery }
  }

  // ------------------------------------------------------------------
  // Anomaly detection
  // ------------------------------------------------------------------

  /**
   * Returns an array of candidate alerts. The caller is expected to:
   *   1. call `alertManager.evaluate(device, alertType, threshold)` for
   *      each candidate;
   *   2. when `shouldEmit` is true, persist + broadcast;
   *   3. when `isClearTransition` is true, no further action is needed
   *      — the state machine has been updated.
   */
  checkForAnomalies(device) {
    const candidates = []
    if (device.sensorType === 'Temperature' && Number.isFinite(device.readingValue) && Number.isFinite(device.threshold)) {
      candidates.push({
        alertType: 'TEMPERATURE_THRESHOLD',
        threshold: device.threshold,
      })
    }
    if (Number.isFinite(device.batteryLevel) && device.batteryLevel < 20) {
      candidates.push({
        alertType: 'BATTERY_LOW',
        threshold: 20,
      })
    }
    return candidates
  }

  /**
   * Build a friendly message for a candidate alert.
   */
  buildAlertMessage(device, alertType) {
    if (alertType === 'TEMPERATURE_THRESHOLD') {
      return `Temperature exceeded threshold: ${device.readingValue.toFixed(1)}°C > ${device.threshold}°C`
    }
    if (alertType === 'BATTERY_LOW') {
      return `Battery level critical: ${Math.round(device.batteryLevel)}%`
    }
    return `${alertType} triggered`
  }

  persistAlert(candidate) {
    return this.createAlert(
      candidate.deviceId,
      candidate.deviceName,
      candidate.location,
      candidate.sensorType,
      candidate.alertType,
      candidate.severity,
      candidate.message
    )
  }

  createAlert(deviceId, deviceName, location, sensorType, alertType, severity, message) {
    const alert = new Alert(
      `ALT-${String(this.alertIdCounter++).padStart(6, '0')}`,
      deviceId,
      deviceName,
      location,
      sensorType,
      alertType,
      severity,
      message,
      new Date().toISOString()
    )
    // Ensure new alerts are Active by default
    alert.status = 'Active'
    this.alerts.push(alert)
    return alert
  }

  /**
   * Update an alert's status. If set to 'Resolved' the alert is removed
   * from the active alerts collection so it no longer appears in the
   * Active Alerts grid.
   */
  updateAlertStatus(alertId, status) {
    const idx = this.alerts.findIndex((a) => a.alertId === alertId)
    if (idx === -1) return null
    if (status === 'Resolved') {
      // Remove from active alerts
      const removed = this.alerts.splice(idx, 1)[0]
      return { removed }
    }
    this.alerts[idx].status = status
    return { updated: this.alerts[idx] }
  }

  /**
   * Permanently delete an alert and re-derive the linked device status
   * from its current reading/threshold. Device rows are never deleted.
   * Returns { removed, updatedDevice } or null if alertId is unknown.
   */
  deleteAlert(alertId) {
    const idx = this.alerts.findIndex((a) => a.alertId === alertId)
    if (idx === -1) return null

    const [removed] = this.alerts.splice(idx, 1)
    let updatedDevice = null

    if (removed?.deviceId) {
      const device = this.getDeviceById(removed.deviceId)
      if (device) {
        // Status always follows live reading vs threshold after alert removal
        device.status = deriveStatus(device.readingValue, device.threshold)
        device.lastUpdated = new Date().toISOString()
        updatedDevice = {
          deviceId: device.deviceId,
          status: device.status,
          readingValue: device.readingValue,
          signalStrength: device.signalStrength,
          batteryLevel: device.batteryLevel,
          lastUpdated: device.lastUpdated,
        }
      }
    }

    return { removed, updatedDevice }
  }

  // ------------------------------------------------------------------
  // Custom Binding — alerts grid with virtual scroll support
  // ------------------------------------------------------------------
  /**
   * Get paginated, filtered, sorted, searched alerts.
   * Automatically enables virtualization when total records > 100.
   *
   * Filter order:
   *   1. Apply date range filter
   *   2. Apply column filters (where tree with multi-predicate support)
   *   3. Apply global search
   *   4. Apply sorting
   *   5. Apply skip/take (virtualization or regular paging)
   *
   * Returns { result: [...], count: totalAfterFilterButBeforePaging }
   * The count is used by the virtual scroll engine to know the total filtered size.
   *
   * Virtualization is automatically enabled when total filtered count > 100
   * (detected at the client by examining the total count).
   */
  getAlertsForGrid(
    skip = 0,
    take = 12,
    sortBy = '',
    sortDirection = 'ascending',
    searchValue = '',
    filters = [],
    whereTree = null,
    startDate = null,
    endDate = null,
    virtualScroll = false
  ) {
    let data = [...this.alerts]

    // 1. DATE RANGE: Apply temporal filter first (if provided)
    if (startDate && endDate) {
      const start = new Date(startDate).getTime()
      const end = new Date(endDate)
      end.setHours(23, 59, 59, 999)
      const endMs = end.getTime()
      data = data.filter((a) => {
        const t = new Date(a.timestamp).getTime()
        return t >= start && t <= endMs
      })
    }

    // 2. FILTER: Apply column filters (where tree for multi-select support)
    if ((filters && filters.length > 0) || (whereTree && whereTree.length > 0)) {
      data = applyFilters(data, filters, whereTree)
    }

    // 3. SEARCH: Apply global search
    if (searchValue && searchValue.trim()) {
      const q = searchValue.toLowerCase()
      data = data.filter(
        (a) =>
          a.alertId.toLowerCase().includes(q) ||
          a.deviceId.toLowerCase().includes(q) ||
          a.deviceName.toLowerCase().includes(q) ||
          a.location.toLowerCase().includes(q) ||
          a.sensorType.toLowerCase().includes(q) ||
          a.severity.toLowerCase().includes(q) ||
          a.message.toLowerCase().includes(q)
      )
    }

    // 4. SORT: Apply sorting
    if (sortBy) {
      data.sort((a, b) => {
        let av = a[sortBy]
        let bv = b[sortBy]
        if (typeof av === 'string') {
          av = av.toLowerCase()
          bv = bv.toLowerCase()
        }
        if (av < bv) return sortDirection === 'ascending' ? -1 : 1
        if (av > bv) return sortDirection === 'ascending' ? 1 : -1
        return 0
      })
    }

    // 5. VIRTUALIZATION/PAGING: Apply skip/take
    // totalCount is the size after all filtering but before paging
    // This is required by the virtual scroll engine
    const totalCount = data.length
    const result = data.slice(skip, skip + take)

    return { result, count: totalCount }
  }

  // ------------------------------------------------------------------
  // reports
  // ------------------------------------------------------------------


  getReports() {
    const reportData = this.devices.reduce((acc, device) => {
      const existing = acc.find((r) => r.sensorType === device.sensorType)
      if (existing) {
        existing.totalDevices++
        existing.readings.push(device.readingValue)
        existing.averageReading =
          Math.round(
            (existing.readings.reduce((a, b) => a + b, 0) / existing.readings.length) * 100
          ) / 100
        existing.maxReading = Math.max(...existing.readings)
        existing.minReading = Math.min(...existing.readings)
        existing.avgBattery += device.batteryLevel
      } else {
        acc.push({
          sensorType: device.sensorType,
          totalDevices: 1,
          averageReading: device.readingValue,
          maxReading: device.readingValue,
          minReading: device.readingValue,
          avgBattery: device.batteryLevel,
          readings: [device.readingValue],
        })
      }
      return acc
    }, [])
    reportData.forEach((report) => {
      report.avgBattery = Math.round((report.avgBattery / report.totalDevices) * 100) / 100
      delete report.readings
    })
    return reportData
  }
}

export { deriveStatus }
