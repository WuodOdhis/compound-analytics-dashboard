/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      encoding: false,
      'pino-pretty': require.resolve('pino-pretty'),
      bufferutil: false,
      'utf-8-validate': false,
    }
    return config
  },
  env: {
    RPC_URL: process.env.RPC_URL,
    COMET_ADDRESS: process.env.COMET_ADDRESS,
    COMET_REWARDS_ADDRESS: process.env.COMET_REWARDS_ADDRESS,
  },
}

module.exports = nextConfig