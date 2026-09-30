# CLAUDE.md — SkripsiTrack

Aturan proyek untuk AI coding agent (Claude). Baca file ini sebelum mengubah kode.

## Tentang proyek

SkripsiTrack membantu mahasiswa memantau progres skripsi: tahapan, log bimbingan,
jadwal bimbingan ke Google Calendar (dosen ikut diundang), dan syarat sidang.
Dibuat untuk Vibe Coding Challenge NusaLab 2026.

## Stack

- React 19 + Vite, JavaScript (tanpa TypeScript)
- Data disimpan di `localStorage` (key `skripsitrack:data`), tanpa backend
- Test: Vitest (`npm test`)
- Styling: satu file `src/index.css` dengan CSS variables (mendukung dark mode)

## Struktur

```
src/
  App.jsx              state utama + navigasi tab
  components/          UI per tab (Dashboard, Stages, Sessions, Requirements, Settings)
  lib/
    defaults.js        template tahapan & syarat, uid()
    storage.js         load/save/normalize data (localStorage + import backup)
    progress.js        perhitungan progres, fase pra/pasca sempro, statistik bimbingan
    calendar.js        link Google Calendar & file .ics
    logic.test.js      unit test untuk semua logika di lib/
```

## Aturan

1. Logika (hitung, validasi, format) ditaruh di `src/lib/`, bukan di komponen. Komponen hanya UI.
2. Setiap perubahan logika di `lib/` harus disertai test di `logic.test.js`.
3. Jangan tambah dependency tanpa alasan jelas. Tidak perlu library UI, state manager, atau date library.
4. Jangan tambah backend, login, atau API key. Google Calendar memakai link template (`action=TEMPLATE`), bukan API.
5. Semua teks UI dalam Bahasa Indonesia.
6. Perubahan struktur data wajib tetap bisa membaca data lama (lihat `normalizeData`).
7. Tindakan menghapus selalu minta konfirmasi. Form selalu divalidasi dan menampilkan pesan error.
8. Zona waktu jadwal: `Asia/Jakarta`.
9. Jaga perubahan tetap kecil dan fokus; jangan refactor bagian yang tidak diminta.

## Alur kerja

1. **Pahami** — baca file terkait sebelum mengubah.
2. **Rencanakan** — jelaskan rencana singkat untuk perubahan yang menyentuh lebih dari satu file.
3. **Kerjakan** — perubahan kecil dan terfokus.
4. **Verifikasi** — jalankan `npm test` dan `npm run build` sebelum menyatakan selesai.

## Perintah

```bash
npm install     # pasang dependency
npm run dev     # jalankan di http://localhost:5173
npm test        # unit test
npm run build   # build produksi ke dist/
```
