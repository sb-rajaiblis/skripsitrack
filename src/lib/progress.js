import { SEMPRO_KEYWORD } from './defaults.js'

export function todayISO(now = new Date()) {
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function stageProgress(stages) {
  const total = stages.length
  const done = stages.filter((s) => s.done).length
  return { total, done, percent: total ? Math.round((done / total) * 100) : 0 }
}

// Tahap yang belum selesai tapi target tanggalnya sudah lewat.
export function overdueStages(stages, today = todayISO()) {
  return stages.filter((s) => !s.done && s.targetDate && s.targetDate < today)
}

export function currentStage(stages) {
  return stages.find((s) => !s.done) || null
}

export function findSemproStage(stages) {
  return stages.find((s) => s.title.toLowerCase().includes(SEMPRO_KEYWORD)) || null
}

// Menentukan apakah sebuah tanggal bimbingan jatuh sebelum atau sesudah sempro.
export function phaseForDate(date, stages) {
  const sempro = findSemproStage(stages)
  if (!sempro || !sempro.done || !sempro.doneDate) return 'pra'
  return date > sempro.doneDate ? 'pasca' : 'pra'
}

export function sessionStats(sessions, stages, today = todayISO()) {
  const done = sessions.filter((s) => s.status === 'selesai')
  const upcoming = sessions
    .filter((s) => s.status === 'terjadwal' && s.date >= today)
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
  const pra = done.filter((s) => phaseForDate(s.date, stages) === 'pra').length
  return {
    total: done.length,
    pra,
    pasca: done.length - pra,
    upcoming,
    openRevisions: sessions.reduce(
      (n, s) => n + (s.revisions || []).filter((r) => !r.done).length,
      0,
    ),
  }
}

export function daysUntil(dateISO, today = todayISO()) {
  const a = new Date(today + 'T00:00:00')
  const b = new Date(dateISO + 'T00:00:00')
  return Math.round((b - a) / 86400000)
}

export function formatDate(iso) {
  if (!iso) return '-'
  return new Date(iso + 'T00:00:00').toLocaleDateString('id-ID', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
