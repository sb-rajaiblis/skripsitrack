// Template bawaan. Tahapan & syarat bisa diubah pengguna sesuai aturan kampusnya.

export const DEFAULT_STAGES = [
  'Pengajuan judul / topik',
  'Penetapan dosen pembimbing',
  'Penyusunan proposal (Bab 1–3)',
  'Seminar proposal (sempro)',
  'Revisi hasil sempro',
  'Pengerjaan sistem / penelitian',
  'Penulisan Bab 4–5',
  'Pendaftaran sidang',
  'Sidang skripsi',
  'Revisi & pengumpulan final',
]

export const DEFAULT_REQUIREMENTS = [
  'Lembar persetujuan dosen pembimbing',
  'Kartu / log bimbingan lengkap',
  'Cek plagiarisme',
  'Transkrip nilai / jumlah SKS terpenuhi',
  'Sertifikat bahasa Inggris (jika diwajibkan)',
  'Naskah skripsi final untuk penguji',
]

export const SEMPRO_KEYWORD = 'sempro'

export function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4)
}

export function createInitialData() {
  return {
    version: 1,
    profile: {
      studentName: '',
      title: '',
      supervisorName: '',
      supervisorEmail: '',
      location: '',
    },
    stages: DEFAULT_STAGES.map((title) => ({
      id: uid(),
      title,
      done: false,
      targetDate: '',
      doneDate: '',
    })),
    sessions: [],
    requirements: DEFAULT_REQUIREMENTS.map((text) => ({ id: uid(), text, done: false })),
  }
}
