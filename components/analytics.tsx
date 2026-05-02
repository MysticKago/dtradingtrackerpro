'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { calculateStats, formatCurrency } from '@/lib/utils'
import type { Trade } from '@/lib/types'
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Cell, PieChart, Pie 
} from 'recharts'
import { TrendingUp, TrendingDown, Activity, Target, ArrowUpRight, ArrowDownRight } from 'lucide-react'

interface AnalyticsProps {
  trades: Trade[]
}

export function Analytics({ trades }: AnalyticsProps) {
  const [timePeriod, setTimePeriod] = useState<'7d' | '30d' | '90d' | 'ytd' | 'all'>('all')

  const getFilteredTrades = () => {
    let filtered = trades
    const now = new Date()
    const cutoffDate = new Date()

    switch (timePeriod) {
      case '7d':
        cutoffDate.setDate(now.getDate() - 7)
        break
      case '30d':
        cutoffDate.setDate(now.getDate() - 30)
        break
      case '90d':
        cutoffDate.setDate(now.getDate() - 90)
        break
      case 'ytd':
        cutoffDate.setFullYear(now.getFullYear(), 0, 1)
        break
    }

    if (timePeriod !== 'all') {
      filtered = filtered.filter(t => new Date(t.date) >= cutoffDate)
    }

    return filtered
  }

  const filteredTrades = getFilteredTrades()
  const stats = calculateStats(filteredTrades)
  
  // Prepare data for charts
  const sortedTrades = [...filteredTrades].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  
  let cumulativePnL = 0
  const cumulativeData = sortedTrades.reduce((acc, trade) => {
    const date = trade.date.split('T')[0]
    cumulativePnL += trade.pnl
    
    const existingDay = acc.find(d => d.date === date)
    if (existingDay) {
      existingDay.cumulative = cumulativePnL
      existingDay.pnl += trade.pnl
    } else {
      acc.push({ date, cumulative: cumulativePnL, pnl: trade.pnl })
    }
    return acc
  }, [] as { date: string; cumulative: number; pnl: number }[])

  const winLossData = [
    { name: 'Wins', value: filteredTrades.filter(t => t.pnl > 0).length, color: '#10b981' },
    { name: 'Losses', value: filteredTrades.filter(t => t.pnl < 0).length, color: '#ef4444' },
    { name: 'Break Even', value: filteredTrades.filter(t => t.pnl === 0).length, color: '#6b7280' },
  ].filter(d => d.value > 0)

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Performance Analytics</h1>
          
        </div>
        
        <div className="flex bg-secondary/30 p-1 rounded-lg border border-white/5 overflow-x-auto max-w-full">
          {(['7d', '30d', '90d', 'ytd', 'all'] as const).map(period => (
            <button
              key={period}
              onClick={() => setTimePeriod(period)}
              className={`px-3 md:px-4 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
                timePeriod === period 
                  ? 'bg-primary text-primary-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
              }`}
            >
              {period === 'all' ? 'All Time' : period.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card p-5 border border-white/5 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Net Profit</p>
            <div className={`p-1.5 rounded-full ${stats.totalReturns >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
              {stats.totalReturns >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            </div>
          </div>
          <p className={`text-2xl font-bold ${stats.totalReturns >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {formatCurrency(stats.totalReturns)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {filteredTrades.length} total trades
          </p>
        </Card>

        <Card className="glass-card p-5 border border-white/5 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Win Rate</p>
            <div className="p-1.5 rounded-full bg-blue-500/10 text-blue-400">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-blue-400">
            {stats.winRate.toFixed(1)}%
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Profit Factor: {stats.profitFactor.toFixed(2)}
          </p>
        </Card>

        <Card className="glass-card p-5 border border-white/5 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Avg Win / Loss</p>
            <div className="p-1.5 rounded-full bg-purple-500/10 text-purple-400">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-lg font-bold text-emerald-400">{formatCurrency(stats.averageWin)}</p>
            <span className="text-xs text-muted-foreground">/</span>
            <p className="text-lg font-bold text-red-400">{formatCurrency(stats.averageLoss)}</p>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Avg R:R ratio: {(stats.averageLoss === 0 ? 0 : stats.averageWin / stats.averageLoss).toFixed(2)}
          </p>
        </Card>

        <Card className="glass-card p-5 border border-white/5 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Max Drawdown</p>
            <div className="p-1.5 rounded-full bg-orange-500/10 text-orange-400">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-orange-400">
            {formatCurrency(stats.maxDrawdown)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Peak to valley drop
          </p>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cumulative PnL Chart */}
        <Card className="glass-card p-6 border border-white/5 lg:col-span-2">
          <h3 className="text-sm font-bold mb-6 uppercase tracking-wider text-muted-foreground">Cumulative Performance</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cumulativeData}>
                <defs>
                  <linearGradient id="colorCumulative" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorCumulativeLoss" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="#525252" 
                  fontSize={11} 
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return `${date.getMonth() + 1}/${date.getDate()}`;
                  }}
                />
                <YAxis 
                  stroke="#525252" 
                  fontSize={11} 
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0a0a0a', 
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                  formatter={(value: number) => [formatCurrency(value), 'Cumulative P&L']}
                />
                <Area 
                  type="monotone" 
                  dataKey="cumulative" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  fill="url(#colorCumulative)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Win/Loss Distribution */}
        <Card className="glass-card p-6 border border-white/5">
          <h3 className="text-sm font-bold mb-6 uppercase tracking-wider text-muted-foreground">Win / Loss Ratio</h3>
          <div className="h-[300px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={winLossData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {winLossData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0a0a0a', 
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <p className="text-3xl font-bold text-foreground">{filteredTrades.length}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Trades</p>
              </div>
            </div>
          </div>
          <div className="flex justify-center gap-4 mt-4">
            {winLossData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-xs text-muted-foreground">{item.name}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Daily PnL Bar Chart */}
      <Card className="glass-card p-6 border border-white/5">
        <h3 className="text-sm font-bold mb-6 uppercase tracking-wider text-muted-foreground">Daily P&L History</h3>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={cumulativeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis 
                dataKey="date" 
                stroke="#525252" 
                fontSize={11} 
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return `${date.getMonth() + 1}/${date.getDate()}`;
                }}
              />
              <YAxis 
                stroke="#525252" 
                fontSize={11} 
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip 
                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                contentStyle={{ 
                  backgroundColor: '#0a0a0a', 
                  borderColor: 'rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: '#fff'
                }}
                formatter={(value: number) => [formatCurrency(value), 'Daily P&L']}
              />
              <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                {cumulativeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.pnl >= 0 ? '#10b981' : '#ef4444'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  )
}
