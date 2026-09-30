import { useState } from 'react'
import { uid } from '../lib/defaults.js'

export default function Requirements({ data, setRequirements }) {
  const { requirements } = data
  const [text, setText] = useState('')
  const [error, setError] = useState('')
  const done = requirements.filter((r) => r.done).length
  const percent = requirements.length ? Math.round((done / requirements.length) * 100) : 0

  const add = (e) => {
    e.preventDefault()
    if (!text.trim()) return setError('Nama syarat tidak boleh kosong.')
    setRequirements((list) => [...list, { id: uid(), text: text.trim(), done: false }])
    setText('')
    setError('')
  }

  const toggle = (id) =>
    setRequirements((list) => list.map((r) => (r.id === id ? { ...r, done: !r.done } : r)))

  const remove = (r) => {
    if (window.confirm(`Hapus syarat "${r.text}"?`)) {
      setRequirements((list) => list.filter((x) => x.id !== r.id))
    }
  }

  return (
    <section className="card">
      <div className="row between">
        <h2>Syarat pendaftaran sidang</h2>
        <span className="pill">{done}/{requirements.length} siap</span>
      </div>
      <div className="bar"><div className="bar-fill" style={{ width: `${percent}%` }} /></div>
      <p className="muted">Sesuaikan dengan buku panduan skripsi di kampus/jurusanmu.</p>

      {requirements.length === 0 && <p className="empty">Belum ada syarat. Tambahkan di bawah.</p>}

      <ul className="checklist big-items">
        {requirements.map((r) => (
          <li key={r.id} className={r.done ? 'done' : ''}>
            <label>
              <input type="checkbox" checked={r.done} onChange={() => toggle(r.id)} />
              <span>{r.text}</span>
            </label>
            <button className="icon danger" onClick={() => remove(r)} aria-label="Hapus syarat">✕</button>
          </li>
        ))}
      </ul>

      <form className="row" onSubmit={add}>
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Tambah syarat, misal: Bukti publikasi jurnal" />
        <button className="btn primary">Tambah</button>
      </form>
      {error && <p className="field-error">{error}</p>}
    </section>
  )
}
