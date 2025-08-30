'use client'

import { useState, useEffect } from 'react'
import { Wallet, TrendingUp, TrendingDown, DollarSign, PieChart, Plus } from 'lucide-react'
import { useAllMarketsData } from '../hooks/useCompoundData'

interface Position {
  id: string
  market: string
  type: 'supply' | 'borrow'
  amount: number
  value: number
  apy: number
  healthFactor?: number
  liquidationPrice?: number
}

interface PortfolioSummary {
  totalSupplied: number
  totalBorrowed: number
  netAPY: number
  healthFactor: number
  totalPositions: number
  pnl24h: number
}

// Mock user positions (in a real app, this would come from wallet connection)
const mockPositions: Position[] = [
  {
    id: '1',
    market: 'USDC',
    type: 'supply',
    amount: 10000,
    value: 10000,
    apy: 5.2,
    healthFactor: 2.1
  },
  {
    id: '2',
    market: 'WETH',
    type: 'supply',
    amount: 5,
    value: 15000,
    apy: 3.1,
    healthFactor: 2.1
  },
  {
    id: '3',
    market: 'WBTC',
    type: 'borrow',
    amount: 0.5,
    value: 25000,
    apy: 4.5,
    healthFactor: 1.8,
    liquidationPrice: 45000
  },
  {
    id: '4',
    market: 'USDC',
    type: 'borrow',
    amount: 5000,
    value: 5000,
    apy: 7.8,
    healthFactor: 1.8
  }
]

export default function PortfolioTracker() {
  const { data: markets } = useAllMarketsData()
  const [positions, setPositions] = useState<Position[]>(mockPositions)
  const [portfolio, setPortfolio] = useState<PortfolioSummary>({
    totalSupplied: 0,
    totalBorrowed: 0,
    netAPY: 0,
    healthFactor: 0,
    totalPositions: 0,
    pnl24h: 0
  })
  const [selectedView, setSelectedView] = useState<'overview' | 'positions'>('overview')

  // Calculate portfolio summary
  useEffect(() => {
    const supplied = positions
      .filter(p => p.type === 'supply')
      .reduce((sum, p) => sum + p.value, 0)

    const borrowed = positions
      .filter(p => p.type === 'borrow')
      .reduce((sum, p) => sum + p.value, 0)

    const supplyWeightedAPY = positions
      .filter(p => p.type === 'supply')
      .reduce((sum, p) => sum + (p.apy * p.value), 0) / supplied || 0

    const borrowWeightedAPY = positions
      .filter(p => p.type === 'borrow')
      .reduce((sum, p) => sum + (p.apy * p.value), 0) / borrowed || 0

    const netAPY = supplyWeightedAPY - borrowWeightedAPY
    const healthFactor = Math.min(...positions.map(p => p.healthFactor || 10))

    setPortfolio({
      totalSupplied: supplied,
      totalBorrowed: borrowed,
      netAPY: netAPY,
      healthFactor: healthFactor,
      totalPositions: positions.length,
      pnl24h: (supplied + borrowed) * 0.02 // Mock 24h P&L
    })
  }, [positions])

  const getHealthFactorColor = (hf: number) => {
    if (hf < 1.2) return 'text-red-400'
    if (hf < 1.5) return 'text-yellow-400'
    return 'text-green-400'
  }

  const getPositionIcon = (type: Position['type']) => {
    return type === 'supply'
      ? <TrendingUp className="h-4 w-4 text-green-400" />
      : <TrendingDown className="h-4 w-4 text-red-400" />
  }

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-700">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white flex items-center">
          <Wallet className="h-5 w-5 mr-2 text-purple-400" />
          Portfolio Tracker
        </h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setSelectedView('overview')}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              selectedView === 'overview'
                ? 'bg-purple-500 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setSelectedView('positions')}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              selectedView === 'positions'
                ? 'bg-purple-500 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            Positions
          </button>
        </div>
      </div>

      {selectedView === 'overview' ? (
        <div className="space-y-6">
          {/* Portfolio Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-700/50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total Supplied</p>
                  <p className="text-xl font-bold text-white">
                    ${portfolio.totalSupplied.toLocaleString()}
                  </p>
                </div>
                <TrendingUp className="h-5 w-5 text-green-400" />
              </div>
            </div>

            <div className="bg-slate-700/50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total Borrowed</p>
                  <p className="text-xl font-bold text-white">
                    ${portfolio.totalBorrowed.toLocaleString()}
                  </p>
                </div>
                <TrendingDown className="h-5 w-5 text-red-400" />
              </div>
            </div>

            <div className="bg-slate-700/50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Net APY</p>
                  <p className={`text-xl font-bold ${
                    portfolio.netAPY > 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {portfolio.netAPY.toFixed(2)}%
                  </p>
                </div>
                <DollarSign className="h-5 w-5 text-blue-400" />
              </div>
            </div>

            <div className="bg-slate-700/50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Health Factor</p>
                  <p className={`text-xl font-bold ${getHealthFactorColor(portfolio.healthFactor)}`}>
                    {portfolio.healthFactor.toFixed(2)}
                  </p>
                </div>
                <PieChart className="h-5 w-5 text-purple-400" />
              </div>
            </div>
          </div>

          {/* Portfolio Performance */}
          <div className="bg-slate-700/50 rounded-lg p-4">
            <h3 className="text-white font-medium mb-4">Portfolio Performance</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-slate-400 text-sm">24h P&L</p>
                <p className={`text-2xl font-bold ${
                  portfolio.pnl24h > 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  ${portfolio.pnl24h.toFixed(2)}
                </p>
                <p className={`text-sm ${
                  portfolio.pnl24h > 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {((portfolio.pnl24h / portfolio.totalSupplied) * 100).toFixed(2)}%
                </p>
              </div>
              <div className="text-center">
                <p className="text-slate-400 text-sm">Utilization</p>
                <p className="text-2xl font-bold text-white">
                  {((portfolio.totalBorrowed / portfolio.totalSupplied) * 100).toFixed(1)}%
                </p>
                <p className="text-slate-400 text-sm">of supplied assets</p>
              </div>
              <div className="text-center">
                <p className="text-slate-400 text-sm">Active Positions</p>
                <p className="text-2xl font-bold text-white">{portfolio.totalPositions}</p>
                <p className="text-slate-400 text-sm">across markets</p>
              </div>
            </div>
          </div>

          {/* Risk Warnings */}
          {portfolio.healthFactor < 1.5 && (
            <div className="bg-red-500/10 border border-red-400/50 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center">
                  <TrendingDown className="h-4 w-4 text-red-400" />
                </div>
                <div>
                  <p className="text-white font-medium">Health Factor Warning</p>
                  <p className="text-slate-300 text-sm">
                    Your health factor is {portfolio.healthFactor.toFixed(2)}.
                    Consider reducing borrowing or adding collateral.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-medium">Your Positions</h3>
            <button className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors">
              <Plus className="h-4 w-4" />
              <span>Add Position</span>
            </button>
          </div>

          {positions.length === 0 ? (
            <div className="text-center py-8">
              <Wallet className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-400">No positions yet</p>
              <p className="text-slate-500 text-sm">Connect your wallet to view your Compound positions</p>
            </div>
          ) : (
            <div className="space-y-3">
              {positions.map(position => (
                <div
                  key={position.id}
                  className="bg-slate-700/50 rounded-lg p-4 border border-slate-600"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        {getPositionIcon(position.type)}
                        <div>
                          <p className="text-white font-medium">{position.market}</p>
                          <p className="text-slate-400 text-sm capitalize">{position.type}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-medium">
                          {position.amount.toLocaleString()} {position.market}
                        </p>
                        <p className="text-slate-400 text-sm">
                          ${position.value.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className={`font-medium ${
                        position.type === 'supply' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {position.apy.toFixed(2)}% APY
                      </p>
                      {position.healthFactor && (
                        <p className={`text-sm ${getHealthFactorColor(position.healthFactor)}`}>
                          HF: {position.healthFactor.toFixed(2)}
                        </p>
                      )}
                    </div>
                  </div>

                  {position.liquidationPrice && (
                    <div className="mt-3 pt-3 border-t border-slate-600">
                      <p className="text-slate-400 text-sm">
                        Liquidation Price: ${position.liquidationPrice.toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}


