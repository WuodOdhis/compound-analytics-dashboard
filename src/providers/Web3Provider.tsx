'use client'

import { WagmiProvider, createConfig } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { type ReactNode } from 'react'
import { injected, walletConnect, coinbaseWallet } from '@wagmi/connectors'
import { mainnet, sepolia } from 'viem/chains'
import { createPublicClient, http } from 'viem'

// Create a client outside component to prevent multiple initializations
const queryClient = new QueryClient()

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'default-project-id'

// Create wagmi config outside component
const config = createConfig({
  chains: [mainnet, sepolia],
  connectors: [
    injected(),
    walletConnect({ 
      projectId,
      showQrModal: true,
    }),
    coinbaseWallet({ appName: 'Compound Analytics' })
  ],
  client: ({ chain }) =>
    createPublicClient({
      chain,
      transport: http(),
      batch: {
        multicall: true
      }
    })
})

export function Web3Provider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
}