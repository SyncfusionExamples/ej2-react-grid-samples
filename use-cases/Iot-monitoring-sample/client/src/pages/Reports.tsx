/**
 * Reports Page
 * Summary reports with export functionality
 */

import { useState, useEffect, useRef } from 'react'
import {
  GridComponent,
  ColumnsDirective,
  ColumnDirective,
  Inject,
  Page,
  Sort,
  ExcelExport,
  PdfExport
} from '@syncfusion/ej2-react-grids'
import { apiService } from '../services/apiService'

interface ReportData {
  sensorType: string
  totalDevices: number
  averageReading: number
  maxReading: number
  minReading: number
  avgBattery: number
}

export default function Reports() {
  const [reportData, setReportData] = useState<ReportData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const gridRef = useRef<GridComponent | null>(null)

  const fetchReports = async () => {
    setIsLoading(true)

    try {
      const data = await apiService.getReports()
      setReportData(data)
    } catch (error) {
      console.error('Failed to fetch reports:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchReports()
  }, [])

  const handleExcelExport = () => {
    gridRef.current?.excelExport()
  }

  const handlePdfExport = () => {
    gridRef.current?.pdfExport()
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5 animate-pulse">
          <div className="h-5 w-32 bg-slate-200 rounded mb-4" />
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-slate-100 rounded" />
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 animate-pulse">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-10 bg-slate-50 rounded mb-2" />
          ))}
        </div>
      </div>
    )
  }

  const totalDevices = reportData.reduce((sum, r) => sum + r.totalDevices, 0)

  const avgReading = reportData.length
    ? reportData.reduce((sum, r) => sum + r.averageReading, 0) /
      reportData.length
    : 0

  const avgBattAll = reportData.length
    ? reportData.reduce((sum, r) => sum + r.avgBattery, 0) /
      reportData.length
    : 0

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Reports</h1>
        <p className="text-sm text-slate-500 mt-1">
          Summarized device and sensor analytics
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            label: 'Total Monitored Devices',
            value: totalDevices.toLocaleString(),
            color: 'text-blue-600',
            icon: '📡'
          },
          {
            label: 'Avg Reading (All Sensors)',
            value: avgReading.toFixed(2),
            color: 'text-violet-600',
            icon: '📊'
          },
          {
            label: 'Fleet Avg Battery',
            value: `${avgBattAll.toFixed(1)}%`,
            color: 'text-emerald-600',
            icon: '🔋'
          }
        ].map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-xl border border-slate-200 shadow-sm p-5"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{card.icon}</span>

              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {card.label}
              </p>
            </div>

            <p className={`text-3xl font-bold ${card.color}`}>
              {card.value}
            </p>
          </div>
        ))}
      </div>

      {/* Reports Grid */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Grid Header */}
        <div className="flex flex-col gap-3 px-2.5 py-4 border-b border-slate-200 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col justify-center">
            <h2 className="text-base font-semibold text-slate-800 leading-none">
              Sensor Type Summary
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              {reportData.length} Sensor Types
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExcelExport}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-700"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>

              Export Excel
            </button>

            <button
              onClick={handlePdfExport}
              className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-red-700"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 10v6m0 0l-3-3m3 3l3-3M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>

              Export PDF
            </button>
          </div>
        </div>

        <GridComponent
          ref={gridRef}
          dataSource={reportData}
          allowSorting={true}
          allowExcelExport={true}
          allowPdfExport={true}
        >
          <ColumnsDirective>
            <ColumnDirective
              field="sensorType"
              headerText="Sensor Type"
              width="170"
            />

            <ColumnDirective
              field="totalDevices"
              headerText="Total Devices"
              width="140"
              textAlign="Right"
            />

            <ColumnDirective
              field="averageReading"
              headerText="Average Reading"
              width="150"
              format="N2"
              textAlign="Right"
            />

            <ColumnDirective
              field="maxReading"
              headerText="Maximum"
              width="130"
              format="N2"
              textAlign="Right"
            />

            <ColumnDirective
              field="minReading"
              headerText="Minimum"
              width="130"
              format="N2"
              textAlign="Right"
            />

            <ColumnDirective
              field="avgBattery"
              headerText="Avg Battery (%)"
              width="150"
              format="N2"
              textAlign="Right"
            />
          </ColumnsDirective>

          <Inject services={[Page, Sort, ExcelExport, PdfExport]} />
        </GridComponent>

        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500">
          {reportData.length} sensor types •{' '}
          {totalDevices.toLocaleString()} monitored devices
        </div>
      </div>

      {/* Breakdown */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200">
          <h2 className="text-sm font-semibold text-slate-800">
            Sensor Type Breakdown
          </h2>
        </div>

        <div className="divide-y divide-slate-100">
          {reportData.map((report) => {
            const badge =
              report.avgBattery > 60
                ? 'bg-emerald-50 text-emerald-600'
                : report.avgBattery > 30
                ? 'bg-amber-50 text-amber-600'
                : 'bg-red-50 text-red-600'

            return (
              <div
                key={report.sensorType}
                className="flex items-center justify-between px-5 py-3 hover:bg-slate-50"
              >
                <div>
                  <div className="font-semibold text-slate-800">
                    {report.sensorType}
                  </div>

                  <div className="text-xs text-slate-500 mt-1">
                    {report.totalDevices} devices • Avg{' '}
                    {report.averageReading.toFixed(2)} • Range{' '}
                    {report.minReading.toFixed(1)} -{' '}
                    {report.maxReading.toFixed(1)}
                  </div>
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${badge}`}
                >
                  {report.avgBattery.toFixed(1)}%
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}