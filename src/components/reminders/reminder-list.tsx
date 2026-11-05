'use client'

import { useNotifications, type ReminderItem, type TaskReminder, type HabitReminder, type ReviewReminder } from '@/hooks/use-notifications'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { PERIOD_LABELS, PRIORITY_COLORS } from '@/lib/constants'
import {
  Bell,
  BellOff,
  BellRing,
  AlertTriangle,
  Clock,
  CheckCircle2,
  ClipboardList,
  Activity,
  RefreshCw,
} from 'lucide-react'
import { toast } from 'sonner'

interface ReminderListProps {
  className?: string
  compact?: boolean
}

export function ReminderList({ className, compact = false }: ReminderListProps) {
  const {
    permission,
    requestPermission,
    isSupported,
    reminderList,
    notifyNow,
  } = useNotifications()

  const handleEnableNotifications = async () => {
    if (!isSupported) {
      toast.error('Your browser does not support notifications')
      return
    }
    const state = await requestPermission()
    if (state === 'granted') {
      toast.success('Notifications enabled')
      notifyNow()
    } else if (state === 'denied') {
      toast.error('Notification permission denied. Enable it in browser settings.')
    } else if (state === 'unsupported') {
      toast.error('Your browser does not support notifications')
    }
  }

  const handleNotifyNow = () => {
    const { shown } = notifyNow()
    if (shown === 0) {
      toast.info('No reminders to send')
    } else {
      toast.success(`Sent ${shown} reminders`)
    }
  }

  const { items, overdueCount } = reminderList

  // Group items by category
  const overdueItems: TaskReminder[] = items.filter(
    (i): i is TaskReminder => i.type === 'task' && i.isOverdue
  )
  const taskReminders: TaskReminder[] = items.filter(
    (i): i is TaskReminder => i.type === 'task' && !i.isOverdue
  )
  const habitReminders: HabitReminder[] = items.filter(
    (i): i is HabitReminder => i.type === 'habit'
  )
  const reviewReminder = items.find((i): i is ReviewReminder => i.type === 'review')

  // Compact mode: just show a bell icon with count
  if (compact) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        {permission === 'granted' ? (
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={handleNotifyNow}
            title="Send reminders"
            aria-label="Send reminders"
          >
            <BellRing className="h-4 w-4" aria-hidden="true" />
            {overdueCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-micro tabular-nums text-destructive-foreground">
                {overdueCount}
              </span>
            )}
          </Button>
        ) : permission === 'denied' ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleEnableNotifications}
            title="Notifications disabled"
            aria-label="Notifications disabled; click to enable"
          >
            <BellOff className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleEnableNotifications}
            title="Enable notifications"
            aria-label="Enable notifications"
          >
            <Bell className="h-4 w-4" aria-hidden="true" />
          </Button>
        )}
      </div>
    )
  }

  // Full panel mode
  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <BellRing className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
          <h2 className="text-title">Reminder center</h2>
          {overdueCount > 0 && (
            <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-micro tabular-nums text-destructive">
              {overdueCount} overdue
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {permission === 'granted' ? (
            <Button
              variant="outline"
              size="sm"
              className="text-caption"
              onClick={handleNotifyNow}
            >
              <RefreshCw className="h-3 w-3" aria-hidden="true" />
              Remind now
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="text-caption"
              onClick={handleEnableNotifications}
              disabled={!isSupported || permission === 'denied'}
            >
              {permission === 'denied' ? (
                <>
                  <BellOff className="h-3 w-3" aria-hidden="true" />
                  Notifications disabled
                </>
              ) : (
                <>
                  <Bell className="h-3 w-3" aria-hidden="true" />
                  Enable notifications
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Unsupported browser warning */}
      {!isSupported && (
        <div className="flex items-center gap-2 rounded-lg border border-border bg-surface-2 px-3 py-2 text-caption text-muted-foreground">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          Your browser does not support desktop notifications
        </div>
      )}

      {/* Permission denied message */}
      {permission === 'denied' && (
        <div className="flex items-center gap-2 rounded-lg border border-border bg-surface-2 px-3 py-2 text-caption text-muted-foreground">
          <BellOff className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          Enable notification permission in your browser settings
        </div>
      )}

      {/* Empty state */}
      {items.length === 1 && reviewReminder?.isDone && overdueItems.length === 0 && taskReminders.length === 0 && habitReminders.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
          <CheckCircle2 className="h-8 w-8 text-muted-foreground/50" aria-hidden="true" />
          <p className="text-body text-muted-foreground">No reminders today</p>
          <p className="text-caption text-muted-foreground/80">Great work—keep it up</p>
        </div>
      )}

      {/* Overdue tasks section */}
      {overdueItems.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5 text-destructive" aria-hidden="true" />
            <h3 className="text-section text-destructive">Overdue tasks</h3>
            <span className="text-caption tabular-nums text-muted-foreground">
              {overdueItems.length}
            </span>
          </div>
          <div className="space-y-1.5">
            {overdueItems.map((item) => (
              <ReminderCard key={item.task.id} item={item} variant="overdue" />
            ))}
          </div>
        </div>
      )}

      {/* Task reminders */}
      {taskReminders.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5">
            <ClipboardList className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
            <h3 className="text-section">Task reminders</h3>
            <span className="text-caption tabular-nums text-muted-foreground">
              {taskReminders.length}
            </span>
          </div>
          <div className="space-y-1.5">
            {taskReminders.map((item) => (
              <ReminderCard key={item.task.id} item={item} variant="task" />
            ))}
          </div>
        </div>
      )}

      {/* Habit reminders */}
      {habitReminders.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5">
            <Activity className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
            <h3 className="text-section">Habit tracking</h3>
            <span className="text-caption tabular-nums text-muted-foreground">
              {habitReminders.length}
            </span>
          </div>
          <div className="space-y-1.5">
            {habitReminders.map((item) => (
              <ReminderCard key={item.habit.id} item={item} variant="habit" />
            ))}
          </div>
        </div>
      )}

      {/* Daily review */}
      {reviewReminder && !reviewReminder.isDone && (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5">
            <ClipboardList className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
            <h3 className="text-section">Daily review</h3>
          </div>
          <ReminderCard item={reviewReminder} variant="review" />
        </div>
      )}
    </div>
  )
}

// ---------- Sub-components ----------

interface ReminderCardProps {
  item: ReminderItem
  variant: 'overdue' | 'task' | 'habit' | 'review'
}

function ReminderCard({ item, variant }: ReminderCardProps) {
  const baseClasses =
    'flex items-center gap-3 rounded-lg border px-3 py-2.5 ui-transition'

  const variantClasses: Record<string, string> = {
    overdue: 'border-destructive/30 bg-destructive/5 hover:border-destructive/45 hover:bg-destructive/10',
    task: 'border-border bg-surface hover:border-border-strong',
    habit: 'border-border bg-surface hover:border-border-strong',
    review: 'border-border bg-surface-2 hover:border-border-strong',
  }

  return (
    <div className={cn(baseClasses, variantClasses[variant])}>
      {/* Icon */}
      <div className="shrink-0">
        {variant === 'overdue' && (
          <AlertTriangle className="h-4 w-4 text-destructive" aria-hidden="true" />
        )}
        {variant === 'task' && (
          <Clock className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        )}
        {variant === 'habit' && (
          <Activity className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        )}
        {variant === 'review' && (
          <ClipboardList className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        )}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        {item.type === 'task' && (
          <>
            <p className="truncate text-body font-medium">{item.task.title}</p>
            <p className="text-caption tabular-nums text-muted-foreground">
              {item.isOverdue ? 'Overdue' : `Reminder: ${item.timeLabel}`}
              {item.task.task_date && ` · ${item.task.task_date}`}
              {item.task.period && ` · ${PERIOD_LABELS[item.task.period]}`}
            </p>
          </>
        )}
        {item.type === 'habit' && (
          <>
            <p className="truncate text-body font-medium">{item.habit.name}</p>
            <p className="text-caption tabular-nums text-muted-foreground">
              Reminder: {item.timeLabel}
              {item.habit.target_value > 1
                ? ` · Target: ${item.habit.target_value}${item.habit.unit || ''}`
                : ''}
            </p>
          </>
        )}
        {item.type === 'review' && (
          <>
            <p className="text-body font-medium">Daily review</p>
            <p className="text-caption text-muted-foreground">
              {item.isDone ? 'Completed' : 'Not written yet'}
            </p>
          </>
        )}
      </div>

      {/* Priority indicator for tasks */}
      {item.type === 'task' && (
        <span
          className={cn(
            'shrink-0 rounded-full px-1.5 py-0.5 text-micro',
            PRIORITY_COLORS[item.task.priority]
          )}
        >
          {item.task.priority === 'urgent' ? 'Urgent' : item.task.priority === 'high' ? 'High' : ''}
        </span>
      )}
    </div>
  )
}

// ---------- Skeleton ----------

export function ReminderListSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-7 w-16" />
      </div>
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-14 w-full rounded-lg" />
      ))}
    </div>
  )
}
