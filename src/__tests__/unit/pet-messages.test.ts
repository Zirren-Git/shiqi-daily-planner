import { describe, it, expect } from 'vitest'
import {
  buildFocusBubble,
  buildGreetingBubble,
  buildTasksBubble,
  greetingByHour,
  nextBubbleKind,
  PET_BUBBLE_CYCLE,
} from '@/lib/pet/messages'
import type { FocusSession } from '@/types'

function session(partial: Partial<FocusSession>): FocusSession {
  return {
    id: 's1',
    user_id: 'u1',
    mode: 'focus',
    timer_mode: 'countdown',
    planned_minutes: 25,
    actual_seconds: 0,
    status: 'running',
    pause_count: 0,
    ...partial,
  } as FocusSession
}

describe('桌宠气泡：轮播顺序', () => {
  it('四类气泡按序循环', () => {
    expect(PET_BUBBLE_CYCLE).toEqual(['greeting', 'tasks', 'focus', 'dialogue'])
    let kind = nextBubbleKind('greeting')
    expect(kind).toBe('tasks')
    kind = nextBubbleKind(kind)
    expect(kind).toBe('focus')
    kind = nextBubbleKind(kind)
    expect(kind).toBe('dialogue')
    kind = nextBubbleKind(kind)
    expect(kind).toBe('greeting')
  })
})

describe('桌宠气泡：问候语', () => {
  it('按小时段问候', () => {
    expect(greetingByHour(7)).toBe('Good morning')
    expect(greetingByHour(10)).toBe('Good morning')
    expect(greetingByHour(12)).toBe('Good afternoon')
    expect(greetingByHour(15)).toBe('Good afternoon')
    expect(greetingByHour(20)).toBe('Good evening')
    expect(greetingByHour(2)).toBe('Good night')
    expect(greetingByHour(23)).toBe('Good night')
  })

  it('有台词时带上一句，没台词也不出错', () => {
    expect(buildGreetingBubble(9, ['看啥看？'])).toContain('Good morning')
    expect(buildGreetingBubble(9, ['看啥看？'])).toContain('看啥看？')
    expect(buildGreetingBubble(9, [])).toBe('Good morning!')
  })
})

describe('桌宠气泡：剩余任务', () => {
  it('全部完成时夸一句', () => {
    expect(buildTasksBubble([])).toContain('All done for today')
  })

  it('少于等于三件时全部列出', () => {
    const text = buildTasksBubble(['写周报', '取快递'])
    expect(text).toContain('2 tasks remaining')
    expect(text).toContain('写周报, 取快递')
  })

  it('超过三件时只列三件并给出总数', () => {
    const text = buildTasksBubble(['一', '二', '三', '四', '五'])
    expect(text).toContain('5 tasks remaining')
    expect(text).toContain('一, 二, 三 (+2 more)')
    expect(text).not.toContain('四、五')
  })
})

describe('桌宠气泡：专注状态', () => {
  const now = Date.now()

  it('没有专注时给出引导', () => {
    expect(buildFocusBubble(null, now)).toContain('No active focus session')
    expect(buildFocusBubble(session({ status: 'completed' }), now)).toContain('No active focus session')
  })

  it('倒计时给剩余时间', () => {
    const started = new Date(now - 10 * 60 * 1000).toISOString()
    const text = buildFocusBubble(session({ started_at: started }), now)
    expect(text).toContain('Focus remaining')
    expect(text).toContain('15:00')
  })

  it('正计时给已持续时长', () => {
    const started = new Date(now - (25 * 60 + 30) * 1000).toISOString()
    const text = buildFocusBubble(
      session({ timer_mode: 'stopwatch', started_at: started }),
      now
    )
    expect(text).toContain('Focused for')
    expect(text).toContain('25:30')
  })

  it('paused以暂停时点计算', () => {
    const started = new Date(now - 20 * 60 * 1000).toISOString()
    const paused = new Date(now - 5 * 60 * 1000).toISOString()
    const text = buildFocusBubble(session({ started_at: started, paused_at: paused, status: 'paused' }), now)
    expect(text).toContain('paused')
    expect(text).toContain('10:00')
  })
})
