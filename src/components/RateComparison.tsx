'use client'

import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Target, Zap } from 'lucide-react'

interface RateData {
  market: string
  supplyAPY: number
  borrowAPY: number
  netAPY: number
  utilization: number
}

const mockRateData: RateData[] = [
  { market: 'USDC', supplyAPY: 5.2, borrowAPY: 7.8, netAPY: 2.6, utilization: 0.85 },
  { market: 'WETH', supplyAPY: 3.1, borrowAPY: 4.8, netAPY: 1.7, utilization: 0.72 },
  { market: 'WBTC', supplyAPY: 2.9, borrowAPY: 4.5, netAPY: 1.6, utilization: 0.68 },
  { market: 'UNI', supplyAPY: 1.8, borrowAPY: 3.2, netAPY: 1.4, utilization: 0.45 },
  { market: 'LINK', supplyAPY: 4.7, borrowAPY: 6.9, netAPY: 2.2, utilization: 0.78 },
  { market: 'AAVE', supplyAPY: 3.8, borrowAPY: 5.6, netAPY: 1.8, utilization: 0.65 }
]

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4']

export default function RateComparison() {
  const [sortBy, setSortBy] = useState<'supplyAPY' | 'borrowAPY' | 'netAPY' | 'utilization'>('supplyAPY')

  const sortedData = [...mockRateData].sort((a, b) => b[sortBy] - a[sortBy])

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-slate-800 border border-slate-600 rounded-lg p-3 shadow-lg">
          <p className="text-white font-medium mb-2">{label}</p>
          <div className="space-y-1 text-sm">
            <p className="text-green-400">Supply APY: {data.supplyAPY.toFixed(2)}%</p>
            <p className="text-red-400">Borrow APY: {data.borrowAPY.toFixed(2)}%</p>
            <p className="text-blue-400">Net APY: {data.netAPY.toFixed(2)}%</p>
            <p className="text-slate-400">Utilization: {(data.utilization * 100).toFixed(1)}%</p>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-700">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white flex items-center">
          <Target className="h-5 w-5 mr-2 text-green-400" />
          Rate Comparison
        </h2>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="bg-slate-700 border border-slate-600 rounded px-3 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
        >
          <option value="supplyAPY">Supply APY</option>
          <option value="borrowAPY">Borrow APY</option>
          <option value="netAPY">Net APY</option>
          <option value="utilization">Utilization</option>
        </select>
      </div>

      <div className="h-64 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={sortedData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="market"
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
            <Bar dataKey={sortBy} radius={[4, 4, 0, 0]}>
              {sortedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Top Performers */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-white mb-4">Top Performers</h3>

        <div className="grid grid-cols-1 gap-3">
          <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                <Zap className="h-4 w-4 text-green-400" />
              </div>
              <div>
                <p className="text-white font-medium">Highest Supply APY</p>
                <p className="text-slate-400 text-sm">USDC at {mockRateData[0].supplyAPY.toFixed(2)}%</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-green-400 font-bold">{mockRateData[0].supplyAPY.toFixed(2)}%</p>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center">
                <Target className="h-4 w-4 text-red-400" />
              </div>
              <div>
                <p className="text-white font-medium">Lowest Borrow APY</p>
                <p className="text-slate-400 text-sm">UNI at {mockRateData[3].borrowAPY.toFixed(2)}%</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-red-400 font-bold">{mockRateData[3].borrowAPY.toFixed(2)}%</p>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                <Zap className="h-4 w-4 text-blue-400" />
              </div>
              <div>
                <p className="text-white font-medium">Best Net APY</p>
                <p className="text-slate-400 text-sm">USDC at {mockRateData[0].netAPY.toFixed(2)}%</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-blue-400 font-bold">{mockRateData[0].netAPY.toFixed(2)}%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


