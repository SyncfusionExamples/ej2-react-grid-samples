/**
 * useSocket Hook
 * React Hook for Socket.IO integration.
 *
 * Uses a ref for the latest callback so socket subscription is only
 * set up once per (event, connected) change. Prevents re-subscribing
 * on every render and avoids the listener leak that would otherwise
 * cause duplicate socket deliveries.
 */

import { useEffect, useRef, useCallback } from 'react'
import { socketService } from '../services/socketService'

export const useSocket = (
  event: string,
  callback: (data: any) => void,
  connected: boolean = true
) => {
  const callbackRef = useRef(callback)

  // Always keep the latest callback reference
  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  useEffect(() => {
    if (!connected) return

    const wrappedCallback = (data: any) => {
      callbackRef.current(data)
    }

    socketService.subscribe(event, wrappedCallback)

    return () => {
      socketService.unsubscribe(event, wrappedCallback)
    }
  }, [event, connected])

  const emit = useCallback(
    (data?: any) => {
      socketService.emit(event, data)
    },
    [event]
  )

  return { emit }
}

/**
 * useSocketConnection Hook
 * Manages Socket.IO connection lifecycle
 */
export const useSocketConnection = () => {
  const connectionAttempted = useRef(false)

  useEffect(() => {
    if (connectionAttempted.current) return

    connectionAttempted.current = true

    const connect = async () => {
      try {
        await socketService.connect()
      } catch (error) {
        console.error('Failed to connect socket:', error)
      }
    }

    connect()

    return () => {
      // Optional: disconnect on unmount
      // socketService.disconnect()
    }
  }, [])

  return {
    isConnected: socketService.getIsConnected(),
    socketId: socketService.getSocketId()
  }
}
