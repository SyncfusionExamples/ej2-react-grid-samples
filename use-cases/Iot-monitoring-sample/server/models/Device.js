/**
 * Device Model
 * Represents an IoT device with sensor data
 */
export class Device {
  constructor(
    deviceId,
    deviceName,
    location,
    sensorType,
    status,
    readingValue,
    threshold,
    signalStrength,
    batteryLevel,
    lastUpdated
  ) {
    this.deviceId = deviceId;
    this.deviceName = deviceName;
    this.location = location;
    this.sensorType = sensorType;
    this.status = status;
    this.readingValue = readingValue;
    this.threshold = threshold;
    this.signalStrength = signalStrength;
    this.batteryLevel = batteryLevel;
    this.lastUpdated = lastUpdated;
  }
}

/**
 * Alert Model
 * Represents an anomaly alert
 */
export class Alert {
  constructor(
    alertId,
    deviceId,
    deviceName,
    location,
    sensorType,
    alertType,
    severity,
    message,
    timestamp
  ) {
    this.alertId = alertId;
    this.deviceId = deviceId;
    this.deviceName = deviceName;
    this.location = location;
    this.sensorType = sensorType;
    this.alertType = alertType;
    this.severity = severity;
    this.message = message;
    this.timestamp = timestamp;
    // Alert status: Active | Acknowledged | Resolved
    this.status = 'Active'
  }
}
