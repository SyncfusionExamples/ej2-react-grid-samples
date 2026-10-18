/**
 * Header Component
 * Top navigation bar — clean enterprise style
 */

import React, { useState, useEffect } from 'react'
import { useAppContext } from '../context/AppContext'

interface HeaderProps {
  onMenuToggle: () => void
  isSidebarOpen: boolean
  alertCount?: number
}

export const Header: React.FC<HeaderProps> = ({ onMenuToggle, alertCount = 0 }) => {
  const { socketConnected } = useAppContext()
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const timeStr = currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  const dateStr = currentTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })

  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center px-4 md:px-6 gap-4 sticky top-0 z-40">
      {/* Mobile menu toggle */}
      <button
        onClick={onMenuToggle}
        className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
        aria-label="Toggle menu"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* App title (desktop) */}
      <div className="hidden md:flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2v-4M9 21H5a2 2 0 01-2-2v-4m0 0h18" />
          </svg>
        </div>
        <span className="text-sm font-semibold text-slate-800">Industrial IoT Monitoring</span>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Live time display */}
      <div className="hidden sm:flex flex-col items-end leading-tight">
        <span className="text-xs font-semibold text-slate-700 tabular-nums">{timeStr}</span>
        <span className="text-[10px] text-slate-400">{dateStr}</span>
      </div>

      {/* Divider */}
      <div className="hidden sm:block w-px h-6 bg-slate-200" />

      {/* Connection status */}
      <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200">
        <span
          className={`w-2 h-2 rounded-full flex-shrink-0 ${
            socketConnected ? 'bg-emerald-500 shadow-sm shadow-emerald-300' : 'bg-red-500'
          }`}
          style={socketConnected ? { animation: 'pulse 2s ease-in-out infinite' } : {}}
        />
        <span className={`text-[11px] font-medium hidden sm:inline ${socketConnected ? 'text-emerald-700' : 'text-red-600'}`}>
          {socketConnected ? 'Live' : 'Offline'}
        </span>
      </div>

      {/* Alert count badge */}
      {alertCount > 0 && (
        <div className="relative flex items-center justify-center w-9 h-9 rounded-lg text-slate-500 hover:bg-slate-100 cursor-pointer transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
            {alertCount > 9 ? '9+' : alertCount}
          </span>
        </div>
      )}

      {/* User avatar */}
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center pointer-events-none">
        <span className="text-white font-semibold text-[11px] tracking-wide">IO</span>
      </div>
    </header>
  )
}
