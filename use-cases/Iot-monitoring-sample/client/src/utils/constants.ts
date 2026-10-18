/**
 * Application Constants
 */

export const SENSOR_TYPES = ['Temperature', 'Pressure', 'Humidity', 'Voltage', 'Flow', 'Vibration']

export const LOCATIONS = ['Factory A', 'Factory B', 'Warehouse', 'Plant 1', 'Plant 2']

export const DEVICE_STATUSES = {
  Normal: { color: '#10b981', bg: '#ecfdf5', label: 'Normal' },
  Warning: { color: '#f59e0b', bg: '#fffbeb', label: 'Warning' },
  Critical: { color: '#ef4444', bg: '#fef2f2', label: 'Critical' }
}

export const SEVERITY_LEVELS = {
  High: { color: '#ef4444', bg: '#fef2f2' },
  Medium: { color: '#f59e0b', bg: '#fffbeb' },
  Low: { color: '#3b82f6', bg: '#eff6ff' },
  Critical: { color: '#7c3aed', bg: '#faf5ff' }
}

export const GRID_PAGE_SIZES = [12, 24, 48, 96]

export const CHARTS_REFRESH_INTERVAL = 30000 // 30 seconds

export const SOCKET_UPDATE_INTERVAL = 2500 // 2.5 seconds
