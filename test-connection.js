// Quick test script to verify RPC connection and Compound contract interaction
const { JsonRpcProvider, Contract } = require('ethers')
const CometAbi = require('./src/abi/Comet.json')

async function testConnection() {
  console.log('🧪 Testing RPC connection and Compound contract...')

  try {
    // Test RPC connection
    const provider = new JsonRpcProvider('https://cloudflare-eth.com')
    console.log('🔗 Connecting to RPC...')

    const network = await provider.getNetwork()
    console.log('✅ Connected to network:', network.name, 'Chain ID:', network.chainId)

    // Test Compound contract (USDC market)
    const cometAddress = '0xc3d688B66703497DAA19211EEdff47f25384cdc3'
    console.log('📄 Testing Compound USDC contract at:', cometAddress)

    const comet = new Contract(cometAddress, CometAbi, provider)

    // Test basic contract call
    console.log('📊 Testing utilization call...')
    const utilization = await comet.getUtilization()
    console.log('✅ Utilization:', utilization.toString())

    console.log('💰 Testing supply rate call...')
    const supplyRate = await comet.getSupplyRate(utilization)
    console.log('✅ Supply Rate:', supplyRate.toString())

    console.log('🎉 All tests passed! RPC and Compound contract are working.')

  } catch (error) {
    console.error('❌ Test failed:', error.message)
    console.error('Full error:', error)
  }
}

testConnection()
