'use client'

import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot, ReferenceLine } from 'recharts'
import { Loader2, TrendingUp, TrendingDown, Clock, DollarSign } from 'lucide-react'
import type { Trade } from '@/lib/types'
import { DerivAPI } from '@/lib/deriv-api'
import { format } from 'date-fns'

interface TradeChartModalProps {
  trade: Trade | null
  isOpen: boolean
  onClose: () => void
  derivToken?: string
}

export function TradeChartModal({ trade, isOpen, onClose, derivToken }: TradeChartModalProps) {
  const [candles, setCandles] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen || !trade || !trade.rawSymbol || !trade.entryTime || !trade.exitTime || !derivToken) {
      return
    }

    setLoading(true)
    setError(null)
    setCandles([])

    const api = new DerivAPI(derivToken, {
      onMessage: (data) => {
        if (data.msg_type === 'candles') {
          setCandles(data.candles.map((c: any) => ({
            time: c.epoch,
            price: c.close,
            high: c.high,
            low: c.low,
            open: c.open,
            date: new Date(c.epoch * 1000).toLocaleTimeString(),
            fullDate: new Date(c.epoch * 1000)
          })))
          setLoading(false)
          api.disconnect()
        } else if (data.error) {
          setError(data.error.message)
          setLoading(false)
        }
      },
      onError: () => {
        setError('Failed to connect to Deriv API')
        setLoading(false)
      }
    })

    api.connect()
    
    setTimeout(() => {
      if (trade.rawSymbol && trade.entryTime && trade.exitTime) {
        const duration = trade.exitTime - trade.entryTime
        const buffer = Math.max(60, Math.floor(duration * 0.2)) // 20% buffer or at least 1 min
        api.fetchCandles(
          trade.rawSymbol, 
          trade.entryTime - buffer, 
          trade.exitTime + buffer
        )
      }
    }, 1000)

    return () => {
      api.disconnect()
    }
  }, [isOpen, trade, derivToken])

  if (!trade) return null

  const prices = candles.map(c => c.price)
  const minPrice = Math.min(...prices, trade.entryPrice || Infinity, trade.exitPrice || Infinity)
  const maxPrice = Math.max(...prices, trade.entryPrice || -Infinity, trade.exitPrice || -Infinity)
  const priceRange = maxPrice - minPrice
  const yDomain = [minPrice - (priceRange * 0.1), maxPrice + (priceRange * 0.1)]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] bg-background/95 backdrop-blur-xl border-white/10 p-0 overflow-hidden gap-0">
        <div className="p-6 border-b border-white/10 bg-white/5">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${trade.pnl >= 0 ? 'bg-emerald-500/20 text-emerald-500' : 'bg-red-500/20 text-red-500'}`}>
                  {trade.pnl >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                </div>
                <div>
                  <div className="text-lg font-bold">{trade.asset}</div>
                  <div className="text-xs text-muted-foreground font-mono">{trade.rawSymbol}</div>
                </div>
              </div>
              <div className={`text-2xl font-bold ${trade.pnl >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                {trade.pnl >= 0 ? '+' : ''}{trade.pnl.toFixed(2)}
              </div>
            </DialogTitle>
          </DialogHeader>
        </div>

        <div className="h-[500px] w-full relative bg-black/20">
          {loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/50 z-10 backdrop-blur-sm">
              <Loader2 className="w-10 h-10 animate-spin text-primary mb-2" />
              <div className="text-sm text-muted-foreground">Loading chart data...</div>
            </div>
          )}
          
          {error ? (
            <div className="flex items-center justify-center h-full text-red-500 bg-red-500/5">
              {error}
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={candles} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis 
                  dataKey="time" 
                  stroke="rgba(255,255,255,0.3)"
                  fontSize={11}
                  tickFormatter={(time) => format(new Date(time * 1000), 'HH:mm:ss')}
                  minTickGap={50}
                />
                <YAxis 
                  domain={yDomain}
                  stroke="rgba(255,255,255,0.3)"
                  fontSize={11}
                  tickFormatter={(val) => val.toFixed(2)}
                  width={60}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(20, 20, 25, 0.9)', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
                  }}
                  labelFormatter={(time) => format(new Date(time * 1000), 'MMM d, HH:mm:ss')}
                  formatter={(value: number) => [value.toFixed(4), 'Price']}
                />
                <Area 
                  type="monotone" 
                  dataKey="price" 
                  stroke="#3b82f6" 
                  fillOpacity={1} 
                  fill="url(#colorPrice)" 
                  strokeWidth={2}
                />
                
                {/* Entry Point */}
                {trade.entryTime && trade.entryPrice && (
                  <>
                    <ReferenceDot
                      x={candles.reduce((prev, curr) => 
                        Math.abs(curr.time - trade.entryTime!) < Math.abs(prev.time - trade.entryTime!) ? curr : prev
                      , candles[0])?.time}
                      y={trade.entryPrice}
                      r={6}
                      fill="#10b981"
                      stroke="#fff"
                      strokeWidth={2}
                    />
                    <ReferenceLine y={trade.entryPrice} stroke="#10b981" strokeDasharray="3 3" opacity={0.5} />
                  </>
                )}

                {/* Exit Point */}
                {trade.exitTime && trade.exitPrice && (
                  <>
                    <ReferenceDot
                      x={candles.reduce((prev, curr) => 
                        Math.abs(curr.time - trade.exitTime!) < Math.abs(prev.time - trade.exitTime!) ? curr : prev
                      , candles[0])?.time}
                      y={trade.exitPrice}
                      r={6}
                      fill="#ef4444"
                      stroke="#fff"
                      strokeWidth={2}
                    />
                    <ReferenceLine y={trade.exitPrice} stroke="#ef4444" strokeDasharray="3 3" opacity={0.5} />
                  </>
                )}
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
        
        <div className="grid grid-cols-2 divide-x divide-white/10 border-t border-white/10 bg-white/5">
          <div className="p-4 flex items-center justify-between group hover:bg-white/5 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-emerald-500/10 text-emerald-500">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Entry</div>
                <div className="font-mono font-bold text-lg">{trade.entryPrice?.toFixed(4)}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 text-xs text-muted-foreground justify-end">
                <Clock className="w-3 h-3" /> Time
              </div>
              <div className="font-mono text-sm">
                {trade.entryTime ? format(new Date(trade.entryTime * 1000), 'HH:mm:ss') : '-'}
              </div>
            </div>
          </div>
          
          <div className="p-4 flex items-center justify-between group hover:bg-white/5 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-red-500/10 text-red-500">
                <TrendingDown className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Exit</div>
                <div className="font-mono font-bold text-lg">{trade.exitPrice?.toFixed(4)}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 text-xs text-muted-foreground justify-end">
                <Clock className="w-3 h-3" /> Time
              </div>
              <div className="font-mono text-sm">
                {trade.exitTime ? format(new Date(trade.exitTime * 1000), 'HH:mm:ss') : '-'}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
