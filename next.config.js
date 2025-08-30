/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    RPC_URL: process.env.RPC_URL,
    COMET_ADDRESS: process.env.COMET_ADDRESS,
    COMET_REWARDS_ADDRESS: process.env.COMET_REWARDS_ADDRESS,
  },
}

module.exports = nextConfig
