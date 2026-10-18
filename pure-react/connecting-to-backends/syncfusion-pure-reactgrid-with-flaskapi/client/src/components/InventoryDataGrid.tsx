/**
 * Inventory DataGrid Component — Syncfusion Pure React, custom data binding.
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Grid,
  Columns,
  Column,
  PageSettings,
  EditType,
  type DataRequestEvent,
  type DataChangeRequestEvent,
  type ColumnTemplateProps,
  type SortSettings,
  type FilterSettings,
  type SearchSettings,
  type EditSettings,
  type SelectionSettings,
  type GridRef
} from '@syncfusion/react-grid'
import {
  productAPI,
  PRODUCT_STATUS_OPTIONS,
  type Product,
  type ApiResponse
} from '../services/api'
import {
  formatCurrency,
  calculateStockPercentage,
  truncateText
} from '../utils/formatters'
import '../styles/grid.css'

const PRODUCT_ID_PATTERN = /^PROD-\d{6}$/

const toNumber = (value: unknown): number =>
  typeof value === 'number' ? value : Number(value) || 0

const stripId = (data: Record<string, unknown>) => {
  const { id: _ignored, ...rest } = data
  return rest
}

const getSelectedProductIds = (value: unknown): string[] => {
  if (!Array.isArray(value)) return []
  return value
    .map((item) => {
      if (item && typeof item === 'object' && 'productId' in item) {
        return String((item as Product).productId)
      }
      return ''
    })
    .filter((productId) => productId.length > 0)
}

const extractSearchTerm = (raw: unknown): string => {
  if (raw == null) return ''
  if (typeof raw === 'string') return raw.trim()
  if (Array.isArray(raw) && raw.length > 0) {
    const first = raw[0]
    if (first && typeof first === 'object') {
      return extractSearchTerm((first as Record<string, unknown>).value ?? (first as Record<string, unknown>).key)
    }
    return String(first).trim()
  }
  if (typeof raw === 'object') {
    const obj = raw as Record<string, unknown>
    return extractSearchTerm(obj.value ?? obj.key ?? obj.search)
  }
  return String(raw).trim()
}

const toSlug = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const toLabel = (value: string): string =>
  value.length > 0 ? value.charAt(0).toUpperCase() + value.slice(1) : ''

const dropdownEdit: { type: EditType } = { type: EditType.DropDownList }
const numericEdit: { type: EditType } = { type: EditType.NumericTextBox }

interface InventoryStats {
  totalProducts: number
  totalStock: number
  totalValue: number
  inStockProducts: number
}

interface GridDataState {
  result: Product[]
  count: number
}

const TOOLBAR = ['Add', 'Edit', 'Delete', 'Update', 'Cancel', 'Search']

const InventoryDataGrid: React.FC = (): React.ReactElement => {
  const gridRef = useRef<GridRef<unknown> | null>(null)

  const sortSettings = useMemo<SortSettings>(() => ({ enabled: true }), [])
  const filterSettings = useMemo<FilterSettings>(() => ({ enabled: true }), [])
  const searchSettings = useMemo<SearchSettings>(() => ({ enabled: true }), [])
  const editSettings = useMemo<EditSettings>(
    () => ({ allowAdd: true, allowEdit: true, allowDelete: true, confirmOnDelete: false }),
    []
  )
  const selectionSettings = useMemo<SelectionSettings>(() => ({ mode: 'Multiple', persistSelection: true }), [])

  const skuRules = useMemo(() => ({ required: true, pattern: PRODUCT_ID_PATTERN }), [])
  const nameRules = useMemo(() => ({ required: true, minLength: 2, maxLength: 255 }), [])
  const categoryRules = useMemo(() => ({ required: true }), [])
  const priceRules = useMemo(() => ({ required: true, min: 0 }), [])
  const stockRules = useMemo(() => ({ required: true, min: 1, max: 1_000_000 }), [])
  const statusRules = useMemo(() => ({ required: true }), [])

  const [dataSource, setDataSource] = useState<GridDataState>({ result: [], count: 0 })
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<InventoryStats>({
    totalProducts: 0,
    totalStock: 0,
    totalValue: 0,
    inStockProducts: 0
  })

  const pageSettings = useMemo<PageSettings>(
    () => ({ enabled: true, pageSize: 12, pageCount: 5 }),
    []
  )

  const fetchProducts = useCallback(async (params: Record<string, unknown>): Promise<void> => {
    setLoading(true)
    setError(null)
    try {
      const response: ApiResponse<Product[]> = await productAPI.getProducts(params)
      setDataSource({ result: response.result ?? [], count: response.count ?? 0 })
    } catch (err: unknown) {
      const apiError = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
      setError(apiError ?? 'Failed to fetch products')
    } finally {
      setLoading(false)
    }
  }, [])

  const handleDataRequest = useCallback(
    async (args: DataRequestEvent): Promise<void> => {
      const params: Record<string, unknown> = {
        skip: args.skip ?? 0,
        take: args.take ?? 12
      }

      const sorted = (args as { sorted?: unknown }).sorted ?? (args as { sort?: unknown }).sort
      if (Array.isArray(sorted) && sorted.length > 0) {
        params.sorted = sorted.map((s: Record<string, unknown>) => ({
          field: (s.name as string) ?? (s.field as string),
          direction: (s.direction as string) ?? (s.dir as string) ?? 'ascending'
        }))
      }

      const where = (args as { where?: unknown }).where
      if (Array.isArray(where) && where.length > 0) {
        const predicates = where.flatMap((entry: Record<string, unknown>) => {
          if (Array.isArray(entry.predicates)) return entry.predicates
          return [entry]
        })
        params.where = predicates
          .filter((p) => p?.field && p?.operator && p?.value !== undefined && p?.value !== null)
          .map((p) => ({
            field: (p.field as string) ?? (p.name as string),
            operator: String(p.operator ?? p.predicate ?? 'contains'),
            value: p.value
          }))
      }

      const searchTerm = extractSearchTerm((args as { search?: unknown }).search)
      if (searchTerm.length > 0) params.search = searchTerm

      await fetchProducts(params)
    },
    [fetchProducts]
  )

  const executeCrud = useCallback(
    async (action: string | undefined, data: Record<string, unknown> | undefined): Promise<void> => {
      if (!action || !data) return
      const normalized = action.toLowerCase()
      switch (normalized) {
        case 'add':
        case 'insert':
          await productAPI.createProduct(stripId(data) as Omit<Product, 'id'>)
          return
        case 'edit':
        case 'update':
          if (data.productId != null) await productAPI.updateProduct(String(data.productId), data)
          return
        case 'delete':
        case 'remove': {
          const productIds = getSelectedProductIds(data)
          await Promise.all(productIds.map((productId) => productAPI.deleteProduct(productId)))
          return
        }
        default:
          return
      }
    },
    []
  )

  const handleDataSourceChange = useCallback(
    async (args: DataChangeRequestEvent): Promise<void> => {
      try {
        const action = (args as { action?: string }).action
        const data = (args as { data?: Record<string, unknown> }).data
        await executeCrud(action, data)
        args.saveDataChanges?.()
        await fetchProducts({ skip: 0, take: pageSettings.pageSize })
      } catch {
        args.cancelDataChanges?.()
      }
    },
    [executeCrud, fetchProducts, pageSettings.pageSize]
  )

  const fetchStats = useCallback(async (): Promise<void> => {
    try {
      const statsData = await productAPI.getStats()
      setStats({
        totalProducts: statsData.totalProducts ?? 0,
        totalStock: statsData.totalStock ?? 0,
        totalValue: statsData.totalValue ?? 0,
        inStockProducts: statsData.inStockProducts ?? 0
      })
    } catch {
      // Keep zero defaults if the stats endpoint is unreachable.
    }
  }, [])

  useEffect(() => {
    void fetchProducts({ skip: 0, take: 50 })
    void fetchStats()
  }, [fetchProducts, fetchStats])

  const productNameTemplate = (props: ColumnTemplateProps<Product>): React.ReactElement => {
    const row = props.data as Product | undefined
    const name = row?.productName ?? ''
    return (
      <a
        href="#"
        onClick={(event: React.MouseEvent<HTMLAnchorElement>) => event.preventDefault()}
        className="product-link"
        title={name}
      >
        {truncateText(name, 40)}
      </a>
    )
  }

  const categoryTemplate = (props: ColumnTemplateProps<Product>): React.ReactElement => {
    const row = props.data as Product | undefined
    const category = row?.category ?? 'Uncategorized'
    return (
      <div className="cat-cell">
        <span className={`category-badge badge-${toSlug(category) || 'uncategorized'}`}>{category}</span>
      </div>
    )
  }

  const priceTemplate = (props: ColumnTemplateProps<Product>): React.ReactElement => {
    const row = props.data as Product | undefined
    const price = toNumber(row?.price)
    return <span className="price-currency">{formatCurrency(price)}</span>
  }

  const stockTemplate = (props: ColumnTemplateProps<Product>): React.ReactElement => {
    const row = props.data as Product | undefined
    const stock = toNumber(row?.stock)
    const percentage = calculateStockPercentage(stock, 5000)
    return (
      <div className="stock-progress-container">
        <div className="stock-progress-bar">
          <div className="stock-progress-fill" style={{ width: `${percentage}%` }} />
        </div>
        <span className="stock-progress-text">{stock.toLocaleString()}</span>
      </div>
    )
  }

  const statusTemplate = (props: ColumnTemplateProps<Product>): React.ReactElement => {
    const row = props.data as Product | undefined
    const status = row?.status ?? ''
    return (
      <div className="status-cell">
        <span className={`status-badge status-${toSlug(status)}`}>{toLabel(status)}</span>
      </div>
    )
  }

  if (error && dataSource.result.length === 0) {
    return (
      <div className="grid-container">
        <div className="grid-header">
          <div className="error-message">⚠️ {error}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="grid-container">
      <div className="grid-header">
        <h1 className="grid-title">📦 Inventory Management System</h1>
        <div className="grid-stats">
          <div className="stat-card">
            <div className="stat-label">Total Products</div>
            <div className="stat-value">{stats.totalProducts.toLocaleString()}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Total Stock</div>
            <div className="stat-value">{stats.totalStock.toLocaleString()}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">In Stock Products</div>
            <div className="stat-value">{stats.inStockProducts.toLocaleString()}</div>
          </div>
        </div>
      </div>

      <div className="datagrid-wrapper">
        {loading && dataSource.result.length === 0 ? (
          <div className="loading-spinner">
            <div className="spinner" />
          </div>
        ) : (
          <div className="datagrid-inner">
            <Grid
              ref={gridRef}
              dataSource={dataSource}
              height="100%"
              pageSettings={pageSettings}
              sortSettings={sortSettings}
              filterSettings={filterSettings}
              searchSettings={searchSettings}
              selectionSettings={selectionSettings}
              onDataRequest={handleDataRequest}
              toolbar={TOOLBAR}
              editSettings={editSettings}
              onDataChangeRequest={handleDataSourceChange}
            >
              <Columns>
                <Column
                  field="productId"
                  headerText="Product ID"
                  width="140"
                  isPrimaryKey={true}
                  validationRules={skuRules}
                />
                <Column
                  field="productName"
                  headerText="Product Name"
                  width="220"
                  template={productNameTemplate as never}
                  validationRules={nameRules}
                />
                <Column
                  field="category"
                  headerText="Category"
                  width="170"
                  edit={dropdownEdit}
                  template={categoryTemplate as never}
                  validationRules={categoryRules}
                />
                <Column
                  field="price"
                  headerText="Unit Price"
                  width="130"
                  template={priceTemplate as never}
                  format="C2"
                  edit={numericEdit}
                  validationRules={priceRules}
                />
                <Column
                  field="stock"
                  headerText="Stock Quantity"
                  width="160"
                  edit={numericEdit}
                  template={stockTemplate as never}
                  validationRules={stockRules}
                />
                <Column
                  field="status"
                  headerText="Status"
                  width="150"
                  edit={dropdownEdit}
                  template={statusTemplate as never}
                  validationRules={statusRules}
                />
              </Columns>
            </Grid>
          </div>
        )}
      </div>
    </div>
  )
}

export default InventoryDataGrid