import {
  currentStage,
  daysUntil,
  formatDate,
  overdueStages,
  sessionStats,
  stageProgress,
} from '../lib/progress.js'

export default function Dashboard({ data, goTo }) {
  const { stages, sessions, requirements, profile } = data
  const progress = stageProgress(stages)
  const current = currentStage(stages)
  const overdue = overdueStages(stages)
  const stats = sessionStats(sessions, stages)
  const reqDone = requirements.filter((r) => r.done).length
  const next = stats.upcoming[0]

  return (
    <div className="stack">
      {!profile.supervisorEmail && (
        <div className="alert info">
          Lengkapi judul dan email dosen pembimbing di{' '}
          <button className="link" onClick={() => goTo('pengaturan')}>Pengaturan</button> supaya
          jadwal bimbingan bisa langsung dikirim ke kalender dosen.
        </div>
      )}

      <section className="card hero">
        <div>
          <p className="muted">Progres skripsi</p>
          <p className="big">{progress.percent}%</p>
          <p className="muted">
            {progress.done} dari {progress.total} tahap selesai
          </p>
        </div>
        <div className="hero-right">
          <div className="bar" role="progressbar" aria-valuenow={progress.percent} aria-valuemin="0" aria-valuemax="100">
            <div className="bar-fill" style={{ width: `${progress.percent}%` }} />
          </div>
          <p>
            {current ? (
              <>
                Tahap sekarang: <strong>{current.title}</strong>
                {current.targetDate && <> · target {formatDate(current.targetDate)}</>}
              </>
            ) : (
              <strong>Semua tahap selesai. Selamat! 🎓</strong>
            )}
          </p>
        </div>
      </section>

      {overdue.length > 0 && (
        <div className="alert warn">
          <strong>{overdue.length} tahap melewati target:</strong>{' '}
          {overdue.map((s) => s.title).join(', ')}
        </div>
      )}

      <div className="grid">
        <section className="card stat">
          <p className="muted">Bimbingan</p>
          <p className="big">{stats.total}×</p>
          <p className="muted">
            {stats.pra} sebelum sempro · {stats.pasca} sesudah sempro
          </p>
        </section>

        <section className="card stat">
          <p className="muted">Bimbingan berikutnya</p>
          {next ? (
            <>
              <p className="mid">{formatDate(next.date)} · {next.time}</p>
              <p className="muted">
                {daysUntil(next.date) === 0 ? 'Hari ini' : `${daysUntil(next.date)} hari lagi`}
                {next.topic && ` · ${next.topic}`}
              </p>
            </>
          ) : (
            <>
              <p className="mid">Belum ada jadwal</p>
              <button className="link" onClick={() => goTo('bimbingan')}>Jadwalkan bimbingan →</button>
            </>
          )}
        </section>

        <section className="card stat">
          <p className="muted">Revisi belum beres</p>
          <p className="big">{stats.openRevisions}</p>
          <p className="muted">dari catatan bimbingan</p>
        </section>

        <section className="card stat">
          <p className="muted">Syarat sidang</p>
          <p className="big">
            {reqDone}/{requirements.length}
          </p>
          <p className="muted">dokumen siap</p>
        </section>
      </div>

      <section className="card">
        <h2>Linimasa tahapan</h2>
        <ol className="timeline">
          {stages.map((s) => {
            const late = !s.done && overdue.some((o) => o.id === s.id)
            const cls = s.done ? 'done' : s.id === current?.id ? 'now' : late ? 'late' : ''
            return (
              <li key={s.id} className={cls}>
                <span className="dot" aria-hidden="true" />
                <span className="t-title">{s.title}</span>
                <span className="t-date muted">
                  {s.done
                    ? `selesai ${formatDate(s.doneDate)}`
                    : s.targetDate
                      ? `target ${formatDate(s.targetDate)}`
                      : ''}
                </span>
              </li>
            )
          })}
        </ol>
      </section>
    </div>
  )
}
