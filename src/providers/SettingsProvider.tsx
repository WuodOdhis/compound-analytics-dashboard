'use client'

import { createContext, useContext, useMemo, useState, useEffect } from 'react'

export type RefetchInterval = 15000 | 30000 | 60000

interface AlertThresholds {
  utilizationHighPct: number // e.g., 85
  rateChangePct: number      // e.g., 1.0
  arbitrageSpreadPct: number // e.g., 2.0
}

interface SettingsContextValue {
  refetchInterval: RefetchInterval
  setRefetchInterval: (v: RefetchInterval) => void
  thresholds: AlertThresholds
  setThresholds: (t: AlertThresholds) => void
  favorites: string[]
  toggleFavorite: (symbol: string) => void
  lastUpdated: number | null
  setLastUpdated: (n: number) => void
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined)

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [refetchInterval, setRefetchInterval] = useState<RefetchInterval>(30000)
  const [thresholds, setThresholds] = useState<AlertThresholds>({
    utilizationHighPct: 85,
    rateChangePct: 1.0,
    arbitrageSpreadPct: 2.0,
  })
  const [favorites, setFavorites] = useState<string[]>([])
  const [lastUpdated, setLastUpdated] = useState<number | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('settings')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        if (parsed.refetchInterval) setRefetchInterval(parsed.refetchInterval)
        if (parsed.thresholds) setThresholds(parsed.thresholds)
        if (parsed.favorites) setFavorites(parsed.favorites)
      } catch {}
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('settings', JSON.stringify({ refetchInterval, thresholds, favorites }))
  }, [refetchInterval, thresholds, favorites])

  const toggleFavorite = (symbol: string) => {
    setFavorites(prev => prev.includes(symbol) ? prev.filter(s => s !== symbol) : [...prev, symbol])
  }

  const value = useMemo(() => ({
    refetchInterval,
    setRefetchInterval,
    thresholds,
    setThresholds,
    favorites,
    toggleFavorite,
    lastUpdated,
    setLastUpdated,
  }), [refetchInterval, thresholds, favorites, lastUpdated])

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider')
  return ctx
}


