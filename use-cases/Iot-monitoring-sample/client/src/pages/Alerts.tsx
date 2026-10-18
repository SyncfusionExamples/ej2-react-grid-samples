/**
 * Alerts Page
 * Historical anomaly records with LOCAL DATA BINDING.
 */
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  GridComponent,
  ColumnsDirective,
  ColumnDirective,
  Inject,
  Page,
  Resize,
  Sort,
  Filter,
  Search,
  Selection,
  Edit,
  VirtualScroll,
  Toolbar,
} from '@syncfusion/ej2-react-grids';
import { DateRangePickerComponent } from '@syncfusion/ej2-react-calendars';
import { apiService } from '../services/apiService';
import { useAppContext } from '../context/AppContext';
import '../index.css'

// ------------------------------------------------------------------
// Types
// ------------------------------------------------------------------
interface Alert {
  alertId: string;
  deviceId: string;
  deviceName: string;
  location: string;
  sensorType: string;
  alertType: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  status?: 'Active' | 'Acknowledged' | 'Resolved';
  message: string;
  timestamp: string | Date;
}

// ------------------------------------------------------------------
// Component
// ------------------------------------------------------------------
export default function Alerts() {
  const gridRef = useRef<GridComponent | null>(null);
  const { setSummary, alerts, setAlerts } = useAppContext();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [serverAvailable, setServerAvailable] = useState<boolean | null>(null);
  const [dateRange, setDateRange] = useState<[Date, Date] | null>(null);
  const dateRangePickerRef = useRef<DateRangePickerComponent | null>(null);

  const requestTokenRef = useRef(0);

  // ------------------------------------------------------------------
  // Load Data
  // ------------------------------------------------------------------
  const loadAlerts = useCallback(async () => {
    const token = ++requestTokenRef.current;
    setIsLoading(true);

    try {
      const response = await apiService.getAlerts({ skip: 0, take: 999999 });
      if (token !== requestTokenRef.current) return;

      const alertsData = response.result || response || [];
      const parsedAlerts = alertsData.map((a: any) => ({
        ...a,
        timestamp: a.timestamp ? new Date(a.timestamp) : a.timestamp,
      })) as Alert[];

      setAlerts(parsedAlerts);
      setServerAvailable(true);
    } catch (err) {
      if (token !== requestTokenRef.current) return;
      console.error('[Alerts] load failed', err);
      setServerAvailable(false);
    } finally {
      if (token === requestTokenRef.current) setIsLoading(false);
    }
  }, [setAlerts]);

  // ------------------------------------------------------------------
  // Action Handler (Status Change + Persisted Delete)
  // ------------------------------------------------------------------
  const handleActionComplete = useCallback(async (args: any) => {
    // Status Change
    if (args.requestType === 'save' && args.data) {
      const updatedAlert = args.data as Alert;
      if (!updatedAlert.alertId) return;

      if (args.endEdit) args.endEdit();

      setAlerts((prev) =>
        prev.map((a) =>
          a.alertId === updatedAlert.alertId ? { ...a, status: updatedAlert.status } : a
        )
      );

      apiService.getSummary?.().then(setSummary).catch(console.error);
    }

    // Persist delete on server so remount/refetch cannot restore rows
    else if (args.requestType === 'delete' && args.data) {
      const deletedAlerts: Alert[] = Array.isArray(args.data) ? args.data : [args.data];
      const deletedIds: string[] = deletedAlerts
        .map((a) => a.alertId)
        .filter((id): id is string => Boolean(id));

      if (deletedIds.length === 0) return;

      
      setAlerts((prev) => prev.filter((a) => !deletedIds.includes(a.alertId)));

      try {
        await Promise.all(deletedIds.map((id: string) => apiService.deleteAlert(id)));
        const summary = await apiService.getSummary();
        setSummary(summary);
        console.log(`✅ Deleted ${deletedIds.length} alert(s) on server`);
      } catch (err) {
        console.error('[Alerts] delete failed — reloading from server', err);
        // Restore authoritative state if the server rejected any delete
        await loadAlerts();
      }
    }
  }, [setAlerts, setSummary, loadAlerts]);

    // ------------------------------------------------------------------
  // Improved Date Range Filter
  // ------------------------------------------------------------------
  const filteredAlerts = useMemo(() => {
    if (!dateRange || !dateRange[0] || !dateRange[1]) {
      return alerts;
    }

    const startDate = new Date(dateRange[0]);
    const endDate = new Date(dateRange[1]);

    // Normalize to full days
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    return alerts.filter((alert) => {
      if (!alert.timestamp) return false;
      const alertDate = new Date(alert.timestamp);
      return alertDate >= startDate && alertDate <= endDate;
    });
  }, [alerts, dateRange]);

  // ------------------------------------------------------------------
  // Handlers
  // ------------------------------------------------------------------
  const handleDateRangeChange = useCallback((e: any) => {
    if (e?.value && Array.isArray(e.value) && e.value.length === 2 && e.value[0] && e.value[1]) {
      setDateRange([e.value[0], e.value[1]]);
      console.log('Date range updated:', e.value[0], 'to', e.value[1]); // for debugging
    } else {
      setDateRange(null);
    }
  }, []);

const handleClearFilters = useCallback(() => {
  setDateRange(null);

  // Safely reset DateRangePicker (without optional chaining assignment)
  if (dateRangePickerRef.current) {
    dateRangePickerRef.current.value = undefined as any;
  }

  // Reset Grid filters
  if (gridRef.current) {
    gridRef.current.clearFiltering();
  }
}, []);

  // ------------------------------------------------------------------
  // Load on Mount
  // ------------------------------------------------------------------
  useEffect(() => {
    loadAlerts();
  }, []);

  // ------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------
  if (serverAvailable === false && alerts.length === 0) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-10 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01M5.07 19h13.86c1.54 0 2.5-1.67 1.73-3L13.73 4a2 2 0 00-3.46 0L3.34 16c-.77 1.33.19 3 1.73 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-1">Server Unavailable</h3>
          <p className="text-slate-500 text-sm mb-4">We couldn't load the alert history.</p>
          <button
            onClick={loadAlerts}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Alerts</h1>
          <p className="text-slate-500 text-sm mt-0.5">Historical anomaly records and device alerts</p>
        </div>
        <button
          onClick={handleClearFilters}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Filters */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
  <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">

    {/* Left Section */}
    <div className="flex flex-col sm:flex-row sm:items-end gap-4">

      {/* Date Range */}
     <div className="flex items-end gap-2 w-fit">
  <div className="w-[260px]">
    <label className="block mb-1 text-xs font-medium text-slate-600 uppercase tracking-wide">
      Date Range
    </label>

    <DateRangePickerComponent
      ref={dateRangePickerRef}
      change={handleDateRangeChange}
      format="MMM d, yyyy"
      width="100%"
      cssClass="analytics-date-range"
    />
  </div>

  <button
  onClick={handleClearFilters}
  className="
    h-8
    px-4
    text-sm
    font-medium
    text-slate-700
    bg-slate-50
    border
    border-slate-200
    rounded-md
    hover:bg-slate-100
    whitespace-nowrap
    flex
    items-center
    justify-center
  "
>
  Clear Filters
</button>
</div>
    </div>

    {/* Right Section */}
    <div className="text-left lg:text-right">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-600">
        Total Alerts
      </p>

      <p className="text-3xl font-bold text-slate-900 leading-none mt-1">
        {filteredAlerts.length.toLocaleString()}
      </p>
    </div>

  </div>
</div>

      {/* Grid */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mb-3" />
              <p className="text-slate-500 text-sm">Loading alerts...</p>
            </div>
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-1">No Data Available</h3>
            <p className="text-slate-500 text-sm">
              {dateRange ? 'No alerts match the selected date range.' : 'No alerts recorded yet.'}
            </p>
          </div>
        ) : (
          <GridComponent
            ref={gridRef}
            dataSource={filteredAlerts}
            allowResizing
            allowSorting
            allowFiltering
            toolbar={['Delete']}
            filterSettings={{ type: 'CheckBox' }}
            editSettings={{ allowEditing: true, allowAdding: false, allowDeleting: true, mode: 'Cell' }}
            enableVirtualization={filteredAlerts.length > 100}
            height="400px"
            clipMode="EllipsisWithTooltip"
            actionComplete={handleActionComplete}
            actionFailure={(err) => console.error('[Alerts] Grid action failed:', err)}
          >
            <ColumnsDirective>
              <ColumnDirective field="alertId" headerText="Alert ID" width="100" textAlign="Left" />
              <ColumnDirective field="deviceId" headerText="Device ID" width="100" textAlign="Left" />
              <ColumnDirective field="deviceName" headerText="Device Name" width="120" textAlign="Left" />
              <ColumnDirective field="location" headerText="Location" width="120" textAlign="Left" />
              <ColumnDirective field="sensorType" headerText="Sensor Type" width="110" textAlign="Left" />
              <ColumnDirective field="message" headerText="Message" width="220" textAlign="Left" 
                template={(props: Alert) => (
                  <div className="text-xs text-slate-600 truncate" title={props.message}>
                    {props.message}
                  </div>
                )} 
              />
              
              <ColumnDirective
                field="timestamp"
                headerText="Timestamp"
                width="160"
                type="datetime"
                format="MMM d, yyyy HH:mm:ss"
              />
            </ColumnsDirective>
            <Inject services={[Page, Sort, Filter, Search, Selection, Resize, VirtualScroll, Edit, Toolbar]} />
          </GridComponent>
        )}
      </div>
    </div>
  );
}