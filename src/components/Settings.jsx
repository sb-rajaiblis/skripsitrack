import { useRef, useState } from 'react'
import { createInitialData } from '../lib/defaults.js'
import { normalizeData } from '../lib/storage.js'
import { isValidEmail } from '../lib/calendar.js'
import { todayISO } from '../lib/progress.js'

export default function Settings({ data, setProfile, setData }) {
  const { profile } = data
  const fileRef = useRef(null)
  const [message, setMessage] = useState(null)
  const [profileStatus, setProfileStatus] = useState(null)

  const field = (key) => ({
    value: profile[key],
    onChange: (e) => {
      setProfile((p) => ({ ...p, [key]: e.target.value }))
      setProfileStatus(null)
    },
  })

  const emailInvalid = profile.supervisorEmail && !isValidEmail(profile.supervisorEmail)

  const saveProfile = (e) => {
    e.preventDefault()
    if (emailInvalid) {
      setProfileStatus({ type: 'error', text: 'Email dosen belum benar. Perbaiki dulu sebelum menyimpan.' })
      return
    }
    setProfile((p) =>
      Object.fromEntries(Object.entries(p).map(([k, v]) => [k, typeof v === 'string' ? v.trim() : v])),
    )
    setProfileStatus({ type: 'success', text: '✓ Profil tersimpan.' })
  }

  const exportData = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `skripsitrack-backup-${todayISO()}.json`
    a.click()
    setTimeout(() => URL.revokeObjectURL(a.href), 1000)
    setMessage({ type: 'success', text: 'Backup berhasil diunduh.' })
  }

  const importData = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    try {
      const parsed = normalizeData(JSON.parse(await file.text()))
      if (!window.confirm('Data sekarang akan diganti dengan isi file backup. Lanjutkan?')) return
      setData(parsed)
      setMessage({ type: 'success', text: 'Data berhasil dipulihkan dari backup.' })
    } catch (err) {
      setMessage({ type: 'error', text: `Gagal import: ${err.message}` })
    }
  }

  const reset = () => {
    if (window.confirm('Hapus SEMUA data dan mulai dari template awal? Tindakan ini tidak bisa dibatalkan.')) {
      setData(createInitialData())
      setMessage({ type: 'success', text: 'Data direset ke template awal.' })
    }
  }

  return (
    <div className="stack">
      <section className="card">
        <h2>Profil skripsi</h2>
        <form className="form-grid" onSubmit={saveProfile} noValidate>
          <label>
            Nama mahasiswa
            <input placeholder="Nama lengkap" {...field('studentName')} />
          </label>
          <label>
            Lokasi bimbingan default
            <input placeholder="Misal: Ruang dosen / link Zoom" {...field('location')} />
          </label>
          <label className="span-2">
            Judul skripsi
            <textarea rows="2" placeholder="Judul skripsi (boleh sementara)" {...field('title')} />
          </label>
          <label>
            Nama dosen pembimbing
            <input placeholder="Nama dosen" {...field('supervisorName')} />
          </label>
          <label>
            Email dosen pembimbing
            <input type="email" placeholder="dosen@kampus.ac.id" aria-invalid={emailInvalid ? 'true' : undefined} {...field('supervisorEmail')} />
            {emailInvalid && <span className="field-error">Format email belum benar.</span>}
          </label>
          <div className="span-2 row wrap">
            <button className="btn primary">Simpan profil</button>
            {profileStatus && (
              <span className={profileStatus.type === 'error' ? 'field-error' : 'saved-text'}>{profileStatus.text}</span>
            )}
          </div>
        </form>
        <p className="muted small">
          Perubahan juga tersimpan otomatis di browser. Email dosen dipakai sebagai tamu undangan saat
          menambah jadwal ke Google Calendar.
        </p>
      </section>

      <section className="card">
        <h2>Backup data</h2>
        <p className="muted">
          Data hanya tersimpan di browser ini. Unduh backup secara berkala, terutama sebelum ganti
          perangkat atau menghapus riwayat browser.
        </p>
        <div className="row wrap">
          <button className="btn primary" onClick={exportData}>Export backup (.json)</button>
          <button className="btn" onClick={() => fileRef.current?.click()}>Import backup</button>
          <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={importData} />
          <button className="btn danger" onClick={reset}>Reset semua data</button>
        </div>
        {message && <p className={`alert small ${message.type}`}>{message.text}</p>}
      </section>
    </div>
  )
}
