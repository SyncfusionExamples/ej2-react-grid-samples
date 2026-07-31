/**
 * useGridState Hook
 * Centralized grid state management using plain useState.
 *
 * Handles all grid state transitions: pagination, sorting, filtering, searching
 * Ensures page index resets when filters or search changes.
 *
 * NOTE: Implemented with useState (NOT useReducer) to keep grid state local
 * to the consuming component and avoid extra render passes.
 */

import { useState, useCallback, useRef, useEffect } from 'react'

// ------------------------------------------------------------------
// Types
// ------------------------------------------------------------------

export interface FilterPredicate {
  field: string
  operator: string
  value: string | number | boolean
  predicate?: 'and' | 'or'
  matchCase?: boolean
}

export interface GridRequestState {
  skip: number
  take: number
  sortBy: string
  sortDirection: 'ascending' | 'descending'
  searchValue: string
  filters: FilterPredicate[]
}

export interface GridResponse<T> {
  result: T[]
  count: number
}

export interface GridStateData<T> {
  request: GridRequestState
  response: GridResponse<T>
  isLoading: boolean
  error: Error | null
}

// ------------------------------------------------------------------
// Hook
// ------------------------------------------------------------------

export interface UseGridStateOptions {
  pageSize?: number
  initialFilters?: FilterPredicate[]
  initialSearch?: string
}

export interface UseGridStateReturn<T> {
  // State
  state: GridStateData<T>
  isLoading: boolean
  error: Error | null
  data: T[]
  totalCount: number
  request: GridRequestState

  // Pagination
  pageIndex: number
  pageCount: number
  pageSize: number

  // Filters
  hasActiveFilters: boolean

  // Actions
  setPage: (pageIndex: number) => void
  setSort: (field: string, direction: 'ascending' | 'descending') => void
  setSearch: (query: string) => void
  setFilters: (filters: FilterPredicate[]) => void
  resetFilters: () => void
  setLoading: (loading: boolean) => void
  setData: (response: GridResponse<T>) => void
  setError: (error: Error | null) => void
}

export function useGridState<T>(options: UseGridStateOptions = {}): UseGridStateReturn<T> {
  const { pageSize = 10, initialFilters = [], initialSearch = '' } = options

  const [request, setRequest] = useState<GridRequestState>(() => ({
    skip: 0,
    take: pageSize,
    sortBy: '',
    sortDirection: 'ascending',
    searchValue: initialSearch,
    filters: initialFilters,
  }))

  const [data, setDataInternal] = useState<T[]>([])
  const [count, setCount] = useState<number>(0)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setErrorInternal] = useState<Error | null>(null)

  // ------------------------------------------------------------------
  // Stable refs for callback identity (prevents re-renders)
  // ------------------------------------------------------------------
  const pageSizeRef = useRef(pageSize)
  useEffect(() => {
    pageSizeRef.current = pageSize
  }, [pageSize])

  // ------------------------------------------------------------------
  // Actions — all use functional updates to avoid stale closures
  // ------------------------------------------------------------------

  const setPage = useCallback((pageIndex: number) => {
    const skip = pageIndex * pageSizeRef.current
    setRequest((prev) => (prev.skip === skip ? prev : { ...prev, skip }))
  }, [])

  const setSort = useCallback(
    (field: string, direction: 'ascending' | 'descending' = 'ascending') => {
      setRequest((prev) => {
        if (prev.sortBy === field && prev.sortDirection === direction) return prev
        return { ...prev, sortBy: field, sortDirection: direction, skip: 0 }
      })
    },
    []
  )

  const setSearch = useCallback((query: string) => {
    setRequest((prev) =>
      prev.searchValue === query ? prev : { ...prev, searchValue: query, skip: 0 }
    )
  }, [])

  const setFilters = useCallback((filters: FilterPredicate[]) => {
    setRequest((prev) => {
      if (prev.filters.length === filters.length) {
        let same = true
        for (let i = 0; i < filters.length; i++) {
          const a = prev.filters[i]
          const b = filters[i]
          if (a.field !== b.field || a.operator !== b.operator || a.value !== b.value) {
            same = false
            break
          }
        }
        if (same) return prev
      }
      return { ...prev, filters, skip: 0 }
    })
  }, [])

  const resetFilters = useCallback(() => {
    setRequest((prev) => {
      if (
        prev.filters.length === 0 &&
        prev.searchValue === '' &&
        prev.sortBy === '' &&
        prev.sortDirection === 'ascending' &&
        prev.skip === 0
      ) {
        return prev
      }
      return {
        ...prev,
        filters: [],
        searchValue: '',
        sortBy: '',
        sortDirection: 'ascending',
        skip: 0,
      }
    })
  }, [])

  const setLoading = useCallback((loading: boolean) => {
    setIsLoading((prev) => (prev === loading ? prev : loading))
  }, [])

  const setData = useCallback((response: GridResponse<T>) => {
    setDataInternal(response.result)
    setCount(response.count)
    setIsLoading(false)
    setErrorInternal(null)
  }, [])

  const setError = useCallback((err: Error | null) => {
    setErrorInternal(err)
    setIsLoading(false)
  }, [])

  // ------------------------------------------------------------------
  // Derived values
  // ------------------------------------------------------------------
  const pageIndex = Math.floor(request.skip / pageSizeRef.current)
  const pageCount = Math.ceil(count / pageSizeRef.current) || 1
  const hasActiveFilters = request.filters.length > 0 || request.searchValue.length > 0

  const state: GridStateData<T> = {
    request,
    response: { result: data, count },
    isLoading,
    error,
  }

  return {
    // State
    state,
    isLoading,
    error,
    data,
    totalCount: count,
    request,

    // Pagination
    pageIndex,
    pageCount,
    pageSize: pageSizeRef.current,

    // Filters
    hasActiveFilters,

    // Actions
    setPage,
    setSort,
    setSearch,
    setFilters,
    resetFilters,
    setLoading,
    setData,
    setError,
  }
}
