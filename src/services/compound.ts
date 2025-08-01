import { ethers } from 'ethers'
import { MarketData } from '../types/market'

const COMPOUND_MARKETS = {
  USDC: '0xc3d688B66703497DAA19211EEdff47f25384cdc3',
  WETH: '0xA17581A9E3356d9A858b789D68B4d866e593aE94',
  WBTC: '0x9994E35Db50125E0DF82e4c2dde62496CE330999',
}

export class CompoundService {
  private provider: ethers.Provider
  private mockMode: boolean = false
  private requestTimeoutMs: number = 3000

  constructor() {
    const rpcUrl = process.env.RPC_URL || 'https://cloudflare-eth.com'
    this.provider = new ethers.JsonRpcProvider(rpcUrl)
    this.mockMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'
    this.testConnection()
  }

  private async testConnection() {
    try {
      await this.provider.getNetwork()
      console.log('✅ Connected to network:', await this.provider.getNetwork())
    } catch (error) {
      console.warn('⚠️ Failed to connect to network, falling back to mock mode')
      this.mockMode = true
    }
  }

  private getMockMarketData(): MarketData[] {
    return Object.entries(COMPOUND_MARKETS).map(([symbol, address]) => ({
      symbol,
      address,
      utilization: Math.random() * 0.8 + 0.1, // 10-90%
      supplyApy: Math.random() * 0.1, // 0-10%
      borrowApy: Math.random() * 0.15 + 0.05, // 5-20%
      totalSupply: ethers.parseUnits('1000000', 6).toString(),
      totalBorrow: ethers.parseUnits('600000', 6).toString(),
      reserves: ethers.parseUnits('50000', 6).toString(),
      price: ethers.parseUnits('1', 8).toString(),
    }))
  }

  async getAllMarketsData(): Promise<MarketData[]> {
    if (this.mockMode) {
      return this.getMockMarketData()
    }

    try {
      const withTimeout = <T>(promise: Promise<T>): Promise<T> => {
        return new Promise<T>((resolve, reject) => {
          const timeout = setTimeout(() => reject(new Error('Request timed out')), this.requestTimeoutMs)
          promise
            .then((value) => { clearTimeout(timeout); resolve(value) })
            .catch((err) => { clearTimeout(timeout); reject(err) })
        })
      }

      const marketPromises = Object.entries(COMPOUND_MARKETS).map(async ([symbol, address]) => {
        const contract = new ethers.Contract(
          address,
          ['function getUtilization() view returns (uint256)',
           'function getBorrowRate(uint256) view returns (uint256)',
           'function getSupplyRate(uint256) view returns (uint256)',
           'function totalSupply() view returns (uint256)',
           'function totalBorrow() view returns (uint256)',
           'function getReserves() view returns (uint256)',
           'function getPrice(address) view returns (uint256)'],
          this.provider
        )

        const [
          utilization,
          totalSupply,
          totalBorrow,
          reserves,
          price
        ] = await Promise.all([
          withTimeout(contract.getUtilization()),
          withTimeout(contract.totalSupply()),
          withTimeout(contract.totalBorrow()),
          withTimeout(contract.getReserves()),
          withTimeout(contract.getPrice(address))
        ])

        const borrowRate = await withTimeout(contract.getBorrowRate(utilization))
        const supplyRate = await withTimeout(contract.getSupplyRate(utilization))

        return {
          symbol,
          address,
          utilization: Number(utilization) / 1e18,
          supplyApy: Number(supplyRate) / 1e18,
          borrowApy: Number(borrowRate) / 1e18,
          totalSupply: totalSupply.toString(),
          totalBorrow: totalBorrow.toString(),
          reserves: reserves.toString(),
          price: price.toString()
        }
      })

      return await Promise.all(marketPromises)
    } catch (error) {
      console.error('Failed to fetch market data:', error)
      return this.getMockMarketData()
    }
  }
}