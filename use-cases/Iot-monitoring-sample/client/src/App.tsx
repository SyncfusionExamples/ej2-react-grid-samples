/**
 * Main App Component
 * Root application with routing and layout
 */

import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Header } from './components/Header'
import { Sidebar } from './components/Sidebar'
import { ToastNotificationContainer, Toast } from './components/ToastNotification'
import { ErrorBoundary } from './components/ErrorBoundary'
import { AppProvider, useAppContext } from './context/AppContext'
import { useSocketConnection, useSocket } from './hooks/useSocket'
import Dashboard from './pages/Dashboard'
import Alerts from './pages/Alerts'
import Reports from './pages/Reports'
import { apiService } from './services/apiService'

const AppLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [toasts, setToasts] = useState<Toast[]>([])
  const { setSummary } = useAppContext()

  // Initialize socket connection
  // Connection state is now managed by AppContext via socketService.onConnectionStateChange()
  useSocketConnection()

  // Listen for summary updates
  useSocket('summary_update', (summary) => {
    setSummary(summary)
  })

  // Listen for anomalies and show toast
  // Server is single source of truth — trust that server only sends valid, non-duplicate alerts
  // Toast display is simply: receive event → show toast with auto-timeout
  // No client-side deduplication needed
  useSocket(
    'anomaly_detected',
    (alert: { 
      message: string
      severity: string
      alertType?: string
      deviceId?: string
      deviceName?: string
    }) => {
      // Determine toast type based on severity or alert type
      const isBatteryAlert = alert.alertType?.includes('BATTERY')
      const toastType = isBatteryAlert ? 'warning' : 'error'
      
      console.log(`[Toast] Showing: ${alert.message} (type: ${toastType})`)
      addToast(alert.message, toastType)
    }
  )

  // Fetch initial summary — silent on failure; the Dashboard / Alerts
  // pages render their own empty / retry state. The summary card on
  // the dashboard simply shows zeros until a real value arrives.
  useEffect(() => {
    let cancelled = false
    const fetchSummary = async () => {
      try {
        const summary = await apiService.getSummary()
        if (!cancelled) setSummary(summary)
      } catch {
        // Intentionally swallowed — server may be unavailable
      }
    }
    fetchSummary()
    return () => {
      cancelled = true
    }
  }, [setSummary])

  const addToast = (message: string, type: Toast['type'] = 'info') => {
    const id = Date.now().toString()
    setToasts((prev) => [...prev, { id, message, type }])
  }

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  const { alertCount } = useAppContext()

  return (
    <div className="flex h-screen bg-[#f8fafc] text-slate-900">
      {/* Sidebar — fixed w-60 on md+ */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main wrapper — offset by sidebar on md+ */}
      <div className="flex-1 flex flex-col overflow-hidden md">
        {/* Header — h-14 */}
        <Header
          onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          isSidebarOpen={isSidebarOpen}
          alertCount={alertCount}
        />

        {/* Page content — scrollable, padding matches header */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-4 lg:p-4 max-w-screen-2xl mx-auto w-full">
            <ErrorBoundary>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/alerts" element={<Alerts />} />
                <Route path="/reports" element={<Reports />} />
              </Routes>
            </ErrorBoundary>
          </div>
        </main>
      </div>

      {/* Toast notifications */}
      <ToastNotificationContainer toasts={toasts} onRemove={removeToast} />
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </AppProvider>
  )
}
