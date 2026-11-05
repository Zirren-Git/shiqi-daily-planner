'use client'

import { useState, useCallback } from 'react'
import { useAuth } from '@/providers/auth-provider'
import { useRepos } from '@/providers/repo-provider'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { enrichCountdown, sortCountdowns } from '@/lib/utils/countdown'
import type { Countdown } from '@/types'
import {
  Clock,
  Plus,
  ChevronRight,
  Pin,
  PinOff,
  Pencil,
  Archive,
  Trash2,
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

const COUNTDOWN_ICONS = ['Target', 'Star', 'Heart', 'GraduationCap', 'Briefcase', 'Plane', 'Gift', 'Calendar']
const COUNTDOWN_COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316']

/** Remaining天数状态色：已过 danger，≤3 天 warning */
function daysTone(days?: number) {
  if (days === undefined) return 'text-muted-foreground'
  if (days < 0) return 'text-destructive'
  if (days <= 3) return 'text-warning'
  return 'text-muted-foreground'
}

/** 开关胶囊：选中 acg-pill */
function togglePillClass(active: boolean) {
  return cn(
    'h-8 rounded-full px-3 text-caption ui-transition',
    active
      ? 'acg-pill font-semibold'
      : 'border border-border text-muted-foreground hover:bg-muted hover:text-foreground'
  )
}

export function HomeCountdowns() {
  const { user } = useAuth()
  const { countdowns: cdRepo } = useRepos()
  const queryClient = useQueryClient()
  const [showCreate, setShowCreate] = useState(false)
  const [editTarget, setEditTarget] = useState<Countdown | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Countdown | null>(null)
  const [collapsed, setCollapsed] = useState(false)

  // Create form state
  const [title, setTitle] = useState('')
  const [targetDate, setTargetDate] = useState('')
  const [isYearly, setIsYearly] = useState(false)
  const [color, setColor] = useState(COUNTDOWN_COLORS[0])
  const [icon, setIcon] = useState(COUNTDOWN_ICONS[0])
  const [description, setDescription] = useState('')
  const [showOnHome, setShowOnHome] = useState(true)

  const { data: rawList = [] } = useQuery({
    queryKey: ['countdowns'],
    queryFn: () => cdRepo.list(user!.id),
    enabled: !!user,
  })

  const countdowns = sortCountdowns(rawList.map(enrichCountdown)).filter((c) => c.show_on_home !== false)
  const displayCountdowns = countdowns.slice(0, 4)

  const handleCreate = useCallback(async () => {
    if (!title.trim() || !targetDate || !user) return
    try {
      await cdRepo.create(user.id, {
        title: title.trim(),
        target_date: targetDate,
        is_yearly: isYearly,
        color,
        icon,
        description: description || undefined,
        show_on_home: showOnHome,
        is_pinned: false,
        sort_order: rawList.length,
      })
      queryClient.invalidateQueries({ queryKey: ['countdowns'] })
      setTitle('')
      setTargetDate('')
      setDescription('')
      setShowOnHome(true)
      setShowCreate(false)
      toast.success('Countdown created')
    } catch {
      toast.error('Could not create')
    }
  }, [title, targetDate, isYearly, color, icon, description, showOnHome, user, cdRepo, queryClient, rawList.length])

  const handleTogglePin = useCallback(
    async (c: Countdown) => {
      try {
        await cdRepo.update(user!.id, c.id, { is_pinned: !c.is_pinned } as Partial<Countdown>)
        queryClient.invalidateQueries({ queryKey: ['countdowns'] })
      } catch {
        toast.error('Action failed')
      }
    },
    [user, cdRepo, queryClient]
  )

  const handleDelete = useCallback(async () => {
    if (!deleteTarget || !user) return
    try {
      await cdRepo.delete(user.id, deleteTarget.id)
      queryClient.invalidateQueries({ queryKey: ['countdowns'] })
      setDeleteTarget(null)
      toast.success('Deleted')
    } catch {
      toast.error('Could not delete')
    }
  }, [deleteTarget, user, cdRepo, queryClient])

  const startEdit = useCallback((c: Countdown) => {
    setEditTarget(c)
    setTitle(c.title)
    setTargetDate(c.target_date)
    setIsYearly(c.is_yearly)
    setColor(c.color)
    setIcon(c.icon || COUNTDOWN_ICONS[0])
    setDescription(c.description || '')
    setShowOnHome(c.show_on_home !== false)
  }, [])

  const handleUpdate = useCallback(async () => {
    if (!editTarget || !title.trim() || !targetDate || !user) return
    try {
      await cdRepo.update(user.id, editTarget.id, {
        title: title.trim(),
        target_date: targetDate,
        is_yearly: isYearly,
        color,
        icon,
        description: description || undefined,
        show_on_home: showOnHome,
      } as Partial<Countdown>)
      queryClient.invalidateQueries({ queryKey: ['countdowns'] })
      setEditTarget(null)
      toast.success('Updated')
    } catch {
      toast.error('Could not save')
    }
  }, [editTarget, title, targetDate, isYearly, color, icon, description, showOnHome, user, cdRepo, queryClient])

  const handleArchive = useCallback(
    async (c: Countdown) => {
      try {
        if (c.archived_at) {
          await cdRepo.unarchive(user!.id, c.id)
          toast.success('Unarchived')
        } else {
          await cdRepo.archive(user!.id, c.id)
          toast.success('Archived')
        }
        queryClient.invalidateQueries({ queryKey: ['countdowns'] })
      } catch {
        toast.error('Action failed')
      }
    },
    [user, cdRepo, queryClient]
  )

  if (displayCountdowns.length === 0 && !showCreate) {
    return (
      <Card className="shadow-none">
        <CardContent className="p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-caption text-muted-foreground">
              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
              Countdowns
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-caption text-muted-foreground"
              onClick={() => setShowCreate(true)}
            >
              <Plus className="h-3 w-3" aria-hidden="true" />
              New
            </Button>
          </div>
          <div className="flex flex-col items-center gap-2 py-4 text-center">
            <Clock className="h-6 w-6 text-muted-foreground/60" aria-hidden="true" />
            <p className="text-caption text-muted-foreground">No countdowns yet</p>
            <p className="text-micro text-muted-foreground/80">Add a milestone, exam or vacation</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className="shadow-none">
        <CardContent className="p-3">
          <div className="mb-2 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setCollapsed(!collapsed)}
              aria-expanded={!collapsed}
              className="flex items-center gap-1.5 text-caption text-muted-foreground ui-transition hover:text-foreground"
            >
              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
              Countdowns
              <ChevronRight className={cn('h-3 w-3 transition-transform', !collapsed && 'rotate-90')} aria-hidden="true" />
            </button>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon-xs"
                className="text-muted-foreground"
                onClick={() => setShowCreate(true)}
                aria-label="New countdown"
              >
                <Plus className="h-3 w-3" aria-hidden="true" />
              </Button>
              <Link href="/countdowns">
                <Button variant="ghost" size="sm" className="h-6 text-caption text-muted-foreground">
                  All
                </Button>
              </Link>
            </div>
          </div>

          {!collapsed && (
            <div className="space-y-0.5">
              {displayCountdowns.map((c) => (
                <div
                  key={c.id}
                  className={cn(
                    'group flex min-h-8 items-center gap-2 rounded-md px-2 py-1.5 ui-transition hover:bg-accent/60',
                    c.is_pinned && 'bg-accent/40'
                  )}
                >
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: c.color }}
                    aria-hidden="true"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-body font-medium">{c.title}</div>
                    <div className={cn('text-micro tabular-nums', daysTone(c.days_remaining))}>
                      {c.display_text}
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5 opacity-100 ui-transition focus-within:opacity-100 sm:opacity-0 sm:group-hover:opacity-100">
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      className="text-muted-foreground"
                      onClick={() => startEdit(c)}
                      title="Edit"
                      aria-label={`Edit ${c.title}`}
                    >
                      <Pencil className="h-3 w-3" aria-hidden="true" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      className="text-muted-foreground"
                      onClick={() => handleTogglePin(c)}
                      title={c.is_pinned ? 'Unpin' : 'Pin'}
                      aria-label={c.is_pinned ? 'Unpin' : 'Pin'}
                    >
                      {c.is_pinned ? (
                        <PinOff className="h-3 w-3" aria-hidden="true" />
                      ) : (
                        <Pin className="h-3 w-3" aria-hidden="true" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      className="text-muted-foreground"
                      onClick={() => handleArchive(c)}
                      title={c.archived_at ? 'Unarchive' : 'Archive'}
                      aria-label={c.archived_at ? 'Unarchive' : 'Archive'}
                    >
                      <Archive className="h-3 w-3" aria-hidden="true" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => setDeleteTarget(c)}
                      aria-label={`Delete ${c.title}`}
                    >
                      <Trash2 className="h-3 w-3" aria-hidden="true" />
                    </Button>
                  </div>
                </div>
              ))}

              {/* Inline create form */}
              {showCreate && (
                <div className="space-y-2 rounded-md border border-border bg-surface-2 p-2">
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Countdown title"
                    autoFocus
                    aria-label="Countdown title"
                  />
                  <div className="flex items-center gap-2">
                    <Input
                      type="date"
                      value={targetDate}
                      onChange={(e) => setTargetDate(e.target.value)}
                      className="flex-1 tabular-nums"
                      aria-label="Target date"
                    />
                    <button
                      type="button"
                      onClick={() => setIsYearly(!isYearly)}
                      aria-pressed={isYearly}
                      className={togglePillClass(isYearly)}
                    >
                      Yearly
                    </button>
                  </div>
                  <div className="flex gap-1">
                    {COUNTDOWN_COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setColor(c)}
                        aria-label={`Choose color ${c}`}
                        aria-pressed={color === c}
                        className={cn(
                          'h-5 w-5 rounded-full border-2 ui-transition',
                          color === c ? 'scale-110 border-foreground' : 'border-transparent'
                        )}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-caption"
                      onClick={() => setShowCreate(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      className="text-caption"
                      onClick={handleCreate}
                      disabled={!title.trim() || !targetDate}
                    >
                      Save
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete confirmation */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="shadow-[var(--shadow-pop)] sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-section">Delete countdown</DialogTitle>
            <DialogDescription className="text-caption text-muted-foreground">
              Delete “{deleteTarget?.title}”? This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={!!editTarget} onOpenChange={() => setEditTarget(null)}>
        <DialogContent className="shadow-[var(--shadow-pop)] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-section">Edit countdown</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label className="text-caption text-muted-foreground">Title</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Countdown title"
                autoFocus
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-caption text-muted-foreground">Target date</Label>
                <Input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="tabular-nums"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-caption text-muted-foreground">Description (optional)</Label>
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Description"
                />
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setIsYearly(!isYearly)}
                aria-pressed={isYearly}
                className={togglePillClass(isYearly)}
              >
                Repeat yearly
              </button>
              <button
                type="button"
                onClick={() => setShowOnHome(!showOnHome)}
                aria-pressed={showOnHome}
                className={togglePillClass(showOnHome)}
              >
                Show on home
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {COUNTDOWN_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  aria-label={`Choose color ${c}`}
                  aria-pressed={color === c}
                  className={cn(
                    'h-6 w-6 rounded-full border-2 ui-transition',
                    color === c ? 'scale-110 border-foreground' : 'border-transparent'
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setEditTarget(null)}>Cancel</Button>
            <Button onClick={handleUpdate} disabled={!title.trim() || !targetDate}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
