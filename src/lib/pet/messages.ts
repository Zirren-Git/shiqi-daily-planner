// ============================================================
// 桌宠气泡文案（纯函数，便于单元测试）
// 桌宠 = 浮窗的另一种形态：左键轮播 问候 / 剩余任务 / 专注状态
// ============================================================

import { formatClock } from '@/lib/focus/focus-core'
import type { FocusSession, TimerMode } from '@/types'

export type PetBubbleKind = 'greeting' | 'tasks' | 'focus' | 'dialogue'

export const PET_BUBBLE_CYCLE: PetBubbleKind[] = ['greeting', 'tasks', 'focus', 'dialogue']

export function nextBubbleKind(current: PetBubbleKind): PetBubbleKind {
  const index = PET_BUBBLE_CYCLE.indexOf(current)
  return PET_BUBBLE_CYCLE[(index + 1) % PET_BUBBLE_CYCLE.length]
}

/** 按当前小时返回问候语 */
export function greetingByHour(hour: number): string {
  if (hour < 5) return 'Good night'
  if (hour < 9) return 'Good morning'
  if (hour < 12) return 'Good morning'
  if (hour < 14) return 'Good afternoon'
  if (hour < 18) return 'Good afternoon'
  if (hour < 23) return 'Good evening'
  return 'Good night'
}

/** 问候气泡：问候语 + 一句角色台词（台词可以是空数组） */
export function buildGreetingBubble(hour: number, dialogueLines: string[]): string {
  const greeting = greetingByHour(hour)
  const line = dialogueLines.length
    ? dialogueLines[Math.floor(Math.random() * dialogueLines.length)]
    : ''
  return line ? `${greeting}!\n${line}` : `${greeting}!`
}

/** 剩余任务气泡：还剩几件 + 最多列三件 */
export function buildTasksBubble(remainingTitles: string[]): string {
  if (remainingTitles.length === 0) return 'All done for today!\nGreat job!'
  const preview = remainingTitles.slice(0, 3).join(', ')
  const more = remainingTitles.length > 3 ? ` (+${remainingTitles.length - 3} more)` : ''
  return `${remainingTitles.length} tasks remaining\n${preview}${more}`
}

/** 专注状态气泡：倒计时给剩余，正计时给已持续 */
export function buildFocusBubble(session: FocusSession | null, now: number): string {
  if (!session || (session.status !== 'running' && session.status !== 'paused')) {
    return 'No active focus session\nStart one from the widget'
  }
  const mode: TimerMode = session.timer_mode || 'countdown'
  const start = session.started_at ? new Date(session.started_at).getTime() : now
  const reference = session.paused_at ? new Date(session.paused_at).getTime() : now
  const elapsed = Math.max(0, Math.floor((reference - start) / 1000))

  if (mode === 'stopwatch') {
    const prefix = session.status === 'paused' ? 'Focus paused\nTime spent' : 'Focused for'
    return `${prefix} ${formatClock(elapsed)}`
  }
  const remaining = Math.max(0, session.planned_minutes * 60 - elapsed)
  const prefix = session.status === 'paused' ? 'Focus paused\nRemaining' : 'Focus remaining'
  return `${prefix} ${formatClock(remaining)}`
}

/** 桌宠形态（表情）的中文标签 */
export const PET_EXPRESSION_LABELS: Record<string, string> = {
  idle: 'Idle',
  happy: 'Happy',
  thinking: 'Thinking',
  working: 'Working',
  error: 'Error',
  sleepy: 'Sleepy',
}
