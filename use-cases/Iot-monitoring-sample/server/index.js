/**
 * IoT Monitoring Dashboard - Backend Server
 * Node.js Express + Socket.IO
 */

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { MockDataGenerator } from './mock-data/mockDataGenerator.js';
import { DeviceService } from './services/DeviceService.js';
import { SocketService } from './services/SocketService.js';
import { DeviceController } from './controllers/DeviceController.js';
import { AlertManager } from './services/AlertManager.js';
import { createDeviceRoutes } from './routes/deviceRoutes.js';

import dotenv from 'dotenv';
dotenv.config();

const PORT = process.env.PORT || 3001;

// Initialize Express app
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }
});

app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}));
app.use(express.json());

// Initialize services
const deviceService = new DeviceService();
const alertManager = new AlertManager();
const socketService = new SocketService(io, deviceService, alertManager);
const deviceController = new DeviceController(deviceService, socketService);

// Initialize with mock data
console.log('Generating mock data for 1000 devices...');
const mockDevices = MockDataGenerator.generateDevices(1000);
deviceService.setDevices(mockDevices);
console.log('✓ Mock data generated successfully');

// Routes
app.use('/api', createDeviceRoutes(deviceController));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    devices: deviceService.getDevices().length,
    alerts: deviceService.alerts.length
  });
});

// Socket.IO initialization
socketService.initialize();

// Start the server
httpServer.listen(PORT, () => {
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║     IoT Monitoring Dashboard - Server Started          ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`🔗 Socket.IO listening for real-time connections`);
  console.log(`📊 Health check: http://localhost:${PORT}/health\n`);

  // Start real-time device updates via Socket.IO
  socketService.startDeviceUpdates();
  console.log('📡 Real-time device updates: ACTIVE\n');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n\n📛 SIGTERM signal received: closing HTTP server');
  socketService.stopDeviceUpdates();
  httpServer.close(() => {
    console.log('✓ HTTP server closed');
    process.exit(0);
  });
});
