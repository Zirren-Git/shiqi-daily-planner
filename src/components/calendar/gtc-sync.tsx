'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useAuth } from '@/providers/auth-provider'
import { useRepos } from '@/providers/repo-provider'
import { useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { GTC_URL, parseGtcCalendar, type GtcEvent } from '@/lib/integrations/gtc'
import { IS_LOCAL_ONLY } from '@/lib/runtime'
import { Capacitor, CapacitorHttp } from '@capacitor/core'
import type { Task } from '@/types'

const enabledKey = (userId: string) => `gtc-calendar-enabled:${userId}`
const marker = 'GTC source: '
function schoolYear() {
  const now = new Date()
  return now.getFullYear() - (now.getMonth() < 7 ? 1 : 0)
}

export function GtcSync() {
  const { user } = useAuth()
  const { tasks } = useRepos()
  const queryClient = useQueryClient()
  const [enabled, setEnabled] = useState(() => user ? localStorage.getItem(enabledKey(user.id)) === 'true' : false)
  const inFlight = useRef(false)
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const sync = useCallback(async () => {
    if (!user || inFlight.current) return
    inFlight.current = true
    setBusy(true)
    try {
      let events: GtcEvent[]
      if (IS_LOCAL_ONLY && Capacitor.isNativePlatform()) {
        // Native HTTP bypasses WebView CORS restrictions on Android.
        const response = await CapacitorHttp.get({ url: GTC_URL, responseType: 'text', connectTimeout: 10000, readTimeout: 10000 })
        if (response.status !== 200 || typeof response.data !== 'string') throw new Error('fetch failed')
        events = parseGtcCalendar(response.data, schoolYear())
      } else {
        const response = await fetch('/api/gtc', { cache: 'no-store' })
        if (!response.ok) throw new Error('fetch failed')
        events = parseGtcCalendar(await response.text(), schoolYear())
      }
      if (!Array.isArray(events) || !events.length) throw new Error('empty feed')
      const existing = await tasks.filter(user.id, { dateFrom: events[0].date, dateTo: events[events.length - 1].date, maxResults: 10000 })
      const byKey = new Map(existing.filter(t => t.description?.includes(marker)).map(t => [t.description!.split(marker)[1]?.split('\n')[0], t]))
      let added = 0
      for (const event of events) {
        const description = `${event.description}\n${marker}${event.key}`
        const previous = byKey.get(event.key)
        if (previous) {
          if (previous.title !== event.title || previous.task_date !== event.date || previous.description !== description) {
            await tasks.update(user.id, previous.id, { title: event.title, task_date: event.date, description })
          }
        } else {
          await tasks.create(user.id, { title: event.title, description, task_date: event.date, period: 'morning', priority: 'normal', status: 'todo', order_index: 0 } as Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>)
          added++
        }
      }
      await queryClient.invalidateQueries({ queryKey: ['tasks'] })
      setMessage(`同步完成，新增 ${added} 项；打开日历时会重新检查。`)
    } catch {
      setMessage('无法获取 GTC 考试日程。请稍后重试；已有日程不会被删除。')
    } finally {
      inFlight.current = false
      setBusy(false)
    }
  }, [user, tasks, queryClient])

  useEffect(() => {
    if (!enabled || !user) return
    const timer = window.setTimeout(() => void sync(), 0)
    return () => window.clearTimeout(timer)
  }, [enabled, user, sync])

  return <div className="border-b px-4 py-2 text-sm">
    <div className="flex flex-wrap items-center gap-2">
      <span>GTC T1cs 考试日程</span>
      <Button size="sm" variant="outline" onClick={() => {
        const next = !enabled
        if (user) localStorage.setItem(enabledKey(user.id), String(next))
        setEnabled(next)
      }}>{enabled ? '关闭自动同步' : '开启自动同步'}</Button>
      {enabled && <Button size="sm" variant="ghost" disabled={busy} onClick={() => void sync()}>{busy ? '同步中…' : '立即同步'}</Button>}
      <a className="underline" href={GTC_URL} target="_blank" rel="noopener noreferrer">查看来源</a>
    </div>
    {message && <p role="status" className="mt-1 text-muted-foreground">{message}</p>}
  </div>
}
