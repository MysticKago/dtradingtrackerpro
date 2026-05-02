'use client'

import { Trash2, Edit2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import type { Trade } from '@/lib/types'

interface TradeListProps {
  trades: Trade[]
  onAdd: (date: string) => void
  onDelete: (id: string) => void
  onUpdate: (id: string, trade: Trade) => void
  onSelect?: (trade: Trade) => void
}

export function TradeList({ trades, onDelete, onSelect }: TradeListProps) {
  const sorted = [...trades].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  if (trades.length === 0) {
    return (
      <Card className="p-6 border border-border">
        <p className="text-muted-foreground text-center">No trades recorded yet</p>
      </Card>
    )
  }

  return (
    <Card className="p-6 border border-border">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 font-semibold">Date</th>
              <th className="text-left py-3 px-4 font-semibold">Asset</th>
              <th className="text-right py-3 px-4 font-semibold">P&L</th>
              <th className="text-left py-3 px-4 font-semibold">Notes</th>
              <th className="text-right py-3 px-4 font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map(trade => (
              <tr 
                key={trade.id} 
                className={`border-b border-border hover:bg-secondary/50 transition-colors ${onSelect ? 'cursor-pointer' : ''}`}
                onClick={() => onSelect?.(trade)}
              >
                <td className="py-3 px-4">{trade.date}</td>
                <td className="py-3 px-4 font-semibold">{trade.asset}</td>
                <td className={`py-3 px-4 text-right font-semibold ${trade.pnl > 0 ? 'text-emerald-500' : trade.pnl < 0 ? 'text-red-500' : ''}`}>
                  {formatCurrency(trade.pnl)}
                </td>
                <td className="py-3 px-4 text-muted-foreground text-xs">{trade.notes || '-'}</td>
                <td className="py-3 px-4 text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(trade.id)}
                    className="text-red-500 hover:text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
