'use client'

import { useState, useEffect, useRef } from 'react'
import { Navigation } from '@/components/navigation'
import { UnifiedDashboard } from '@/components/unified-dashboard'
import { Analytics } from '@/components/analytics'
import { DataManagement } from '@/components/data-management'
import type { Trade, DerivAccount } from '@/lib/types'
import { DerivAPI, mapDerivTradeToAppTrade, parseOAuthRedirect } from '@/lib/deriv-api'

export default function Home() {
  const [trades, setTrades] = useState<Trade[]>([])
  const [view, setView] = useState<'dashboard' | 'analytics' | 'data'>('dashboard')
  const [isLoading, setIsLoading] = useState(true)
  
  // Deriv OAuth state
  const [derivAccounts, setDerivAccounts] = useState<DerivAccount[]>([])
  const [activeAccount, setActiveAccount] = useState<DerivAccount | null>(null)
  const [isDerivConnected, setIsDerivConnected] = useState(false)
  const [derivError, setDerivError] = useState<string | null>(null)
  const derivApiRef = useRef<DerivAPI | null>(null)

  useEffect(() => {
    // Load stored trades
    const stored = localStorage.getItem('trades')
    if (stored) {
      setTrades(JSON.parse(stored))
    }
    
    // Load stored manual connection
    const storedAccounts = localStorage.getItem('deriv_accounts')
    const storedActiveAccount = localStorage.getItem('deriv_active_account')
    
    if (storedAccounts && storedActiveAccount) {
      const accounts: DerivAccount[] = JSON.parse(storedAccounts)
      const active: DerivAccount = JSON.parse(storedActiveAccount)
      setDerivAccounts(accounts)
      setActiveAccount(active)
      connectToDeriv(active.token)
    }
    
    setIsLoading(false)
  }, [])

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('trades', JSON.stringify(trades))
    }
  }, [trades, isLoading])

  const connectToDeriv = (token: string) => {
    setDerivError(null)
    
    if (derivApiRef.current) {
      derivApiRef.current.disconnect()
    }

    const api = new DerivAPI(token, {
      onOpen: () => {
        setIsDerivConnected(true)
      },
      onMessage: (data) => {
        if (data.msg_type === 'profit_table') {
          if (data.profit_table && data.profit_table.transactions) {
            const newTrades = data.profit_table.transactions.map(mapDerivTradeToAppTrade)
            setTrades(prev => {
              const existingIds = new Set(prev.map(t => t.id))
              const uniqueNewTrades = newTrades.filter((t: Trade) => !existingIds.has(t.id))
              return [...prev, ...uniqueNewTrades]
            })
          }
        }
        if (data.error) {
          setDerivError(data.error.message)
          setIsDerivConnected(false)
        }
      },
      onError: (error) => {
        setDerivError('Connection error occurred')
        setIsDerivConnected(false)
      },
      onClose: () => {
        setIsDerivConnected(false)
      }
    })

    api.connect()
    derivApiRef.current = api
  }

  const handleManualTokenConnect = (token: string) => {
    // Generate a placeholder account structure for the token
    const newAccount: DerivAccount = {
      account: 'API Token',
      token: token,
      currency: 'USD'
    }
    
    setDerivAccounts([newAccount])
    setActiveAccount(newAccount)
    localStorage.setItem('deriv_accounts', JSON.stringify([newAccount]))
    localStorage.setItem('deriv_active_account', JSON.stringify(newAccount))
    connectToDeriv(token)
  }

  const selectDerivAccount = (account: DerivAccount) => {
    setActiveAccount(account)
    localStorage.setItem('deriv_active_account', JSON.stringify(account))
    connectToDeriv(account.token)
  }

  const disconnectDeriv = () => {
    if (derivApiRef.current) {
      derivApiRef.current.disconnect()
      derivApiRef.current = null
    }
    setIsDerivConnected(false)
    setDerivAccounts([])
    setActiveAccount(null)
    localStorage.removeItem('deriv_accounts')
    localStorage.removeItem('deriv_active_account')
  }

  const clearAllTrades = () => {
    setTrades([])
  }

  const importTrades = (newTrades: Trade[]) => {
    setTrades(newTrades)
  }

  const addManualTrade = (trade: Omit<Trade, 'id' | 'source'>) => {
    const newTrade: Trade = {
      ...trade,
      id: `manual-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      source: 'manual'
    }
    setTrades(prev => [...prev, newTrade])
  }

  const deleteTrade = (id: string) => {
    setTrades(prev => prev.filter(t => t.id !== id))
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation currentView={view} onViewChange={setView} />
      {view === 'dashboard' && (
        <UnifiedDashboard 
          trades={trades}
          onAddTrade={addManualTrade}
          onDeleteTrade={deleteTrade}
        />
      )}
      {view === 'analytics' && (
        <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
          <Analytics trades={trades} />
        </main>
      )}
      {view === 'data' && (
        <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
          <DataManagement 
            trades={trades} 
            onClear={clearAllTrades} 
            onImport={importTrades}
            isDerivConnected={isDerivConnected}
            derivAccounts={derivAccounts}
            activeDerivAccount={activeAccount}
            onSelectDerivAccount={selectDerivAccount}
            onDerivDisconnect={disconnectDeriv}
            derivError={derivError}
            onManualConnect={handleManualTokenConnect}
          />
        </main>
      )}
    </div>
  )
}
