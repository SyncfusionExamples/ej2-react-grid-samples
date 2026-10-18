/**
 * Device Routes
 * Define API endpoints for device management
 */

import express from 'express';

export function createDeviceRoutes(deviceController) {
  const router = express.Router();

  // Device endpoints — Custom Binding (GET with query params)
  router.get('/devices/grid', (req, res) => deviceController.getDevicesForGrid(req, res));
  router.put('/devices/:deviceId', (req, res) => deviceController.updateDevice(req, res));
  router.get('/devices/summary', (req, res) => deviceController.getSummary(req, res));

  // Alert endpoints — Custom Binding (GET with query params)
  router.get('/alerts/grid', (req, res) => deviceController.getAlertsForGrid(req, res));
  router.put('/alerts/:alertId', (req, res) => deviceController.updateAlertStatus(req, res));
  router.delete('/alerts/:alertId', (req, res) => deviceController.deleteAlert(req, res));

  // Reports endpoints
  router.get('/reports', (req, res) => deviceController.getReports(req, res));

  return router;
}
