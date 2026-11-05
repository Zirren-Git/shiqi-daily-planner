'use client'

import { useState } from 'react'
import { useAuth } from '@/providers/auth-provider'
import { HabitCheckin } from '@/components/habits/habit-checkin'
import { HabitCheckinErrorWrapper } from '@/components/habits/habit-checkin-error-wrapper'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useMediaQuery } from '@/hooks/use-media-query'
import { useRepos } from '@/providers/repo-provider'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { todayStr } from '@/lib/utils/date'
import { toast } from 'sonner'
import { Bell } from 'lucide-react'
import type { MeasurementType } from '@/types'

export default function HabitsPage() {
  const { user } = useAuth()
  const { habits } = useRepos()
  const queryClient = useQueryClient()
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')
  const [newType, setNewType] = useState<MeasurementType>('boolean')
  const [newTarget, setNewTarget] = useState('1')
  const [newUnit, setNewUnit] = useState('')
  const [reminderTime, setReminderTime] = useState('')
  const isDesktop = useMediaQuery('(min-width: 768px)')

  const createMutation = useMutation({
    mutationFn: () =>
      habits.create(user!.id, {
        name: newName,
        measurement_type: newType,
        target_value: Number(newTarget),
        unit: newUnit || undefined,
        schedule_rule: { frequency: 'daily', interval: 1 },
        start_date: todayStr(),
        reminder_time: reminderTime || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] })
      setShowCreate(false)
      setNewName('')
      setReminderTime('')
      toast.success('Habit created')
    },
    onError: () => toast.error('Could not create'),
  })

  if (!user) return null

  const form = (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        if (!newName.trim()) return
        createMutation.mutate()
      }}
      className="space-y-4"
    >
      <div className="space-y-2">
        <Label htmlFor="habit-name">Habit name</Label>
        <Input
          id="habit-name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="e.g. reading, exercise, bedtime"
          autoFocus
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Measurement</Label>
          <Select value={newType} onValueChange={(v: string | null) => v && setNewType(v as MeasurementType)}>
            <SelectTrigger>
              <SelectValue>
                {{ boolean: 'Done / Not done', count: 'Count', duration: 'minutes', minutes: 'minutes', hours: 'hours', numeric: 'Custom value' }[newType] || newType}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="boolean">Done / Not done</SelectItem>
              <SelectItem value="count">Count</SelectItem>
              <SelectItem value="minutes">minutes</SelectItem>
              <SelectItem value="hours">hours</SelectItem>
              <SelectItem value="numeric">Custom value</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Target</Label>
          <Input value={newTarget} onChange={(e) => setNewTarget(e.target.value)} type="number" />
        </div>
      </div>
      {newType !== 'boolean' && (
        <div className="space-y-2">
          <Label>Unit</Label>
          <Input value={newUnit} onChange={(e) => setNewUnit(e.target.value)} placeholder="e.g. times, minutes, items" />
        </div>
      )}
      <div className="space-y-2">
        <Label className="flex items-center gap-1.5">
          <Bell className="h-3.5 w-3.5 text-muted-foreground" />
          Reminder time
        </Label>
        <Input type="time" value={reminderTime} onChange={(e) => setReminderTime(e.target.value)} />
        <p className="text-micro text-muted-foreground">Remind me to check in at this time each day (optional)</p>
      </div>
      <Button type="submit" className="w-full" disabled={createMutation.isPending || !newName.trim()}>
        Create habit
      </Button>
    </form>
  )

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-display">Habit tracking</h1>
          <p className="mt-1 text-caption text-muted-foreground">Keep it up every day</p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4" />New habit
        </Button>
      </div>

      <HabitCheckinErrorWrapper>
        <HabitCheckin />
      </HabitCheckinErrorWrapper>

      {/* Create dialog */}
      {isDesktop ? (
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>New habit</DialogTitle>
            </DialogHeader>
            {form}
          </DialogContent>
        </Dialog>
      ) : (
        <Drawer open={showCreate} onOpenChange={setShowCreate}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>New habit</DrawerTitle>
            </DrawerHeader>
            <div className="px-4 pb-4">{form}</div>
          </DrawerContent>
        </Drawer>
      )}
    </div>
  )
}
