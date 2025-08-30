'use client'

import { useState } from 'react'
import MarketOverview from '@/components/MarketOverview'
import UtilizationChart from '@/components/UtilizationChart'
import RateComparison from '@/components/RateComparison'
import RiskMetrics from '@/components/RiskMetrics'
import AlertSystem from '@/components/AlertSystem'
import PortfolioTracker from '@/components/PortfolioTracker'
import { useMarketStats } from '@/hooks/useCompoundData'
import { useTheme } from '@/providers/ThemeProvider'
import { useSettings } from '@/providers/SettingsProvider'
import ConnectWallet from '@/components/ConnectWallet'
import { Loader2, Moon, Sun, RefreshCw } from 'lucide-react'
import { formatCurrency } from '@/utils/format'

export default function Dashboard() {
  const marketStats = useMarketStats()
  const { theme, toggleTheme } = useTheme()
  const { refetchInterval, setRefetchInterval, lastUpdated } = useSettings()
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    // Trigger a refetch by temporarily setting interval to 1000ms
    setRefetchInterval(1000)
    setTimeout(() => {
      setRefetchInterval(30000)
      setIsRefreshing(false)
    }, 1000)
  }

  return (
    <main className={`min-h-screen p-8 ${theme === 'dark' ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Compound Analytics Dashboard</h1>
          <div className="flex items-center space-x-4">
            <button
              onClick={handleRefresh}
              className="p-2 hover:bg-slate-700 rounded-full transition-colors"
              disabled={isRefreshing}
            >
              <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={toggleTheme}
              className="p-2 hover:bg-slate-700 rounded-full transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <ConnectWallet />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-800 rounded-lg p-6 shadow-lg">
            <h3 className="text-lg text-gray-400 mb-2">Total Supply</h3>
            <p className="text-2xl font-bold truncate" title={`$${marketStats.totalSupplyUSD.toLocaleString()}`}>
              {formatCurrency(marketStats.totalSupplyUSD)}
            </p>
          </div>
          <div className="bg-slate-800 rounded-lg p-6 shadow-lg">
            <h3 className="text-lg text-gray-400 mb-2">Total Borrow</h3>
            <p className="text-2xl font-bold truncate" title={`$${marketStats.totalBorrowUSD.toLocaleString()}`}>
              {formatCurrency(marketStats.totalBorrowUSD)}
            </p>
          </div>
          <div className="bg-slate-800 rounded-lg p-6 shadow-lg">
            <h3 className="text-lg text-gray-400 mb-2">Average Utilization</h3>
            <p className="text-2xl font-bold">{(marketStats.averageUtilization * 100).toFixed(2)}%</p>
          </div>
          <div className="bg-slate-800 rounded-lg p-6 shadow-lg">
            <h3 className="text-lg text-gray-400 mb-2">Active Markets</h3>
            <p className="text-2xl font-bold">{marketStats.marketCount}</p>
          </div>
        </div>

        <div className="space-y-8">
          <MarketOverview />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <UtilizationChart />
            <RateComparison />
          </div>
          <RiskMetrics />
          <PortfolioTracker />
        </div>

        <AlertSystem />

        <div className="mt-8 text-sm text-gray-400 text-right">
          Last updated: {marketStats.lastUpdated ? new Date(marketStats.lastUpdated).toLocaleString() : 'Never'}
        </div>
      </div>
    </main>
  )
}