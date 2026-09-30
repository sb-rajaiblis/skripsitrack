import { useState } from 'react'
import { uid } from '../lib/defaults.js'
import { buildEvent, buildIcs, googleCalendarUrl } from '../lib/calendar.js'
import { formatDate, phaseForDate, sessionStats, todayISO } from '../lib/progress.js'

const EMPTY_FORM = { date: '', time: '10:00', duration: 60, topic: '', location: '' }

export default function Sessions({ data, setSessions, goTo }) {
  const { sessions, stages, profile } = data
  const [mode, setMode] = useState('jadwal') // 'jadwal' | 'catat'
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [notice, setNotice] = useState('')
  const today = todayISO()
  const stats = sessionStats(sessions, stages, today)

  const scheduled = sessions
    .filter((s) => s.status === 'terjadwal')
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
  const history = sessions
    .filter((s) => s.status === 'selesai')
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))

  const patch = (id, changes) =>
    setSessions((list) => list.map((s) => (s.id === id ? { ...s, ...changes } : s)))

  const validate = () => {
    const e = {}
    if (!form.date) e.date = 'Tanggal wajib diisi.'
    else if (mode === 'jadwal' && form.date < today) e.date = 'Jadwal tidak boleh di masa lalu. Pakai mode "Catat" untuk bimbingan yang sudah terjadi.'
    else if (mode === 'catat' && form.date > today) e.date = 'Bimbingan yang dicatat harus sudah terjadi.'
    if (!form.time) e.time = 'Jam wajib diisi.'
    const dur = Number(form.duration)
    if (!dur || dur < 15 || dur > 480) e.duration = 'Durasi 15–480 menit.'
    return e
  }

  const openCalendar = (session) => {
    const url = googleCalendarUrl(buildEvent({ session, profile }))
    window.open(url, '_blank', 'noopener')
  }

  const downloadIcs = (session) => {
    const ics = buildIcs(buildEvent({ session, profile }), session.id)
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `bimbingan-${session.date}.ics`
    a.click()
    setTimeout(() => URL.revokeObjectURL(a.href), 1000)
  }

  const submit = (e) => {
    e.preventDefault()
    const errs = validate()
    setErrors(errs)
    if (Object.keys(errs).length) return
    const session = {
      id: uid(),
      ...form,
      duration: Number(form.duration),
      topic: form.topic.trim(),
      location: form.location.trim(),
      status: mode === 'jadwal' ? 'terjadwal' : 'selesai',
      notes: '',
      revisions: [],
    }
    setSessions((list) => [...list, session])
    setForm(EMPTY_FORM)
    if (mode === 'jadwal') {
      openCalendar(session)
      setNotice(
        profile.supervisorEmail
          ? `Jadwal disimpan. Di Google Calendar, klik Save lalu "Send" agar undangan terkirim ke ${profile.supervisorEmail}.`
          : 'Jadwal disimpan. Email dosen belum diisi, jadi undangan belum otomatis dikirim ke dosen.',
      )
    } else {
      setNotice('Bimbingan dicatat. Tambahkan catatan dan revisi di riwayat di bawah.')
    }
  }

  const markDone = (s) => patch(s.id, { status: 'selesai' })
  const remove = (s, label) => {
    if (window.confirm(`Hapus ${label} tanggal ${formatDate(s.date)}?`)) {
      setSessions((list) => list.filter((x) => x.id !== s.id))
    }
  }

  const addRevision = (s, text) =>
    patch(s.id, { revisions: [...s.revisions, { id: uid(), text, done: false }] })
  const toggleRevision = (s, rid) =>
    patch(s.id, {
      revisions: s.revisions.map((r) => (r.id === rid ? { ...r, done: !r.done } : r)),
    })
  const removeRevision = (s, rid) =>
    patch(s.id, { revisions: s.revisions.filter((r) => r.id !== rid) })

  const field = (key) => ({
    value: form[key],
    onChange: (e) => setForm((f) => ({ ...f, [key]: e.target.value })),
    'aria-invalid': errors[key] ? 'true' : undefined,
  })

  return (
    <div className="stack">
      <div className="grid three">
        <section className="card stat">
          <p className="muted">Total bimbingan</p>
          <p className="big">{stats.total}×</p>
        </section>
        <section className="card stat">
          <p className="muted">Sebelum sempro</p>
          <p className="big">{stats.pra}×</p>
        </section>
        <section className="card stat">
          <p className="muted">Sesudah sempro</p>
          <p className="big">{stats.pasca}×</p>
        </section>
      </div>

      <section className="card">
        <div className="segmented" role="tablist">
          <button role="tab" aria-selected={mode === 'jadwal'} className={mode === 'jadwal' ? 'on' : ''} onClick={() => { setMode('jadwal'); setErrors({}) }}>
            Jadwalkan bimbingan
          </button>
          <button role="tab" aria-selected={mode === 'catat'} className={mode === 'catat' ? 'on' : ''} onClick={() => { setMode('catat'); setErrors({}) }}>
            Catat yang sudah terjadi
          </button>
        </div>

        {mode === 'jadwal' && !profile.supervisorEmail && (
          <p className="alert info small">
            Email dosen belum diisi. Isi di{' '}
            <button className="link" onClick={() => goTo('pengaturan')}>Pengaturan</button> supaya
            dosen otomatis diundang ke Google Calendar.
          </p>
        )}

        <form className="form-grid" onSubmit={submit} noValidate>
          <label>
            Tanggal
            <input type="date" min={mode === 'jadwal' ? today : undefined} max={mode === 'catat' ? today : undefined} {...field('date')} />
            {errors.date && <span className="field-error">{errors.date}</span>}
          </label>
          <label>
            Jam
            <input type="time" {...field('time')} />
            {errors.time && <span className="field-error">{errors.time}</span>}
          </label>
          <label>
            Durasi (menit)
            <input type="number" min="15" max="480" step="15" {...field('duration')} />
            {errors.duration && <span className="field-error">{errors.duration}</span>}
          </label>
          <label>
            Lokasi / link meeting
            <input placeholder={profile.location || 'Ruang dosen / Zoom / Teams'} {...field('location')} />
          </label>
          <label className="span-2">
            Topik yang dibahas
            <input placeholder="Misal: Revisi Bab 2 dan rancangan database" {...field('topic')} />
          </label>
          <div className="span-2 row">
            <button className="btn primary">
              {mode === 'jadwal' ? 'Simpan & tambah ke Google Calendar' : 'Catat bimbingan'}
            </button>
          </div>
        </form>
        {notice && <p className="alert success small">{notice}</p>}
      </section>

      <section className="card">
        <h2>Jadwal mendatang</h2>
        {scheduled.length === 0 ? (
          <p className="empty">Belum ada jadwal bimbingan.</p>
        ) : (
          <ul className="session-list">
            {scheduled.map((s) => {
              const past = s.date < today
              return (
                <li key={s.id} className="session">
                  <div>
                    <strong>{formatDate(s.date)} · {s.time}</strong>
                    {past && <span className="pill warn">sudah lewat — sudah jadi bimbingan?</span>}
                    <p className="muted small">{s.topic || 'Tanpa topik'}{s.location && ` · ${s.location}`}</p>
                  </div>
                  <div className="row wrap">
                    <button className="btn" onClick={() => openCalendar(s)}>Google Calendar</button>
                    <button className="btn" onClick={() => downloadIcs(s)}>Unduh .ics</button>
                    <button className="btn primary" onClick={() => markDone(s)}>Tandai selesai</button>
                    <button className="btn danger" onClick={() => remove(s, 'jadwal')}>Hapus</button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <section className="card">
        <h2>Riwayat bimbingan</h2>
        {history.length === 0 ? (
          <p className="empty">Belum ada bimbingan yang tercatat.</p>
        ) : (
          <ul className="session-list">
            {history.map((s, i) => (
              <HistoryItem
                key={s.id}
                s={s}
                number={i + 1}
                phase={phaseForDate(s.date, stages)}
                onNotes={(notes) => patch(s.id, { notes })}
                onAddRevision={(text) => addRevision(s, text)}
                onToggleRevision={(rid) => toggleRevision(s, rid)}
                onRemoveRevision={(rid) => removeRevision(s, rid)}
                onRemove={() => remove(s, 'catatan bimbingan')}
              />
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

function HistoryItem({ s, number, phase, onNotes, onAddRevision, onToggleRevision, onRemoveRevision, onRemove }) {
  const [text, setText] = useState('')
  const open = s.revisions.filter((r) => !r.done).length

  const add = (e) => {
    e.preventDefault()
    if (!text.trim()) return
    onAddRevision(text.trim())
    setText('')
  }

  return (
    <li className="session history">
      <div className="row between wrap">
        <div>
          <strong>Bimbingan ke-{number}</strong>{' '}
          <span className={phase === 'pra' ? 'pill' : 'pill accent'}>
            {phase === 'pra' ? 'sebelum sempro' : 'sesudah sempro'}
          </span>
          {open > 0 && <span className="pill warn">{open} revisi terbuka</span>}
          <p className="muted small">
            {formatDate(s.date)} · {s.time}{s.topic && ` · ${s.topic}`}
          </p>
        </div>
        <button className="btn danger small" onClick={onRemove}>Hapus</button>
      </div>

      <label className="small">
        Catatan dari dosen
        <textarea rows="2" value={s.notes} onChange={(e) => onNotes(e.target.value)} placeholder="Masukan, arahan, atau keputusan dosen…" />
      </label>

      <div className="small">
        <p className="label">Daftar revisi</p>
        {s.revisions.length === 0 && <p className="muted">Belum ada revisi.</p>}
        <ul className="checklist">
          {s.revisions.map((r) => (
            <li key={r.id} className={r.done ? 'done' : ''}>
              <label>
                <input type="checkbox" checked={r.done} onChange={() => onToggleRevision(r.id)} />
                <span>{r.text}</span>
              </label>
              <button className="icon danger" onClick={() => onRemoveRevision(r.id)} aria-label="Hapus revisi">✕</button>
            </li>
          ))}
        </ul>
        <form className="row" onSubmit={add}>
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Tambah revisi, misal: Perbaiki diagram use case" />
          <button className="btn">Tambah</button>
        </form>
      </div>
    </li>
  )
}
