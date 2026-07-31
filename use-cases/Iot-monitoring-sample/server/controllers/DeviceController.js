/**
 * Device Controller
 * Handles HTTP request routing for devices.
 *
 * Architecture: Syncfusion Custom Binding
 *   - All Grid operations (paging, sorting, filtering, searching) are
 *     performed server-side using DeviceService utility functions.
 *   - Every response is { result: [...], count: N } so the Grid pager
 *     stays synchronised with the server-side total record count.
 *
 */

export class DeviceController {
  constructor(deviceService, socketService = null) {
    this.deviceService = deviceService;
    this.socketService = socketService
  }

  /**
   * GET /api/devices/grid
   * Custom Binding endpoint — paging, sorting, filtering, searching with virtual scroll support.
   * Query params:
   *   skip, take, sortBy, sortDirection, searchValue,
   *   filters (JSON array), where (JSON array - predicate tree),
   *   virtualScroll (boolean)
   */
  getDevicesForGrid(req, res) {
    try {
      const {
        skip = '0',
        take = '10',
        sortBy = '',
        sortDirection = 'ascending',
        searchValue = '',
        filters: filtersJson = '[]',
        where: whereJson = '[]',
        virtualScroll = 'false',
      } = req.query;

      // Parse structured filter predicates sent by the Grid
      let filters = [];
      try {
        filters = JSON.parse(filtersJson);
      } catch {
        filters = [];
      }

      // Parse preserved where tree (for multi-predicate correctness)
      // Supports complex filter groups from multi-select checkbox filters
      let whereTree = [];
      try {
        whereTree = JSON.parse(whereJson);
      } catch {
        whereTree = [];
      }

      const isVirtualScroll = virtualScroll === 'true';

      const data = this.deviceService.getDevicesForGrid(
        parseInt(skip, 10),
        parseInt(take, 10),
        sortBy,
        sortDirection,
        searchValue,
        filters,
        whereTree,
        isVirtualScroll
      );

      res.json(data);
    } catch (error) {
      console.error('Error fetching devices:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * PUT /api/devices/:deviceId
   * Update device (for cell editing)
   */
  updateDevice(req, res) {
    const { deviceId } = req.params;
    const updatedFields = req.body;

    try {
      const device = this.deviceService.updateDevice(deviceId, updatedFields);
      
      if (!device) {
        return res.status(404).json({ error: 'Device not found' });
      }

      res.json(device);
    } catch (error) {
      console.error('Error updating device:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * GET /api/devices/summary
   * Get dashboard summary statistics
   */
  getSummary(req, res) {
    try {
      const summary = this.deviceService.getSummary();
      res.json(summary);
    } catch (error) {
      console.error('Error fetching summary:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * GET /api/alerts/grid
   * Custom Binding endpoint — paging, sorting, filtering, searching, date range with virtual scroll support.
   * Query params:
   *   skip, take, sortBy, sortDirection, searchValue,
   *   filters (JSON array), where (JSON array - predicate tree),
   *   startDate (ISO), endDate (ISO), virtualScroll (boolean)
   *
   * Automatically enables row virtualization when total records > 100.
   */
  getAlertsForGrid(req, res) {
    try {
      const {
        skip = '0',
        take = '12',
        sortBy = '',
        sortDirection = 'ascending',
        searchValue = '',
        filters: filtersJson = '[]',
        where: whereJson = '[]',
        startDate = null,
        endDate = null,
        virtualScroll = 'false',
      } = req.query;

      // Parse structured filter predicates sent by the Grid
      let filters = [];
      try {
        filters = JSON.parse(filtersJson);
      } catch {
        filters = [];
      }

      // Parse preserved where tree (for multi-predicate correctness)
      // Supports multi-select checkbox filters with OR conditions within groups
      let whereTree = [];
      try {
        whereTree = JSON.parse(whereJson);
      } catch {
        whereTree = [];
      }

      const isVirtualScroll = virtualScroll === 'true';

      const data = this.deviceService.getAlertsForGrid(
        parseInt(skip, 10),
        parseInt(take, 10),
        sortBy,
        sortDirection,
        searchValue,
        filters,
        whereTree,
        startDate,
        endDate,
        isVirtualScroll
      );

      res.json(data);
    } catch (error) {
      console.error('Error fetching alerts:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * PUT /api/alerts/:alertId
   * Update an alert's status (Active | Acknowledged | Resolved)
   */
  updateAlertStatus(req, res) {
    try {
      const { alertId } = req.params
      const { status } = req.body
      if (!alertId || !status) return res.status(400).json({ error: 'alertId and status required' })

      const result = this.deviceService.updateAlertStatus(alertId, status)
      if (!result) return res.status(404).json({ error: 'Alert not found' })

      // Notify connected clients of summary change if socketService available
      try {
        if (this.socketService && typeof this.socketService.io !== 'undefined') {
          this.socketService.io.emit('summary_update', this.deviceService.getSummary())
        }
      } catch (e) {
        /* ignore socket emit failures */
      }

      res.json({ success: true })
    } catch (error) {
      console.error('Error updating alert status:', error)
      res.status(500).json({ error: error.message })
    }
  }

  /**
   * DELETE /api/alerts/:alertId
   * Permanently remove an alert and push recalculated device status (if any).
   */
  deleteAlert(req, res) {
    try {
      const { alertId } = req.params
      if (!alertId) return res.status(400).json({ error: 'alertId required' })

      const result = this.deviceService.deleteAlert(alertId)
      if (!result) return res.status(404).json({ error: 'Alert not found' })

      try {
        if (this.socketService && typeof this.socketService.io !== 'undefined') {
          if (result.updatedDevice) {
            // Reuse the existing dashboard device_update path — never deletes rows
            this.socketService.io.emit('device_update', result.updatedDevice)
          }
          this.socketService.io.emit('summary_update', this.deviceService.getSummary())
        }
      } catch (e) {
        /* ignore socket emit failures */
      }

      res.json({ success: true, removed: result.removed, updatedDevice: result.updatedDevice })
    } catch (error) {
      console.error('Error deleting alert:', error)
      res.status(500).json({ error: error.message })
    }
  }

  /**
   * GET /api/analytics
   * Get analytics data
   */
  getAnalytics(req, res) {
    try {
      const analytics = this.deviceService.getAnalytics();
      res.json(analytics);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * GET /api/reports
   * Get reports data
   */
  getReports(req, res) {
    try {
      const reports = this.deviceService.getReports();
      res.json(reports);
    } catch (error) {
      console.error('Error fetching reports:', error);
      res.status(500).json({ error: error.message });
    }
  }
}
