import { GTC_URL, parseGtcCalendar } from '@/lib/integrations/gtc'

export async function GET() {
  // Static desktop/Android builds have no server to refresh this feed.
  if (process.env.BUILD_STATIC === '1') return Response.json({ error: 'unavailable' }, { status: 503 })
  try {
    const response = await fetch(GTC_URL, { signal: AbortSignal.timeout(10000), cache: 'no-store' })
    if (!response.ok) throw new Error('upstream unavailable')
    const bytes = await response.arrayBuffer()
    const charset = /charset=([\w-]+)/i.exec(response.headers.get('content-type') ?? '')?.[1] ?? 'windows-1252'
    const html = new TextDecoder(charset).decode(bytes)
    // URL v=45 refers to the autumn school term; use the school year spanning today.
    const now = new Date()
    const schoolYear = now.getUTCFullYear() - (now.getUTCMonth() < 7 ? 1 : 0)
    const events = parseGtcCalendar(html, schoolYear)
    if (!events.length) throw new Error('no events parsed')
    return Response.json(events, { headers: { 'Cache-Control': 'no-store' } })
  } catch {
    return Response.json({ error: 'GTC calendar unavailable' }, { status: 502 })
  }
}
