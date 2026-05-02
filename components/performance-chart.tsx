'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Card } from '@/components/ui/card'
import { getCumulativeData, formatCurrency } from '@/lib/utils'
import type { Trade } from '@/lib/types'

interface PerformanceChartProps {
  trades: Trade[]
}

export function PerformanceChart({ trades }: PerformanceChartProps) {
  const data = getCumulativeData(trades)

  if (data.length === 0) {
    return (
      <Card className="p-6 border border-border">
        <p className="text-muted-foreground text-center py-8">Add trades to see performance chart</p>
      </Card>
    )
  }

  return (
    <Card className="p-6 border border-border">
      <h3 className="text-lg font-semibold mb-4">Cumulative Performance</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.2 0 0)" />
          <XAxis 
            dataKey="date" 
            stroke="oklch(0.65 0 0)"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="oklch(0.65 0 0)"
            style={{ fontSize: '12px' }}
            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip
            formatter={(value) => formatCurrency(value as number)}
            contentStyle={{
              backgroundColor: 'oklch(0.12 0 0)',
              border: '1px solid oklch(0.2 0 0)',
              borderRadius: '6px',
              color: 'oklch(0.95 0 0)',
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="cumulative"
            stroke="oklch(0.65 0.2 142)"
            strokeWidth={2}
            dot={false}
            name="Cumulative P&L"
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  )
}
