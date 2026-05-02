'use client'

import { BarChart3, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface NavigationProps {
  currentView: 'dashboard' | 'analytics' | 'data'
  onViewChange: (view: 'dashboard' | 'analytics' | 'data') => void
}

export function Navigation({ currentView, onViewChange }: NavigationProps) {
  return (
    <nav className="border-b border-white/5 bg-background/40 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex items-center justify-center h-16 overflow-x-auto no-scrollbar">
          <div className="flex gap-2 md:gap-4 min-w-max px-2">
            <Button
              variant={currentView === 'dashboard' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewChange('dashboard')}
              className="gap-2 text-xs md:text-sm font-semibold"
            >
              <BarChart3 className="w-4 h-4" />
              Dashboard
            </Button>
            <Button
              variant={currentView === 'analytics' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewChange('analytics')}
              className="gap-2 text-xs md:text-sm font-semibold"
            >
              <BarChart3 className="w-4 h-4" />
              Analytics
            </Button>
            <Button
              variant={currentView === 'data' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewChange('data')}
              className="gap-2 text-xs md:text-sm font-semibold"
            >
              <Settings className="w-4 h-4" />
              Data
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
