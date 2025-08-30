
'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Bell, TrendingUp, TrendingDown, DollarSign, Zap, X } from 'lucide-react'
import { useAllMarketsData } from '../hooks/useCompoundData'
import { useSettings } from '@/providers/SettingsProvider'

interface SmartAlert {
  id: string
  type: 'opportunity' | 'warning' | 'rate_change' | 'yield_opportunity'
  title: string
  message: string
  market: string
  value: number
  change?: number
  timestamp: number
  priority: 'low' | 'medium' | 'high'
}

export default function AlertSystem() {
  const { data: markets, isLoading } = useAllMarketsData()
  const [alerts, setAlerts] = useState<SmartAlert[]>([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [previousData, setPreviousData] = useState<any>(null)
  const { thresholds } = useSettings()

  // Generate smart alerts based on market data
  useEffect(() => {
    if (!markets || markets.length === 0 || isLoading) return

    const newAlerts: SmartAlert[] = []

    markets.forEach(market => {
      // High yield opportunities
      if (market.supplyRate > thresholds.arbitrageSpreadPct + 6) {
        newAlerts.push({
          id: `yield-${market.symbol}-${Date.now()}`,
          type: 'yield_opportunity',
          title: 'High Yield Opportunity',
          message: `${market.symbol} offering ${(market.supplyRate).toFixed(2)}% APY`,
          market: market.symbol,
          value: market.supplyRate,
          timestamp: Date.now(),
          priority: 'high'
        })
      }

      // Rate change alerts (compared to previous data)
      if (previousData) {
        const prevMarket = previousData.find((m: any) => m.symbol === market.symbol)
        if (prevMarket) {
          const supplyRateChange = market.supplyRate - prevMarket.supplyRate
          const borrowRateChange = market.borrowRate - prevMarket.borrowRate

          if (Math.abs(supplyRateChange) > thresholds.rateChangePct) {
            newAlerts.push({
              id: `rate-change-${market.symbol}-${Date.now()}`,
              type: 'rate_change',
              title: 'Rate Change Alert',
              message: `${market.symbol} supply rate ${supplyRateChange > 0 ? 'increased' : 'decreased'} by ${Math.abs(supplyRateChange).toFixed(2)}%`,
              market: market.symbol,
              value: market.supplyRate,
              change: supplyRateChange,
              timestamp: Date.now(),
              priority: Math.abs(supplyRateChange) > 1 ? 'high' : 'medium'
            })
          }

          if (Math.abs(borrowRateChange) > thresholds.rateChangePct) {
            newAlerts.push({
              id: `borrow-rate-${market.symbol}-${Date.now()}`,
              type: 'rate_change',
              title: 'Borrow Rate Alert',
              message: `${market.symbol} borrow rate ${borrowRateChange > 0 ? 'increased' : 'decreased'} by ${Math.abs(borrowRateChange).toFixed(2)}%`,
              market: market.symbol,
              value: market.borrowRate,
              change: borrowRateChange,
              timestamp: Date.now(),
              priority: Math.abs(borrowRateChange) > 1 ? 'high' : 'medium'
            })
          }
        }
      }

      // Utilization warnings
      if (market.utilization * 100 > thresholds.utilizationHighPct) {
        newAlerts.push({
          id: `utilization-${market.symbol}-${Date.now()}`,
          type: 'warning',
          title: 'High Utilization Warning',
          message: `${market.symbol} utilization at ${(market.utilization * 100).toFixed(1)}%`,
          market: market.symbol,
          value: market.utilization * 100,
          timestamp: Date.now(),
          priority: market.utilization > 0.95 ? 'high' : 'medium'
        })
      }

      // Arbitrage opportunities (when borrow rate < supply rate)
      const netRate = market.supplyRate - market.borrowRate
      if (netRate > thresholds.arbitrageSpreadPct) {
        newAlerts.push({
          id: `arbitrage-${market.symbol}-${Date.now()}`,
          type: 'opportunity',
          title: 'Arbitrage Opportunity',
          message: `Potential arbitrage in ${market.symbol}: ${(netRate).toFixed(2)}% spread`,
          market: market.symbol,
          value: netRate,
          timestamp: Date.now(),
          priority: 'high'
        })
      }
    })

    // Update alerts (keep only recent ones)
    setAlerts(prev => {
      const combined = [...newAlerts, ...prev]
      return combined.slice(0, 10) // Keep latest 10 alerts
    })

    // Store current data for comparison
    setPreviousData(markets)

    // Auto-show notifications for high priority alerts
    if (newAlerts.some(alert => alert.priority === 'high')) {
      setShowNotifications(true)
    }
  }, [markets, isLoading, previousData])

  const dismissAlert = (id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id))
  }

  const getAlertIcon = (type: SmartAlert['type']) => {
    switch (type) {
      case 'yield_opportunity':
        return <TrendingUp className="h-4 w-4 text-green-400" />
      case 'opportunity':
        return <DollarSign className="h-4 w-4 text-blue-400" />
      case 'rate_change':
        return <TrendingUp className="h-4 w-4 text-yellow-400" />
      case 'warning':
        return <Zap className="h-4 w-4 text-red-400" />
      default:
        return <Bell className="h-4 w-4 text-slate-400" />
    }
  }

  const getPriorityColor = (priority: SmartAlert['priority']) => {
    switch (priority) {
      case 'high':
        return 'border-red-400/50 bg-red-500/10'
      case 'medium':
        return 'border-yellow-400/50 bg-yellow-500/10'
      case 'low':
        return 'border-blue-400/50 bg-blue-500/10'
      default:
        return 'border-slate-400/50 bg-slate-500/10'
    }
  }

  const activeAlerts = alerts.filter(alert =>
    Date.now() - alert.timestamp < 5 * 60 * 1000 // Show alerts from last 5 minutes
  )

  // Create a portal container so the panel escapes stacking contexts
  const [portalEl, setPortalEl] = useState<HTMLElement | null>(null)

  useEffect(() => {
    const el = document.createElement('div')
    el.id = 'alert-portal'
    document.body.appendChild(el)
    setPortalEl(el)
    return () => {
      try { document.body.removeChild(el) } catch {}
    }
  }, [])

  return (
    <div className="relative z-[60]">
      {/* Alert Bell */}
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative p-2 bg-slate-800/80 rounded-lg border border-slate-700 hover:bg-slate-700/80 transition-colors antialiased"
      >
        <Bell className="h-5 w-5 text-slate-300" />
        {activeAlerts.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {activeAlerts.length}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {showNotifications && portalEl && createPortal(
        <div className="fixed top-16 right-6 w-96 max-h-96 overflow-y-auto bg-slate-800/95 rounded-lg border border-slate-700 shadow-xl z-[99999] antialiased">
          <div className="p-4 border-b border-slate-700">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-medium">Smart Alerts</h3>
              <button
                onClick={() => setShowNotifications(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="p-2">
            {activeAlerts.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                <p className="text-slate-400 text-sm">No active alerts</p>
              </div>
            ) : (
              <div className="space-y-2">
                {activeAlerts.map(alert => (
                  <div
                    key={alert.id}
                    className={`p-3 rounded-lg border ${getPriorityColor(alert.priority)}`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        {getAlertIcon(alert.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <p className="text-white font-medium text-sm">{alert.title}</p>
                          <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                            alert.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                            alert.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-blue-500/20 text-blue-400'
                          }`}>
                            {alert.priority}
                          </span>
                        </div>
                        <p className="text-slate-300 text-sm mt-1">{alert.message}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-slate-400 text-xs">{alert.market}</span>
                          <div className="flex items-center space-x-2">
                            {alert.change && (
                              <span className={`text-xs font-medium ${
                                alert.change > 0 ? 'text-green-400' : 'text-red-400'
                              }`}>
                                {alert.change > 0 ? '+' : ''}{alert.change.toFixed(2)}%
                              </span>
                            )}
                            <span className="text-slate-400 text-xs">
                              {new Date(alert.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => dismissAlert(alert.id)}
                        className="text-slate-400 hover:text-white flex-shrink-0"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>,
        portalEl
      )}

      {/* Floating Alert Badges */}
      {activeAlerts.filter(a => a.priority === 'high').length > 0 && !showNotifications && (
        <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
      )}
    </div>
  )
}
