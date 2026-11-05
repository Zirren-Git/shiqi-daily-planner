// ============================================================
// Unified display labels — all internal→Chinese mappings
// Used by every Select, display, and form in the app
// ============================================================

import type { Period, CalendarView, WeekStartDay, TaskStatus, Difficulty, UrgencyLevel } from '@/types'

// ---------- Period ----------

export const PERIOD_LABELS: Record<Period, string> = {
  morning: 'Morning',
  afternoon: 'Afternoon',
  evening: 'Evening',
}

export function getPeriodLabel(period: string): string {
  return PERIOD_LABELS[period as Period] || period
}

// ---------- Task Status ----------

export const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: 'To do',
  in_progress: 'In progress',
  done: 'Completed',
  cancelled: 'Cancelled',
}

export function getStatusLabel(status: string): string {
  return STATUS_LABELS[status as TaskStatus] || status
}

// ---------- Difficulty ----------

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
  very_hard: 'Very hard',
}

export function getDifficultyLabel(d: string): string {
  return DIFFICULTY_LABELS[d as Difficulty] || d
}

// ---------- Urgency (auto-calculated) ----------

export const URGENCY_LABELS: Record<UrgencyLevel, string> = {
  overdue: 'Overdue',
  urgent: 'Urgent',
  soon: 'Soon',
  upcoming: 'Upcoming',
  plenty: 'Plenty of time',
  none: 'No deadline',
}

// ---------- Calendar View ----------

export const CALENDAR_VIEW_LABELS: Record<CalendarView, string> = {
  month: 'Month view',
  week: 'Week view',
  day: 'Day view',
}

// ---------- Week Start Day ----------

export const WEEK_START_LABELS: Record<WeekStartDay, string> = {
  0: 'Sun',
  1: 'Mon',
  6: 'Sat',
}

// ---------- Weekday names ----------

export const WEEKDAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const

// ---------- Focus mode ----------

export const FOCUS_MODE_LABELS = {
  focus: 'Focus',
  short_break: 'Short break',
  long_break: 'Long break',
} as const

// ---------- Measurement Type ----------

export const MEASUREMENT_TYPE_LABELS: Record<string, string> = {
  boolean: 'Done / Not done',
  count: 'Count',
  duration: 'minutes',
  minutes: 'minutes',
  hours: 'hours',
  numeric: 'Custom value',
}

export function getMeasurementTypeLabel(type: string): string {
  return MEASUREMENT_TYPE_LABELS[type] || type
}

// ---------- Select placeholder text ----------

export const SELECT_PLACEHOLDER = {
  tag: 'Choose a tag',
  period: 'Choose a period',
  difficulty: 'Choose difficulty',
  status: 'Choose status',
  focusCategory: 'Choose a focus category',
  noTag: 'Uncategorized',
  tagDeleted: 'Deleted tag',
  calendarView: 'Choose view',
  weekStart: 'Choose start day',
} as const

// ---------- Tag display helpers ----------

export interface TagLike {
  id: string
  name: string
  color: string
}

/**
 * Look up a tag by id from a tag list. Returns the tag or null.
 */
export function findTagById(tags: TagLike[], tagId: string | undefined | null): TagLike | null {
  if (!tagId) return null
  return tags.find((t) => t.id === tagId) || null
}

/**
 * Get the display name for a tag reference.
 * - tagId null/undefined → "Uncategorized"
 * - tag exists → tag.name
 * - tag not found → "Deleted tag"
 */
export function getTagDisplayName(tags: TagLike[], tagId: string | undefined | null): string {
  if (!tagId) return SELECT_PLACEHOLDER.noTag
  const tag = findTagById(tags, tagId)
  if (!tag) return SELECT_PLACEHOLDER.tagDeleted
  return tag.name
}

/**
 * Get the color for a tag reference. Returns undefined if no tag.
 */
export function getTagColor(tags: TagLike[], tagId: string | undefined | null): string | undefined {
  if (!tagId) return undefined
  return findTagById(tags, tagId)?.color
}
