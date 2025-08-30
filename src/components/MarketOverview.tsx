'use client'

import { useMemo, useState } from 'react'
import { Activity, DollarSign, TrendingUp, TrendingDown, Loader2 } from 'lucide-react'
import { useAllMarketsData } from '../hooks/useCompoundData'
import { useSettings } from '@/providers/SettingsProvider'

export default function MarketOverview() {
  const { data: markets, isLoading, error } = useAllMarketsData()
  const [selectedMarket, setSelectedMarket] = useState<string>('USDC')
  const { favorites, toggleFavorite } = useSettings()

  const orderedMarkets = useMemo(() => {
    if (!markets) return [] as any[]
    const favSet = new Set(favorites)
    const favs = markets.filter(m => favSet.has(m.symbol))
    const rest = markets.filter(m => !favSet.has(m.symbol))
    return [...favs, ...rest]
  }, [markets, favorites])

  if (isLoading) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-700 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-400 mx-auto mb-2" />
          <p className="text-slate-400">Loading market data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-700 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-2">Error loading market data</p>
          <p className="text-slate-400 text-sm">Please check your RPC configuration</p>
        </div>
      </div>
    )
  }

  const selectedMarketData = markets?.find(m => m.symbol === selectedMarket)

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-700">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white flex items-center">
          <Activity className="h-5 w-5 mr-2 text-blue-400" />
          Market Overview
        </h2>
        <select
          value={selectedMarket}
          onChange={(e) => setSelectedMarket(e.target.value)}
          className="bg-slate-700 border border-slate-600 rounded px-3 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          {markets?.map(market => (
            <option key={market.symbol} value={market.symbol}>{market.symbol}</option>
          ))}
        </select>
      </div>

      {selectedMarketData && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-700/50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Utilization</p>
                  <p className="text-2xl font-bold text-white">
                    {(selectedMarketData.utilization * 100).toFixed(1)}%
                  </p>
                </div>
                <div className={`p-2 rounded-full ${selectedMarketData.utilization > 0.8 ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                  <Activity className="h-4 w-4" />
                </div>
              </div>
            </div>

            <div className="bg-slate-700/50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total Supply</p>
                  <p className="text-xl font-bold text-white">${parseFloat(selectedMarketData.totalSupply).toLocaleString()}</p>
                </div>
                <DollarSign className="h-4 w-4 text-green-400" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-700/50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Supply APY</p>
                  <p className="text-xl font-bold text-green-400">
                    {selectedMarketData.supplyRate.toFixed(2)}%
                  </p>
                </div>
                <TrendingUp className="h-4 w-4 text-green-400" />
              </div>
            </div>

            <div className="bg-slate-700/50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Borrow APY</p>
                  <p className="text-xl font-bold text-red-400">
                    {selectedMarketData.borrowRate.toFixed(2)}%
                  </p>
                </div>
                <TrendingDown className="h-4 w-4 text-red-400" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Market List */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-white mb-4">All Markets</h3>
        <div className="space-y-2">
          {orderedMarkets?.map(market => (
            <div
              key={market.symbol}
              className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                selectedMarket === market.symbol ? 'bg-blue-500/20 border border-blue-400/50' : 'bg-slate-700/30 hover:bg-slate-700/50'
              }`}
              onClick={() => setSelectedMarket(market.symbol)}
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center text-xs font-bold text-white">
                  {market.symbol.slice(0, 2)}
                </div>
                <div>
                  <p className="text-white font-medium">{market.symbol}</p>
                  <p className="text-slate-400 text-sm">${parseFloat(market.totalSupply).toLocaleString()} TVL</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white font-medium">{(market.utilization * 100).toFixed(0)}%</p>
                <p className="text-slate-400 text-sm">utilized</p>
              </div>
              <button
                className={`ml-3 px-2 py-1 text-xs rounded border ${favorites.includes(market.symbol) ? 'border-yellow-400 text-yellow-300' : 'border-slate-600 text-slate-300'}`}
                onClick={(e) => { e.stopPropagation(); toggleFavorite(market.symbol) }}
              >
                {favorites.includes(market.symbol) ? '★ Fav' : '☆ Fav'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
