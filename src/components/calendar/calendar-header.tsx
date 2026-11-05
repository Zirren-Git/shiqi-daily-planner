'use client'

import { useCallback, useEffect, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Plus, LayoutGrid, Clock } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { enUS } from 'date-fns/locale'
import { type CalendarView } from '@/types'
import { navigateDate, todayStr } from '@/lib/utils/date'
import { KEYBOARD_SHORTCUTS } from '@/lib/constants'
import { cn } from '@/lib/utils'

type PresentationMode = 'time' | 'category'

interface CalendarHeaderProps {
  currentView: CalendarView
  currentDate: string
  presentationMode: PresentationMode
  onViewChange: (view: CalendarView) => void
  onDateChange: (date: string) => void
  onNewTask: () => void
  onPresentationModeChange: (mode: PresentationMode) => void
}

const VIEW_OPTIONS: { value: CalendarView; label: string; shortcut: string }[] = [
  { value: 'month', label: 'Month', shortcut: 'M' },
  { value: 'week', label: 'Week', shortcut: 'W' },
  { value: 'day', label: 'Day', shortcut: 'D' },
]

export function CalendarHeader({
  currentView,
  currentDate,
  presentationMode,
  onViewChange,
  onDateChange,
  onNewTask,
  onPresentationModeChange,
}: CalendarHeaderProps) {
  const displayDate = (() => {
    const d = parseISO(currentDate)
    switch (currentView) {
      case 'month':
        return format(d, 'MMMM yyyy', { locale: enUS })
      case 'week':
        return format(d, 'MMMM yyyy, week w', { locale: enUS })
      case 'day':
        return format(d, 'EEEE, MMMM d, yyyy', { locale: enUS })
    }
  })()

  const goToday = useCallback(() => {
    onDateChange(todayStr())
  }, [onDateChange])

  const goPrev = useCallback(() => {
    onDateChange(navigateDate(currentDate, currentView, -1))
  }, [currentDate, currentView, onDateChange])

  const goNext = useCallback(() => {
    onDateChange(navigateDate(currentDate, currentView, 1))
  }, [currentDate, currentView, onDateChange])

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const el = document.activeElement
      if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) return

      const key = e.key.toLowerCase()
      if (key === KEYBOARD_SHORTCUTS.today) goToday()
      if (key === KEYBOARD_SHORTCUTS.monthView) onViewChange('month')
      if (key === KEYBOARD_SHORTCUTS.weekView) onViewChange('week')
      if (key === KEYBOARD_SHORTCUTS.dayView) onViewChange('day')
      if (key === KEYBOARD_SHORTCUTS.newTask) {
        e.preventDefault()
        onNewTask()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [goToday, onViewChange, onNewTask])

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="flex items-center justify-between gap-2 px-4 py-2 sm:px-6">
        {/* 一级：日期导航 */}
        <div className="flex min-w-0 items-center gap-0.5">
          {presentationMode === 'time' ? (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0"
                onClick={goPrev}
                title="Previous"
                aria-label="Previous"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                className="h-8 min-w-0 shrink truncate px-2 text-title font-semibold text-foreground"
                onClick={goToday}
                title="Go to today"
                aria-label={`Go to today, currently ${displayDate}`}
              >
                {displayDate}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0"
                onClick={goNext}
                title="Next"
                aria-label="Next"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="ml-1 hidden h-7 shrink-0 rounded-full px-2.5 text-caption sm:inline-flex"
                onClick={goToday}
              >
                Today
              </Button>
            </>
          ) : (
            <h1 className="min-w-0 truncate px-2 text-title text-foreground">By category</h1>
          )}
        </div>

        {/* 二级：视图切换（桌面） */}
        <div className="flex shrink-0 items-center gap-2">
          <SegmentedGroup ariaLabel="Display mode" className="hidden sm:inline-flex">
            <SegmentedButton
              active={presentationMode === 'time'}
              onClick={() => onPresentationModeChange('time')}
            >
              <Clock className="h-3.5 w-3.5" />
              By time
            </SegmentedButton>
            <SegmentedButton
              active={presentationMode === 'category'}
              onClick={() => onPresentationModeChange('category')}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              By category
            </SegmentedButton>
          </SegmentedGroup>

          {presentationMode === 'time' && (
            <SegmentedGroup ariaLabel="Calendar view" className="hidden sm:inline-flex">
              {VIEW_OPTIONS.map((opt) => (
                <SegmentedButton
                  key={opt.value}
                  active={currentView === opt.value}
                  onClick={() => onViewChange(opt.value)}
                  title={`${opt.label} view (${opt.shortcut})`}
                >
                  {opt.label}
                </SegmentedButton>
              ))}
            </SegmentedGroup>
          )}

          <Button
            variant="default"
            size="sm"
            className="h-8 gap-1.5 px-2.5"
            onClick={onNewTask}
            title="New task (N)"
            aria-label="New task"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">New</span>
          </Button>
        </div>
      </div>

      {/* 二级：视图切换（移动端） */}
      <div className="flex flex-wrap items-center gap-2 px-4 pb-2 sm:hidden">
        <SegmentedGroup ariaLabel="Display mode">
          <SegmentedButton
            active={presentationMode === 'time'}
            onClick={() => onPresentationModeChange('time')}
          >
            <Clock className="h-3.5 w-3.5" />
            By time
          </SegmentedButton>
          <SegmentedButton
            active={presentationMode === 'category'}
            onClick={() => onPresentationModeChange('category')}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            By category
          </SegmentedButton>
        </SegmentedGroup>

        {presentationMode === 'time' && (
          <SegmentedGroup ariaLabel="Calendar view">
            {VIEW_OPTIONS.map((opt) => (
              <SegmentedButton
                key={opt.value}
                active={currentView === opt.value}
                onClick={() => onViewChange(opt.value)}
                title={`${opt.label} view (${opt.shortcut})`}
              >
                {opt.label}
              </SegmentedButton>
            ))}
          </SegmentedGroup>
        )}
      </div>
    </header>
  )
}

// ---------- 纯展示：胶囊分段控件 ----------

function SegmentedGroup({
  ariaLabel,
  className,
  children,
}: {
  ariaLabel: string
  className?: string
  children: ReactNode
}) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={cn('inline-flex items-center gap-0.5 rounded-full bg-muted p-0.5', className)}
    >
      {children}
    </div>
  )
}

function SegmentedButton({
  active,
  onClick,
  title,
  children,
}: {
  active: boolean
  onClick: () => void
  title?: string
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-pressed={active}
      className={cn(
        'inline-flex h-8 select-none items-center justify-center gap-1 whitespace-nowrap rounded-full border border-transparent px-2 text-caption ui-transition',
        active ? 'acg-pill font-medium' : 'text-muted-foreground hover:text-foreground'
      )}
    >
      {children}
    </button>
  )
}
