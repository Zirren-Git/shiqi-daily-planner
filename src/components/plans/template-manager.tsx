'use client'

import { useState } from 'react'
import { useAuth } from '@/providers/auth-provider'
import { useRepos } from '@/providers/repo-provider'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { Skeleton } from '@/components/ui/skeleton'
import { useMediaQuery } from '@/hooks/use-media-query'
import { PERIOD_LABELS, PRIORITY_LABELS } from '@/lib/constants'
import { todayStr } from '@/lib/utils/date'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
  Plus,
  Trash2,
  FileText,
  Play,
} from 'lucide-react'
import type { TaskTemplate, Task, Period, Priority } from '@/types'
import { PERIOD_CLASS } from '@/lib/period-style'
interface TemplateManagerProps {
  onApply?: (template: Partial<Task>) => void
}

export function TemplateManager({ onApply }: TemplateManagerProps) {
  const { user } = useAuth()
  const { taskTemplates, tasks } = useRepos()
  const queryClient = useQueryClient()
  const isDesktop = useMediaQuery('(min-width: 768px)')
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')
  /** 待删除的模板：用应用内弹窗代替 window.confirm */
  const [pendingDelete, setPendingDelete] = useState<{ id: string; name: string } | null>(null)

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['taskTemplates'],
    queryFn: () => taskTemplates.getAll(user!.id),
    enabled: !!user,
  })

  const createMutation = useMutation({
    mutationFn: () =>
      taskTemplates.create(user!.id, {
        name: newName,
        description: newDesc || undefined,
        template_data: [],
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taskTemplates'] })
      setShowCreate(false)
      setNewName('')
      setNewDesc('')
      toast.success('Template created')
    },
    onError: () => toast.error('Could not create'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => taskTemplates.delete(user!.id, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taskTemplates'] })
      toast.success('Template deleted')
    },
    onError: () => toast.error('Could not delete'),
  })

  const handleApply = async (template: TaskTemplate) => {
    if (onApply) {
      onApply(template.template_data[0] as Partial<Task>)
      toast.success(`Applied template “${template.name}”`)
      return
    }
    // Create a task from the template data
    if (template.template_data.length > 0) {
      const taskData = template.template_data[0] as Partial<Task>
      try {
        await tasks.create(user!.id, {
          title: taskData.title || 'Untitled task',
          description: taskData.description,
          task_date: todayStr(),
          period: taskData.period || 'morning',
          priority: taskData.priority || 'normal',
          status: 'todo',
          estimated_minutes: taskData.estimated_minutes,
          tag_id: taskData.tag_id,
          order_index: 0,
        } as Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>)
        queryClient.invalidateQueries({ queryKey: ['tasks'] })
        toast.success(`Created task from template “${template.name}”`)
      } catch {
        toast.error('Could not create')
      }
    }
  }

  const createFormContent = (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        if (!newName.trim()) return
        createMutation.mutate()
      }}
      className="space-y-4"
    >
      <div className="space-y-3">
        <div className="space-y-2">
          <Label htmlFor="tpl-name" className="text-caption text-muted-foreground">
            Template name
          </Label>
          <Input
            id="tpl-name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="e.g. daily stand-up, weekly report"
            autoFocus
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tpl-desc" className="text-caption text-muted-foreground">
            Description (optional)
          </Label>
          <Textarea
            id="tpl-desc"
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            placeholder="Describe the template"
            rows={2}
            className="rounded-md"
          />
        </div>
      </div>
      <div className="flex justify-end border-t border-border pt-4">
        <Button type="submit" disabled={createMutation.isPending || !newName.trim()}>
          Create template
        </Button>
      </div>
    </form>
  )

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-7 w-24" />
        {[1, 2].map((i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <h3 className="text-section">Task templates</h3>
          {templates.length > 0 && (
            <span className="rounded-full bg-secondary px-2 py-0.5 text-micro tabular-nums text-secondary-foreground">
              {templates.length}
            </span>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowCreate(true)}
        >
          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
          New template
        </Button>
      </div>

      {/* Empty state */}
      {templates.length === 0 && (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border px-3 py-6 text-center">
          <FileText className="h-7 w-7 text-muted-foreground/60" aria-hidden="true" />
          <p className="text-body text-muted-foreground">No templates yet</p>
          <p className="text-caption text-muted-foreground/80">Create templates from frequently used tasks</p>
        </div>
      )}

      {/* Template list */}
      <div className="space-y-2">
        {templates.map((template) => (
          <div
            key={template.id}
            className="surface surface-interactive p-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-body font-medium">{template.name}</p>
                {template.description && (
                  <p className="mt-0.5 truncate text-caption text-muted-foreground">
                    {template.description}
                  </p>
                )}
                {template.template_data.length > 0 && (
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    {template.template_data[0].period && (
                      <span
                        className={cn(
                          'period-chip rounded-full px-2 py-0.5 text-micro',
                          PERIOD_CLASS[template.template_data[0].period as Period]
                        )}
                      >
                        {PERIOD_LABELS[template.template_data[0].period as Period]}
                      </span>
                    )}
                    {template.template_data[0].priority && (
                      <span className="rounded-full border border-border px-2 py-0.5 text-micro text-muted-foreground">
                        {PRIORITY_LABELS[template.template_data[0].priority as Priority]}
                      </span>
                    )}
                    {template.template_data[0].estimated_minutes && (
                      <span className="rounded-full border border-border px-2 py-0.5 text-micro tabular-nums text-muted-foreground">
                        {template.template_data[0].estimated_minutes} minutes
                      </span>
                    )}
                  </div>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => handleApply(template)}
                  title="Apply template"
                  aria-label={`Apply template ${template.name}`}
                >
                  <Play className="h-3.5 w-3.5" aria-hidden="true" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => setPendingDelete({ id: template.id, name: template.name })}
                  title="Delete template"
                  aria-label={`Delete template ${template.name}`}
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create dialog */}
      {isDesktop ? (
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogContent className="shadow-[var(--shadow-pop)] sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-section">New template</DialogTitle>
            </DialogHeader>
            {createFormContent}
          </DialogContent>
        </Dialog>
      ) : (
        <Drawer open={showCreate} onOpenChange={setShowCreate}>
          <DrawerContent className="shadow-[var(--shadow-pop)]">
            <DrawerHeader>
              <DrawerTitle className="text-section">New template</DrawerTitle>
            </DrawerHeader>
            <div className="px-4 pb-4">{createFormContent}</div>
          </DrawerContent>
        </Drawer>
      )}

      {/* 删除确认（替代 window.confirm） */}
      <Dialog
        open={!!pendingDelete}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null)
        }}
      >
        <DialogContent className="shadow-[var(--shadow-pop)] sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-section">Delete template</DialogTitle>
            <DialogDescription className="text-caption text-muted-foreground">
              Delete “{pendingDelete?.name}”? Existing tasks created from this template will remain.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setPendingDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (pendingDelete) deleteMutation.mutate(pendingDelete.id)
                setPendingDelete(null)
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
