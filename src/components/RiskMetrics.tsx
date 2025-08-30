import { useEffect, useState } from 'react'
import { useAllMarketsData } from '../hooks/useCompoundData'
import { RiskAlert, MarketData } from '../types/market'
import { Loader2 } from 'lucide-react'

export default function RiskMetrics() {
  const { data, isLoading } = useAllMarketsData()
  const [alerts, setAlerts] = useState<RiskAlert[]>([])
  const [protocolRiskScore, setProtocolRiskScore] = useState(0)

  // Calculate risk metrics from market data
  useEffect(() => {
    const markets = data?.markets || []
    if (markets.length === 0) return

    const newAlerts: RiskAlert[] = []
    let totalRiskScore = 0

    markets.forEach((market: MarketData) => {
      // High utilization alert
      if (market.utilization > 0.8) {
        newAlerts.push({
          id: `high-util-${market.symbol}`,
          type: 'warning',
          message: `High utilization (${(market.utilization * 100).toFixed(1)}%) in ${market.symbol} market`,
          timestamp: Date.now()
        })
        totalRiskScore += 20
      }

      // Supply depletion risk
      const availableSupply = parseFloat(market.totalSupply) - parseFloat(market.totalBorrow)
      if (availableSupply < parseFloat(market.totalSupply) * 0.1) {
        newAlerts.push({
          id: `low-liquidity-${market.symbol}`,
          type: 'danger',
          message: `Low liquidity in ${market.symbol} market`,
          timestamp: Date.now()
        })
        totalRiskScore += 30
      }

      // Rate spike detection
      if (market.borrowApy > 0.2) { // 20% APY threshold
        newAlerts.push({
          id: `high-rates-${market.symbol}`,
          type: 'info',
          message: `High borrow rates (${(market.borrowApy * 100).toFixed(1)}%) in ${market.symbol} market`,
          timestamp: Date.now()
        })
        totalRiskScore += 10
      }
    })

    setAlerts(newAlerts)
    setProtocolRiskScore(Math.min(100, totalRiskScore))
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
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Risk Assessment</h2>
        <div className="flex items-center space-x-4">
          <div className="text-lg">Protocol Risk Score:</div>
          <div className={`text-2xl font-bold ${
            protocolRiskScore < 30 ? 'text-green-400' :
            protocolRiskScore < 60 ? 'text-yellow-400' :
            'text-red-400'
          }`}>
            {protocolRiskScore}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`p-4 rounded-lg ${
              alert.type === 'danger' ? 'bg-red-900/50 border-red-700' :
              alert.type === 'warning' ? 'bg-yellow-900/50 border-yellow-700' :
              'bg-blue-900/50 border-blue-700'
            } border`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">{alert.message}</div>
              <div className="text-sm text-gray-400">
                {new Date(alert.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}

        {alerts.length === 0 && (
          <div className="text-center text-gray-400 py-8">
            No active risk alerts
          </div>
        )}
      </div>
    </div>
  )
}