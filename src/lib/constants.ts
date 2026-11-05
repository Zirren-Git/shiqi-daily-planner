import type { Tag, Period } from '@/types'
import {
  PERIOD_LABELS as _PERIOD_LABELS,
  STATUS_LABELS as _STATUS_LABELS,
  DIFFICULTY_LABELS as _DIFFICULTY_LABELS,
  CALENDAR_VIEW_LABELS as _CALENDAR_VIEW_LABELS,
  WEEK_START_LABELS as _WEEK_START_LABELS,
  WEEKDAY_NAMES as _WEEKDAY_NAMES,
  URGENCY_LABELS as _URGENCY_LABELS,
} from '@/lib/display-labels'

// Re-export display labels so existing imports don't break
export {
  _PERIOD_LABELS as PERIOD_LABELS,
  _STATUS_LABELS as STATUS_LABELS,
  _DIFFICULTY_LABELS as DIFFICULTY_LABELS,
  _CALENDAR_VIEW_LABELS as CALENDAR_VIEW_LABELS,
  _WEEK_START_LABELS as WEEK_START_LABELS,
  _WEEKDAY_NAMES as WEEKDAY_NAMES,
  _URGENCY_LABELS as URGENCY_LABELS,
}

// ---------- App branding ----------

export const APP_NAME = 'ShiQi'
export const APP_SHORT_NAME = 'ShiQi'
export const APP_DESCRIPTION = 'Plan your day, track habits and reflect on your progress'

// ---------- Default tags ----------

export const DEFAULT_TAGS: Omit<Tag, 'user_id' | 'created_at' | 'updated_at'>[] = [
  { id: 'tag-learning', name: 'Study', color: '#3b82f6', icon: 'BookOpen', is_default: true, is_visible: true, sort_order: 0 },
  { id: 'tag-research', name: 'Research', color: '#8b5cf6', icon: 'FlaskConical', is_default: true, is_visible: true, sort_order: 1 },
  { id: 'tag-work', name: 'Work', color: '#f59e0b', icon: 'Briefcase', is_default: true, is_visible: true, sort_order: 2 },
  { id: 'tag-exercise', name: 'Exercise', color: '#10b981', icon: 'Dumbbell', is_default: true, is_visible: true, sort_order: 3 },
  { id: 'tag-life', name: 'Life', color: '#ec4899', icon: 'Heart', is_default: true, is_visible: true, sort_order: 4 },
  { id: 'tag-rest', name: 'Rest', color: '#6b7280', icon: 'Moon', is_default: true, is_visible: true, sort_order: 5 },
  { id: 'tag-social', name: 'Social', color: '#06b6d4', icon: 'Users', is_default: true, is_visible: true, sort_order: 6 },
  { id: 'tag-other', name: 'Other', color: '#94a3b8', icon: 'Ellipsis', is_default: true, is_visible: true, sort_order: 7 },
]

export const PERIOD_ORDER: Period[] = ['morning', 'afternoon', 'evening']

// ---------- Priority (legacy — kept for backward compat) ----------

export const PRIORITY_LABELS = {
  low: 'Low',
  normal: 'Normal',
  high: 'High',
  urgent: 'Urgent',
} as const

export const PRIORITY_COLORS = {
  low: 'text-slate-500',
  normal: 'text-blue-600 dark:text-blue-400',
  high: 'text-orange-600 dark:text-orange-400',
  urgent: 'text-red-600 dark:text-red-400',
} as const

export const DIFFICULTY_COLORS = {
  easy: 'text-emerald-600 dark:text-emerald-400',
  medium: 'text-blue-600 dark:text-blue-400',
  hard: 'text-orange-600 dark:text-orange-400',
  very_hard: 'text-red-600 dark:text-red-400',
} as const

export const URGENCY_COLORS = {
  overdue: 'text-red-600 dark:text-red-400',
  urgent: 'text-red-500 dark:text-red-400',
  soon: 'text-orange-500 dark:text-orange-400',
  upcoming: 'text-amber-500 dark:text-amber-400',
  plenty: 'text-slate-400 dark:text-slate-500',
  none: 'text-muted-foreground',
} as const

// ---------- Select placeholder labels ----------

export const SELECT_LABELS = {
  tagNone: 'Uncategorized',
  noOption: 'Please select',
} as const

// ---------- Focus mode labels ----------

export const FOCUS_MODE_LABELS = {
  focus: 'Focus',
  short_break: 'Short break',
  long_break: 'Long break',
} as const

// ---------- Navigation ----------

export const NAV_ITEMS = [
  { href: '/calendar', label: 'Calendar', icon: 'Calendar' },
  { href: '/today', label: 'Today', icon: 'Sun' },
  { href: '/habits', label: 'Check in', icon: 'CheckSquare' },
  { href: '/insights', label: 'Insights', icon: 'BarChart3' },
  { href: '/settings', label: 'Settings', icon: 'Settings' },
] as const

// ---------- Keyboard shortcuts ----------

export const KEYBOARD_SHORTCUTS = {
  newTask: 'n',
  today: 't',
  monthView: 'm',
  weekView: 'w',
  dayView: 'd',
  search: '/',
  close: 'Escape',
} as const

// ---------- IndexedDB ----------

export const DB_NAME = 'my-plan-calendar-db'
export const DB_VERSION = 3

// ---------- Local storage keys ----------

export const STORAGE_KEYS = {
  lastView: 'plan-calendar-last-view',
  lastDate: 'plan-calendar-last-date',
  userPreferences: 'plan-calendar-preferences',
  draftReview: 'plan-calendar-draft-review',
} as const
