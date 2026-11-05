'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { useMediaQuery } from '@/hooks/use-media-query'
import { Calendar, CalendarRange, List } from 'lucide-react'

export type RecurrenceActionScope = 'this' | 'future' | 'all'

interface RecurrenceActionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (scope: RecurrenceActionScope) => void
  action: 'edit' | 'delete'
  title?: string
}

function ScopeOption({
  icon,
  title,
  description,
  onClick,
}: {
  icon: React.ReactNode
  title: string
  description: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="surface surface-interactive group flex w-full items-start gap-3 p-3 text-left"
    >
      <span className="mt-0.5 shrink-0 text-muted-foreground ui-transition group-hover:text-foreground">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-body font-medium">{title}</span>
        <span className="mt-0.5 block text-caption text-muted-foreground">{description}</span>
      </span>
    </button>
  )
}

export function RecurrenceActionDialog({
  open,
  onOpenChange,
  onSelect,
  action,
  title,
}: RecurrenceActionDialogProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)')

  const content = (
    <div className="space-y-4">
      <div className="space-y-2">
        <ScopeOption
          icon={<Calendar className="h-5 w-5" aria-hidden="true" />}
          title={action === 'edit' ? 'Edit this occurrence' : 'Delete this occurrence'}
          description={
            action === 'edit'
              ? 'Change only this occurrence'
              : 'Delete only this occurrence'
          }
          onClick={() => {
            onSelect('this')
            onOpenChange(false)
          }}
        />

        <ScopeOption
          icon={<CalendarRange className="h-5 w-5" aria-hidden="true" />}
          title={action === 'edit' ? 'Edit this and future' : 'Delete this and future'}
          description={
            action === 'edit'
              ? 'Change this and future occurrences'
              : 'Delete this and future occurrences'
          }
          onClick={() => {
            onSelect('future')
            onOpenChange(false)
          }}
        />

        <ScopeOption
          icon={<List className="h-5 w-5" aria-hidden="true" />}
          title={action === 'edit' ? 'Edit entire series' : 'Delete entire series'}
          description={
            action === 'edit'
              ? 'Change all occurrences, past and future'
              : 'Delete all occurrences, past and future'
          }
          onClick={() => {
            onSelect('all')
            onOpenChange(false)
          }}
        />
      </div>

      <div className="flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          className="text-caption text-muted-foreground"
          onClick={() => onOpenChange(false)}
        >
          Cancel
        </Button>
      </div>
    </div>
  )

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="shadow-[var(--shadow-pop)] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-section">
              {action === 'edit' ? 'Edit recurring task' : 'Delete recurring task'}
            </DialogTitle>
            <DialogDescription className="truncate text-caption text-muted-foreground">
              {title && `“${title}” repeats. Choose which occurrences to affect.`}
              {!title && 'Choose which occurrences to affect'}
            </DialogDescription>
          </DialogHeader>
          {content}
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="shadow-[var(--shadow-pop)]">
        <DrawerHeader>
          <DrawerTitle className="text-section">
            {action === 'edit' ? 'Edit recurring task' : 'Delete recurring task'}
          </DrawerTitle>
          <DrawerDescription className="text-caption text-muted-foreground">
            {title && `“${title}” repeats. Choose which occurrences to affect.`}
          </DrawerDescription>
        </DrawerHeader>
        <div className="px-4 pb-4">{content}</div>
      </DrawerContent>
    </Drawer>
  )
}
