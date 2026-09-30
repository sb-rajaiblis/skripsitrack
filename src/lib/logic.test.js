import { describe, expect, it } from 'vitest'
import { addMinutes, buildEvent, buildIcs, googleCalendarUrl, isValidEmail } from './calendar.js'
import { overdueStages, phaseForDate, sessionStats, stageProgress } from './progress.js'
import { normalizeData } from './storage.js'

const stages = [
  { id: 'a', title: 'Proposal', done: true, targetDate: '2026-09-01', doneDate: '2026-09-01' },
  { id: 'b', title: 'Seminar proposal (sempro)', done: true, targetDate: '', doneDate: '2026-10-10' },
  { id: 'c', title: 'Sidang', done: false, targetDate: '2026-09-15', doneDate: '' },
]

describe('progress', () => {
  it('menghitung persentase tahap', () => {
    expect(stageProgress(stages)).toEqual({ total: 3, done: 2, percent: 67 })
    expect(stageProgress([]).percent).toBe(0)
  })

  it('mendeteksi tahap yang lewat target', () => {
    expect(overdueStages(stages, '2026-10-01').map((s) => s.id)).toEqual(['c'])
  })

  it('memisahkan bimbingan sebelum/sesudah sempro', () => {
    expect(phaseForDate('2026-10-05', stages)).toBe('pra')
    expect(phaseForDate('2026-10-20', stages)).toBe('pasca')
    expect(phaseForDate('2026-10-20', [{ ...stages[1], done: false }])).toBe('pra')
  })

  it('menghitung jumlah bimbingan & revisi terbuka', () => {
    const sessions = [
      { id: '1', date: '2026-10-01', time: '10:00', status: 'selesai', revisions: [{ done: false }, { done: true }] },
      { id: '2', date: '2026-10-20', time: '10:00', status: 'selesai', revisions: [] },
      { id: '3', date: '2026-10-25', time: '09:00', status: 'terjadwal', revisions: [] },
    ]
    const s = sessionStats(sessions, stages, '2026-10-21')
    expect(s.total).toBe(2)
    expect(s.pra).toBe(1)
    expect(s.pasca).toBe(1)
    expect(s.openRevisions).toBe(1)
    expect(s.upcoming.map((x) => x.id)).toEqual(['3'])
  })
})

describe('calendar', () => {
  const profile = { studentName: 'Steven', title: 'Deteksi Anime', supervisorName: 'Pak Dosen', supervisorEmail: 'dosen@petra.ac.id', location: '' }
  const session = { id: 'x1', date: '2026-10-05', time: '23:30', duration: 60, topic: 'Bab 2', location: 'Ruang P.201' }

  it('menambah menit melewati tengah malam', () => {
    expect(addMinutes('2026-10-05', '23:30', 60)).toEqual({ date: '2026-10-06', time: '00:30' })
  })

  it('membuat link Google Calendar dengan dosen sebagai tamu', () => {
    const url = new URL(googleCalendarUrl(buildEvent({ session, profile })))
    expect(url.searchParams.get('action')).toBe('TEMPLATE')
    expect(url.searchParams.get('dates')).toBe('20261005T233000/20261006T003000')
    expect(url.searchParams.get('add')).toBe('dosen@petra.ac.id')
    expect(url.searchParams.get('ctz')).toBe('Asia/Jakarta')
    expect(url.searchParams.get('text')).toBe('Bimbingan Skripsi – Steven')
  })

  it('tidak menambah tamu jika email kosong', () => {
    const url = new URL(googleCalendarUrl(buildEvent({ session, profile: { ...profile, supervisorEmail: '' } })))
    expect(url.searchParams.has('add')).toBe(false)
  })

  it('membuat file .ics yang valid', () => {
    const ics = buildIcs(buildEvent({ session, profile }), 'x1')
    expect(ics).toContain('DTSTART;TZID=Asia/Jakarta:20261005T233000')
    expect(ics).toContain('ATTENDEE;ROLE=REQ-PARTICIPANT;RSVP=TRUE:mailto:dosen@petra.ac.id')
    expect(ics.startsWith('BEGIN:VCALENDAR')).toBe(true)
  })

  it('validasi email', () => {
    expect(isValidEmail('a@b.co')).toBe(true)
    expect(isValidEmail('bukan email')).toBe(false)
  })
})

describe('storage', () => {
  it('menolak file yang bukan backup', () => {
    expect(() => normalizeData({ foo: 1 })).toThrow()
  })
  it('melengkapi data backup lama', () => {
    const d = normalizeData({ stages: [], sessions: [{ id: '1' }] })
    expect(d.sessions[0].revisions).toEqual([])
    expect(d.requirements.length).toBeGreaterThan(0)
  })
})
