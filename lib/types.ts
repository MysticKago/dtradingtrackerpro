export interface Trade {
  id: string
  date: string
  asset: string
  pnl: number
  notes?: string
  source: 'manual' | 'deriv'
  entryTime?: number
  exitTime?: number
  entryPrice?: number
  exitPrice?: number
  rawSymbol?: string
}

export interface DailyTotal {
  date: string
  total: number
  count: number
}

export interface DerivAccount {
  account: string
  token: string
  currency: string
}

export interface Stats {
  totalReturns: number
  totalTrades: number
  averagePnl: number
  bestDay: { date: string; amount: number } | null
  worstDay: { date: string; amount: number } | null
  winRate: number
}
