import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { compoundService, MarketData, COMPOUND_MARKETS } from '../services/compound'
import { useSettings } from '@/providers/SettingsProvider'

export function useAllMarketsData() {
  const queryClient = useQueryClient()
  const { refetchInterval, setLastUpdated } = useSettings()

  const query = useQuery({
    queryKey: ['compound-markets'],
    queryFn: async () => {
      console.log('🔄 Fetching all markets data...')
      try {
        const data = await compoundService.getAllMarketsData()
        console.log('✅ Successfully fetched markets data:', data)
        setLastUpdated(Date.now())
        return data
      } catch (error) {
        console.error('❌ Error fetching markets data:', error)
        throw error
      }
    },
    refetchInterval,
    staleTime: Math.max(0, refetchInterval - 5000),
    retry: (failureCount, error) => {
      console.log(`🔄 Retry attempt ${failureCount} for markets data:`, error)
      return failureCount < 3
    },
    onError: (error) => {
      console.error('💥 Markets data query failed:', error)
    }
  })

  // Set up real-time updates
  useEffect(() => {
    const intervals: NodeJS.Timeout[] = []

    COMPOUND_MARKETS.forEach(market => {
      const unsubscribe = compoundService.subscribeToMarketUpdates(
        market.address,
        (data) => {
          if (data) {
            console.log('📡 Real-time update received for', market.symbol, data)
            queryClient.setQueryData(['compound-markets'], (oldData: MarketData[] | undefined) => {
              if (!oldData) return [data]

              const existingIndex = oldData.findIndex(m => m.address === data.address)
              if (existingIndex >= 0) {
                const newData = [...oldData]
                newData[existingIndex] = data
                return newData
              } else {
                return [...oldData, data]
              }
            })
          }
        }
      )

      intervals.push(setInterval(() => unsubscribe, 30000))
    })

    return () => {
      intervals.forEach(clearInterval)
    }
  }, [queryClient])

  return query
}

export function useMarketData(cometAddress: string) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['compound-market', cometAddress],
    queryFn: () => compoundService.getMarketData(cometAddress),
    refetchInterval: 30000,
    staleTime: 25000,
    enabled: !!cometAddress,
  })

  // Set up real-time updates for this specific market
  useEffect(() => {
    if (!cometAddress) return

    const unsubscribe = compoundService.subscribeToMarketUpdates(
      cometAddress,
      (data) => {
        if (data) {
          queryClient.setQueryData(['compound-market', cometAddress], data)
        }
      }
    )

    return unsubscribe
  }, [cometAddress, queryClient])

  return query
}

export function useMarketStats() {
  const { data: markets, isLoading } = useAllMarketsData()

  const stats = {
    totalMarkets: markets?.length || 0,
    averageUtilization: markets?.length
      ? markets.reduce((sum, market) => sum + market.utilization, 0) / markets.length
      : 0,
    highestUtilization: markets?.length
      ? Math.max(...markets.map(m => m.utilization))
      : 0,
    totalValueLocked: markets?.length
      ? markets.reduce((sum, market) => sum + parseFloat(market.totalSupply), 0)
      : 0,
    totalBorrowed: markets?.length
      ? markets.reduce((sum, market) => sum + parseFloat(market.totalBorrow), 0)
      : 0,
  }

  return {
    stats,
    isLoading,
    markets: markets || []
  }
}
