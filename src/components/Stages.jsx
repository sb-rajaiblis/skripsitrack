import { useState } from 'react'
import { uid } from '../lib/defaults.js'
import { stageProgress, todayISO } from '../lib/progress.js'

export default function Stages({ data, setStages }) {
  const { stages } = data
  const [newTitle, setNewTitle] = useState('')
  const [error, setError] = useState('')
  const progress = stageProgress(stages)

  const patch = (id, changes) =>
    setStages((list) => list.map((s) => (s.id === id ? { ...s, ...changes } : s)))

  const toggle = (s) =>
    patch(s.id, { done: !s.done, doneDate: !s.done ? s.doneDate || todayISO() : '' })

  const move = (index, dir) =>
    setStages((list) => {
      const target = index + dir
      if (target < 0 || target >= list.length) return list
      const copy = [...list]
      ;[copy[index], copy[target]] = [copy[target], copy[index]]
      return copy
    })

  const remove = (s) => {
    if (window.confirm(`Hapus tahap "${s.title}"?`)) {
      setStages((list) => list.filter((x) => x.id !== s.id))
    }
  }

  const add = (e) => {
    e.preventDefault()
    const title = newTitle.trim()
    if (!title) return setError('Nama tahap tidak boleh kosong.')
    setStages((list) => [...list, { id: uid(), title, done: false, targetDate: '', doneDate: '' }])
    setNewTitle('')
    setError('')
  }

  return (
    <div className="stack">
      <section className="card">
        <div className="row between">
          <h2>Tahapan skripsi</h2>
          <span className="pill">{progress.done}/{progress.total} selesai</span>
        </div>
        <p className="muted">
          Tahapan tiap kampus bisa berbeda. Ubah nama, urutan, dan target tanggalnya sesuai aturan
          kampusmu. Tahap yang namanya mengandung kata <em>sempro</em> dipakai untuk memisahkan
          bimbingan sebelum dan sesudah sempro.
        </p>

        {stages.length === 0 && <p className="empty">Belum ada tahap. Tambahkan di bawah.</p>}

        <ul className="stage-list">
          {stages.map((s, i) => (
            <li key={s.id} className={s.done ? 'stage done' : 'stage'}>
              <input
                type="checkbox"
                checked={s.done}
                onChange={() => toggle(s)}
                aria-label={`Tandai ${s.title} selesai`}
              />
              <div className="stage-body">
                <input
                  className="stage-title"
                  value={s.title}
                  onChange={(e) => patch(s.id, { title: e.target.value })}
                  aria-label="Nama tahap"
                />
                <div className="row wrap small">
                  <label>
                    Target
                    <input
                      type="date"
                      value={s.targetDate}
                      onChange={(e) => patch(s.id, { targetDate: e.target.value })}
                    />
                  </label>
                  {s.done && (
                    <label>
                      Selesai
                      <input
                        type="date"
                        value={s.doneDate}
                        onChange={(e) => patch(s.id, { doneDate: e.target.value })}
                      />
                    </label>
                  )}
                </div>
              </div>
              <div className="stage-actions">
                <button className="icon" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Naikkan">↑</button>
                <button className="icon" onClick={() => move(i, 1)} disabled={i === stages.length - 1} aria-label="Turunkan">↓</button>
                <button className="icon danger" onClick={() => remove(s)} aria-label="Hapus">✕</button>
              </div>
            </li>
          ))}
        </ul>

        <form className="row" onSubmit={add}>
          <input
            placeholder="Tambah tahap baru, misal: Seminar hasil"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />
          <button className="btn primary">Tambah</button>
        </form>
        {error && <p className="field-error">{error}</p>}
      </section>
    </div>
  )
}
