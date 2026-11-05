import { describe, expect, it } from 'vitest'
import { parseGtcCalendar } from '@/lib/integrations/gtc'

describe('GTC exam calendar', () => {
  it('imports each entry on a day and rolls January into the next year', () => {
    const html = `<table><tr><td>v.47</td><td>Mån&nbsp;16/11<br><b>Prov</b><br>Elektriska Kretsar<br><i>Anders Dahlberg</i><br>Registreringstidpunkt:<br>2026-09-29 13:54:47<br><b>Prov</b><br>Elektronik delprov<br><i>Ulrika Holm</i><br>Registreringstidpunkt:<br>2026-09-29 10:28:29</td><td>Tis 17/11</td></tr><tr><td>v.2</td><td>Ons 13/1<br><b>Presentation</b><br>Litteraturseminarium<br><i>Liselotte Johansson</i><br>Registreringstidpunkt:<br>2026-09-14 15:28:36</td></tr></table>`
    const events = parseGtcCalendar(html, 2026)
    expect(events).toHaveLength(3)
    expect(events.map(e => e.date)).toEqual(['2026-11-16', '2026-11-16', '2027-01-13'])
    expect(events[0].title).toBe('Prov: Elektriska Kretsar')
    expect(events[1].title).toBe('Prov: Elektronik delprov')
  })
  it('ignores empty dates', () => {
    expect(parseGtcCalendar('<tr><td>Mån 2/11</td></tr>', 2026)).toEqual([])
  })
})
