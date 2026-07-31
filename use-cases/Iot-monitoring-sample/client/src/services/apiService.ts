/**
 * API Service
 *
 * Thin fetch wrapper with:
 *  - per-request timeout (default 8s)
 *  - server-availability tracking: when a request fails we expose a
 *    callback so the UI can render an "offline" state and stop the
 *    request loop
 */

const API_BASE_URL = 'http://localhost:3001/api'
const DEFAULT_TIMEOUT_MS = 8000

export interface GridQueryParams {
  skip?: number
  take?: number
  sortBy?: string
  sortDirection?: 'ascending' | 'descending'
  searchValue?: string
}

export interface AlertsQueryParams extends GridQueryParams {
  startDate?: string
  endDate?: string
}

type ServerStatusListener = (online: boolean) => void

class ApiServiceClass {
  private serverOnline = true
  private listeners: Set<ServerStatusListener> = new Set()
  // In-flight requests are aborted on disconnect to avoid leaks.
  private activeControllers: Set<AbortController> = new Set()

  /** Subscribe to server-online state changes. Returns an unsubscribe fn. */
  onServerStatusChange(listener: ServerStatusListener): () => void {
    this.listeners.add(listener)
    listener(this.serverOnline)
    return () => {
      this.listeners.delete(listener)
    }
  }

  private setServerOnline(online: boolean) {
    if (this.serverOnline === online) return
    this.serverOnline = online
    if (!online) this.cancelAll()
    this.listeners.forEach((l) => {
      try {
        l(online)
      } catch {
        /* ignore */
      }
    })
  }

  private cancelAll() {
    for (const c of this.activeControllers) {
      try {
        c.abort()
      } catch {
        /* ignore */
      }
    }
    this.activeControllers.clear()
  }

  /** True when the last request succeeded. Useful for retry buttons. */
  isServerOnline(): boolean {
    return this.serverOnline
  }

  private async fetchJson(url: string, init?: RequestInit): Promise<any> {
    const controller = new AbortController()
    this.activeControllers.add(controller)
    const timer = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS)
    try {
      const response = await fetch(url, { ...init, signal: controller.signal })
      clearTimeout(timer)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} ${response.statusText}`)
      }
      this.setServerOnline(true)
      return response.json()
    } catch (err) {
      clearTimeout(timer)
      this.setServerOnline(false)
      throw err
    } finally {
      this.activeControllers.delete(controller)
    }
  }

  private toQueryString(params: object): string {
    const qs = new URLSearchParams()
    Object.entries(params as Record<string, unknown>).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        qs.append(key, String(value))
      }
    })
    return qs.toString()
  }

  async getDevices(params: GridQueryParams) {
    return this.fetchJson(`${API_BASE_URL}/devices/grid?${this.toQueryString(params)}`)
  }

  async updateDevice(deviceId: string, data: Record<string, any>) {
    return this.fetchJson(`${API_BASE_URL}/devices/${deviceId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
  }

  async getSummary() {
    return this.fetchJson(`${API_BASE_URL}/devices/summary`)
  }

  async getAlerts(params: AlertsQueryParams) {
    return this.fetchJson(`${API_BASE_URL}/alerts/grid?${this.toQueryString(params)}`)
  }

  async updateAlertStatus(alertId: string, status: string) {
    return this.fetchJson(`${API_BASE_URL}/alerts/${encodeURIComponent(alertId)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
  }

  async deleteAlert(alertId: string) {
    return this.fetchJson(`${API_BASE_URL}/alerts/${encodeURIComponent(alertId)}`, {
      method: 'DELETE',
    })
  }

  async getAnalytics() {
    return this.fetchJson(`${API_BASE_URL}/analytics`)
  }

  async getReports() {
    return this.fetchJson(`${API_BASE_URL}/reports`)
  }
}

export const apiService = new ApiServiceClass()
