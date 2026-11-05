/** GTC's public exam calendar is an HTML table, not an iCalendar feed. */
export const GTC_URL = 'https://www.gtc.com/provschema/kalender.asp?v=45&klass=T1cs'
export type GtcEvent = { key: string; date: string; title: string; description: string }

function text(html: string): string {
  return html.replace(/<br\s*\/?\s*>/gi, '\n').replace(/<[^>]*>/g, '')
    .replace(/&nbsp;|&#160;/gi, ' ').replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"').replace(/&#39;|&apos;/gi, "'")
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
    .replace(/[ \t]+/g, ' ').trim()
}

/** Extract all entries (including multiple exams on one day) without importing empty days. */
export function parseGtcCalendar(html: string, schoolYear: number): GtcEvent[] {
  const events: GtcEvent[] = []
  // The page displays weeks from August to June. The year advances at January.
  const rows = html.match(/<tr\b[^>]*>[\s\S]*?<\/tr>/gi) ?? []
  for (const row of rows) {
    const cells = row.match(/<td\b[^>]*>[\s\S]*?<\/td>/gi) ?? []
    for (const cell of cells) {
      const day = text(cell).match(/(?:Mån|Tis|Ons|Tor|Fre|Lör|Sön)\s*(\d{1,2})\s*\/\s*(\d{1,2})/i)
      if (!day) continue
      const month = Number(day[2]), dateNumber = Number(day[1])
      if (month < 1 || month > 12 || dateNumber < 1 || dateNumber > 31) continue
      const year = schoolYear + (month < 8 ? 1 : 0)
      const date = `${year}-${String(month).padStart(2, '0')}-${String(dateNumber).padStart(2, '0')}`
      // Registration timestamps separate entries; the category/title precede each timestamp.
      const lines = text(cell).split('\n').map(line => line.trim()).filter(Boolean)
      const first = lines.findIndex(line => /(?:Mån|Tis|Ons|Tor|Fre|Lör|Sön)\s*\d{1,2}\s*\/\s*\d{1,2}/i.test(line))
      let segment: string[] = []
      for (const line of lines.slice(first + 1)) {
        if (/Registreringstidpunkt:/i.test(line)) {
          const cleaned = segment.filter(part => !/^(?:Registreringstidpunkt|\d{4}-\d\d-\d\d)/i.test(part))
          if (cleaned.length >= 2) {
            const [category, name, ...teacher] = cleaned
            const title = `${category}: ${name}`
            const description = `${teacher.join(' ')}\n${GTC_URL}`.trim()
            // An entry's registration timestamp stays stable when another entry is added.
            const stamp = line.match(/\d{4}-\d\d-\d\d\s+\d\d:\d\d:\d\d/)?.[0]
            const key = stamp ?? `${date}|${category}|${name}|${teacher.join(' ')}`
            events.push({ key, date, title, description })
          }
          segment = []
        } else if (!/^\d{4}-\d\d-\d\d\s+\d\d:\d\d:\d\d$/.test(line)) {
          segment.push(line)
        }
      }
    }
  }
  return events
}
