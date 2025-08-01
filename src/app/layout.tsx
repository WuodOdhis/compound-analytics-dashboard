import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '../providers/ThemeProvider'
import { QueryProvider } from '../providers/QueryProvider'
import { SettingsProvider } from '../providers/SettingsProvider'
import { Web3Provider } from '../providers/Web3Provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Compound Analytics Dashboard',
  description: 'Real-time Compound v3 market analytics and portfolio tracking',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Web3Provider>
          <ThemeProvider>
            <SettingsProvider>
              <QueryProvider>
                {children}
              </QueryProvider>
            </SettingsProvider>
          </ThemeProvider>
        </Web3Provider>
      </body>
    </html>
  )
}
