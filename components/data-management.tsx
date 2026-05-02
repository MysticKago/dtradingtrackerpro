'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, Upload, Trash2, Database, FileJson, AlertTriangle, CheckCircle2 } from 'lucide-react'
import type { Trade, DerivAccount } from '@/lib/types'
import { DerivConnection } from './deriv-connection'

interface DataManagementProps {
  trades: Trade[]
  onClear: () => void
  onImport: (trades: Trade[]) => void
  isDerivConnected: boolean
  derivAccounts: DerivAccount[]
  activeDerivAccount: DerivAccount | null
  onSelectDerivAccount: (account: DerivAccount) => void
  onDerivDisconnect: () => void
  derivError: string | null
}

export function DataManagement({ 
  trades, 
  onClear, 
  onImport,
  isDerivConnected,
  derivAccounts,
  activeDerivAccount,
  onSelectDerivAccount,
  onDerivDisconnect,
  derivError
}: DataManagementProps) {
  const [importError, setImportError] = useState<string | null>(null)
  const [importSuccess, setImportSuccess] = useState<string | null>(null)

  const handleExport = () => {
    const dataStr = JSON.stringify(trades, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `trade-tracker-export-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        setImportError(null)
        setImportSuccess(null)
        const content = event.target?.result as string
        const imported = JSON.parse(content) as Trade[]
        
        if (!Array.isArray(imported)) {
          throw new Error('Invalid format: expected an array of trades')
        }

        onImport(imported)
        setImportSuccess(`Successfully imported ${imported.length} trades`)
      } catch (error) {
        setImportError(error instanceof Error ? error.message : 'Failed to import data')
      }
    }
    reader.readAsText(file)
  }

  const handleClear = () => {
    if (window.confirm('Are you sure you want to delete all trades? This cannot be undone.')) {
      onClear()
    }
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-10">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Data Management</h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1">Control your trading data and connections</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary/30 px-3 py-1 rounded-full border border-white/5">
          <Database className="w-3 h-3" />
          Local Storage Active
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Stats */}
        <Card className="glass-card p-6 border border-white/5 lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400">
              <FileJson className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Records</p>
              <p className="text-2xl font-bold">{trades.length}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 border-l-0 border-t md:border-t-0 md:border-l border-white/5 pt-4 md:pt-0 md:pl-6">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Last Sync</p>
              <p className="text-lg font-semibold">Just now</p>
            </div>
          </div>

          <div className="flex items-center gap-4 border-l-0 border-t md:border-t-0 md:border-l border-white/5 pt-4 md:pt-0 md:pl-6">
            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Data Source</p>
              <p className="text-lg font-semibold">{isDerivConnected ? 'Deriv API' : 'Manual Entry'}</p>
            </div>
          </div>
        </Card>

        {/* Deriv Connection */}
        <div className="lg:col-span-2">
          <DerivConnection 
            isConnected={isDerivConnected}
            accounts={derivAccounts}
            activeAccount={activeDerivAccount}
            onSelectAccount={onSelectDerivAccount}
            onDisconnect={onDerivDisconnect}
            connectionError={derivError}
          />
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <Card className="glass-card p-5 border border-white/5 hover:border-white/10 transition-colors">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 mt-1">
                <Download className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-sm">Export Data</h3>
                <p className="text-xs text-muted-foreground mt-1 mb-3">Save a JSON backup of your trades</p>
                <Button onClick={handleExport} variant="outline" size="sm" className="w-full text-xs h-8">
                  Download JSON
                </Button>
              </div>
            </div>
          </Card>

          <Card className="glass-card p-5 border border-white/5 hover:border-white/10 transition-colors">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 mt-1">
                <Upload className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-sm">Import Data</h3>
                <p className="text-xs text-muted-foreground mt-1 mb-3">Restore from a backup file</p>
                <label className="block w-full">
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImport}
                    className="hidden"
                  />
                  <div className="flex items-center justify-center w-full h-8 px-3 py-1 text-xs font-medium transition-colors border rounded-md cursor-pointer hover:bg-accent hover:text-accent-foreground border-input bg-background shadow-sm">
                    Select File
                  </div>
                </label>
                {importError && (
                  <div className="flex items-center gap-1 mt-2 text-xs text-red-400">
                    <AlertTriangle className="w-3 h-3" />
                    {importError}
                  </div>
                )}
                {importSuccess && (
                  <div className="flex items-center gap-1 mt-2 text-xs text-emerald-400">
                    <CheckCircle2 className="w-3 h-3" />
                    {importSuccess}
                  </div>
                )}
              </div>
            </div>
          </Card>

          <Card className="glass-card p-5 border border-red-500/20 hover:border-red-500/40 transition-colors bg-red-500/5">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-red-500/10 text-red-400 mt-1">
                <Trash2 className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-sm text-red-400">Danger Zone</h3>
                <p className="text-xs text-red-400/70 mt-1 mb-3">Permanently delete all data</p>
                <Button 
                  onClick={handleClear}
                  variant="destructive" 
                  size="sm" 
                  className="w-full text-xs h-8 bg-red-500/80 hover:bg-red-600"
                >
                  Clear All Data
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
