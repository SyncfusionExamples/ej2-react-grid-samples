/**
 * Date Utilities
 * Helper functions for date manipulation and formatting
 */

export const formatDate = (date: Date | string): string => {
  const d = new Date(date)
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

export const getDateRange = (rangeType: 'today' | 'yesterday' | 'last7days' | 'custom') => {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  switch (rangeType) {
    case 'today':
      return {
        startDate: today,
        endDate: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1)
      }
    case 'yesterday':
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)
      return {
        startDate: yesterday,
        endDate: new Date(yesterday.getTime() + 24 * 60 * 60 * 1000 - 1)
      }
    case 'last7days':
      const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
      return {
        startDate: sevenDaysAgo,
        endDate: now
      }
    default:
      return { startDate: today, endDate: now }
  }
}

export const toISOString = (date: Date | string): string => {
  return new Date(date).toISOString()
}
