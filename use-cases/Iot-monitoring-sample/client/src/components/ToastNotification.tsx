/**
 * Toast Notification Component
 * Only one toast is visible at a time; additional notifications are queued.
 * Duplicate messages are grouped and displayed once while queued.
 */

import React, { useEffect, useState, useMemo } from 'react'

export interface Toast {
  id: string
  message: string
  type: 'success' | 'warning' | 'error' | 'info'
  duration?: number
}

interface ToastNotificationProps {
  toasts: Toast[]
  onRemove: (id: string) => void
}

const MAX_VISIBLE = 1
const DEFAULT_TOAST_DURATION = 4000 // 4 seconds

// Icons per type
const icons: Record<Toast['type'], React.ReactNode> = {
  success: (
    <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
  ),
  error: (
    <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
    </svg>
  ),
  warning: (
    <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
  ),
  info: (
    <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
    </svg>
  ),
}

const typeStyles: Record<Toast['type'], string> = {
  success: 'bg-white border-l-4 border-emerald-500 text-slate-700',
  error:   'bg-white border-l-4 border-red-500   text-slate-700',
  warning: 'bg-white border-l-4 border-amber-400  text-slate-700',
  info:    'bg-white border-l-4 border-blue-500   text-slate-700',
}

const iconStyles: Record<Toast['type'], string> = {
  success: 'text-emerald-500',
  error:   'text-red-500',
  warning: 'text-amber-500',
  info:    'text-blue-500',
}

interface GroupedToast {
  representativeId: string   // id to remove when dismissed
  allIds: string[]           // all ids in this group
  message: string
  type: Toast['type']
  count: number
  duration?: number
}

const ToastItem: React.FC<{ group: GroupedToast; onRemove: () => void; queueCount: number }> = ({
  group,
  onRemove,
  queueCount,
}) => {
  const [visible, setVisible] = useState(false)
  const [exiting, setExiting] = useState(false)

  // Animate in
  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(id)
  }, [])

  // Auto-dismiss after duration
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setExiting(true)
      window.setTimeout(onRemove, 300)
    }, group.duration || DEFAULT_TOAST_DURATION)
    return () => window.clearTimeout(timer)
  }, [group.duration, onRemove])

  const handleClose = () => {
    setExiting(true)
    window.setTimeout(onRemove, 300)
  }

  return (
    <div
      role="alert"
      className={`
        flex items-start gap-3 px-4 py-3 rounded-xl shadow-lg min-w-[280px] max-w-sm w-[300px]
        ${typeStyles[group.type]}
        transition-all duration-300 ease-out
        ${visible && !exiting ? 'translate-x-0 opacity-100' : 'translate-x-3 opacity-0'}
      `}
    >
      <span className={`mt-0.5 ${iconStyles[group.type]}`}>{icons[group.type]}</span>

      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium leading-snug line-clamp-2">
          {group.message}
          {group.count > 1 && (
            <span className="ml-1.5 inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
              ×{group.count}
            </span>
          )}
        </p>
        {queueCount > 0 && (
          <p className="text-[10px] text-slate-400 mt-0.5">+{queueCount} more in queue</p>
        )}
      </div>

      <button
        onClick={handleClose}
        className="flex-shrink-0 p-0.5 text-slate-400 hover:text-slate-600 transition-colors rounded"
        aria-label="Dismiss"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}

/**
 * Groups toasts with identical messages into single items with a count badge.
 * Shows at most MAX_VISIBLE at once; extras are queued.
 */
export const ToastNotificationContainer: React.FC<ToastNotificationProps> = ({ toasts, onRemove }) => {
  const grouped = useMemo<GroupedToast[]>(() => {
    const map = new Map<string, GroupedToast>()
    for (const t of toasts) {
      const key = `${t.type}::${t.message}`
      const existing = map.get(key)
      if (existing) {
        existing.count++
        existing.allIds.push(t.id)
      } else {
        map.set(key, {
          representativeId: t.id,
          allIds: [t.id],
          message: t.message,
          type: t.type,
          count: 1,
          duration: t.duration,
        })
      }
    }
    return Array.from(map.values())
  }, [toasts])

  const visible = grouped.slice(0, MAX_VISIBLE)
  const queueCount = grouped.length - visible.length

  if (visible.length === 0) return null

  return (
    <div
      className="fixed top-16 right-4 z-50 flex flex-col gap-2 items-end"
      aria-live="polite"
      aria-atomic="false"
    >
      {visible.map((group, idx) => (
        <ToastItem
          key={group.representativeId}
          group={group}
          queueCount={idx === visible.length - 1 ? queueCount : 0}
          onRemove={() => group.allIds.forEach((id) => onRemove(id))}
        />
      ))}
    </div>
  )
}
