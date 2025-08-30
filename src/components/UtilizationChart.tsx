'use client'

import { useState, useEffect } from 'react'
import { useAllMarketsData } from '@/hooks/useCompoundData'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Loader2 } from 'lucide-react'

interface ChartData {
  timestamp: number
  [key: string]: number
}

export default function UtilizationChart() {
  const { data, isLoading } = useAllMarketsData()
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [selectedMarkets, setSelectedMarkets] = useState<string[]>([])

  // Initialize chart data when markets data is available
  useEffect(() => {
    const markets = data?.markets || []
    if (markets.length > 0) {
      // Generate initial chart data from current market data
      const now = new Date()
      const initialData: ChartData[] = []
      
      // Create data points for the last 24 hours
      for (let i = 24; i >= 0; i--) {
        const timestamp = now.getTime() - i * 3600000 // hourly points
        const dataPoint: ChartData = { timestamp }
        
        markets.forEach(market => {
          // Simulate historical data with some random variation around current value
          const baseValue = market.utilization
          const variation = (Math.random() - 0.5) * 0.1 // ±5% variation
          dataPoint[market.symbol] = Math.max(0, Math.min(1, baseValue + variation))
        })
        
        initialData.push(dataPoint)
      }
      
      setChartData(initialData)
      setSelectedMarkets(markets.slice(0, 3).map(m => m.symbol)) // Show top 3 by default
    }
  }, [data])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="bg-slate-800 rounded-lg p-6 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Utilization Rates</h2>
        <div className="flex gap-2">
          {data?.markets.map(market => (
            <button
              key={market.symbol}
              onClick={() => setSelectedMarkets(prev => 
                prev.includes(market.symbol)
                  ? prev.filter(s => s !== market.symbol)
                  : [...prev, market.symbol]
              )}
              className={`px-3 py-1 rounded text-sm ${
                selectedMarkets.includes(market.symbol)
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-700 text-gray-400'
              }`}
            >
              {market.symbol}
            </button>
          ))}
        </div>
      </div>

      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
            <XAxis
              dataKey="timestamp"
              tickFormatter={(timestamp) => new Date(timestamp).toLocaleTimeString()}
              stroke="#94a3b8"
            />
            <YAxis
              tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
              domain={[0, 1]}
              stroke="#94a3b8"
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#1e293b', border: 'none' }}
              formatter={(value: number) => `${(value * 100).toFixed(2)}%`}
              labelFormatter={(timestamp) => new Date(timestamp).toLocaleString()}
            />
            <Legend />
            {selectedMarkets.map((symbol, index) => (
              <Line
                key={symbol}
                type="monotone"
                dataKey={symbol}
                stroke={[
                  '#3b82f6',
                  '#10b981',
                  '#f59e0b',
                  '#ef4444',
                  '#8b5cf6',
                ][index % 5]}
                strokeWidth={2}
                dot={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}