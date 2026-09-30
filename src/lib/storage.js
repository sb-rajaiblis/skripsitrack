import { createInitialData } from './defaults.js'

const KEY = 'skripsitrack:data'

export function loadData() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return createInitialData()
    return normalizeData(JSON.parse(raw))
  } catch {
    return createInitialData()
  }
}

export function saveData(data) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data))
    return true
  } catch {
    return false
  }
}

// Pastikan data dari localStorage / file import punya bentuk yang benar.
export function normalizeData(input) {
  const base = createInitialData()
  if (!input || typeof input !== 'object') throw new Error('Format data tidak valid')
  if (!Array.isArray(input.stages) || !Array.isArray(input.sessions)) {
    throw new Error('File bukan backup SkripsiTrack')
  }
  return {
    version: 1,
    profile: { ...base.profile, ...(input.profile || {}) },
    stages: input.stages,
    sessions: input.sessions.map((s) => ({ revisions: [], ...s })),
    requirements: Array.isArray(input.requirements) ? input.requirements : base.requirements,
  }
}
