/**
 * Status Badge Component
 * Compact badge optimized for Grid row heights
 */

import React from 'react'

interface StatusBadgeProps {
  status: 'Normal' | 'Warning' | 'Critical' | 'Offline' | 'High' | 'Medium' | 'Low'
  className?: string
  showDot?: boolean
}

const statusConfig: Record<string, { bg: string; text: string; dot: string }> = {
  Normal: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    dot: 'bg-emerald-500'
  },
  Warning: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    dot: 'bg-amber-400'
  },
  Critical: {
    bg: 'bg-red-50',
    text: 'text-red-700',
    dot: 'bg-red-500'
  },
  Offline: {
    bg: 'bg-slate-100',
    text: 'text-slate-600',
    dot: 'bg-slate-400'
  },
  High: {
    bg: 'bg-red-50',
    text: 'text-red-700',
    dot: 'bg-red-500'
  },
  Medium: {
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    dot: 'bg-orange-500'
  },
  Low: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    dot: 'bg-blue-500'
  }
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  className = '',
  showDot = true
}) => {
  const cfg = statusConfig[status] || statusConfig.Normal

  return (
    <div className="flex items-center h-full">
      <span
        className={`
          inline-flex
          items-center
          justify-center
          gap-1
          h-6
          px-2.5
          rounded-full
          text-[11px]
          font-semibold
          leading-none
          whitespace-nowrap
          ${cfg.bg}
          ${cfg.text}
          ${className}
        `}
      >
        {showDot && (
          <span
            className={`
              w-1.5
              h-1.5
              rounded-full
              flex-shrink-0
              ${cfg.dot}
              ${
                status === 'Critical' || status === 'High'
                  ? 'animate-pulse'
                  : ''
              }
            `}
          />
        )}

        {status}
      </span>
    </div>
  )
}