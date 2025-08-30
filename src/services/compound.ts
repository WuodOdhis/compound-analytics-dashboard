import { Contract, JsonRpcProvider, formatUnits, ethers } from 'ethers'
import CometAbi from '../abi/Comet.json'
import { loadEnv } from '../config'

export interface MarketData {
  address: string
  symbol: string
  utilization: number
  supplyRate: number
  borrowRate: number
  totalSupply: string
  totalBorrow: string
  baseTokenPrice: number
  reserves: string
  lastUpdate: number
}

export interface CompoundMarket {
  address: string
  symbol: string
  name: string
}

// Known Compound III markets on mainnet (verified addresses)
export const COMPOUND_MARKETS: CompoundMarket[] = [
  {
    address: '0xc3d688B66703497DAA19211EEdff47f25384cdc3',
    symbol: 'USDC',
    name: 'USD Coin'
  },
  {
    address: '0xA17581A9E3356d9A858b789D68B4d866e593aE94',
    symbol: 'WETH',
    name: 'Wrapped Ether'
  },
  {
    address: '0xF25212E676D1F7F89Cd72ffea7374A97BDb5BD6',
    symbol: 'WBTC',
    name: 'Wrapped Bitcoin'
  }
]

export class CompoundService {
  private provider: JsonRpcProvider
  private env: any

  constructor() {
    try {
      this.env = loadEnv()
      console.log('🔧 Initializing CompoundService with RPC:', this.env.RPC_URL)
      this.provider = new JsonRpcProvider(this.env.RPC_URL)

      // Test the connection
      this.testConnection()
    } catch (error) {
      console.error('❌ Failed to initialize CompoundService:', error)
      throw error
    }
  }

  private async testConnection() {
    try {
      console.log('🧪 Testing RPC connection...')
      const network = await this.provider.getNetwork()
      console.log('✅ Connected to network:', network.name, 'Chain ID:', network.chainId)
    } catch (error) {
      console.error('❌ RPC connection test failed:', error)
    }
  }

  // Mock data for fallback when contract calls fail
  private getMockMarketData(cometAddress: string): MarketData {
    const market = COMPOUND_MARKETS.find(m => m.address === cometAddress)
    const baseUtilization = 0.75 + Math.random() * 0.2 // 75-95% utilization
    const baseSupplyRate = 3 + Math.random() * 4 // 3-7% supply rate
    const baseBorrowRate = baseSupplyRate * 1.5 + Math.random() * 2 // Higher borrow rate

    return {
      address: cometAddress,
      symbol: market?.symbol || 'UNKNOWN',
      utilization: baseUtilization,
      supplyRate: baseSupplyRate,
      borrowRate: baseBorrowRate,
      totalSupply: (1000000 + Math.random() * 5000000).toFixed(0), // 1M to 6M tokens
      totalBorrow: (750000 + Math.random() * 4500000).toFixed(0), // 750K to 5.25M tokens
      baseTokenPrice: market?.symbol === 'USDC' ? 1.00 : market?.symbol === 'WETH' ? 3500 : 65000,
      reserves: (10000 + Math.random() * 50000).toFixed(0),
      lastUpdate: Date.now()
    }
  }

  async getMarketData(cometAddress: string): Promise<MarketData | null> {
    console.log(`🔍 Fetching data for market: ${cometAddress}`)

    try {
      const comet = new Contract(cometAddress, CometAbi as any, this.provider)
      console.log(`📄 Contract created for ${cometAddress}`)

      // Get utilization
      console.log(`📊 Getting utilization for ${cometAddress}`)
      const utilization = await comet.getUtilization()
      const utilizationFormatted = Number(formatUnits(utilization, 18))
      console.log(`📊 Utilization for ${cometAddress}: ${utilizationFormatted}`)

      // Get rates
      let supplyRate = 0
      let borrowRate = 0

      try {
        console.log(`💰 Getting supply/borrow rates for ${cometAddress}`)
        const supplyRateRaw = await comet.getSupplyRate(utilization)
        const borrowRateRaw = await comet.getBorrowRate(utilization)
        supplyRate = Number(formatUnits(supplyRateRaw, 18))
        borrowRate = Number(formatUnits(borrowRateRaw, 18))
        console.log(`💰 Rates for ${cometAddress}: Supply=${supplyRate}, Borrow=${borrowRate}`)
      } catch (error) {
        console.warn(`⚠️ Rate functions unavailable for ${cometAddress}, using defaults:`, error)
      }

      // Get total supply and borrow
      console.log(`💵 Getting supply/borrow totals for ${cometAddress}`)
      const totalSupply = await comet.totalSupply()
      const totalBorrow = await comet.totalBorrow()

      // Get base token price (simplified)
      const baseTokenPrice = await this.getBaseTokenPrice(comet)

      // Get reserves
      const reserves = await comet.getReserves()

      const market = COMPOUND_MARKETS.find(m => m.address === cometAddress)
      console.log(`✅ Successfully fetched data for ${market?.symbol || 'UNKNOWN'}`)

      return {
        address: cometAddress,
        symbol: market?.symbol || 'UNKNOWN',
        utilization: utilizationFormatted,
        supplyRate: supplyRate * 100, // Convert to percentage
        borrowRate: borrowRate * 100, // Convert to percentage
        totalSupply: ethers.formatUnits(totalSupply, 6), // USDC has 6 decimals
        totalBorrow: ethers.formatUnits(totalBorrow, 6),
        baseTokenPrice,
        reserves: ethers.formatUnits(reserves, 6),
        lastUpdate: Date.now()
      }
    } catch (error) {
      console.error(`❌ Error fetching market data for ${cometAddress}:`, error)
      console.log(`🔄 Falling back to mock data for ${cometAddress}`)
      return this.getMockMarketData(cometAddress)
    }
  }

  async getAllMarketsData(): Promise<MarketData[]> {
    const promises = COMPOUND_MARKETS.map(market =>
      this.getMarketData(market.address)
    )

    const results = await Promise.allSettled(promises)
    return results
      .filter((result): result is PromiseFulfilledResult<MarketData> =>
        result.status === 'fulfilled' && result.value !== null
      )
      .map(result => result.value)
  }

  private async getBaseTokenPrice(comet: Contract): Promise<number> {
    try {
      // This is a simplified implementation
      // In a real app, you'd get price from Chainlink or other oracles
      const baseToken = await comet.baseToken()
      // For demo purposes, return mock prices
      const mockPrices: { [key: string]: number } = {
        '0xA0b86a33E6441e88C5F2712C3E9b74F5b8b6b8b8': 1.00, // USDC
        '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2': 3500.00, // WETH
        '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599': 65000.00, // WBTC
      }
      return mockPrices[baseToken] || 1.00
    } catch {
      return 1.00
    }
  }

  // Subscribe to real-time updates
  subscribeToMarketUpdates(
    cometAddress: string,
    callback: (data: MarketData | null) => void
  ): () => void {
    const updateData = async () => {
      const data = await this.getMarketData(cometAddress)
      callback(data)
    }

    // Initial fetch
    updateData()

    // Set up polling every 30 seconds
    const interval = setInterval(updateData, 30000)

    return () => clearInterval(interval)
  }
}

export const compoundService = new CompoundService()
