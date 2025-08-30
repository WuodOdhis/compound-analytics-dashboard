'use client'

import { ReactNode, useMemo } from 'react'
import { WagmiConfig, createConfig } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'
import { http } from 'viem'
import { coinbaseWallet, injected, walletConnect } from '@wagmi/connectors'

export function Web3Provider({ children }: { children: ReactNode }) {
  const rpcUrl = process.env.RPC_URL || 'https://cloudflare-eth.com'

  const config = useMemo(() => {
    const transports: Record<number, ReturnType<typeof http>> = {
      [mainnet.id]: http(rpcUrl),
      [sepolia.id]: http('https://rpc.sepolia.org'),
    }

    return createConfig({
      chains: [mainnet, sepolia],
      transports,
      connectors: [
        injected({ shimDisconnect: true }),
        walletConnect({ projectId: 'demo', showQrModal: true }),
        coinbaseWallet({ appName: 'Compound Analytics' }),
      ],
      multiInjectedProviderDiscovery: true,
      ssr: true,
    })
  }, [rpcUrl])

  return <WagmiConfig config={config}>{children}</WagmiConfig>
}


