'use client'

import { useState } from 'react'
import { useAccount, useConnect, useDisconnect } from 'wagmi'

export default function ConnectWallet() {
  const { address, isConnected } = useAccount()
  const { connect, connectors, isPending, error } = useConnect()
  const { disconnect } = useDisconnect()
  const [isOpen, setIsOpen] = useState(false)

  if (!isConnected) {
    const injectedConnector = connectors.find(c => c.id === 'injected')
    const wcConnector = connectors.find(c => c.id.includes('walletConnect'))
    const cbConnector = connectors.find(c => c.id.includes('coinbase'))

    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(prev => !prev)}
          className="px-3 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium"
        >
          {isPending ? 'Connecting...' : 'Connect Wallet'}
        </button>
        {isOpen && (
          <div className="absolute right-0 mt-2 w-56 bg-slate-800 border border-slate-700 rounded-lg shadow-lg p-2 space-y-1 z-[9999]">
            {injectedConnector && (
              <button
                onClick={() => { connect({ connector: injectedConnector }); setIsOpen(false) }}
                className="w-full text-left px-3 py-2 text-sm text-slate-200 hover:bg-slate-700 rounded"
              >
                Browser Wallet
              </button>
            )}
            {wcConnector && (
              <button
                onClick={() => { connect({ connector: wcConnector }); setIsOpen(false) }}
                className="w-full text-left px-3 py-2 text-sm text-slate-200 hover:bg-slate-700 rounded"
              >
                WalletConnect
              </button>
            )}
            {cbConnector && (
              <button
                onClick={() => { connect({ connector: cbConnector }); setIsOpen(false) }}
                className="w-full text-left px-3 py-2 text-sm text-slate-200 hover:bg-slate-700 rounded"
              >
                Coinbase Wallet
              </button>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 text-sm font-medium"
      >
        {address?.slice(0, 6)}...{address?.slice(-4)}
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-lg">
          <button
            onClick={() => { setIsOpen(false); disconnect() }}
            className="w-full text-left px-3 py-2 text-sm text-slate-200 hover:bg-slate-700 rounded-lg"
          >
            Disconnect
          </button>
        </div>
      )}
    </div>
  )
}


