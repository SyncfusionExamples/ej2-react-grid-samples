/**
 * Mock Data Generator
 * Generates 1000 IoT devices with realistic Industrial IoT sensor data
 */

import { Device } from '../models/Device.js';

const SENSOR_TYPES = ['Temperature', 'Pressure', 'Humidity', 'Voltage', 'Flow', 'Vibration'];

// Realistic industrial IoT locations
const LOCATIONS = [
  'Assembly Line 1',
  'Assembly Line 2',
  'Assembly Line 3',
  'Production Floor A',
  'Production Floor B',
  'Warehouse Zone 1',
  'Warehouse Zone 2',
  'Cooling System',
  'Compressor Station A',
  'Compressor Station B',
  'Pump House',
  'Control Room',
  'Maintenance Depot',
  'Quality Lab',
  'Shipping Dock',
];

// Realistic industrial IoT device names by sensor type
const DEVICE_NAMES = {
  Temperature: [
    'Boiler Temp',
    'Reactor Temp',
    'Oven Temp',
    'Tank Temp',
    'Coolant Temp',
    'Furnace Temp',
    'Bearing Temp'
  ],

  Pressure: [
    'Hydraulic Press',
    'Air Pressure',
    'Steam Pressure',
    'Pump Pressure',
    'Line Pressure',
    'Tank Pressure',
    'Compressor Pressure'
  ],

  Humidity: [
    'Warehouse Humidity',
    'Room Humidity',
    'Dry Room',
    'Storage Humidity',
    'HVAC Humidity',
    'Lab Humidity',
    'Air Humidity'
  ],

  Voltage: [
    'UPS Monitor',
    'Transformer',
    'Power Panel',
    'Main Bus',
    'Generator',
    'Breaker',
    'DC Supply'
  ],

  Flow: [
    'Water Flow',
    'Coolant Flow',
    'Steam Flow',
    'Fuel Flow',
    'Air Flow',
    'Oil Flow',
    'Chemical Flow'
  ],

  Vibration: [
    'Motor Vibration',
    'Pump Vibration',
    'Fan Vibration',
    'Bearing Monitor',
    'Conveyor Drive',
    'Gearbox',
    'Compressor'
  ]
};

const STATUSES = ['Normal', 'Warning', 'Critical'];

export class MockDataGenerator {
  static generateDevices(count = 1000) {
    const devices = [];
    
    for (let i = 1; i <= count; i++) {
      const deviceId = `DEV-${String(i).padStart(4, '0')}`;
      const sensorType = SENSOR_TYPES[Math.floor(Math.random() * SENSOR_TYPES.length)];
      const location = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
      const deviceNameOptions = DEVICE_NAMES[sensorType] || DEVICE_NAMES['Temperature'];
      const baseDeviceName = deviceNameOptions[Math.floor(Math.random() * deviceNameOptions.length)];
      
      // Append sequential number to make each device name unique: "Furnace Temp Sensor-001"
      const deviceName = `${baseDeviceName}-${String(i).padStart(3, '0')}`;
      
      const threshold = this.getThresholdForSensor(sensorType);
      const readingValue = Math.random() * threshold * 1.2;
      
      // Realistic initial battery: 60-100% for most devices, very few below 30%
      // This avoids showing 0% on startup
      let initialBattery;
      const batteryRoll = Math.random();
      if (batteryRoll < 0.7) {
        // 70% of devices: healthy battery 60-100%
        initialBattery = 60 + Math.random() * 40;
      } else if (batteryRoll < 0.95) {
        // 25% of devices: medium battery 30-60%
        initialBattery = 30 + Math.random() * 30;
      } else {
        // 5% of devices: low battery 20-30%
        initialBattery = 20 + Math.random() * 10;
      }
      
      const device = new Device(
        deviceId,
        deviceName,
        location,
        sensorType,
        this.getRandomStatus(),
        Math.round(readingValue * 100) / 100,
        threshold,
        Math.floor(Math.random() * 100) + 30, // Signal strength 30-130
        Math.round(initialBattery * 100) / 100, // Realistic battery 20-100%
        new Date().toISOString()
      );
      
      devices.push(device);
    }
    
    return devices;
  }

  static getThresholdForSensor(sensorType) {
    const thresholds = {
      'Temperature': 80,
      'Pressure': 150,
      'Humidity': 100,
      'Voltage': 240,
      'Flow': 500,
      'Vibration': 10
    };
    return thresholds[sensorType] || 100;
  }

  static getRandomStatus() {
    const random = Math.random();
    if (random < 0.7) return 'Normal';
    if (random < 0.9) return 'Warning';
    return 'Critical';
  }

  static updateDeviceReading(device) {
    const threshold = this.getThresholdForSensor(device.sensorType);
    
    // Gradual battery drain: 0.1% to 0.5% per update
    // This simulates realistic battery usage over time
    const drainRate = 0.1 + Math.random() * 0.4; // 0.1% to 0.5%
    const newBattery = Math.max(0, device.batteryLevel - drainRate);
    
    return {
      ...device,
      status: this.getRandomStatus(),
      readingValue: Math.round((Math.random() * threshold * 1.2) * 100) / 100,
      signalStrength: Math.floor(Math.random() * 100) + 30,
      batteryLevel: Math.round(newBattery * 100) / 100,
      lastUpdated: new Date().toISOString()
    };
  }
}
