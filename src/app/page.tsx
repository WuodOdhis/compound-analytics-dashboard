'use client'

import { TrendingUp, DollarSign, Users, AlertTriangle, Sun, Moon, RefreshCw, Clock } from 'lucide-react'
import MarketOverview from '@/components/MarketOverview'
import UtilizationChart from '@/components/UtilizationChart'
import RateComparison from '@/components/RateComparison'
import RiskMetrics from '@/components/RiskMetrics'
import AlertSystem from '@/components/AlertSystem'
import PortfolioTracker from '@/components/PortfolioTracker'
import { useMarketStats } from '@/hooks/useCompoundData'
import { useTheme } from '@/providers/ThemeProvider'
import { useSettings } from '@/providers/SettingsProvider'

export default function Dashboard() {
  const { stats, isLoading } = useMarketStats()
  const { theme, toggleTheme } = useTheme()
  const { refetchInterval, setRefetchInterval, lastUpdated } = useSettings()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-xl text-white">Loading Compound Analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Compound Analytics</h1>
              <p className="text-slate-400 mt-1">Real-time market insights & portfolio tracking</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-green-400">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm">Live</span>
              </div>
              <div className="flex items-center space-x-2 text-yellow-400">
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                <span className="text-sm">Demo Mode</span>
              </div>
              <div className="hidden md:flex items-center space-x-2 text-slate-300">
                <Clock className="h-4 w-4" />
                <select
                  value={refetchInterval}
                  onChange={(e) => setRefetchInterval(Number(e.target.value) as any)}
                  className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-sm"
                >
                  <option value={15000}>15s</option>
                  <option value={30000}>30s</option>
                  <option value={60000}>60s</option>
                </select>
                {lastUpdated && (
                  <span className="text-xs text-slate-400">Updated {new Date(lastUpdated).toLocaleTimeString()}</span>
                )}
                <button
                  onClick={() => window.location.reload()}
                  className="flex items-center space-x-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded px-2 py-1 text-sm"
                  title="Refresh now"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Refresh</span>
                </button>
              </div>
              <button
                onClick={toggleTheme}
                className="p-2 rounded border border-slate-700 bg-slate-800 hover:bg-slate-700"
                title="Toggle theme"
              >
                {theme === 'dark' ? <Sun className="h-4 w-4 text-yellow-300" /> : <Moon className="h-4 w-4 text-slate-700" />}
              </button>
              <AlertSystem />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Total Markets</p>
                <p className="text-2xl font-bold text-white">{stats.totalMarkets}</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-400" />
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Avg Utilization</p>
                <p className="text-2xl font-bold text-white">{(stats.averageUtilization * 100).toFixed(1)}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-400" />
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Total Value Locked</p>
                <p className="text-2xl font-bold text-white">${stats.totalValueLocked.toLocaleString()}</p>
              </div>
              <Users className="h-8 w-8 text-purple-400" />
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Highest Utilization</p>
                <p className="text-2xl font-bold text-white">{(stats.highestUtilization * 100).toFixed(1)}%</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-400" />
            </div>
          </div>
        </div>

        {/* Charts and Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <MarketOverview />
          <UtilizationChart />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <RateComparison />
          <RiskMetrics />
        </div>

        {/* Portfolio Section */}
        <PortfolioTracker />
      </main>
    </div>
  )
}
