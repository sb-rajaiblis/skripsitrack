import { useEffect, useState } from 'react'
import { loadData, saveData } from './lib/storage.js'
import Dashboard from './components/Dashboard.jsx'
import Stages from './components/Stages.jsx'
import Sessions from './components/Sessions.jsx'
import Requirements from './components/Requirements.jsx'
import Settings from './components/Settings.jsx'

const TABS = [
  { id: 'ringkasan', label: 'Ringkasan' },
  { id: 'tahapan', label: 'Tahapan' },
  { id: 'bimbingan', label: 'Bimbingan' },
  { id: 'syarat', label: 'Syarat Sidang' },
  { id: 'pengaturan', label: 'Pengaturan' },
]

export default function App() {
  const [data, setData] = useState(loadData)
  const [tab, setTab] = useState('ringkasan')
  const [saveError, setSaveError] = useState(false)

  useEffect(() => {
    setSaveError(!saveData(data))
  }, [data])

  const update = (key) => (value) =>
    setData((prev) => ({
      ...prev,
      [key]: typeof value === 'function' ? value(prev[key]) : value,
    }))

  const props = {
    data,
    setProfile: update('profile'),
    setStages: update('stages'),
    setSessions: update('sessions'),
    setRequirements: update('requirements'),
    setData,
    goTo: setTab,
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="logo" aria-hidden="true">✓</span>
          <div>
            <h1>SkripsiTrack</h1>
            <p>{data.profile.title || 'Pantau progres skripsimu dari judul sampai sidang'}</p>
          </div>
        </div>
        <nav className="tabs" aria-label="Menu utama">
          {TABS.map((t) => (
            <button
              key={t.id}
              className={tab === t.id ? 'tab active' : 'tab'}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </header>

      {saveError && (
        <div className="alert error">
          Data tidak bisa disimpan di browser ini. Gunakan menu Pengaturan → Export untuk backup.
        </div>
      )}

      <main>
        {tab === 'ringkasan' && <Dashboard {...props} />}
        {tab === 'tahapan' && <Stages {...props} />}
        {tab === 'bimbingan' && <Sessions {...props} />}
        {tab === 'syarat' && <Requirements {...props} />}
        {tab === 'pengaturan' && <Settings {...props} />}
      </main>

      <footer className="footer">Data tersimpan di browser ini · SkripsiTrack</footer>
    </div>
  )
}
