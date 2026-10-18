import React from 'react'

interface SummaryCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  color: 'blue' | 'green' | 'orange' | 'red' | 'violet'
  subtext?: string
  trend?: { value: string; positive?: boolean }
}

const colorMap = {
  blue: {
    bg: 'bg-blue-50',
    ring: 'ring-blue-100',
    icon: 'text-blue-600'
  },
  green: {
    bg: 'bg-emerald-50',
    ring: 'ring-emerald-100',
    icon: 'text-emerald-600'
  },
  orange: {
    bg: 'bg-amber-50',
    ring: 'ring-amber-100',
    icon: 'text-amber-600'
  },
  red: {
    bg: 'bg-red-50',
    ring: 'ring-red-100',
    icon: 'text-red-600'
  },
  violet: {
    bg: 'bg-violet-50',
    ring: 'ring-violet-100',
    icon: 'text-violet-600'
  }
}

export const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  value,
  icon,
  color,
  subtext,
  trend
}) => {
  const c = colorMap[color]

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm px-4 py-3 hover:shadow transition-all">
      <div className="flex items-center justify-between">

        <div className="min-w-0 flex-1">

          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 truncate">
            {title}
          </p>

          <div className="mt-1 flex items-center gap-2">
            <span className="text-xl font-bold leading-none text-slate-800 tabular-nums">
              {value}
            </span>

            {trend && (
              <span
                className={`text-[10px] font-medium ${
                  trend.positive !== false
                    ? 'text-emerald-600'
                    : 'text-red-500'
                }`}
              >
                {trend.positive !== false ? '↑' : '↓'} {trend.value}
              </span>
            )}
          </div>

          {subtext && (
            <p className="mt-1 text-[10px] text-slate-400 truncate">
              {subtext}
            </p>
          )}

        </div>

        <div
          className={`${c.bg} ring-1 ${c.ring} w-8 h-8 rounded-md flex items-center justify-center ${c.icon}`}
        >
          {icon}
        </div>

      </div>
    </div>
  )
}