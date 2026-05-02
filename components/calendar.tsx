'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Plus, Trash2, Edit2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getDailyTotals, formatCurrency, getWeeklyTotals } from '@/lib/utils'
import { TradeForm } from './trade-form'
import { TradeList } from './trade-list'
import type { Trade } from '@/lib/types'

interface CalendarProps {
  trades: Trade[]
  onAddTrade: (trade: Trade) => void
  onUpdateTrade: (id: string, trade: Trade) => void
  onDeleteTrade: (id: string) => void
}

export function Calendar({ trades, onAddTrade, onUpdateTrade, onDeleteTrade }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [showForm, setShowForm] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'month' | 'list'>('month')

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()
  const startingDayOfWeek = firstDay.getDay()

  const dailyTotals = getDailyTotals(trades)
  const weeklyTotals = getWeeklyTotals(trades, year, month)

  const previousMonth = () => {
    setCurrentDate(new Date(year, month - 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1))
  }

  const getDayTrades = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return trades.filter(t => t.date === dateStr)
  }

  const handleAddTrade = (date: string) => {
    setSelectedDate(date)
    setShowForm(true)
  }

  const handleFormSubmit = (trade: Omit<Trade, 'id'>) => {
    onAddTrade({ ...trade, id: '' })
    setShowForm(false)
    setSelectedDate(null)
  }

  const monthName = new Date(year, month).toLocaleString('default', { month: 'long' })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold">Calendar & Trading</h1>
        <p className="text-muted-foreground mt-2">View and manage your trades by date</p>
      </div>

      <div className="flex gap-2">
        <Button
          variant={viewMode === 'month' ? 'default' : 'outline'}
          onClick={() => setViewMode('month')}
        >
          Monthly View
        </Button>
        <Button
          variant={viewMode === 'list' ? 'default' : 'outline'}
          onClick={() => setViewMode('list')}
        >
          List View
        </Button>
      </div>

      {viewMode === 'month' && (
        <Card className="p-6 border border-border">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">{monthName} {year}</h2>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={previousMonth}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={nextMonth}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-sm font-semibold text-muted-foreground py-2">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: startingDayOfWeek }).map((_, i) => (
                  <div key={`empty-${i}`} className="aspect-square" />
                ))}

                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1
                  const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                  const dayTotal = dailyTotals[dateStr] || 0
                  const dayTrades = getDayTrades(day)

                  return (
                    <div
                      key={day}
                      className="aspect-square border border-border rounded p-2 hover:bg-secondary/50 cursor-pointer transition"
                      onClick={() => handleAddTrade(dateStr)}
                    >
                      <div className="text-xs text-muted-foreground mb-1">{day}</div>
                      {dayTotal !== 0 && (
                        <div className={`text-sm font-semibold ${dayTotal > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                          {formatCurrency(dayTotal)}
                        </div>
                      )}
                      {dayTrades.length > 0 && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {dayTrades.length} trade{dayTrades.length > 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="w-32 flex flex-col gap-1">
              <div className="text-center text-sm font-semibold text-muted-foreground py-2 mb-2">
                WEEK
              </div>
              {weeklyTotals.map((week, index) => (
                <div
                  key={index}
                  className="border border-border rounded p-3 bg-secondary/20"
                  style={{ height: 'calc((100% - 2.5rem) / 5)' }}
                >
                  <div className="text-xs text-muted-foreground mb-1">W{week.weekNum}</div>
                  <div className={`text-lg font-bold ${week.total > 0 ? 'text-emerald-500' : week.total < 0 ? 'text-red-500' : 'text-muted-foreground'}`}>
                    {formatCurrency(week.total)}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {week.count} Trade{week.count !== 1 ? 's' : ''}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {viewMode === 'list' && (
        <TradeList trades={trades} onAdd={handleAddTrade} onDelete={onDeleteTrade} onUpdate={onUpdateTrade} />
      )}

      <Button onClick={() => {
        setSelectedDate(new Date().toISOString().split('T')[0])
        setShowForm(true)
      }} className="gap-2">
        <Plus className="w-4 h-4" />
        Add Trade
      </Button>

      {showForm && (
        <TradeForm
          initialDate={selectedDate}
          onSubmit={handleFormSubmit}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  )
}
