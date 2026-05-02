"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, X, Plus, Trash2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { calculateStats, formatCurrency, getDailyTotals, getCumulativeData, getWeeklyTotals } from "@/lib/utils"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { TradeForm } from "@/components/trade-form"
import { TradeChartModal } from "@/components/trade-chart-modal"
import type { Trade } from "@/lib/types"

function MonthlySummaryTable({
  trades,
  onMonthClick,
}: {
  trades: Trade[]
  onMonthClick: (year: number, month: number) => void
}) {
  // Group trades by year and month
  const yearStats = trades.reduce(
    (acc, trade) => {
      const date = new Date(trade.date)
      const year = date.getFullYear()
      const month = date.getMonth() // 0-11

      if (!acc[year]) {
        acc[year] = {
          months: Array(12).fill(0),
          hasData: Array(12).fill(false),
          ytd: 0,
        }
      }

      acc[year].months[month] += trade.pnl
      acc[year].hasData[month] = true
      acc[year].ytd += trade.pnl

      return acc
    },
    {} as Record<number, { months: number[]; hasData: boolean[]; ytd: number }>,
  )

  // Get sorted years (descending)
  const years = Object.keys(yearStats)
    .map(Number)
    .sort((a, b) => b - a)

  // If no data, show current year as empty
  if (years.length === 0) {
    const currentYear = new Date().getFullYear()
    years.push(currentYear)
    yearStats[currentYear] = {
      months: Array(12).fill(0),
      hasData: Array(12).fill(false),
      ytd: 0,
    }
  }

  const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"]

  return (
    <div className="w-full">
      <table className="w-full text-[10px] md:text-xs border-collapse table-fixed">
        <thead>
          <tr className="text-muted-foreground border-b border-white/10">
            <th className="text-left py-2 px-1 font-bold uppercase tracking-wider w-[8%]">Year</th>
            {months.map((month) => (
              <th key={month} className="text-right py-2 px-0.5 font-bold uppercase tracking-tight w-[7%]">
                {month}
              </th>
            ))}
            <th className="text-right py-2 px-1 font-bold uppercase tracking-wider w-[9%]">YTD</th>
          </tr>
        </thead>
        <tbody>
          {years.map((year) => {
            const stats = yearStats[year]
            return (
              <tr key={year} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="py-2 px-1 font-bold text-white">{year}</td>
                {stats.months.map((pnl, index) => (
                  <td
                    key={index}
                    className="text-right py-2 px-0.5 font-medium cursor-pointer hover:bg-white/10 transition-colors"
                    onClick={() => onMonthClick(year, index)}
                  >
                    {stats.hasData[index] ? (
                      <span className={pnl >= 0 ? "text-emerald-400" : "text-red-400"}>{formatCurrency(pnl)}</span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </td>
                ))}
                <td
                  className={`text-right py-2 px-1 font-bold ${stats.ytd >= 0 ? "text-emerald-400" : "text-red-400"}`}
                >
                  {formatCurrency(stats.ytd)}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

interface UnifiedDashboardProps {
  trades: Trade[]
  onAddTrade: (trade: Omit<Trade, "id" | "source">) => void
  onDeleteTrade: (id: string) => void
  derivToken?: string
}

export function UnifiedDashboard({ trades, onAddTrade, onDeleteTrade, derivToken }: UnifiedDashboardProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedDayDetails, setSelectedDayDetails] = useState<{ date: string; trades: Trade[] } | null>(null)
  const [showTradeForm, setShowTradeForm] = useState(false)
  const [tradeFormDate, setTradeFormDate] = useState<string | null>(null)
  const [selectedTradeForChart, setSelectedTradeForChart] = useState<Trade | null>(null)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()
  const startingDayOfWeek = firstDay.getDay()

  const dailyTotals = getDailyTotals(trades)

  const monthStartDate = new Date(year, month, 1)
  const monthEndDate = new Date(year, month + 1, 0)
  const monthTrades = trades.filter((t) => {
    const tradeDate = new Date(t.date)
    return tradeDate >= monthStartDate && tradeDate <= monthEndDate
  })

  const stats = calculateStats(monthTrades)
  const cumulativeData = getCumulativeData(monthTrades)
  const weeklyTotals = getWeeklyTotals(trades, year, month)

  const getDayTrades = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    return trades.filter((t) => t.date.startsWith(dateStr))
  }

  const monthName = new Date(year, month).toLocaleString("default", { month: "long" })

  const handleDayClick = (date: string, dayTrades: Trade[]) => {
    setSelectedDayDetails({ date, trades: dayTrades })
  }

  const monthTotal = monthTrades.reduce((sum, t) => sum + t.pnl, 0)

  const handleMonthClick = (year: number, monthIndex: number) => {
    setCurrentDate(new Date(year, monthIndex))
  }

  const handleAddTradeClick = () => {
    setTradeFormDate(null)
    setShowTradeForm(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 text-foreground py-4 px-4 md:px-6 md:py-4">
      <TradeChartModal
        trade={selectedTradeForChart}
        isOpen={!!selectedTradeForChart}
        onClose={() => setSelectedTradeForChart(null)}
        derivToken={derivToken}
      />

      <div className="max-w-7xl mx-auto">
        <Button
          onClick={handleAddTradeClick}
          className="fixed bottom-6 right-6 z-40 rounded-full w-12 h-12 md:w-14 md:h-14 shadow-lg bg-emerald-500 hover:bg-emerald-600"
          size="icon"
        >
          <Plus className="w-6 h-6" />
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left side: Calendar and Monthly Summary */}
          <div className="col-span-1 lg:col-span-2 flex flex-col gap-6 mx-[-30px]">
            {/* Calendar Card */}
            <Card className="glass-card p-4 md:p-6">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/5">
                <div className="flex items-baseline gap-2">
                  <h2 className="text-2xl font-bold">{monthName}</h2>
                  <p className="text-sm text-muted-foreground">{year}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentDate(new Date(year, month - 1))}
                    className="rounded-lg border-white/10 hover:border-white/20 hover:bg-white/5 transition-all duration-200"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentDate(new Date(year, month + 1))}
                    className="rounded-lg border-white/10 hover:border-white/20 hover:bg-white/5 transition-all duration-200"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="overflow-x-auto -mx-4 px-4 md:overflow-visible md:mx-0 md:px-0">
                <div className="flex gap-2 min-w-[640px] md:min-w-0">
                  <div className="flex-1">
                    <div className="grid grid-cols-7 gap-2">
                      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                        <div
                          key={day}
                          className="text-center text-xs font-bold text-muted-foreground py-2 uppercase tracking-wider"
                        >
                          {day}
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-7 gap-2 mt-2">
                      {Array.from({ length: startingDayOfWeek }).map((_, i) => (
                        <div key={`empty-${i}`} className="rounded-lg opacity-30 h-20" />
                      ))}

                      {Array.from({ length: daysInMonth }).map((_, i) => {
                        const day = i + 1
                        const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
                        const dayTotal = dailyTotals[dateStr] || 0
                        const dayTrades = getDayTrades(day)
                        const isPositive = dayTotal > 0
                        const isNegative = dayTotal < 0

                        let bgColor = "bg-white/3 border-white/5 hover:border-white/15"
                        let textColor = "text-foreground"
                        if (isPositive) {
                          bgColor =
                            "bg-emerald-500/10 border-emerald-500/30 hover:border-emerald-500/50 hover:bg-emerald-500/15"
                          textColor = "text-emerald-400 font-semibold"
                        }
                        if (isNegative) {
                          bgColor = "bg-red-500/10 border-red-500/30 hover:border-red-500/50 hover:bg-red-500/15"
                          textColor = "text-red-400 font-semibold"
                        }

                        return (
                          <div
                            key={day}
                            onClick={() => handleDayClick(dateStr, dayTrades)}
                            className={`calendar-cell border p-2 cursor-pointer flex flex-col justify-start h-20 ${bgColor}`}
                          >
                            <div className="text-xs font-bold text-muted-foreground tracking-wider">{day}</div>
                            {dayTotal !== 0 && (
                              <div className={`text-xs truncate ${textColor} mt-1`}>{formatCurrency(dayTotal)}</div>
                            )}
                            {dayTrades.length > 0 && (
                              <div className="text-xs text-muted-foreground mt-1 opacity-75">
                                {dayTrades.length} {dayTrades.length === 1 ? "trade" : "trades"}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  <div className="w-24 flex flex-col gap-0">
                    <div className="text-center text-xs font-bold text-muted-foreground py-2 uppercase tracking-wider">
                      Week
                    </div>
                    <div className="flex flex-col gap-2 mt-2">
                      {weeklyTotals.map((week, index) => (
                        <div
                          key={index}
                          className="h-20 flex flex-col justify-center items-center border border-white/5 bg-white/3 rounded-lg p-1"
                        >
                          <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                            W{week.weekNum}
                          </div>
                          <div
                            className={`text-sm font-bold ${week.total > 0 ? "text-emerald-400" : week.total < 0 ? "text-red-400" : "text-muted-foreground"}`}
                          >
                            {formatCurrency(week.total)}
                          </div>
                          <div className="text-[10px] text-muted-foreground">
                            {week.count} {week.count === 1 ? "Trade" : "Trades"}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="glass-card p-4 md:p-5 border border-white/5">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">
                Profit Summary by Month
              </h3>
              <MonthlySummaryTable trades={trades} onMonthClick={handleMonthClick} />
            </Card>
          </div>

          {/* Right side: Stats and Chart - No scrolling */}
          <div className="flex flex-col gap-6 mx-7">
            <Card className="stat-card leading-7">
              <div className="text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wider">
                {monthName} Profit
              </div>
              <div
                className={`text-3xl font-bold smooth-gradient ${monthTotal >= 0 ? "text-emerald-400" : "text-red-400"}`}
              >
                {formatCurrency(monthTotal)}
              </div>
              <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                {monthTotal >= 0 ? (
                  <TrendingUp className="w-3 h-3 text-emerald-400" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-red-400" />
                )}
                {monthTrades.length} trades
              </div>
            </Card>

            <div className="grid grid-cols-2 gap-3">
              <Card className="stat-card border-emerald-500/30">
                <div className="text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wider">Best Day</div>
                {stats.bestDay ? (
                  <>
                    <div className="text-2xl font-bold text-emerald-400">{formatCurrency(stats.bestDay.amount)}</div>
                    <div className="text-xs text-muted-foreground mt-2">{stats.bestDay.date}</div>
                  </>
                ) : (
                  <div className="text-muted-foreground text-xs mt-2">No trades</div>
                )}
              </Card>
              <Card className="stat-card border-red-500/30">
                <div className="text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wider">Worst Day</div>
                {stats.worstDay ? (
                  <>
                    <div className="text-2xl font-bold text-red-400">{formatCurrency(stats.worstDay.amount)}</div>
                    <div className="text-xs text-muted-foreground mt-2">{stats.worstDay.date}</div>
                  </>
                ) : (
                  <div className="text-muted-foreground text-xs mt-2">No trades</div>
                )}
              </Card>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Card className="stat-card">
                <div className="text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wider">
                  Total Trades
                </div>
                <div className="text-2xl font-bold">{stats.totalTrades}</div>
                <div className="text-xs text-muted-foreground mt-2">placed</div>
              </Card>
              <Card className="stat-card">
                <div className="text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wider">Avg. P/L</div>
                <div
                  className={`text-2xl font-bold smooth-gradient ${stats.averagePnl >= 0 ? "text-emerald-400" : "text-red-400"}`}
                >
                  {formatCurrency(stats.averagePnl)}
                </div>
                <div className="text-xs text-muted-foreground mt-2">per trade</div>
              </Card>
            </div>

            <Card className="glass-card p-5 border border-white/5">
              <h3 className="text-sm font-bold mb-3 uppercase tracking-wider text-muted-foreground">Cumulative P/L</h3>
              <div className="h-40">
                {cumulativeData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={cumulativeData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis
                        dataKey="date"
                        stroke="oklch(0.62 0 0)"
                        style={{ fontSize: "11px", fontWeight: 500 }}
                        tickFormatter={(value) => {
                          const date = new Date(value)
                          return `${date.getMonth() + 1}/${date.getDate()}`
                        }}
                      />
                      <YAxis stroke="oklch(0.62 0 0)" style={{ fontSize: "11px", fontWeight: 500 }} />
                      <Tooltip
                        formatter={(value) => formatCurrency(value as number)}
                        contentStyle={{
                          backgroundColor: "oklch(0.08 0 0)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          borderRadius: "8px",
                          boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="cumulative"
                        stroke="url(#colorCumulative)"
                        strokeWidth={3}
                        dot={false}
                        isAnimationActive={false}
                      />
                      <defs>
                        <linearGradient id="colorCumulative" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="oklch(0.72 0.2 142)" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="oklch(0.72 0.2 142)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                    Add your first trade
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>

      {selectedDayDetails && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md glass-card border-white/10 max-h-[80vh] flex flex-col">
            <div className="p-4 border-b border-white/10 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold">
                  {new Date(selectedDayDetails.date).toLocaleDateString("default", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}
                </h3>
                <p className="text-xs text-muted-foreground">{selectedDayDetails.trades.length} trades</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setSelectedDayDetails(null)}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="p-4 overflow-y-auto flex-1 space-y-3">
              {selectedDayDetails.trades.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No trades recorded for this day.</p>
                </div>
              ) : (
                selectedDayDetails.trades.map((trade) => (
                  <div
                    key={trade.id}
                    className="p-3 rounded-lg bg-white/5 border border-white/5 hover:border-white/10 transition-colors cursor-pointer"
                    onClick={() => {
                      if (trade.source === "deriv" && trade.rawSymbol) {
                        setSelectedTradeForChart(trade)
                      }
                    }}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <span className="font-bold text-sm">{trade.asset}</span>
                        <span
                          className={`ml-2 text-xs px-1.5 py-0.5 rounded ${trade.pnl >= 0 ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}
                        >
                          {trade.pnl >= 0 ? "WIN" : "LOSS"}
                        </span>
                        {trade.source === "deriv" && (
                          <span className="ml-2 text-xs px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400">Deriv</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`font-bold ${trade.pnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                          {formatCurrency(trade.pnl)}
                        </span>
                        {trade.source === "manual" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation()
                              onDeleteTrade(trade.id)
                              setSelectedDayDetails((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      trades: prev.trades.filter((t) => t.id !== trade.id),
                                    }
                                  : null,
                              )
                            }}
                            className="h-6 w-6 text-red-500 hover:text-red-400 hover:bg-red-500/10"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                    {trade.notes && <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{trade.notes}</p>}
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      )}

      {showTradeForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <TradeForm initialDate={tradeFormDate} onSubmit={onAddTrade} onClose={() => setShowTradeForm(false)} />
        </div>
      )}
    </div>
  )
}
