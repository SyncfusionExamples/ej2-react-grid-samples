/**
 * GridDataAdaptor
 *
 * Client-side helper for Syncfusion Grid Custom Binding.
 *
 * Responsibilities:
 * - Parse dataStateChange arguments.
 * - Preserve the Syncfusion where tree.
 * - Send paging, sorting, searching and filtering parameters to the server.
 * - Return { result, count } back to the Grid.
 *
 * All data operations (filtering, searching, sorting and paging)
 * are performed on the server.
 */


// Use relative proxy path in dev; absolute URL in production
const API_BASE_URL = 'http://localhost:3001/api' 

// ------------------------------------------------------------------
// Types
// ------------------------------------------------------------------

/** A single filter predicate as sent by Syncfusion Grid */
export interface FilterPredicate {
  field: string
  /** e.g. 'equal' | 'notequal' | 'contains' | 'startswith' | 'endswith' | 'greaterthan' | 'lessthan' */
  operator: string
  value: unknown
  matchCase?: boolean
  predicate?: 'and' | 'or'
}

/** Syncfusion predicate node in the where tree */
export interface PredicateNode {
  field?: string
  operator?: string
  value?: unknown
  matchCase?: boolean
  predicates?: PredicateNode[]
  condition?: 'and' | 'or'
  isComplex?: boolean
}

export interface GridRequestState {
  skip: number
  take: number
  sortBy: string
  sortDirection: 'ascending' | 'descending'
  searchValue: string
  /** Structured filter predicates — one entry per filtered column */
  filters: FilterPredicate[]
  /** Preserved Syncfusion where tree for advanced filtering (multi-predicate support) */
  where?: PredicateNode[]
  /** Virtual scroll request detected */
  isVirtualScroll?: boolean
  /** Request type from dataStateChange */
  requestType?: string
}

export interface GridResult<T = Record<string, unknown>> {
  result: T[]
  count: number
}

// ------------------------------------------------------------------
// Fetch devices — called from Dashboard dataStateChange handler
// ------------------------------------------------------------------

export async function fetchDeviceGridData(state: GridRequestState): Promise<GridResult> {
  const params = new URLSearchParams({
    skip: String(state.skip),
    take: String(state.take),
    sortBy: state.sortBy,
    sortDirection: state.sortDirection,
    searchValue: state.searchValue,
  })

  // Send preserved where tree to server for correct multi-predicate evaluation
  // The where tree includes complex filter groups from multi-select checkbox filters
  if (state.where && state.where.length > 0) {
    params.set('where', JSON.stringify(state.where))
  } else if (state.filters && state.filters.length > 0) {
    // Fallback to flat filters if where tree is not available
    params.set('filters', JSON.stringify(state.filters))
  }


  const response = await fetch(`${API_BASE_URL}/devices/grid?${params}`)
  if (!response.ok) {
    throw new Error(`Grid fetch failed: ${response.status} ${response.statusText}`)
  }
  return response.json() as Promise<GridResult>
}

// ------------------------------------------------------------------
// Fetch alerts — called from Alerts page dataStateChange handler
// ------------------------------------------------------------------

export async function fetchAlertGridData(
  state: GridRequestState,
  startDate?: Date,
  endDate?: Date
): Promise<GridResult> {
  const params: Record<string, string> = {
    skip: String(state.skip),
    take: String(state.take),
    sortBy: state.sortBy,
    sortDirection: state.sortDirection,
    searchValue: state.searchValue,
  }

  // Send where tree for complex multi-select filtering (e.g., multiple severity levels)
  if (state.where && state.where.length > 0) {
    params['where'] = JSON.stringify(state.where)
  } else if (state.filters && state.filters.length > 0) {
    params['filters'] = JSON.stringify(state.filters)
  }

  if (startDate && endDate) {
    params['startDate'] = startDate.toISOString()
    params['endDate'] = endDate.toISOString()
  }

  // Indicate if this is a virtual scroll request (for row virtualization > 100 records)
  if (state.isVirtualScroll) {
    params['virtualScroll'] = 'true'
  }

  const response = await fetch(`${API_BASE_URL}/alerts/grid?${new URLSearchParams(params)}`)
  if (!response.ok) {
    throw new Error(`Alerts fetch failed: ${response.status} ${response.statusText}`)
  }
  return response.json() as Promise<GridResult>
}

// ------------------------------------------------------------------
// Parse dataStateChange event args -> GridRequestState
// ------------------------------------------------------------------
export function parseGridState(args: {
  skip?: number
  take?: number
  sorted?: Array<{ name: string; direction: string }>
  where?: unknown[]
  action?: { requestType: string; searchString?: string }
  searchString?: string
}): GridRequestState {
  const skip = args.skip ?? 0
  const take = args.take ?? 12

  let sortBy = ''
  let sortDirection: 'ascending' | 'descending' = 'ascending'

  if (args.sorted && args.sorted.length > 0) {
    sortBy = args.sorted[0].name ?? ''
    sortDirection =
      String(args.sorted[0].direction ?? 'ascending').toLowerCase() === 'descending'
        ? 'descending'
        : 'ascending'
  }

  let searchValue =
    args.searchString ??
    (args.action?.requestType === 'searching' ? (args.action.searchString ?? '') : '')

  searchValue = searchValue.trim().toLowerCase()
  const requestType = args.action?.requestType ?? ''
  const isVirtualScroll = requestType === 'virtualscroll'

  // Preserve the original Syncfusion where tree for correct multi-predicate evaluation.
  // The where array may contain:
  //   - Simple predicates: { field, operator, value, matchCase }
  //   - Nested groups: { predicates: [...], condition: 'and'|'or' }
  // Example multi-select: multiple severity values are OR'd within a group,
  // then AND'd with other column filters.
  const where = (Array.isArray(args.where) ? args.where : []) as PredicateNode[]
  const filters: FilterPredicate[] = []

  return {
    skip,
    take,
    sortBy,
    sortDirection,
    searchValue,
    filters,
    where,
    isVirtualScroll,
    requestType,
  }
}

// ------------------------------------------------------------------
// Filter choice data sources (for filter dropdowns)
// ------------------------------------------------------------------

/**
 * Get ALL filtered device records for filter dropdown distinct values.
 * 
 */
export async function fetchDeviceGridDataForFilterChoices(
  state: GridRequestState
): Promise<GridResult> {
  const params = new URLSearchParams({
    skip: '0',
    take: String(999999), // Unlimited — get all matching records
    sortBy: state.sortBy,
    sortDirection: state.sortDirection,
    searchValue: state.searchValue,
  })

  if (state.where && state.where.length > 0) {
    params.set('where', JSON.stringify(state.where))
  } else if (state.filters && state.filters.length > 0) {
    params.set('filters', JSON.stringify(state.filters))
  }

  const response = await fetch(`${API_BASE_URL}/devices/grid?${params}`)
  if (!response.ok) {
    throw new Error(`Filter choices fetch failed: ${response.status} ${response.statusText}`)
  }
  return response.json() as Promise<GridResult>
}
