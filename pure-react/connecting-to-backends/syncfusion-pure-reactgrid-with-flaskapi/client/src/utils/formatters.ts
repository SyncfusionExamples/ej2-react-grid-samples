/**
 * Utility formatters used across the inventory grid.
 */
export const formatCurrency = (value: number): string =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)

export const formatNumber = (value: number): string => new Intl.NumberFormat('en-US').format(value)

export const formatDate = (dateString: string | Date): string => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

const CATEGORY_COLORS: Record<string, string> = {
  Electronics: '#1976d2',
  Accessories: '#43a047',
  Storage: '#f57c00',
  Networking: '#c2185b',
  Software: '#5e35b1',
  Components: '#0097a7',
  Peripherals: '#ad1457',
  'Smart Devices': '#e64a19'
}

const STATUS_COLORS: Record<string, string> = {
  'In Stock': '#43a047',
  'Out of Stock': '#f44336',
  Discontinued: '#9e9e9e'
}

export const getCategoryColor = (category: string): string => CATEGORY_COLORS[category] ?? '#757575'

export const getStatusColor = (status: string): string => STATUS_COLORS[status] ?? '#757575'

export const calculateStockPercentage = (stock: number, maxStock: number = 5000): number =>
  Math.min((stock / maxStock) * 100, 100)

export const truncateText = (text: string, maxLength: number = 50): string => {
  if (!text) return ''
  return text.length <= maxLength ? text : `${text.substring(0, maxLength)}...`
}

interface SortDescriptor {
  field: string
  direction: 'asc' | 'desc'
}

interface FilterDescriptor {
  field?: string
  operator?: string
  value?: unknown
  filters?: FilterDescriptor[]
  logic?: 'and' | 'or'
}

export const parseSortingState = (sortDescriptor: SortDescriptor[] | undefined): SortDescriptor[] => {
  if (!sortDescriptor?.length) return []
  return sortDescriptor.map((sort) => ({
    field: sort.field,
    direction: sort.direction === 'desc' ? 'desc' : 'asc'
  }))
}

export const parseFilteringState = (filterDescriptor: FilterDescriptor | undefined): FilterDescriptor[] => {
  if (!filterDescriptor) return []
  const parseFilters = (filters: FilterDescriptor[], predicate: 'and' | 'or' = 'and'): FilterDescriptor[] =>
    filters.map((filter) =>
      filter.filters
        ? { logic: filter.logic || predicate, filters: parseFilters(filter.filters, filter.logic || predicate) }
        : { field: filter.field, operator: filter.operator, value: filter.value }
    )
  return parseFilters([filterDescriptor])
}
