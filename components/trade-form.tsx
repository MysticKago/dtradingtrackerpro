'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import type { Trade } from '@/lib/types'

interface TradeFormProps {
  initialDate?: string | null
  onSubmit: (trade: Omit<Trade, 'id'>) => void
  onClose: () => void
}

export function TradeForm({ initialDate, onSubmit, onClose }: TradeFormProps) {
  const [date, setDate] = useState(initialDate || new Date().toISOString().split('T')[0])
  const [asset, setAsset] = useState('')
  const [pnl, setPnl] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!asset.trim()) {
      setError('Asset is required')
      return
    }
    if (!pnl || isNaN(Number(pnl))) {
      setError('Valid P&L amount is required')
      return
    }

    onSubmit({
      date,
      asset: asset.toUpperCase(),
      pnl: Number(pnl),
      notes: notes || undefined,
    })

    setAsset('')
    setPnl('')
    setNotes('')
    onClose()
  }

  return (
    <Card className="p-6 border border-border fixed inset-0 m-auto w-96 max-h-96 z-50">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Add Trade</h2>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full mt-1 px-3 py-2 bg-secondary border border-border rounded text-foreground"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Asset</label>
          <input
            type="text"
            value={asset}
            onChange={(e) => setAsset(e.target.value)}
            placeholder="e.g., AAPL, BTC"
            className="w-full mt-1 px-3 py-2 bg-secondary border border-border rounded text-foreground"
          />
        </div>

        <div>
          <label className="text-sm font-medium">P&L Amount ($)</label>
          <input
            type="number"
            value={pnl}
            onChange={(e) => setPnl(e.target.value)}
            placeholder="0.00"
            step="0.01"
            className="w-full mt-1 px-3 py-2 bg-secondary border border-border rounded text-foreground"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Notes (Optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any notes about this trade..."
            className="w-full mt-1 px-3 py-2 bg-secondary border border-border rounded text-foreground h-20"
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <div className="flex gap-2 pt-4">
          <Button type="submit" className="flex-1">
            Add Trade
          </Button>
          <Button type="button" variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  )
}
