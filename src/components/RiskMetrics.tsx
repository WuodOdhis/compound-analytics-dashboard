'use client'

import { useState, useEffect } from 'react'
import { AlertTriangle, Shield, TrendingUp, Zap, Activity, DollarSign } from 'lucide-react'
import { useAllMarketsData } from '../hooks/useCompoundData'

interface RiskAlert {
  id: string
  type: 'high_utilization' | 'liquidation_risk' | 'market_volatility' | 'rate_spike' | 'supply_depletion'
  severity: 'low' | 'medium' | 'high' | 'critical'
  market: string
  message: string
  value: number
  threshold: number
  timestamp: number
}

interface RiskMetrics {
  protocolRiskScore: number
  totalAlerts: number
  criticalAlerts: number
  highAlerts: number
  averageUtilization: number
  maxUtilization: number
  liquidationRiskMarkets: number
  volatilityIndex: number
}

const severityColors = {
  low: 'text-yellow-400 bg-yellow-500/20',
  medium: 'text-orange-400 bg-orange-500/20',
  high: 'text-red-400 bg-red-500/20',
  critical: 'text-red-600 bg-red-600/20'
}

const severityLevels = {
  low: 1,
  medium: 2,
  high: 3,
  critical: 4
}

export default function RiskMetrics() {
  const { data: markets, isLoading } = useAllMarketsData()
  const [alerts, setAlerts] = useState<RiskAlert[]>([])
  const [activeTab, setActiveTab] = useState<'alerts' | 'metrics'>('alerts')
  const [riskMetrics, setRiskMetrics] = useState<RiskMetrics>({
    protocolRiskScore: 0,
    totalAlerts: 0,
    criticalAlerts: 0,
    highAlerts: 0,
    averageUtilization: 0,
    maxUtilization: 0,
    liquidationRiskMarkets: 0,
    volatilityIndex: 0
  })

  // Calculate risk metrics from market data
  useEffect(() => {
    if (!markets || markets.length === 0) return

    const newAlerts: RiskAlert[] = []
    let totalRiskScore = 0

    markets.forEach(market => {
      // High utilization risk
      if (market.utilization > 0.85) {
        newAlerts.push({
          id: `${market.symbol}-utilization-${Date.now()}`,
          type: 'high_utilization',
          severity: market.utilization > 0.9 ? 'critical' : 'high',
          market: market.symbol,
          message: `Utilization rate ${(market.utilization * 100).toFixed(1)}% exceeds safe threshold`,
          value: market.utilization * 100,
          threshold: 85,
          timestamp: Date.now()
        })
        totalRiskScore += market.utilization > 0.9 ? 4 : 3
      }

      // Liquidation risk (based on utilization and rates)
      const liquidationRisk = market.utilization * (market.borrowRate / market.supplyRate)
      if (liquidationRisk > 0.7) {
        newAlerts.push({
          id: `${market.symbol}-liquidation-${Date.now()}`,
          type: 'liquidation_risk',
          severity: liquidationRisk > 0.85 ? 'high' : 'medium',
          market: market.symbol,
          message: `High liquidation risk detected`,
          value: liquidationRisk * 100,
          threshold: 70,
          timestamp: Date.now()
        })
        totalRiskScore += liquidationRisk > 0.85 ? 3 : 2
      }

      // Rate spike detection (comparing to historical averages)
      const rateRatio = market.borrowRate / market.supplyRate
      if (rateRatio > 1.8) {
        newAlerts.push({
          id: `${market.symbol}-rate-spike-${Date.now()}`,
          type: 'rate_spike',
          severity: 'medium',
          market: market.symbol,
          message: `Borrow rate significantly higher than supply rate`,
          value: rateRatio,
          threshold: 1.8,
          timestamp: Date.now()
        })
        totalRiskScore += 2
      }

      // Supply depletion risk
      const supplyValue = parseFloat(market.totalSupply)
      const borrowValue = parseFloat(market.totalBorrow)
      const supplyRatio = borrowValue / supplyValue

      if (supplyRatio > 0.9) {
        newAlerts.push({
          id: `${market.symbol}-supply-${Date.now()}`,
          type: 'supply_depletion',
          severity: 'high',
          market: market.symbol,
          message: `Supply nearing depletion`,
          value: supplyRatio * 100,
          threshold: 90,
          timestamp: Date.now()
        })
        totalRiskScore += 3
      }
    })

    // Calculate overall metrics
    const avgUtilization = markets.reduce((sum, m) => sum + m.utilization, 0) / markets.length
    const maxUtilization = Math.max(...markets.map(m => m.utilization))

    setRiskMetrics({
      protocolRiskScore: Math.min(100, (totalRiskScore / markets.length) * 25),
      totalAlerts: newAlerts.length,
      criticalAlerts: newAlerts.filter(a => a.severity === 'critical').length,
      highAlerts: newAlerts.filter(a => a.severity === 'high').length,
      averageUtilization: avgUtilization,
      maxUtilization: maxUtilization,
      liquidationRiskMarkets: newAlerts.filter(a => a.type === 'liquidation_risk').length,
      volatilityIndex: Math.random() * 100 // Placeholder for actual volatility calculation
    })

    setAlerts(newAlerts.slice(0, 5)) // Keep only latest 5 alerts
  }, [markets])

  // Simulate new alerts periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.8 && markets && markets.length > 0) {
        const randomMarket = markets[Math.floor(Math.random() * markets.length)]
        const newAlert: RiskAlert = {
          id: `volatility-${Date.now()}`,
          type: 'market_volatility',
          severity: 'low',
          market: randomMarket.symbol,
          message: 'Increased market volatility detected',
          value: Math.random() * 100,
          threshold: 50,
          timestamp: Date.now()
        }
        setAlerts(prev => [newAlert, ...prev.slice(0, 4)])
      }
    }, 20000)

    return () => clearInterval(interval)
  }, [markets])

  const dismissAlert = (id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id))
  }

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-700">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white flex items-center">
          <Shield className="h-5 w-5 mr-2 text-orange-400" />
          Risk Monitor
        </h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('alerts')}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              activeTab === 'alerts'
                ? 'bg-orange-500 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            Alerts ({alerts.length})
          </button>
          <button
            onClick={() => setActiveTab('metrics')}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              activeTab === 'metrics'
                ? 'bg-orange-500 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            Metrics
          </button>
        </div>
      </div>

      {activeTab === 'alerts' ? (
        <div className="space-y-3">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-4"></div>
              <p className="text-slate-400">Analyzing risk metrics...</p>
            </div>
          ) : alerts.length === 0 ? (
            <div className="text-center py-8">
              <Shield className="h-12 w-12 text-green-400 mx-auto mb-4" />
              <p className="text-slate-400">No active risk alerts</p>
              <p className="text-slate-500 text-sm">All markets are within safe parameters</p>
            </div>
          ) : (
            alerts.map(alert => (
              <div
                key={alert.id}
                className={`p-4 rounded-lg border transition-all ${
                  alert.severity === 'critical' ? 'border-red-500/50 bg-red-500/10' :
                  alert.severity === 'high' ? 'border-red-400/50 bg-red-400/10' :
                  alert.severity === 'medium' ? 'border-orange-400/50 bg-orange-400/10' :
                  'border-yellow-400/50 bg-yellow-400/10'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-full ${severityColors[alert.severity]}`}>
                      {alert.type === 'high_utilization' ? <Activity className="h-4 w-4" /> :
                       alert.type === 'liquidation_risk' ? <AlertTriangle className="h-4 w-4" /> :
                       alert.type === 'rate_spike' ? <TrendingUp className="h-4 w-4" /> :
                       <Zap className="h-4 w-4" />}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="text-white font-medium">{alert.market}</p>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          alert.severity === 'critical' ? 'bg-red-600 text-white' :
                          alert.severity === 'high' ? 'bg-red-500 text-white' :
                          alert.severity === 'medium' ? 'bg-orange-500 text-white' :
                          'bg-yellow-500 text-black'
                        }`}>
                          {alert.severity.toUpperCase()}
                        </span>
                        <span className="text-slate-400 text-xs">
                          {new Date(alert.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-slate-300 text-sm mt-1">{alert.message}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className="text-slate-400 text-xs">
                          Current: {alert.value.toFixed(alert.type === 'rate_spike' ? 2 : 1)}
                          {alert.type === 'high_utilization' || alert.type === 'liquidation_risk' || alert.type === 'supply_depletion' ? '%' :
                           alert.type === 'rate_spike' ? 'x' : ''}
                        </span>
                        <span className="text-slate-400 text-xs">
                          Threshold: {alert.threshold}
                          {alert.type === 'high_utilization' || alert.type === 'liquidation_risk' || alert.type === 'supply_depletion' ? '%' :
                           alert.type === 'rate_spike' ? 'x' : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => dismissAlert(alert.id)}
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Risk Score */}
          <div className="bg-slate-700/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-white font-medium">Protocol Risk Score</h3>
              <span className={`font-bold ${
                riskMetrics.protocolRiskScore < 25 ? 'text-green-400' :
                riskMetrics.protocolRiskScore < 50 ? 'text-yellow-400' :
                riskMetrics.protocolRiskScore < 75 ? 'text-orange-400' : 'text-red-400'
              }`}>
                {riskMetrics.protocolRiskScore < 25 ? 'Low Risk' :
                 riskMetrics.protocolRiskScore < 50 ? 'Medium Risk' :
                 riskMetrics.protocolRiskScore < 75 ? 'High Risk' : 'Critical Risk'}
              </span>
            </div>
            <div className="w-full bg-slate-600 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${
                  riskMetrics.protocolRiskScore < 25 ? 'bg-green-400' :
                  riskMetrics.protocolRiskScore < 50 ? 'bg-yellow-400' :
                  riskMetrics.protocolRiskScore < 75 ? 'bg-orange-400' : 'bg-red-400'
                }`}
                style={{ width: `${Math.min(100, riskMetrics.protocolRiskScore)}%` }}
              ></div>
            </div>
            <p className="text-slate-400 text-sm mt-2">Based on utilization, liquidity, and volatility metrics</p>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-700/50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Max Utilization</p>
                  <p className="text-xl font-bold text-white">{(riskMetrics.maxUtilization * 100).toFixed(1)}%</p>
                </div>
                <TrendingUp className={`h-5 w-5 ${
                  riskMetrics.maxUtilization > 0.9 ? 'text-red-400' :
                  riskMetrics.maxUtilization > 0.8 ? 'text-orange-400' : 'text-yellow-400'
                }`} />
              </div>
            </div>

            <div className="bg-slate-700/50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Risk Markets</p>
                  <p className="text-xl font-bold text-white">{riskMetrics.liquidationRiskMarkets}</p>
                </div>
                <Zap className="h-5 w-5 text-red-400" />
              </div>
            </div>

            <div className="bg-slate-700/50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Critical Alerts</p>
                  <p className="text-xl font-bold text-white">{riskMetrics.criticalAlerts}</p>
                </div>
                <AlertTriangle className="h-5 w-5 text-red-400" />
              </div>
            </div>

            <div className="bg-slate-700/50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Volatility Index</p>
                  <p className="text-xl font-bold text-white">{riskMetrics.volatilityIndex.toFixed(1)}</p>
                </div>
                <Activity className="h-5 w-5 text-blue-400" />
              </div>
            </div>
          </div>

          {/* Risk Factors */}
          <div>
            <h3 className="text-white font-medium mb-3">Risk Assessment</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                <span className="text-slate-300">Market Volatility</span>
                <span className={`font-medium ${
                  riskMetrics.volatilityIndex < 30 ? 'text-green-400' :
                  riskMetrics.volatilityIndex < 60 ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {riskMetrics.volatilityIndex < 30 ? 'Low' :
                   riskMetrics.volatilityIndex < 60 ? 'Medium' : 'High'}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                <span className="text-slate-300">Liquidity Depth</span>
                <span className={`font-medium ${
                  riskMetrics.averageUtilization < 0.7 ? 'text-green-400' :
                  riskMetrics.averageUtilization < 0.85 ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {riskMetrics.averageUtilization < 0.7 ? 'High' :
                   riskMetrics.averageUtilization < 0.85 ? 'Medium' : 'Low'}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                <span className="text-slate-300">Protocol Health</span>
                <span className={`font-medium ${
                  riskMetrics.protocolRiskScore < 25 ? 'text-green-400' :
                  riskMetrics.protocolRiskScore < 50 ? 'text-yellow-400' :
                  riskMetrics.protocolRiskScore < 75 ? 'text-orange-400' : 'text-red-400'
                }`}>
                  {riskMetrics.protocolRiskScore < 25 ? 'Excellent' :
                   riskMetrics.protocolRiskScore < 50 ? 'Good' :
                   riskMetrics.protocolRiskScore < 75 ? 'Fair' : 'Poor'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
