import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calculateStats(trades: Trade[]) {
  if (trades.length === 0) {
    return {
      totalReturns: 0,
      totalTrades: 0,
      averagePnl: 0,
      bestDay: null,
      worstDay: null,
      winRate: 0,
      profitFactor: 0,
      averageWin: 0,
      averageLoss: 0,
      maxDrawdown: 0,
    }
  }

  const totalReturns = trades.reduce((sum, t) => sum + t.pnl, 0)
  const totalTrades = trades.length
  const averagePnl = totalReturns / totalTrades
  
  const winningTrades = trades.filter(t => t.pnl > 0)
  const losingTrades = trades.filter(t => t.pnl < 0)
  
  const winRate = (winningTrades.length / totalTrades) * 100
  
  const grossProfit = winningTrades.reduce((sum, t) => sum + t.pnl, 0)
  const grossLoss = Math.abs(losingTrades.reduce((sum, t) => sum + t.pnl, 0))
  const profitFactor = grossLoss === 0 ? grossProfit : grossProfit / grossLoss

  const averageWin = winningTrades.length > 0 ? grossProfit / winningTrades.length : 0
  const averageLoss = losingTrades.length > 0 ? grossLoss / losingTrades.length : 0

  // Calculate Max Drawdown
  let peak = -Infinity
  let maxDrawdown = 0
  let runningPnL = 0
  
  // Sort trades by date for drawdown calculation
  const sortedTrades = [...trades].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  
  sortedTrades.forEach(t => {
    runningPnL += t.pnl
    if (runningPnL > peak) peak = runningPnL
    const drawdown = peak - runningPnL
    if (drawdown > maxDrawdown) maxDrawdown = drawdown
  })

  const dailyTotals: Record<string, number> = {}
  trades.forEach(t => {
    const dateKey = t.date.split('T')[0]
    dailyTotals[dateKey] = (dailyTotals[dateKey] || 0) + t.pnl
  })

  let bestDay = null
  let worstDay = null
  let maxAmount = -Infinity
  let minAmount = Infinity

  Object.entries(dailyTotals).forEach(([date, amount]) => {
    if (amount > maxAmount) {
      maxAmount = amount
      bestDay = { date, amount }
    }
    if (amount < minAmount) {
      minAmount = amount
      worstDay = { date, amount }
    }
  })

  return {
    totalReturns,
    totalTrades,
    averagePnl,
    bestDay,
    worstDay,
    winRate,
    profitFactor,
    averageWin,
    averageLoss,
    maxDrawdown,
  }
}

export function getDailyTotals(trades: Trade[]): Record<string, number> {
  const dailyTotals: Record<string, number> = {}
  trades.forEach(t => {
    const dateKey = t.date.split('T')[0]
    dailyTotals[dateKey] = (dailyTotals[dateKey] || 0) + t.pnl
  })
  return dailyTotals
}

export function getWeeklyTotals(trades: Trade[], year: number, month: number) {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()
  
  const weeks: { weekNum: number; total: number; count: number }[] = []
  let currentWeek = { weekNum: 1, total: 0, count: 0 }
  
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day)
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const dayTrades = trades.filter(t => t.date.startsWith(dateStr))
    
    dayTrades.forEach(t => {
      currentWeek.total += t.pnl
      currentWeek.count++
    })
    
    // If it's Saturday (6) or the last day of the month, end the week
    if (date.getDay() === 6 || day === daysInMonth) {
      weeks.push({ ...currentWeek })
      currentWeek = { weekNum: weeks.length + 1, total: 0, count: 0 }
    }
  }
  
  return weeks
}

export function getCumulativeData(trades: Trade[]) {
  const sorted = [...trades].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  let cumulative = 0
  const dailyMap = new Map<string, number>()
  
  sorted.forEach(t => {
    const dateKey = t.date.split('T')[0]
    dailyMap.set(dateKey, (dailyMap.get(dateKey) || 0) + t.pnl)
  })

  const result: { date: string; cumulative: number; pnl: number }[] = []
  
  // Convert map to array and calculate cumulative
  Array.from(dailyMap.entries()).forEach(([date, pnl]) => {
    cumulative += pnl
    result.push({
      date,
      cumulative,
      pnl
    })
  })
  
  return result
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}
