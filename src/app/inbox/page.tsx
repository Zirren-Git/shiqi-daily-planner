'use client'

import { useState, useCallback } from 'react'
import { useAuth } from '@/providers/auth-provider'
import { useRepos } from '@/providers/repo-provider'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { TaskListItem } from '@/components/schedule/task-list-item'
import { TaskDetailPanel } from '@/components/schedule/task-detail-panel'
import { Inbox, Loader2, ArrowRight, Calendar, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { todayStr, tomorrowStr } from '@/lib/utils/date'
import { defaultPeriodByTime } from '@/lib/utils/period'
import type { Task } from '@/types'

export default function InboxPage() {
  const { user } = useAuth()
  const { tasks: taskRepo, tags: tagRepo } = useRepos()
  const queryClient = useQueryClient()
  const [draft, setDraft] = useState('')
  const [saving, setSaving] = useState(false)
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null)
  const [movingId, setMovingId] = useState<string | null>(null)

  const today = todayStr()

  // 收集箱 = 没有日期的任务（task_date 为空）
  const { data: inboxTasks = [], isLoading } = useQuery({
    queryKey: ['tasks', user?.id, 'inbox'],
    queryFn: () =>
      taskRepo.filter(user!.id, {
        undatedOnly: true,
        maxResults: 200,
      }),
    enabled: !!user,
  })

  const { data: tags = [] } = useQuery({
    queryKey: ['tags', user?.id],
    queryFn: () => tagRepo.getAll(user!.id),
    enabled: !!user,
  })

  const refresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['tasks', user!.id] })
  }, [queryClient, user])

  const handleCapture = useCallback(async () => {
    const title = draft.trim()
    if (!title || !user || saving) return
    setSaving(true)
    try {
      await taskRepo.create(user.id, {
        title,
        task_date: null,
        period: defaultPeriodByTime(),
        priority: 'normal',
        status: 'todo',
        order_index: 0,
      } as Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>)
      setDraft('')
      refresh()
      toast.success('Added to inbox')
    } catch {
      toast.error('Could not add. Please try again.')
    } finally {
      setSaving(false)
    }
  }, [draft, user, saving, taskRepo, refresh])

  const handleSchedule = useCallback(
    async (task: Task, target: string, label: string) => {
      if (!user || movingId) return
      setMovingId(task.id)
      try {
        await taskRepo.update(user.id, task.id, { task_date: target } as Partial<Task>)
        refresh()
        toast.success(`Scheduled for ${label}`)
      } catch {
        toast.error('Action failed')
      } finally {
        setMovingId(null)
      }
    },
    [user, movingId, taskRepo, refresh]
  )

  const activeTask = inboxTasks.find((t) => t.id === activeTaskId) || null

  if (!user) return null

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 px-4 py-6 sm:px-6">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-display">Inbox</h1>
          <p className="mt-1 text-caption text-muted-foreground">
            Capture it now; schedule it later
          </p>
        </div>
        {inboxTasks.length > 0 && (
          <span className="mt-1 shrink-0 rounded-full border border-border bg-surface-2 px-2 py-0.5 text-caption text-muted-foreground tabular-nums">
            {inboxTasks.length} to schedule
          </span>
        )}
      </div>

      {/* 快速记录（不设日期） */}
      <div className="surface flex items-center gap-2 p-2">
        <Plus className="ml-1 h-4 w-4 shrink-0 text-muted-foreground" />
        <Input
          data-testid="inbox-capture"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleCapture()
            }
          }}
          placeholder="Capture a thought to schedule later…"
          className="h-8 min-w-0 flex-1 border-0 bg-transparent px-0 text-body shadow-none dark:bg-transparent"
        />
        <Button
          data-testid="inbox-capture-save"
          onClick={handleCapture}
          disabled={!draft.trim() || saving}
          className="h-8 shrink-0 px-3"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'History'}
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
        </div>
      ) : inboxTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-card px-6 py-12 text-center">
          <Inbox className="h-7 w-7 text-muted-foreground/60" />
          <p className="text-body text-foreground">Your inbox is empty</p>
          <p className="max-w-xs text-caption text-muted-foreground">
            Capture an idea above, then schedule it for today or tomorrow
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {inboxTasks.map((task) => (
            <div key={task.id} className="surface overflow-hidden">
              <TaskListItem
                task={task}
                tags={tags}
                isActive={task.id === activeTaskId}
                onClick={() => setActiveTaskId(task.id)}
              />
              <div className="flex items-center gap-1.5 border-t border-border px-3 py-1.5">
                <span className="mr-auto text-micro text-muted-foreground">Unscheduled</span>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 gap-1 px-2 text-caption"
                  disabled={movingId === task.id}
                  onClick={() => handleSchedule(task, today, 'Today')}
                >
                  <ArrowRight className="h-3 w-3" />
                  Schedule for today
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 gap-1 px-2 text-caption"
                  disabled={movingId === task.id}
                  onClick={() => handleSchedule(task, tomorrowStr(today), 'Tomorrow')}
                >
                  <Calendar className="h-3 w-3" />
                  Schedule for tomorrow
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <TaskDetailPanel
        task={activeTask}
        open={!!activeTaskId}
        onClose={() => setActiveTaskId(null)}
      />
    </div>
  )
}
