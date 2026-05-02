'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, CheckCircle2, XCircle, LogIn, ChevronDown } from 'lucide-react'
import type { DerivAccount } from '@/lib/types'

interface DerivConnectionProps {
  isConnected: boolean
  accounts: DerivAccount[]
  activeAccount: DerivAccount | null
  onSelectAccount: (account: DerivAccount) => void
  onDisconnect: () => void
  connectionError: string | null
  onManualConnect: (token: string) => void
}

export function DerivConnection({ 
  isConnected, 
  accounts, 
  activeAccount, 
  onSelectAccount, 
  onDisconnect, 
  connectionError,
  onManualConnect
}: DerivConnectionProps) {
  const [showAccountPicker, setShowAccountPicker] = useState(false)
  const [tokenInput, setTokenInput] = useState('')

  const handleConnect = () => {
    if (tokenInput.trim()) {
      onManualConnect(tokenInput.trim())
      setTokenInput('')
    }
  }

  const hasAccounts = accounts.length > 0

  return (
    <Card className="p-6 border border-border bg-secondary/10">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
            <span className="text-red-500 font-bold text-xl">D</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Deriv Integration</h3>
            <p className="text-sm text-muted-foreground">Connect your trading account</p>
          </div>
        </div>
        <Badge variant={isConnected ? "default" : "outline"} className={isConnected ? "bg-emerald-500/20 text-emerald-500 border-emerald-500/50" : ""}>
          {isConnected ? (
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Connected
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <XCircle className="w-3 h-3" /> Disconnected
            </span>
          )}
        </Badge>
      </div>

      {!hasAccounts ? (
        /* No accounts — show manual token input */
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Personal API Token</label>
            <div className="flex gap-2">
              <input
                type="password"
                placeholder="e.g. a1-..."
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
              <Button onClick={handleConnect} disabled={!tokenInput.trim()}>
                Connect
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Generate a token with <b>Read</b> and <b>Trade</b> scopes in your Deriv Account Settings (Security & Limits).
            </p>
          </div>

          {connectionError && (
            <div className="p-3 rounded bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
              {connectionError}
            </div>
          )}
        </div>
      ) : (
        /* Accounts available — show account picker and status */
        <div className="space-y-4">
          {/* Account Selector */}
          {accounts.length > 1 && (
            <div className="relative">
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block uppercase tracking-wider">
                Select Account
              </label>
              <button
                onClick={() => setShowAccountPicker(!showAccountPicker)}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg border border-white/10 bg-background hover:border-white/20 transition-colors text-sm"
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium">{activeAccount?.account}</span>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                    {activeAccount?.currency}
                  </Badge>
                  {activeAccount?.account.startsWith('VR') && (
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-yellow-500/50 text-yellow-500">
                      Demo
                    </Badge>
                  )}
                  {activeAccount?.account.startsWith('CR') && (
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-emerald-500/50 text-emerald-500">
                      Real
                    </Badge>
                  )}
                </div>
                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${showAccountPicker ? 'rotate-180' : ''}`} />
              </button>

              {showAccountPicker && (
                <div className="absolute top-full left-0 right-0 mt-1 border border-white/10 bg-background rounded-lg shadow-xl z-10 overflow-hidden">
                  {accounts.map((acc) => (
                    <button
                      key={acc.account}
                      onClick={() => {
                        onSelectAccount(acc)
                        setShowAccountPicker(false)
                      }}
                      className={`w-full flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-white/5 transition-colors text-left ${
                        activeAccount?.account === acc.account ? 'bg-white/5' : ''
                      }`}
                    >
                      <span className="font-medium">{acc.account}</span>
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                        {acc.currency}
                      </Badge>
                      {acc.account.startsWith('VR') && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-yellow-500/50 text-yellow-500">
                          Demo
                        </Badge>
                      )}
                      {acc.account.startsWith('CR') && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-emerald-500/50 text-emerald-500">
                          Real
                        </Badge>
                      )}
                      {activeAccount?.account === acc.account && (
                        <CheckCircle2 className="w-3 h-3 text-emerald-400 ml-auto" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Single account display */}
          {accounts.length === 1 && activeAccount && (
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-white/10 bg-background text-sm">
              <span className="font-medium">{activeAccount.account}</span>
              <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                {activeAccount.currency}
              </Badge>
              {activeAccount.account.startsWith('VR') && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-yellow-500/50 text-yellow-500">
                  Demo
                </Badge>
              )}
              {activeAccount.account.startsWith('CR') && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-emerald-500/50 text-emerald-500">
                  Real
                </Badge>
              )}
            </div>
          )}

          {/* Connection status */}
          {isConnected ? (
            <div className="p-4 rounded bg-emerald-500/5 border border-emerald-500/10">
              <p className="text-sm text-emerald-500">
                Successfully connected to Deriv. Your trades are being synced automatically.
              </p>
            </div>
          ) : (
            <div className="p-4 rounded bg-yellow-500/5 border border-yellow-500/10">
              <p className="text-sm text-yellow-500 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Connecting to Deriv...
              </p>
            </div>
          )}

          {connectionError && (
            <div className="p-3 rounded bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
              {connectionError}
            </div>
          )}

          <Button variant="destructive" onClick={onDisconnect} className="w-full">
            Disconnect & Logout
          </Button>
        </div>
      )}
    </Card>
  )
}
