'use client'

import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'
import { BarChart3, Loader2 } from 'lucide-react'
import { useAllMarketsData } from '../hooks/useCompoundData'

interface ChartData {
  time: string
  utilization: number
  supplyRate: number
  borrowRate: number
}

export default function UtilizationChart() {
  const { data: markets, isLoading, error } = useAllMarketsData()
  const [data, setData] = useState<ChartData[]>([])
  const [viewMode, setViewMode] = useState<'utilization' | 'rates'>('utilization')

  useEffect(() => {
    if (markets && markets.length > 0) {
      // Generate initial chart data from current market data
      const now = new Date()
      const initialData: ChartData[] = []

      for (let i = 23; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 60 * 60 * 1000)
        // Use average values from all markets for the chart
        const avgUtilization = markets.reduce((sum, m) => sum + m.utilization, 0) / markets.length
        const avgSupplyRate = markets.reduce((sum, m) => sum + m.supplyRate, 0) / markets.length
        const avgBorrowRate = markets.reduce((sum, m) => sum + m.borrowRate, 0) / markets.length

        initialData.push({
          time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          utilization: avgUtilization,
          supplyRate: avgSupplyRate,
          borrowRate: avgBorrowRate
        })
      }

      setData(initialData)
    }
  }, [markets])

  useEffect(() => {
    if (data.length === 0) return

    // Update data every 30 seconds with new market data
    const interval = setInterval(() => {
      setData(prev => {
        const newData = [...prev.slice(1)]
        const now = new Date()

        if (markets && markets.length > 0) {
          const avgUtilization = markets.reduce((sum, m) => sum + m.utilization, 0) / markets.length
          const avgSupplyRate = markets.reduce((sum, m) => sum + m.supplyRate, 0) / markets.length
          const avgBorrowRate = markets.reduce((sum, m) => sum + m.borrowRate, 0) / markets.length

          newData.push({
            time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            utilization: avgUtilization,
            supplyRate: avgSupplyRate,
            borrowRate: avgBorrowRate
          })
        }

        return newData
      })
    }, 30000)

    return () => clearInterval(interval)
  }, [markets])

  if (isLoading || data.length === 0) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-700 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-400 mx-auto mb-2" />
          <p className="text-slate-400">Loading chart data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-700 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-2">Error loading chart data</p>
          <p className="text-slate-400 text-sm">Unable to fetch market data</p>
        </div>
      </div>
    )
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 border border-slate-600 rounded-lg p-3 shadow-lg">
          <p className="text-white font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value.toFixed(viewMode === 'utilization' ? 1 : 2)}
              {viewMode === 'utilization' ? '%' : '%'}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-700">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white flex items-center">
          <BarChart3 className="h-5 w-5 mr-2 text-purple-400" />
          Market Analytics
        </h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setViewMode('utilization')}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              viewMode === 'utilization'
                ? 'bg-blue-500 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            Utilization
          </button>
          <button
            onClick={() => setViewMode('rates')}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              viewMode === 'rates'
                ? 'bg-blue-500 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            Rates
          </button>
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          {viewMode === 'utilization' ? (
            <AreaChart data={data}>
              <defs>
                <linearGradient id="utilizationGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="time"
                stroke="#9CA3AF"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#9CA3AF"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="utilization"
                stroke="#3B82F6"
                fill="url(#utilizationGradient)"
                strokeWidth={2}
                name="Utilization"
              />
            </AreaChart>
          ) : (
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="time"
                stroke="#9CA3AF"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#9CA3AF"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="supplyRate"
                stroke="#10B981"
                strokeWidth={2}
                name="Supply APY"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="borrowRate"
                stroke="#EF4444"
                strokeWidth={2}
                name="Borrow APY"
                dot={false}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Summary Stats */}
      <div className="mt-4 grid grid-cols-3 gap-4">
        <div className="text-center">
          <p className="text-slate-400 text-sm">Current</p>
          <p className="text-white font-bold">
            {viewMode === 'utilization'
              ? `${(data[data.length - 1].utilization * 100).toFixed(1)}%`
              : `${data[data.length - 1].supplyRate.toFixed(2)}%`
            }
          </p>
        </div>
        <div className="text-center">
          <p className="text-slate-400 text-sm">24h Change</p>
          <p className={`font-bold ${(data[data.length - 1].utilization - data[0].utilization) > 0 ? 'text-green-400' : 'text-red-400'}`}>
            {viewMode === 'utilization'
              ? `${((data[data.length - 1].utilization - data[0].utilization) * 100).toFixed(1)}%`
              : `${(data[data.length - 1].supplyRate - data[0].supplyRate).toFixed(2)}%`
            }
          </p>
        </div>
        <div className="text-center">
          <p className="text-slate-400 text-sm">24h High</p>
          <p className="text-white font-bold">
            {viewMode === 'utilization'
              ? `${(Math.max(...data.map(d => d.utilization)) * 100).toFixed(1)}%`
              : `${Math.max(...data.map(d => d.supplyRate)).toFixed(2)}%`
            }
          </p>
        </div>
      </div>
    </div>
  )
}
