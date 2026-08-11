/**
 * App Context
 * Global state management for app-wide data
 */

import React, { createContext, useState, useCallback, useEffect, ReactNode } from 'react'
import { socketService } from '../services/socketService'

export interface Summary {
  totalDevices: number
  onlineDevices: number
  criticalDevices: number
  avgBattery: number
}

export interface Alert {
  alertId: string
  deviceId: string
  deviceName: string
  location: string
  sensorType: string
  alertType: string
  severity: 'Low' | 'Medium' | 'High' | 'Critical'
  status?: 'Active' | 'Acknowledged' | 'Resolved'
  message: string
  timestamp: string | Date
}

export interface AppContextType {
  socketConnected: boolean
  setSocketConnected: (connected: boolean) => void
  summary: Summary | null
  setSummary: (summary: Summary) => void
  alertCount: number
  setAlertCount: (count: number) => void
  alerts: Alert[]
  setAlerts: React.Dispatch<React.SetStateAction<Alert[]>>
  showNotification: (message: string, type: 'success' | 'warning' | 'error' | 'info') => void
}

export const AppContext = createContext<AppContextType | undefined>(undefined)

interface AppProviderProps {
  children: ReactNode
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [socketConnected, setSocketConnected] = useState(false)
  const [summary, setSummary] = useState<Summary | null>(null)
  const [alertCount, setAlertCount] = useState(0)
  const [alerts, setAlerts] = useState<Alert[]>([])

  // Listen to actual Socket.IO connection state changes
  useEffect(() => {
    const unsubscribe = socketService.onConnectionStateChange((connected) => {
      setSocketConnected(connected)
      console.log(`[AppContext] Socket connection state: ${connected ? 'connected' : 'disconnected'}`)
    })
    return unsubscribe
  }, [])

  const showNotification = useCallback((message: string, type: 'success' | 'warning' | 'error' | 'info') => {
    // This will be connected to a Toast component
    console.log(`[${type.toUpperCase()}] ${message}`)
  }, [])

  const value: AppContextType = {
    socketConnected,
    setSocketConnected,
    summary,
    setSummary,
    alertCount,
    setAlertCount,
    alerts,
    setAlerts,
    showNotification
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export const useAppContext = () => {
  const context = React.useContext(AppContext)
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider')
  }
  return context
}
