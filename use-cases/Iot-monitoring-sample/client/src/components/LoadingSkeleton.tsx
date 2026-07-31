/**
 * Loading Skeleton Component
 * Placeholder for loading states
 */

import React from 'react'

interface LoadingSkeletonProps {
  count?: number
  height?: string
  type?: 'card' | 'table' | 'chart'
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  count = 1,
  height = 'h-12',
  type = 'card'
}) => {
  const skeletonItems = Array.from({ length: count })

  if (type === 'card') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {skeletonItems.map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-soft">
            <div className="skeleton h-4 w-24 mb-4" />
            <div className="skeleton h-8 w-32 mb-2" />
            <div className="skeleton h-3 w-20" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {skeletonItems.map((_, i) => (
        <div key={i} className={`skeleton ${height} w-full rounded`} />
      ))}
    </div>
  )
}
