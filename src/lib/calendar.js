// Membuat link "Tambah ke Google Calendar" dan file .ics tanpa perlu login / API key.

const TZ = 'Asia/Jakarta'

function compact(date, time) {
  // "2026-10-05", "13:30" -> "20261005T133000"
  return date.replaceAll('-', '') + 'T' + time.replace(':', '') + '00'
}

export function addMinutes(date, time, minutes) {
  const [h, m] = time.split(':').map(Number)
  const d = new Date(`${date}T00:00:00`)
  d.setMinutes(h * 60 + m + minutes)
  const pad = (n) => String(n).padStart(2, '0')
  return {
    date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
  }
}

export function buildEvent({ session, profile }) {
  const end = addMinutes(session.date, session.time, Number(session.duration) || 60)
  const who = profile.studentName ? ` – ${profile.studentName}` : ''
  const lines = []
  if (session.topic) lines.push(`Topik: ${session.topic}`)
  if (profile.title) lines.push(`Judul skripsi: ${profile.title}`)
  if (profile.supervisorName) lines.push(`Dosen pembimbing: ${profile.supervisorName}`)
  lines.push('', 'Dibuat dengan SkripsiTrack')
  return {
    title: `Bimbingan Skripsi${who}`,
    start: compact(session.date, session.time),
    end: compact(end.date, end.time),
    details: lines.join('\n'),
    location: session.location || profile.location || '',
    guest: (profile.supervisorEmail || '').trim(),
  }
}

export function googleCalendarUrl(event) {
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${event.start}/${event.end}`,
    details: event.details,
    ctz: TZ,
  })
  if (event.location) params.set('location', event.location)
  if (event.guest) params.set('add', event.guest)
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

function escapeIcs(text) {
  return String(text)
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;')
}

export function buildIcs(event, uidValue = 'skripsitrack') {
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//SkripsiTrack//ID',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VTIMEZONE',
    `TZID:${TZ}`,
    'BEGIN:STANDARD',
    'DTSTART:19700101T000000',
    'TZOFFSETFROM:+0700',
    'TZOFFSETTO:+0700',
    'TZNAME:WIB',
    'END:STANDARD',
    'END:VTIMEZONE',
    'BEGIN:VEVENT',
    `UID:${uidValue}@skripsitrack`,
    `DTSTAMP:${stamp}`,
    `DTSTART;TZID=${TZ}:${event.start}`,
    `DTEND;TZID=${TZ}:${event.end}`,
    `SUMMARY:${escapeIcs(event.title)}`,
    `DESCRIPTION:${escapeIcs(event.details)}`,
  ]
  if (event.location) lines.push(`LOCATION:${escapeIcs(event.location)}`)
  if (event.guest) lines.push(`ATTENDEE;ROLE=REQ-PARTICIPANT;RSVP=TRUE:mailto:${event.guest}`)
  lines.push(
    'BEGIN:VALARM',
    'TRIGGER:-PT1H',
    'ACTION:DISPLAY',
    'DESCRIPTION:Pengingat bimbingan skripsi',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  )
  return lines.join('\r\n')
}

export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}
