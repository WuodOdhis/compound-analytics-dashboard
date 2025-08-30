export interface MarketData {
  symbol: string
  address: string
  utilization: number
  supplyApy: number
  borrowApy: number
  totalSupply: string
  totalBorrow: string
  reserves: string
  price: string
}

export interface RiskAlert {
  id: string
  type: 'warning' | 'danger' | 'info'
  message: string
  timestamp: number
}

export interface MarketDataResponse {
  markets: MarketData[]
  timestamp: number
}
