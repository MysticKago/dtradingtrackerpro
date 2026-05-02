'use client'

import { Card } from '@/components/ui/card'
import { calculateStats, formatCurrency } from '@/lib/utils'
import { TrendingUp, TrendingDown, Target, Zap } from 'lucide-react'
import type { Trade } from '@/lib/types'
import { PerformanceChart } from './performance-chart'

interface DashboardProps {
  trades: Trade[]
}

export function Dashboard({ trades }: DashboardProps) {
  const stats = calculateStats(trades)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-2">Your trading performance overview</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6 border border-border">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-muted-foreground text-sm mb-1">Total Returns</p>
              <p className={`text-3xl font-bold ${stats.totalReturns >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                {formatCurrency(stats.totalReturns)}
              </p>
              <p className="text-xs text-muted-foreground mt-2">All time</p>
            </div>
            <div className={`p-2 rounded ${stats.totalReturns >= 0 ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
              {stats.totalReturns >= 0 ? (
                <TrendingUp className="w-5 h-5 text-emerald-500" />
              ) : (
                <TrendingDown className="w-5 h-5 text-red-500" />
              )}
            </div>
          </div>
        </Card>

        <Card className="p-6 border border-border">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-muted-foreground text-sm mb-1">Total Trades</p>
              <p className="text-3xl font-bold">{stats.totalTrades}</p>
              <p className="text-xs text-muted-foreground mt-2">Recorded trades</p>
            </div>
            <div className="p-2 rounded bg-primary/10">
              <Target className="w-5 h-5 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="p-6 border border-border">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-muted-foreground text-sm mb-1">Avg P&L Per Trade</p>
              <p className={`text-3xl font-bold ${stats.averagePnl >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                {formatCurrency(stats.averagePnl)}
              </p>
              <p className="text-xs text-muted-foreground mt-2">Average</p>
            </div>
            <div className={`p-2 rounded ${stats.averagePnl >= 0 ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
              <Zap className="w-5 h-5 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="p-6 border border-border">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-muted-foreground text-sm mb-1">Win Rate</p>
              <p className="text-3xl font-bold">{stats.winRate.toFixed(1)}%</p>
              <p className="text-xs text-muted-foreground mt-2">Winning trades</p>
            </div>
            <div className="p-2 rounded bg-primary/10">
              <Target className="w-5 h-5 text-primary" />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="p-6 border border-border">
          <p className="text-muted-foreground text-sm mb-2">Best Day</p>
          {stats.bestDay ? (
            <div>
              <p className="text-2xl font-bold text-emerald-500">{formatCurrency(stats.bestDay.amount)}</p>
              <p className="text-xs text-muted-foreground mt-1">{stats.bestDay.date}</p>
            </div>
          ) : (
            <p className="text-muted-foreground">No trades yet</p>
          )}
        </Card>

        <Card className="p-6 border border-border">
          <p className="text-muted-foreground text-sm mb-2">Worst Day</p>
          {stats.worstDay ? (
            <div>
              <p className="text-2xl font-bold text-red-500">{formatCurrency(stats.worstDay.amount)}</p>
              <p className="text-xs text-muted-foreground mt-1">{stats.worstDay.date}</p>
            </div>
          ) : (
            <p className="text-muted-foreground">No trades yet</p>
          )}
        </Card>

        <Card className="p-6 border border-border">
          <p className="text-muted-foreground text-sm mb-2">Equity Balance</p>
          <p className={`text-2xl font-bold ${stats.totalReturns >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
            {formatCurrency(stats.totalReturns)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Starting balance + P&L</p>
        </Card>
      </div>

      <PerformanceChart trades={trades} />
    </div>
  )
}
