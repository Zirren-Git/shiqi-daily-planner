'use client'

import { useState } from 'react'
import { parseISO } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { RefreshCw, Calendar, Hash, X } from 'lucide-react'
import type { RecurrenceRule } from '@/types'

const FREQUENCY_LABELS: Record<string, string> = {
  none: 'Does not repeat',
  daily: 'Daily',
  weekdays: 'Every weekday',
  weekly: 'Weekly',
  monthly: 'Monthly',
  yearly: 'Yearly',
}

const WEEKDAY_OPTIONS = [
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
  { value: 7, label: 'Sun' },
]

/** 胶囊分段项：选中用 acg-pill，未选中为幽灵文字 */
const pillClass = (selected: boolean) =>
  cn(
    'h-7 rounded-full px-2.5 text-caption ui-transition',
    selected
      ? 'acg-pill font-semibold'
      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
  )

interface RecurrenceEditorProps {
  value: RecurrenceRule | null | undefined
  onChange: (rule: RecurrenceRule | null) => void
  /** 任务日期（yyyy-MM-dd）：选「每周」时Default落在这一天所在的星期几 */
  baseDate?: string
}

/** 把日期换成 ISO 星期（1=周一 … 7=周日） */
function isoWeekday(dateStr?: string): number {
  const date = dateStr ? parseISO(dateStr) : new Date()
  const day = date.getDay()
  return day === 0 ? 7 : day
}

export function RecurrenceEditor({ value, onChange, baseDate }: RecurrenceEditorProps) {
  const frequency = value?.frequency || 'none'
  const [endType, setEndType] = useState<'none' | 'count' | 'date'>(
    value?.count ? 'count' : value?.endDate ? 'date' : 'none'
  )

  const handleFrequencyChange = (freq: string | null) => {
    if (!freq) return
    if (freq === 'none') {
      onChange(null)
      return
    }

    const base: RecurrenceRule = {
      frequency: freq as RecurrenceRule['frequency'],
      interval: value?.interval || 1,
    }

    // Preserve and set appropriate defaults
    if (freq === 'weekly' && !base.byWeekday) {
      // Default沿用任务当天的星期几，而不是写死周一
      base.byWeekday = [isoWeekday(baseDate)]
    }
    if (freq === 'monthly') {
      base.byMonthDay = value?.byMonthDay || 1
    }

    if (value?.endDate) base.endDate = value.endDate
    if (value?.count) base.count = value.count

    onChange(base)
  }

  const handleIntervalChange = (interval: number) => {
    if (!value) return
    onChange({ ...value, interval: Math.max(1, interval) })
  }

  const handleWeekdayToggle = (day: number) => {
    if (!value) return
    const current = value.byWeekday || []
    const next = current.includes(day)
      ? current.filter((d) => d !== day)
      : [...current, day].sort()
    onChange({ ...value, byWeekday: next.length > 0 ? next : undefined })
  }

  const handleMonthDayChange = (day: number) => {
    if (!value) return
    onChange({ ...value, byMonthDay: Math.min(31, Math.max(1, day)) })
  }

  const handleSetPosChange = (pos: number) => {
    if (!value) return
    onChange({
      ...value,
      bySetPos: pos || undefined,
      byWeekday: pos ? (value.byWeekday || [1]) : undefined,
    })
  }

  const handleEndCount = (count: number) => {
    if (!value) return
    const next = { ...value }
    delete next.endDate
    next.count = count > 0 ? count : undefined
    onChange(next)
  }

  const handleEndDate = (date: string) => {
    if (!value) return
    const next = { ...value }
    delete next.count
    next.endDate = date || undefined
    onChange(next)
  }

  if (!value) {
    return (
      <div className="space-y-2">
        <Label className="text-caption text-muted-foreground">Repeat</Label>
        <Select value="none" onValueChange={handleFrequencyChange}>
          <SelectTrigger className="w-full rounded-md">
            <SelectValue placeholder="Does not repeat" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(FREQUENCY_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {key !== 'none' && <RefreshCw className="mr-1.5 inline h-3.5 w-3.5" aria-hidden="true" />}
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    )
  }

  return (
    <div className="space-y-3 rounded-lg border border-border bg-surface-2 p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-caption text-muted-foreground">
          <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
          Recurrence rule
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-1.5 text-caption text-muted-foreground"
          onClick={() => onChange(null)}
        >
          <X className="h-3 w-3" aria-hidden="true" />
          Remove
        </Button>
      </div>

      {/* Frequency */}
      <Select value={frequency} onValueChange={handleFrequencyChange}>
        <SelectTrigger className="w-full rounded-md">
          <SelectValue>{FREQUENCY_LABELS[frequency] || frequency}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {Object.entries(FREQUENCY_LABELS)
            .filter(([key]) => key !== 'none')
            .map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
        </SelectContent>
      </Select>

      {/* Interval */}
      <div className="flex items-center gap-3">
        <Label className="shrink-0 text-caption text-muted-foreground">Interval</Label>
        <div className="flex items-center gap-1.5">
          <span className="text-caption text-muted-foreground">Every</span>
          <Input
            type="number"
            min={1}
            max={99}
            value={value.interval || 1}
            onChange={(e) => handleIntervalChange(parseInt(e.target.value) || 1)}
            className="w-16 text-center tabular-nums"
            aria-label="Repeat interval"
          />
          <span className="text-caption text-muted-foreground">
            {frequency === 'daily' || frequency === 'weekdays'
              ? 'days'
              : frequency === 'weekly'
                ? 'Week'
                : frequency === 'monthly'
                  ? 'Month'
                  : 'years'}
          </span>
        </div>
      </div>

      {/* Weekly: day selection */}
      {frequency === 'weekly' && (
        <div className="space-y-2">
          <Label className="text-caption text-muted-foreground">Repeat days</Label>
          <div className="flex flex-wrap gap-1">
            {WEEKDAY_OPTIONS.map(({ value: day, label }) => (
              <button
                key={day}
                type="button"
                onClick={() => handleWeekdayToggle(day)}
                aria-pressed={(value.byWeekday || []).includes(day)}
                className={pillClass((value.byWeekday || []).includes(day))}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Monthly: day selection */}
      {frequency === 'monthly' && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label className="shrink-0 text-caption text-muted-foreground">Monthly</Label>
            <div className="flex items-center gap-1.5">
              <span className="text-caption text-muted-foreground">On the</span>
              <Input
                type="number"
                min={1}
                max={31}
                value={value.byMonthDay || 1}
                onChange={(e) => handleMonthDayChange(parseInt(e.target.value) || 1)}
                className="w-14 text-center tabular-nums"
                aria-label="Day of month"
              />
              <span className="text-caption text-muted-foreground">days</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-caption text-muted-foreground">or</span>
            <Select
              value={value.bySetPos ? String(value.bySetPos) : ''}
              onValueChange={(v) => handleSetPosChange(v ? parseInt(v) : 0)}
            >
              <SelectTrigger className="w-36 rounded-md">
                <SelectValue placeholder="Choose weekday occurrence" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Do not use</SelectItem>
                <SelectItem value="1">First</SelectItem>
                <SelectItem value="2">Second</SelectItem>
                <SelectItem value="3">Third</SelectItem>
                <SelectItem value="4">Fourth</SelectItem>
                <SelectItem value="-1">Last</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* End condition */}
      <div className="space-y-2 border-t border-border pt-3">
        <Label className="text-caption text-muted-foreground">End condition</Label>
        <div className="inline-flex items-center gap-0.5 rounded-full border border-border bg-surface p-0.5">
          <button
            type="button"
            aria-pressed={endType === 'none'}
            className={pillClass(endType === 'none')}
            onClick={() => {
              setEndType('none')
              const next = { ...value }
              delete next.count
              delete next.endDate
              onChange(next)
            }}
          >
            Never
          </button>
          <button
            type="button"
            aria-pressed={endType === 'count'}
            className={pillClass(endType === 'count')}
            onClick={() => setEndType('count')}
          >
            <span className="flex items-center gap-1">
              <Hash className="h-3 w-3" aria-hidden="true" />
              Count
            </span>
          </button>
          <button
            type="button"
            aria-pressed={endType === 'date'}
            className={pillClass(endType === 'date')}
            onClick={() => setEndType('date')}
          >
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" aria-hidden="true" />
              Date
            </span>
          </button>
        </div>

        {endType === 'count' && (
          <div className="flex items-center gap-2">
            <span className="text-caption text-muted-foreground">Repeat</span>
            <Input
              type="number"
              min={1}
              max={999}
              value={value.count != null ? value.count : ''}
              onChange={(e) => handleEndCount(parseInt(e.target.value) || 0)}
              className="w-20 text-center tabular-nums"
              placeholder="Count"
              aria-label="Number of repetitions"
            />
            <span className="text-caption text-muted-foreground">times</span>
          </div>
        )}

        {endType === 'date' && (
          <div className="flex items-center gap-2">
            <span className="text-caption text-muted-foreground">Until</span>
            <Input
              type="date"
              value={value.endDate || ''}
              onChange={(e) => handleEndDate(e.target.value)}
              aria-label="Repeat end date"
            />
          </div>
        )}
      </div>
    </div>
  )
}
