/**
 * Dashboard Page
 * Main landing page with summary cards and device monitoring grid.
 */

import { useEffect, useRef, useCallback, useMemo, useState } from 'react'
import {
  GridComponent,
  ColumnsDirective,
  ColumnDirective,
  Inject,
  Page,
  Sort,
  Filter,
  Search,
  Resize,
  Toolbar,
  DataStateChangeEventArgs,
  FilterSettingsModel,
  ToolbarItems,
} from '@syncfusion/ej2-react-grids'
import { useAppContext } from '../context/AppContext'
import { useSocket } from '../hooks/useSocket'
import { SummaryCard } from '../components/SummaryCard'
import { StatusBadge } from '../components/StatusBadge'
import { apiService } from '../services/apiService'
import { fetchDeviceGridData, parseGridState, type GridRequestState } from '../services/GridDataAdaptor'

// ------------------------------------------------------------------
// Dashboard-side device name mapping
// Keep this function pure and deterministic: it must be safe to
// run on every custom-binding fetch without breaking realtime
// incremental updates.
// ------------------------------------------------------------------

function mapDeviceNameShort(name: string) {
  // Prefer realistic concise industrial names over aggressive trimming.
  // Only apply targeted replacements to avoid changing unrelated names.
  return name
    .replace(/Pump Vibration Detection Sensor Unit/gi, 'Pump Vib Sensor')
    .replace(/Oven Surface Temperature Sensor/gi, 'Oven Temp Sensor')
    .replace(/Process Vessel Pressure Monitoring Sensor/gi, 'Vessel Pressure')
    .replace(/Air Compressor Monitoring Device/gi, 'Air Compressor')
    .replace(/Warehouse Environmental Sensor/gi, 'Env Sensor')

    // Generic fallbacks (avoid unnecessary truncation)
    .replace(/Monitoring Device/gi, 'Device')
    .replace(/\bSensor\b/gi, 'Sensor')
    .trim()
}

// ------------------------------------------------------------------
// Types
// ------------------------------------------------------------------

interface Device {
  deviceId: string
  deviceName: string
  location: string
  sensorType: string
  status: 'Normal' | 'Warning' | 'Critical' | 'Offline'
  readingValue: number | null
  threshold: number
  signalStrength: number
  batteryLevel: number
  lastUpdated: string | Date
}

interface DeviceUpdate {
  deviceId: string
  status?: 'Normal' | 'Warning' | 'Critical' | 'Offline'
  readingValue?: number | null
  signalStrength?: number
  batteryLevel?: number
  lastUpdated?: string
  rowIndex?: number
}

const PAGE_SIZE = 10
const SOCKET_FLUSH_INTERVAL_MS = 1000
const STATUS_REFRESH_INTERVAL_MS = 20000

function getDeviceStatus(
  readingValue: number | null | undefined,
  threshold: number,
  sensorType: string,
  timeMs = Date.now()
): Device['status'] {
  const zeroAllowedSensors = ['Flow', 'Vibration']
  const isUnavailable =
    readingValue === null ||
    readingValue === undefined ||
    Number.isNaN(readingValue) ||
    (readingValue === 0 && !zeroAllowedSensors.includes(sensorType))

  if (isUnavailable) {
    return 'Offline'
  }

  const safeThreshold = Math.max(threshold || 1, 1)
  const normalizedReading = readingValue / safeThreshold
  const oscillation = Math.sin((timeMs / 1000) * 1.35 + normalizedReading) * 0.24
  const adjustedReading = normalizedReading + oscillation

  if (adjustedReading >= 1.06) return 'Critical'
  if (adjustedReading >= 0.82) return 'Warning'
  return 'Normal'
}

// ------------------------------------------------------------------
// Dashboard component
// ------------------------------------------------------------------

export default function Dashboard() {
  const { summary, socketConnected } = useAppContext()
  const gridRef = useRef<GridComponent | null>(null)

  // ------------------------------------------------------------------
  // Grid request state management (direct useState — no hook abstraction)
  // Includes 'where' field for complex predicate tree support (checkbox filters)
  // ------------------------------------------------------------------
  const [request, setRequest] = useState<GridRequestState>({
    skip: 0,
    take: PAGE_SIZE,
    sortBy: '',
    sortDirection: 'ascending',
    searchValue: '',
    filters: [],
    where: [],
  })

  // Grid response data + loading/error state
  const [data, setData] = useState<Device[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  // ------------------------------------------------------------------
  // Filter choice dialog datasource (unfiltered distinct values)
  // ------------------------------------------------------------------

  const unfilteredDistinctValuesRef = useRef<{
    sensorType: string[]
    status: Array<'Normal' | 'Warning' | 'Critical' | 'Offline'>
    batteryLevel: number[]
  }>({
    sensorType: [],
    status: ['Normal', 'Warning', 'Critical', 'Offline'],
    batteryLevel: [],
  })

  // ------------------------------------------------------------------
  // Server connectivity state — set to false when initial fetch fails
  // ------------------------------------------------------------------
  const [serverAvailable, setServerAvailable] = useState<boolean | null>(null)

  // ------------------------------------------------------------------
  // Refs for callbacks so we never recreate loadData, avoiding the
  // "callback identity changes → effect re-runs → fetch loop" pattern
  // that caused the visible flicker.
  // ------------------------------------------------------------------
  const requestRef = useRef(request)
  requestRef.current = request

  const setLoadingRef = useRef(setIsLoading)
  setLoadingRef.current = setIsLoading
  const setDataStateRef = useRef((result: Device[], count: number) => {
    setData(result)
    setTotalCount(count)
  })

  // Token used to discard stale responses when a newer request fires
  const requestTokenRef = useRef(0)

  // ------------------------------------------------------------------
  // Core: load data from server. Stable identity (no deps).
  // ------------------------------------------------------------------
  const loadData = useCallback(async () => {
    const token = ++requestTokenRef.current
    setLoadingRef.current(true)
    try {
      const data = await fetchDeviceGridData(requestRef.current)
      // Discard stale responses
      if (token !== requestTokenRef.current) return
      // Map long device names to short industrial names and normalise dates
      const devicesWithDates = (data.result as any).map((device: any) => ({
        ...device,
        deviceName: mapDeviceNameShort(String(device.deviceName)),
        lastUpdated: device.lastUpdated ? new Date(device.lastUpdated) : device.lastUpdated,
        readingValue: device.readingValue === null || device.readingValue === undefined ? null : Number(device.readingValue),
        status: getDeviceStatus(device.readingValue, Number(device.threshold), String(device.sensorType), Date.now()),
      }))
      setDataStateRef.current(devicesWithDates as Device[], data.count)

      // Populate unfiltered choice lists once. Crucially, we must not
      // re-scope the choice datasource from gridState.data on every open.
      const distinctSensorTypes = new Set<string>()
      const distinctBatteryLevels = new Set<number>()
      ;(devicesWithDates as Device[]).forEach((d) => {
        if (d.sensorType) distinctSensorTypes.add(String(d.sensorType))
        if (Number.isFinite(d.batteryLevel)) distinctBatteryLevels.add(Number(d.batteryLevel))
      })
      if (unfilteredDistinctValuesRef.current.sensorType.length === 0) {
        unfilteredDistinctValuesRef.current.sensorType = Array.from(distinctSensorTypes).sort()
      }
      if (unfilteredDistinctValuesRef.current.batteryLevel.length === 0) {
        unfilteredDistinctValuesRef.current.batteryLevel = Array.from(distinctBatteryLevels).sort((a, b) => a - b)
      }

      if (serverAvailable !== true) setServerAvailable(true)
    } catch (err) {
      if (token !== requestTokenRef.current) return
      console.warn('[Dashboard] grid fetch failed', err)
      // Mark the server as unavailable so we can stop the connection
      // request loop and show an empty / retry state.
      setServerAvailable(false)
    }
  }, [serverAvailable])

  // ------------------------------------------------------------------
  // Custom Binding: dataStateChange — fires for page / sort / filter / search
  // ------------------------------------------------------------------
  const dataStateChange = useCallback((args: DataStateChangeEventArgs) => {
    // Handle Syncfusion filter choice requests (Excel/Checkbox dialog)
    const action = (args as any).action
    if (
      action &&
      (action.requestType === 'filterchoicerequest' ||
        action.requestType === 'filtersearchbegin' ||
        action.requestType === 'stringfilterrequest')
    ) {
      // Create a request for all records WITHOUT any current filters
      // This ensures we get the complete dataset for distinct value extraction
      const unfilteredRequest: GridRequestState = {
        skip: 0,
        take: 1000,
        sortBy: requestRef.current.sortBy,
        sortDirection: requestRef.current.sortDirection,
        searchValue: '', // Clear search for filter choice
        filters: [],     // CLEAR FILTERS - this is the key fix!
        where: [],       // CLEAR WHERE - this is the key fix!
      }
      
      fetchDeviceGridData(unfilteredRequest)
        .then((result) => {
          try {
            // Pass complete unfiltered dataset for distinct value extraction
            ;(args as any).dataSource(result.result as any)
          } catch (err) {
            console.warn('[Dashboard] filter choice dataSource call failed', err)
          }
        })
        .catch((err) => {
          console.warn('[Dashboard] filter choice request failed', err)
          try {
            // Fallback to current page if fetch fails
            ;(args as any).dataSource(data)
          } catch {
            /* ignore */
          }
        })
      return
    }

    const state = parseGridState(args as Parameters<typeof parseGridState>[0])

    setRequest((prevRequest) => {
      let updated = prevRequest

      // Update skip/page
      if (state.skip !== prevRequest.skip) {
        updated = { ...updated, skip: state.skip }
      }

      // Update sort
      if (state.sortBy !== prevRequest.sortBy || state.sortDirection !== prevRequest.sortDirection) {
        updated = { ...updated, sortBy: state.sortBy, sortDirection: state.sortDirection }
      }

      // Update search
      if (state.searchValue !== prevRequest.searchValue) {
        updated = { ...updated, searchValue: state.searchValue }
      }

      // Handle where tree (complex predicates from Grid filter UI)
      // This preserves nested predicate structures for checkbox filters with multiple selections
      const prevWhereKey = JSON.stringify(prevRequest.where || [])
      const nextWhereKey = JSON.stringify(state.where || [])
      if (nextWhereKey !== prevWhereKey) {
        // When filters change, reset to first page and apply new where tree
        updated = { ...updated, where: state.where || [], skip: 0 }
      }

      return updated
    })
  }, [])

  // ------------------------------------------------------------------
  // Load data when the request changes. Stable callback + primitive
  // dependencies → effect fires only when a request value actually
  // changes, never on a parent re-render.
  // ------------------------------------------------------------------
  const { skip, take, sortBy, sortDirection, searchValue, filters, where } = request
  // Serialise the filter list and where tree so the effect re-fires when the values
  // (not just the length) change.
  const filtersKey = filters
    .map((f) => `${f.field}:${f.operator}:${String(f.value)}`)
    .join('|')
  const whereKey = JSON.stringify(where || [])
  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skip, take, sortBy, sortDirection, searchValue, filtersKey, whereKey])

  // Listen for alert updates in shared context and refresh dashboard
  // 
  // When an alert is resolved/acknowledged/closed/updated in the Alert Grid,
  // the shared context is updated. We need to refresh the summary and device
  // grid to reflect any changes (e.g., critical device count, summary stats).
  // 
  // Strategy:
  //   1. Monitor the alerts array from shared context
  //   2. Debounce to avoid excessive API calls (use ref to track last alert state)
  //   3. When alerts change meaningfully, refresh the summary via getSummary()
  //   4. This keeps dashboard KPIs (critical alerts count, avg battery, etc.) in sync
  const { alerts: contextAlerts, setSummary } = useAppContext()
  const contextAlertsKeyRef = useRef<string>('')
  
  useEffect(() => {
    const currentKey = JSON.stringify(
      contextAlerts.map(a => ({ id: a.alertId, status: a.status }))
    )
    
    if (currentKey !== contextAlertsKeyRef.current && contextAlerts.length > 0) {
      contextAlertsKeyRef.current = currentKey
      
      // Debounce the summary refresh to avoid excessive calls
      const timer = setTimeout(() => {
        apiService
          .getSummary()
          .then((summary) => {
            setSummary(summary)
            console.log('[Dashboard] Summary auto-refreshed after alert change')
          })
          .catch(() => {}) // Silently ignore fetch errors
      }, 300) // 300ms debounce
      
      return () => clearTimeout(timer)
    }
  }, [contextAlerts, setSummary])

 
  const updateBufferRef = useRef<Map<string, Partial<DeviceUpdate>>>(new Map())
  const flushTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const dataRef = useRef<Device[]>([])
  dataRef.current = data

  const flushUpdates = useCallback(() => {
    const grid = gridRef.current
    const buffer = updateBufferRef.current
    if (!grid || buffer.size === 0) return

    const data = dataRef.current
    const updates: Array<{ rowIdx: number; updates: Partial<Device> }> = []

    buffer.forEach((update, deviceId) => {
      const rowIdx = data.findIndex((d) => d.deviceId === deviceId)
      if (rowIdx === -1) return

      const row = data[rowIdx]
      const merged: Partial<Device> = {}

      const effectiveReading = update.readingValue !== undefined ? update.readingValue : row.readingValue
      merged.readingValue = update.readingValue !== undefined ? update.readingValue : row.readingValue
      merged.status = getDeviceStatus(effectiveReading, row.threshold, row.sensorType, Date.now())

      if (update.signalStrength !== undefined) merged.signalStrength = update.signalStrength
      if (update.batteryLevel !== undefined) merged.batteryLevel = update.batteryLevel
      if (update.lastUpdated !== undefined) merged.lastUpdated = update.lastUpdated
      Object.assign(row, merged)
      updates.push({ rowIdx, updates: merged })
    })
    buffer.clear()

  }, [])

  const handleDeviceUpdate = useCallback((update: DeviceUpdate) => {
    if (!gridRef.current || !update?.deviceId) return

    if (typeof (update as any).deviceName === 'string') {
      ;(update as any).deviceName = mapDeviceNameShort((update as any).deviceName)
    }

    const existing = updateBufferRef.current.get(update.deviceId)
    updateBufferRef.current.set(update.deviceId, { ...existing, ...update })

    if (flushTimeoutRef.current === null) {
      flushTimeoutRef.current = setTimeout(() => {
        flushUpdates()
        flushTimeoutRef.current = null
      }, SOCKET_FLUSH_INTERVAL_MS)
    }
  }, [flushUpdates])

  const refreshStatuses = useCallback(() => {
    setData((prevData) =>
      prevData.map((device) => {
        const nextStatus = getDeviceStatus(device.readingValue, device.threshold, device.sensorType, Date.now())
        return nextStatus === device.status ? device : { ...device, status: nextStatus }
      })
    )
  }, [])

  useEffect(() => {
    if (data.length === 0) return

    const intervalId = window.setInterval(() => {
      refreshStatuses()
    }, STATUS_REFRESH_INTERVAL_MS)

    return () => {
      window.clearInterval(intervalId)
      if (flushTimeoutRef.current !== null) {
        clearTimeout(flushTimeoutRef.current)
      }
    }
  }, [data.length, refreshStatuses])

  useSocket('device_update', handleDeviceUpdate, socketConnected && serverAvailable !== false)

  // ------------------------------------------------------------------
  // Derived values
  // ------------------------------------------------------------------
  const healthPct = summary
    ? Math.round((summary.onlineDevices / Math.max(summary.totalDevices, 1)) * 100)
    : 0

  // ------------------------------------------------------------------
  // Stable dataSource reference. The previous implementation passed
  // `{ result: data, count }` inline, which created a new object on
  // every render and forced the Grid to do a full rebind.
  // ------------------------------------------------------------------
  const dataSource = useMemo(
    () => ({ result: data, count: totalCount }),
    [data, totalCount]
  )

// ------------------------------------------------------------------
// Stable Toolbar with Enter-only Search
// ------------------------------------------------------------------
const toolbar: (ToolbarItems | object)[] = useMemo(() => [
  {
    id: 'customSearch',
    align: 'Left',
    template: () => {
      const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
          const grid = gridRef.current;
          const value = (e.target as HTMLInputElement).value.trim();
          if (grid) {
            grid.search(value);
          }
        }
      };

      return (
        <div className="relative w-80">
          <input
            type="text"
            id="dashboard-search"
            placeholder="Search devices... (Press Enter)"
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            onKeyDown={handleSearch}
          />
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 01-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 pointer-events-none">
            ↵ Enter
          </div>
        </div>
      );
    }
  },
], []);
  // ------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------

  // Server unavailable — show empty state and a retry button. Do NOT
  // render the Grid because the dataSource is empty anyway and we want
  // to stop the request loop.
  if (serverAvailable === false && data.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
            <p className="text-slate-500 text-sm mt-0.5">Real-time monitoring of all connected IoT devices</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-10 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M12 9v2m0 4h.01M5.07 19h13.86c1.54 0 2.5-1.67 1.73-3L13.73 4a2 2 0 00-3.46 0L3.34 16c-.77 1.33.19 3 1.73 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-1">Server Unavailable</h3>
          <p className="text-slate-500 text-sm mb-4 max-w-md">
            We couldn't reach the device service. The dashboard will keep trying
            to reconnect — you can also retry manually.
          </p>
          <button
            onClick={() => {
              setServerAvailable(null)
              requestTokenRef.current++
              loadData()
            }}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (isLoading && data.length === 0) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 animate-pulse">
              <div className="h-3 w-24 bg-slate-200 rounded mb-4" />
              <div className="h-7 w-16 bg-slate-200 rounded mb-2" />
              <div className="h-3 w-32 bg-slate-100 rounded" />
            </div>
          ))}
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 animate-pulse">
          <div className="h-5 w-40 bg-slate-200 rounded mb-4" />
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-10 bg-slate-50 rounded mb-2" />
          ))}
        </div>
      </div>
    )
  }

  const filterSettings : FilterSettingsModel = {type: 'CheckBox'}

  return (
    <div className="flex flex-col min-h-screen px-3">
      {/* Page header */}
       <div className="flex items-center justify-between pb-4">
        <div className="pb-2">
            <h1 className="text-2xl font-bold text-slate-800">
                Dashboard
            </h1>

            <p className="mt-1 text-sm text-slate-500">
                Real-time monitoring of all connected IoT devices
            </p>
        </div>
        <div className="flex items-center gap-2">
          {!socketConnected && (
            <span className="text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2 py-1 rounded-full">
              Live updates paused
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 py-1">
        <div className="min-w-0">
          <SummaryCard
            title="Total Devices"
            value={(summary?.totalDevices || 0).toLocaleString()}
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2v-4M9 21H5a2 2 0 01-2-2v-4m0 0h18"
                />
              </svg>
            }
            color="blue"
            subtext="Across all locations"
          />
        </div>

        <div className="min-w-0">
          <SummaryCard
            title="Online Devices"
            value={(summary?.onlineDevices || 0).toLocaleString()}
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            }
            color="green"
            subtext={`${healthPct}% fleet health`}
            trend={{ value: `${healthPct}%`, positive: healthPct >= 80 }}
          />
        </div>

        <div className="min-w-0">
          <SummaryCard
            title="Critical Alerts"
            value={(summary?.criticalDevices || 0).toLocaleString()}
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            }
            color="red"
            subtext="Require attention"
            trend={
              (summary?.criticalDevices || 0) > 0
                ? { value: 'Action Needed', positive: false }
                : undefined
            }
          />
        </div>

        <div className="min-w-0">
          <SummaryCard
            title="Avg Battery"
            value={`${summary?.avgBattery?.toFixed(1) || '0.0'}%`}
            icon={
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                viewBox="0 0 24 24"
              >
                <rect x="2" y="7" width="18" height="10" rx="2" />
                <path d="M22 10v4" />
                <rect x="4.5" y="9.5" width="10" height="5" rx="1" fill="currentColor" stroke="none" />
              </svg>
            }
            color="orange"
            subtext="Fleet battery average"
          />
        </div>
      </div>

      {/* ── Device monitoring grid ── */}
      {/* Main content: keep the grid as the primary focus */}
      <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mt-1 mb-2 flex flex-col min-h-0">
        {/* Empty state when the server returned no rows */}
        {data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-slate-800 mb-1">No Data Available</h3>
          </div>
        ) : (
          <div className="flex-1 overflow-hidden">
            <GridComponent
              ref={gridRef}
              dataSource={dataSource}
              dataStateChange={dataStateChange}
              toolbar={toolbar}
              rowHeight={40}
              allowFiltering={true}
              allowResizing={true}
              filterSettings ={filterSettings}
              pageSettings={{ pageSize: PAGE_SIZE }}
              allowPaging={true}
              allowSorting={true}
              allowSelection={true}
              clipMode ={'EllipsisWithTooltip'}
             height={'100%'}
            >
              <ColumnsDirective>
                <ColumnDirective field="deviceId" headerText="Device ID" width="110" isPrimaryKey={true} />
                <ColumnDirective
                  field="deviceName"
                  headerText="Device Name"
                  width="150"
                />
                <ColumnDirective field="location" headerText="Location" width="130" />
                <ColumnDirective field="sensorType" headerText="Sensor Type" width="130" allowEditing={false}  allowFiltering={false} />
                <ColumnDirective
                  field="status"
                  headerText="Status"
                  width="120"
                  template={(props: Device) => <StatusBadge status={props.status} />}
                />
               <ColumnDirective
                  field="readingValue"
                  textAlign='Right'
                  width="120"
                  headerText="Reading"
                  template={(props:any) => {
                    const color =
                      props.status === 'Critical'
                        ? 'text-red-600'
                        : props.status === 'Warning'
                          ? 'text-amber-600'
                          : 'text-slate-800'

                    return (
                      <span className={`font-semibold ${color}`}>
                        {Number(props.readingValue).toFixed(2)}
                      </span>
                    )
                  }}
                />
                <ColumnDirective field="threshold" headerText="Threshold" width="120" type="number" textAlign='Right' />
                <ColumnDirective
                  field="signalStrength"
                  headerText="Signal"
                  width="90"
                  allowFiltering={false}
                  type="number"
                  textAlign='Right'
                  allowEditing={false}
                  template={(props: Device) => {
                    const s = props.signalStrength
                    const barColor = s >= 75 ? 'bg-emerald-500' : s >= 50 ? 'bg-amber-400' : 'bg-red-400'
                    return (
                      <div className="flex items-center gap-1.5">
                        <div className="flex gap-0.5 items-end h-3">
                          {[1, 2, 3, 4].map((bar) => (
                            <div
                              key={bar}
                              className={`w-1 rounded-sm ${s >= bar * 25 ? barColor : 'bg-slate-200'}`}
                              style={{ height: `${bar * 3 + 2}px` }}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-slate-500">{s}%</span>
                      </div>
                    )
                  }}
                />
                <ColumnDirective
                  field="batteryLevel"
                  headerText="Battery"
                  width="100"
                  allowFiltering={false}
                  allowEditing={false}
                  type="number"
                  textAlign='Right'
                  template={(props: Device) => {
                    const pct = Math.round(props.batteryLevel)
                    const barColor = pct > 50 ? 'bg-emerald-500' : pct > 20 ? 'bg-amber-400' : 'bg-red-500'
                    const textColor = pct > 50 ? 'text-emerald-600' : pct > 20 ? 'text-amber-600' : 'text-red-600'
                    return (
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
                        </div>
                        <span className={`text-xs font-medium ${textColor}`}>{pct}%</span>
                      </div>
                    )
                  }}
                />
                <ColumnDirective
                  field="lastUpdated"
                  headerText="Last Updated"
                  type="date"
                  textAlign='Right'
                  format="dd:MM:yyyy HH:mm"
                  width="140"
                  allowFiltering={false}
                  allowEditing={false}
                />
              </ColumnsDirective>
              <Inject services={[Page, Sort, Filter, Search, Resize, Toolbar]} />
            </GridComponent>
          </div>
        )}
      </div>
    </div>
  )
}
