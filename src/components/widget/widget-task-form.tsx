'use client'

import { useState } from 'react'
import type { Period, Tag } from '@/types'
import { PERIOD_LABELS } from '@/lib/constants'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Check, Loader2, Trash2, X } from 'lucide-react'
import { PERIOD_CLASS, PERIOD_ORDER } from '@/lib/period-style'

export interface WidgetTaskDraft {
  title: string
  period: Period
  tag_id: string
  start_time: string
  end_time: string
}

interface WidgetTaskFormProps {
  mode: 'create' | 'edit'
  initial?: Partial<WidgetTaskDraft>
  tags: Tag[]
  saving?: boolean
  isDone?: boolean
  onCancel: () => void
  onSave: (draft: WidgetTaskDraft) => void
  onDelete?: () => void
  onToggleDone?: () => void
}
/**
 * 浮窗内的任务表单：标题 + 时段 + 标签 + 起止时间。
 * 新建和编辑共用同一套字段，编辑时额外提供「完成 / 删除」。
 */
export function WidgetTaskForm({
  mode,
  initial,
  tags,
  saving,
  isDone,
  onCancel,
  onSave,
  onDelete,
  onToggleDone,
}: WidgetTaskFormProps) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [period, setPeriod] = useState<Period>((initial?.period as Period) ?? 'morning')
  const [tagId, setTagId] = useState(initial?.tag_id ?? '')
  const [startTime, setStartTime] = useState(initial?.start_time ?? '')
  const [endTime, setEndTime] = useState(initial?.end_time ?? '')

  const canSave = title.trim().length > 0 && !saving

  const submit = () => {
    if (!canSave) return
    onSave({
      title: title.trim(),
      period,
      tag_id: tagId,
      start_time: startTime,
      end_time: endTime,
    })
  }

  return (
    <div className="absolute inset-0 z-20 flex flex-col bg-card">
      <div className="app-drag flex h-11 shrink-0 items-center gap-2 border-b border-border bg-surface-2/50 px-3 select-none">
        <span className="text-section">{mode === 'create' ? 'New task' : 'Edit task'}</span>
        <button
          type="button"
          onClick={onCancel}
          aria-label="Cancel"
          className="app-no-drag ml-auto flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground ui-transition hover:bg-accent hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto px-3 py-3">
        <div className="space-y-2">
          <p className="text-micro text-muted-foreground">Title</p>
          <Input
            data-testid="widget-form-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                submit()
              }
            }}
            placeholder="Something to do…"
            autoFocus
            className="h-9 text-body"
          />
        </div>

        {/* 时段 */}
        <div className="space-y-2">
          <p className="text-micro text-muted-foreground">Period</p>
          <div className="grid grid-cols-3 gap-1.5">
            {PERIOD_ORDER.map((item) => (
              <button
                key={item}
                type="button"
                data-testid={`widget-period-${item}`}
                onClick={() => setPeriod(item)}
                className={`flex h-8 items-center justify-center rounded-md text-caption ui-transition ${
                  PERIOD_CLASS[item]
                } ${
                  period === item
                    ? 'period-chip font-medium'
                    : 'bg-muted/60 text-muted-foreground hover:bg-accent hover:text-foreground'
                }`}
              >
                {PERIOD_LABELS[item]}
              </button>
            ))}
          </div>
        </div>

        {/* 标签 */}
        <div className="space-y-2">
          <p className="text-micro text-muted-foreground">Tags</p>
          <select
            data-testid="widget-form-tag"
            value={tagId}
            onChange={(e) => setTagId(e.target.value)}
            className="h-9 w-full rounded-md border border-input bg-background px-2.5 text-body text-foreground ui-transition outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/35 dark:bg-input/25"
          >
            <option value="">Uncategorized</option>
            {tags.map((tag) => (
              <option key={tag.id} value={tag.id}>
                {tag.name}
              </option>
            ))}
          </select>
        </div>

        {/* 时间 */}
        <div className="space-y-2">
          <p className="text-micro text-muted-foreground">Time (optional)</p>
          <div className="flex items-center gap-1.5">
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              aria-label="Start time"
              className="h-9 min-w-0 flex-1 rounded-md border border-input bg-background px-2 text-caption tabular-nums ui-transition outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/35 dark:bg-input/25"
            />
            <span className="shrink-0 text-micro text-muted-foreground">→</span>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              aria-label="End time"
              className="h-9 min-w-0 flex-1 rounded-md border border-input bg-background px-2 text-caption tabular-nums ui-transition outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/35 dark:bg-input/25"
            />
          </div>
        </div>
      </div>

      <div className="shrink-0 space-y-2 border-t border-border bg-surface-2/50 px-3 py-3">
        <Button
          data-testid="widget-form-save"
          onClick={submit}
          disabled={!canSave}
          className="h-9 w-full"
        >
          {saving ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : null}
          {mode === 'create' ? 'Add' : 'Save'}
        </Button>
        {mode === 'edit' && (
          <div className="flex gap-1.5">
            <Button
              variant="outline"
              onClick={onToggleDone}
              className="h-8 flex-1 text-caption"
            >
              <Check className="mr-1 h-3 w-3" />
              {isDone ? 'Mark incomplete' : 'Mark complete'}
            </Button>
            <Button
              variant="outline"
              onClick={onDelete}
              className="h-8 text-caption text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="mr-1 h-3 w-3" />
              Delete
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
