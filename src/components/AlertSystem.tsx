'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useAllMarketsData } from '@/hooks/useCompoundData'
import { useSettings } from '@/providers/SettingsProvider'
import { Bell } from 'lucide-react'
import { MarketData } from '@/types/market'

interface SmartAlert {
  id: string
  type: 'yield_opportunity' | 'risk_warning' | 'rate_change' | 'market_update'
  message: string
  timestamp: number
}

export default function AlertSystem() {
  const { data } = useAllMarketsData()
  const [alerts, setAlerts] = useState<SmartAlert[]>([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [previousData, setPreviousData] = useState<any>(null)
  const { thresholds } = useSettings()

  // Generate smart alerts based on market data
  useEffect(() => {
    if (!data?.markets) return
    
    const list = data.markets
    const generated: SmartAlert[] = []

    for (const market of list) {
      // High yield opportunities
      if (market.supplyApy > thresholds.supplyApy) {
        generated.push({
          id: `yield-${market.symbol}-${Date.now()}`,
          type: 'yield_opportunity',
          message: `High supply APY (${(market.supplyApy * 100).toFixed(2)}%) available in ${market.symbol} market`,
          timestamp: Date.now()
        })
      }

      // High utilization warnings
      if (market.utilization > thresholds.utilization) {
        generated.push({
          id: `util-${market.symbol}-${Date.now()}`,
          type: 'risk_warning',
          message: `High utilization (${(market.utilization * 100).toFixed(2)}%) in ${market.symbol} market`,
          timestamp: Date.now()
        })
      }

      // Rate changes
      if (previousData?.markets) {
        const prevMarket = previousData.markets.find((m: MarketData) => m.symbol === market.symbol)
        if (prevMarket) {
          const borrowRateChange = Math.abs(market.borrowApy - prevMarket.borrowApy)
          if (borrowRateChange > thresholds.rateChange) {
            generated.push({
              id: `rate-${market.symbol}-${Date.now()}`,
              type: 'rate_change',
              message: `Significant rate change in ${market.symbol} market`,
              timestamp: Date.now()
            })
          }
        }
      }
    }

    setAlerts(prev => [...generated, ...prev].slice(0, 10)) // Keep last 10 alerts
    setPreviousData(data)
  }, [data, thresholds])

  if (typeof window === 'undefined') return null

  const notificationPanel = (
    <div 
      className={`fixed top-16 right-6 w-96 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-[9999] transition-all duration-300 ${
        showNotifications ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
      }`}
    >
      <div className="p-4 border-b border-slate-700">
        <h3 className="text-lg font-semibold">Notifications</h3>
      </div>
      <div className="max-h-[70vh] overflow-y-auto">
        {alerts.length > 0 ? (
          <div className="divide-y divide-slate-700">
            {alerts.map(alert => (
              <div key={alert.id} className="p-4 hover:bg-slate-700/50">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm">{alert.message}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded ${
                    alert.type === 'yield_opportunity' ? 'bg-green-900/50 text-green-400' :
                    alert.type === 'risk_warning' ? 'bg-red-900/50 text-red-400' :
                    'bg-blue-900/50 text-blue-400'
                  }`}>
                    {alert.type.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-gray-400">
            No notifications
          </div>
        )}
      </div>
    </div>
  )

  return (
    <>
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="fixed top-4 right-4 p-2 bg-slate-800 hover:bg-slate-700 rounded-full shadow-lg transition-colors z-[60]"
      >
        <Bell className="w-5 h-5" />
        {alerts.length > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center">
            {alerts.length}
          </span>
        )}
      </button>
      {createPortal(notificationPanel, document.body)}
    </>
  )
}