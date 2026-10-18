/**
 * Socket Service
 * Reusable React Socket.IO client with automatic reconnect.
 *
 * - Subscriptions are stored in a Map keyed by event name
 * - Server-triggered events only fire when the socket is actually connected
 * - Connection state listeners are notified on every change so the UI
 *   can render a clean "offline / reconnecting" state.
 */

import { io, Socket } from 'socket.io-client'

class SocketServiceClass {
  private socket: Socket | null = null
  private subscriptions: Map<string, Function[]> = new Map()
  private isConnected = false
  private reconnectAttempts = 0
  private maxReconnectAttempts = 10
  private connectionStateListeners: Array<(connected: boolean) => void> = []
  private url: string = 'http://localhost:3001'
 // private url = (import.meta.env.VITE_API_URL || '').replace('/api', '')

  /**
   * Subscribe to connection state changes
   * Returns unsubscribe function
   */
  onConnectionStateChange(callback: (connected: boolean) => void): () => void {
    this.connectionStateListeners.push(callback)
    // Immediately notify of current state
    callback(this.isConnected)
    return () => {
      const idx = this.connectionStateListeners.indexOf(callback)
      if (idx > -1) this.connectionStateListeners.splice(idx, 1)
    }
  }

  /**
   * Notify all listeners of connection state change
   */
  private notifyConnectionStateChange(): void {
    this.connectionStateListeners.forEach((cb) => {
      try {
        cb(this.isConnected)
      } catch (error) {
        console.error('Error in connection state listener:', error)
      }
    })
  }

  /**
   * Connect to Socket.IO server
   */
  connect(url: string = 'http://localhost:3001'): Promise<void> {
  //connect(url = this.url): Promise<void> {
    return new Promise((resolve, reject) => {
      // If a socket already exists and is connected, do nothing
      if (this.socket && this.isConnected) {
        resolve()
        return
      }

      // If a previous socket exists, tear it down first
      if (this.socket) {
        try {
          this.socket.removeAllListeners()
          this.socket.disconnect()
        } catch {
          /* ignore */
        }
        this.socket = null
      }

      this.url = url

      try {
        this.socket = io(url, {
          reconnection: true,
          reconnectionDelay: 1500,
          reconnectionDelayMax: 8000,
          reconnectionAttempts: this.maxReconnectAttempts,
          transports: ['websocket', 'polling'],
          timeout: 8000,
        })

        this.socket.on('connect', () => {
          console.log('[Socket] connected:', this.socket?.id)
          this.isConnected = true
          this.reconnectAttempts = 0
          this.notifyConnectionStateChange()
          resolve()
        })

        this.socket.on('disconnect', (reason) => {
          console.log('[Socket] disconnected:', reason)
          this.isConnected = false
          this.notifyConnectionStateChange()
        })

        this.socket.on('reconnect', () => {
          console.log('[Socket] reconnected')
          this.isConnected = true
          this.reconnectAttempts = 0
          this.notifyConnectionStateChange()
        })

        this.socket.on('reconnect_attempt', () => {
          this.reconnectAttempts++
          console.log(`[Socket] reconnecting... attempt ${this.reconnectAttempts}`)
        })

        this.socket.on('connect_error', (error) => {
          // Only log the first few errors to avoid flooding the console
          if (this.reconnectAttempts < 3) {
            console.warn('[Socket] connect error:', error.message)
          }
          this.isConnected = false
          this.notifyConnectionStateChange()
          if (this.reconnectAttempts === 1) {
            // Reject the initial connect promise so callers can show
            // a graceful "server unavailable" state.
            reject(error)
          }
        })

        // Forward server-pushed events to subscribers — but ONLY when
        // the socket is actually connected. This prevents the
        // `socketService.triggerSubscribers` map from dispatching stale
        // events after the server has gone down.
        this.socket.on('device_update', (data) => {
          if (!this.isConnected) return
          this.triggerSubscribers('device_update', data)
        })
        this.socket.on('anomaly_detected', (data) => {
          if (!this.isConnected) return
          this.triggerSubscribers('anomaly_detected', data)
        })
        this.socket.on('summary_update', (data) => {
          if (!this.isConnected) return
          this.triggerSubscribers('summary_update', data)
        })
      } catch (error) {
        console.error('[Socket] connection failed:', error)
        reject(error)
      }
    })
  }

  /**
   * Disconnect from Socket.IO server
   */
  disconnect(): void {
    if (this.socket) {
      try {
        this.socket.removeAllListeners()
        this.socket.disconnect()
      } catch {
        /* ignore */
      }
      this.socket = null
    }
    this.isConnected = false
    this.subscriptions.clear()
    this.notifyConnectionStateChange()
  }

  /**
   * Subscribe to event
   */
  subscribe(event: string, callback: Function): void {
    if (!this.subscriptions.has(event)) {
      this.subscriptions.set(event, [])
    }
    // Prevent duplicate subscriptions for the same callback
    const list = this.subscriptions.get(event)!
    if (!list.includes(callback)) {
      list.push(callback)
    }
  }

  /**
   * Unsubscribe from event
   */
  unsubscribe(event: string, callback: Function): void {
    const subscribers = this.subscriptions.get(event)
    if (subscribers) {
      const index = subscribers.indexOf(callback)
      if (index > -1) {
        subscribers.splice(index, 1)
      }
    }
  }

  /**
   * Emit event to server
   */
  emit(event: string, data?: any): void {
    if (this.socket && this.isConnected) {
      this.socket.emit(event, data)
    }
  }

  /**
   * Trigger all subscribers for an event
   */
  private triggerSubscribers(event: string, data: any): void {
    const subscribers = this.subscriptions.get(event) || []
    for (const callback of subscribers) {
      try {
        callback(data)
      } catch (error) {
        console.error(`[Socket] error in subscriber for ${event}:`, error)
      }
    }
  }

  /**
   * Get connection status
   */
  getIsConnected(): boolean {
    return this.isConnected
  }

  /**
   * Get socket ID
   */
  getSocketId(): string | undefined {
    return this.socket?.id
  }

  /**
   * Get the configured URL (useful for debugging)
   */
  getUrl(): string {
    return this.url
  }
}

// Export singleton instance
export const socketService = new SocketServiceClass()
