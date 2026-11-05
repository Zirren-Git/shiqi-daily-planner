'use client'

import { useCallback, useRef } from 'react'
import { useAuth } from '@/providers/auth-provider'
import { useRepos } from '@/providers/repo-provider'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { RecurrenceRule } from '@/types'
import { todayStr } from '@/lib/utils/date'
import { toast } from 'sonner'

// Stable template IDs for deduplication
export const RECOMMENDED_HABITS = [
  {
    template_id: 'recommended-exercise',
    name: 'Exercise',
    description: 'Exercise daily to stay healthy',
    icon: 'Dumbbell',
    color: '#10b981',
    measurement_type: 'duration' as const,
    target_value: 30,
    unit: 'minutes',
    schedule_rule: { frequency: 'weekdays' as const, interval: 1 },
  },
  {
    template_id: 'recommended-water',
    name: 'Drink water',
    description: 'Drink eight glasses of water each day',
    icon: 'Droplets',
    color: '#06b6d4',
    measurement_type: 'count' as const,
    target_value: 8,
    unit: 'glasses',
    schedule_rule: { frequency: 'daily' as const, interval: 1 },
  },
  {
    template_id: 'recommended-sleep',
    name: 'Sleep',
    description: 'Get enough sleep each night',
    icon: 'Moon',
    color: '#8b5cf6',
    measurement_type: 'duration' as const,
    target_value: 8,
    unit: 'hours',
    schedule_rule: { frequency: 'daily' as const, interval: 1 },
  },
  {
    template_id: 'recommended-reading',
    name: 'Read',
    description: 'Read for 30 minutes daily',
    icon: 'BookOpen',
    color: '#f59e0b',
    measurement_type: 'duration' as const,
    target_value: 30,
    unit: 'minutes',
    schedule_rule: { frequency: 'daily' as const, interval: 1 },
  },
  {
    template_id: 'recommended-early-rise',
    name: 'Wake up early',
    description: 'Wake up before 7 a.m.',
    icon: 'Sunrise',
    color: '#f97316',
    measurement_type: 'boolean' as const,
    target_value: 1,
    unit: undefined,
    schedule_rule: { frequency: 'daily' as const, interval: 1 },
  },
]

type RecommendedHabit = (typeof RECOMMENDED_HABITS)[number]

export function useRecommendedHabits() {
  const { user } = useAuth()
  const { habits: habitRepo, users: userRepo } = useRepos()
  const queryClient = useQueryClient()
  const initializedRef = useRef(false)

  const { data: existingHabits = [] } = useQuery({
    queryKey: ['habits'],
    queryFn: () => habitRepo.getAll(user!.id, true),
    enabled: !!user,
  })

  const { data: prefs } = useQuery({
    queryKey: ['userPreferences'],
    queryFn: () => userRepo.getPreferences(user!.id),
    enabled: !!user,
  })

  // Check if recommended habits have been initialized
  const isInitialized = prefs != null && (prefs as unknown as Record<string, unknown>).habits_initialized === true

  // Auto-initialize on first run (idempotent)
  const addRecommended = useCallback(
    async (habit: RecommendedHabit) => {
      if (!user) return null
      // Check by template_id stored in description or name dedup
      const exists = existingHabits.some(
        (h) =>
          h.name === habit.name &&
          h.measurement_type === habit.measurement_type
      )
      if (exists) return null

      try {
        return await habitRepo.create(user.id, {
          name: habit.name,
          description: `${habit.description} [${habit.template_id}]`,
          icon: habit.icon,
          color: habit.color,
          measurement_type: habit.measurement_type,
          target_value: habit.target_value,
          unit: habit.unit,
          schedule_rule: habit.schedule_rule as RecurrenceRule,
          start_date: todayStr(),
        })
      } catch {
        return null
      }
    },
    [user, existingHabits, habitRepo]
  )

  const addAllRecommended = useCallback(async () => {
    if (!user || initializedRef.current) return
    initializedRef.current = true

    let added = 0
    for (const habit of RECOMMENDED_HABITS) {
      const result = await addRecommended(habit)
      if (result) added++
    }

    if (added > 0) {
      // Mark as initialized
      try {
        await userRepo.upsertPreferences(user.id, {
          habits_initialized: true,
        } as Partial<import('@/types').UserPreferences>)
      } catch {
        // Non-critical
      }
      queryClient.invalidateQueries({ queryKey: ['habits'] })
      toast.success(`Added ${added} recommended habits`)
    }
  }, [user, addRecommended, userRepo, queryClient])

  const addSingleHabit = useCallback(
    async (habit: RecommendedHabit) => {
      const result = await addRecommended(habit)
      if (result) {
        queryClient.invalidateQueries({ queryKey: ['habits'] })
        toast.success(`Added “${habit.name}”`)
      } else {
        toast('This habit already exists')
      }
    },
    [addRecommended, queryClient]
  )

  return {
    recommendedHabits: RECOMMENDED_HABITS,
    isInitialized,
    addAllRecommended,
    addSingleHabit,
    existingHabits,
  }
}
