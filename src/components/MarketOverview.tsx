'use client'

import { useMemo, useState } from 'react'
import { useAllMarketsData } from '../hooks/useCompoundData'
import { useSettings } from '../providers/SettingsProvider'
import { Loader2 } from 'lucide-react'
import { MarketData } from '../types/market'

export default function MarketOverview() {
  const { data, isLoading } = useAllMarketsData()
  const { favorites, toggleFavorite } = useSettings()
  const [selectedMarket, setSelectedMarket] = useState(data?.markets[0]?.symbol || 'USDC')

  const markets = useMemo(() => data?.markets || [], [data])
  
  const orderedMarkets = useMemo(() => {
    return markets.sort((a, b) => {
      const aFav = favorites.includes(a.symbol)
      const bFav = favorites.includes(b.symbol)
      if (aFav && !bFav) return -1
      if (!aFav && bFav) return 1
      return 0
    })
  }, [markets, favorites])

  const selectedMarketData = markets.find(m => m.symbol === selectedMarket)

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
        <h2 className="text-2xl font-bold text-white">Market Overview</h2>
        <select
          value={selectedMarket}
          onChange={(e) => setSelectedMarket(e.target.value)}
          className="bg-slate-700 border border-slate-600 rounded px-3 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          {markets.map((market: MarketData) => (
            <option key={market.symbol} value={market.symbol}>{market.symbol}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {orderedMarkets.map((market: MarketData) => (
          <div
            key={market.symbol}
            className="bg-slate-700 rounded-lg p-4 hover:bg-slate-600 transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold">{market.symbol}</h3>
              <button
                onClick={() => toggleFavorite(market.symbol)}
                className={`p-1 rounded ${
                  favorites.includes(market.symbol)
                    ? 'text-yellow-400 hover:text-yellow-500'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                ★
              </button>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Utilization</span>
                <span>{(market.utilization * 100).toFixed(2)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Supply APY</span>
                <span>{(market.supplyApy * 100).toFixed(2)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Borrow APY</span>
                <span>{(market.borrowApy * 100).toFixed(2)}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}