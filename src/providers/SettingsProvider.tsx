'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type RefetchInterval = 1000 | 5000 | 10000 | 30000 | 60000

interface Thresholds {
  utilization: number
  supplyApy: number
  borrowApy: number
  rateChange: number
}

interface SettingsContextType {
  refetchInterval: RefetchInterval
  setRefetchInterval: (interval: RefetchInterval) => void
  favorites: string[]
  toggleFavorite: (symbol: string) => void
  lastUpdated: number | null
  setLastUpdated: (timestamp: number) => void
  thresholds: Thresholds
  setThresholds: (thresholds: Thresholds) => void
}

const defaultThresholds: Thresholds = {
  utilization: 0.8, // 80%
  supplyApy: 0.1,   // 10%
  borrowApy: 0.2,   // 20%
  rateChange: 0.1   // 10% change
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [refetchInterval, setRefetchInterval] = useState<RefetchInterval>(30000)
  const [favorites, setFavorites] = useState<string[]>([])
  const [lastUpdated, setLastUpdated] = useState<number | null>(null)
  const [thresholds, setThresholds] = useState<Thresholds>(defaultThresholds)

  useEffect(() => {
    const savedSettings = localStorage.getItem('dashboardSettings')
    if (savedSettings) {
      const { 
        refetchInterval: savedInterval, 
        favorites: savedFavorites,
        thresholds: savedThresholds 
      } = JSON.parse(savedSettings)
      
      if (savedInterval) setRefetchInterval(savedInterval as RefetchInterval)
      if (savedFavorites) setFavorites(savedFavorites)
      if (savedThresholds) setThresholds(savedThresholds)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('dashboardSettings', JSON.stringify({ 
      refetchInterval, 
      favorites,
      thresholds 
    }))
  }, [refetchInterval, favorites, thresholds])

  const toggleFavorite = (symbol: string) => {
    setFavorites(prev => 
      prev.includes(symbol)
        ? prev.filter(s => s !== symbol)
        : [...prev, symbol]
    )
  }

  return (
    <SettingsContext.Provider value={{
      refetchInterval,
      setRefetchInterval,
      favorites,
      toggleFavorite,
      lastUpdated,
      setLastUpdated,
      thresholds,
      setThresholds
    }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}