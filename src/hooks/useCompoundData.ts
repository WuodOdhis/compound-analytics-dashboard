import { useQuery, UseQueryResult } from '@tanstack/react-query'
import { MarketData, MarketDataResponse } from '../types/market'
import { CompoundService } from '../services/compound'

export function useAllMarketsData(): UseQueryResult<MarketDataResponse> {
  return useQuery({
    queryKey: ['markets'],
    queryFn: async (): Promise<MarketDataResponse> => {
      const service = new CompoundService()
      const markets = await service.getAllMarketsData()
      return {
        markets,
        timestamp: Date.now()
      }
    },
    refetchInterval: 30000,
  })
}

export function useMarketStats() {
  const { data } = useAllMarketsData()
  const markets = data?.markets || []

  const totalSupplyUSD = markets.reduce((acc, market) => {
    const supply = parseFloat(market.totalSupply)
    const price = parseFloat(market.price)
    return acc + (supply * price)
  }, 0)

  const totalBorrowUSD = markets.reduce((acc, market) => {
    const borrow = parseFloat(market.totalBorrow)
    const price = parseFloat(market.price)
    return acc + (borrow * price)
  }, 0)

  const averageUtilization = markets.length > 0
    ? markets.reduce((acc, market) => acc + market.utilization, 0) / markets.length
    : 0

  return {
    totalSupplyUSD,
    totalBorrowUSD,
    averageUtilization,
    marketCount: markets.length,
    lastUpdated: data?.timestamp
  }
}