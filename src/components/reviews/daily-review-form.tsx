'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useRepos } from '@/providers/repo-provider'
import { useAuth } from '@/providers/auth-provider'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { todayStr } from '@/lib/utils/date'
import type { DailyReview, DailyReviewFormData } from '@/types'
import { Star, Smile, Zap, Save, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface DailyReviewFormProps {
  date?: string
  onSaved?: () => void
}

export function DailyReviewForm({ date = todayStr(), onSaved }: DailyReviewFormProps) {
  const { user } = useAuth()
  const { dailyReviews } = useRepos()
  const queryClient = useQueryClient()

  const { data: existingReview, isLoading } = useQuery({
    queryKey: ['dailyReview', date],
    queryFn: () => dailyReviews.getByDate(user!.id, date),
    enabled: !!user,
  })

  const mutation = useMutation({
    mutationFn: (data: Omit<DailyReview, 'id' | 'user_id' | 'created_at' | 'updated_at'>) =>
      dailyReviews.upsert(user!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dailyReview', date] })
      queryClient.invalidateQueries({ queryKey: ['reviews'] })
      toast.success('Review saved')
      onSaved?.()
    },
    onError: () => {
      toast.error('Could not save. Please try again.')
    },
  })

  const form = useForm<DailyReviewFormData>({
    defaultValues: {
      score: undefined,
      subjective_completion: undefined,
      mood: undefined,
      energy: undefined,
      achievement: '',
      unfinished: '',
      problems: '',
      lessons: '',
      tomorrow_focus: '',
      summary: '',
    },
  })

  useEffect(() => {
    if (existingReview) {
      form.reset({
        score: existingReview.score,
        subjective_completion: existingReview.subjective_completion,
        mood: existingReview.mood,
        energy: existingReview.energy,
        achievement: existingReview.achievement || '',
        unfinished: existingReview.unfinished || '',
        problems: existingReview.problems || '',
        lessons: existingReview.lessons || '',
        tomorrow_focus: existingReview.tomorrow_focus || '',
        summary: existingReview.summary || '',
      })
    }
  }, [existingReview, form])

  const handleSubmit = (data: DailyReviewFormData) => {
    if (!user) return
    mutation.mutate({
      review_date: date,
      ...data,
      score: data.score ?? undefined,
      subjective_completion: data.subjective_completion ?? undefined,
      mood: data.mood ?? undefined,
      energy: data.energy ?? undefined,
    })
  }

  if (isLoading) return <Skeleton className="h-32 w-full rounded-lg" />

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)}>
      <div className="surface overflow-hidden">
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
          <div>
            <p className="text-section">Daily rating</p>
            <p className="mt-0.5 text-micro text-muted-foreground">Capture how you felt and what you learned today</p>
          </div>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save
          </Button>
        </div>

        <div className="space-y-4 p-4">
          {/* Quick scores */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <ScoreSelect
              label="Rating"
              icon={<Star className="h-3.5 w-3.5" />}
              value={form.watch('score')}
              onChange={(v) => form.setValue('score', v ?? undefined)}
              max={10}
            />
            <ScoreSelect
              label="Progress"
              value={form.watch('subjective_completion')}
              onChange={(v) => form.setValue('subjective_completion', v ?? undefined)}
              max={100}
              step={10}
              unit="%"
              includeZero
            />
            <ScoreSelect
              label="Mood"
              icon={<Smile className="h-3.5 w-3.5" />}
              value={form.watch('mood')}
              onChange={(v) => form.setValue('mood', v ?? undefined)}
              max={5}
            />
            <ScoreSelect
              label="Energy"
              icon={<Zap className="h-3.5 w-3.5" />}
              value={form.watch('energy')}
              onChange={(v) => form.setValue('energy', v ?? undefined)}
              max={5}
            />
          </div>

          {/* Text fields */}
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-caption text-muted-foreground">Today’s biggest achievement</Label>
              <Textarea
                {...form.register('achievement')}
                placeholder="What did you accomplish today?"
                rows={2}
                className="text-body"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-caption text-muted-foreground">Unfinished tasks</Label>
              <Textarea
                {...form.register('unfinished')}
                placeholder="What did not go to plan?"
                rows={2}
                className="text-body"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-caption text-muted-foreground">Challenges</Label>
              <Textarea
                {...form.register('problems')}
                placeholder="What was difficult?"
                rows={2}
                className="text-body"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-caption text-muted-foreground">What I learned</Label>
              <Textarea
                {...form.register('lessons')}
                placeholder="What did you learn today?"
                rows={2}
                className="text-body"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-caption text-muted-foreground">Tomorrow’s top three priorities</Label>
              <Textarea
                {...form.register('tomorrow_focus')}
                placeholder="What matters most tomorrow?"
                rows={2}
                className="text-body"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-caption text-muted-foreground">Additional notes</Label>
              <Textarea
                {...form.register('summary')}
                placeholder="Anything else to note…"
                rows={3}
                className="text-body"
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}

function ScoreSelect({
  label,
  icon,
  value,
  onChange,
  max,
  step = 1,
  unit = '',
  includeZero = false,
}: {
  label: string
  icon?: React.ReactNode
  value?: number
  onChange: (v: number | null) => void
  max: number
  step?: number
  unit?: string
  includeZero?: boolean
}) {
  const baseOptions = Array.from({ length: max / step }, (_, i) => (i + 1) * step)
  const options = includeZero ? [0, ...baseOptions] : baseOptions
  const stringValue = value != null ? value.toString() : ''

  // 纯展示：用横向小方块预览当前档位
  const blocks = Math.round(max / step)
  const filled = value != null ? Math.round(value / step) : 0

  return (
    <div className="space-y-1.5 rounded-md bg-surface-2 p-3">
      <div className="flex items-center justify-between gap-2">
        <Label className="flex items-center gap-1.5 text-caption text-muted-foreground">
          {icon}
          {label}
        </Label>
        <span className="text-micro tabular-nums text-muted-foreground">
          {value != null ? `${value}${unit}` : '—'}
        </span>
      </div>
      <Select value={stringValue} onValueChange={(v: string | null) => onChange(v ? Number(v) : null)}>
        <SelectTrigger className="h-8 text-caption">
          <SelectValue placeholder="—" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">—</SelectItem>
          {options.map((n) => (
            <SelectItem key={n} value={n.toString()}>
              {n}{unit}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <div className="flex items-center gap-0.5" aria-hidden>
        {Array.from({ length: blocks }).map((_, i) => (
          <span
            key={i}
            className={`h-1.5 flex-1 rounded-full ${i < filled ? 'bg-primary' : 'bg-muted'}`}
          />
        ))}
      </div>
    </div>
  )
}
