# SkripsiTrack 🎓

Aplikasi web sederhana untuk **memantau progres skripsi** — dari pengajuan judul sampai sidang —
lengkap dengan catatan bimbingan dan penjadwalan bimbingan ke **Google Calendar** yang otomatis
mengundang dosen pembimbing.

> Dibuat untuk **Vibe Coding Challenge NusaLab 2026**.

**Demo:** _(isi link Vercel di sini)_

## Masalah yang diselesaikan

Saat mengerjakan skripsi, mahasiswa sering:

- **Kehilangan gambaran progres** — sudah sampai tahap mana, apa yang terlambat dari target.
- **Lupa isi dan jumlah bimbingan** — catatan dosen tersebar di chat, kertas, dan ingatan;
  padahal banyak kampus meminta bukti jumlah bimbingan sebelum sempro/sidang.
- **Revisi dari dosen terlewat** — permintaan revisi tidak tercatat, baru ketahuan saat bimbingan berikutnya.
- **Repot membuat janji bimbingan** — dosen meminta jadwal dimasukkan ke Google Calendar,
  sehingga harus mengetik ulang judul, waktu, dan email dosen setiap kali.

Masalah ini saya alami sendiri saat mengerjakan skripsi.

## Fitur

| Fitur | Keterangan |
|---|---|
| **Ringkasan** | Persentase progres, tahap saat ini, peringatan tahap yang lewat target, linimasa |
| **Tahapan skripsi** | Template umum yang bisa diubah nama, urutan, target tanggal, ditambah/dihapus — karena tiap kampus berbeda |
| **Log bimbingan** | Hitung otomatis sudah berapa kali bimbingan, dipisah **sebelum** dan **sesudah sempro** |
| **Catatan & revisi** | Catatan dosen per bimbingan + checklist revisi yang bisa dicentang |
| **Jadwal ke Google Calendar** | Satu klik membuka Google Calendar dengan acara terisi, **email dosen sudah jadi tamu** |
| **File .ics** | Alternatif untuk Outlook / kalender iPhone, dengan pengingat 1 jam sebelumnya |
| **Syarat sidang** | Checklist dokumen yang bisa disesuaikan |
| **Backup** | Export/import data ke file JSON |

Tanpa login, tanpa server, gratis. Data tersimpan di browser pengguna.

## Cara menjalankan

Butuh [Node.js](https://nodejs.org) versi 20 ke atas.

```bash
git clone <url-repo-ini>
cd skripsitrack
npm install
npm run dev
```

Buka `http://localhost:5173`.

Perintah lain:

```bash
npm test        # menjalankan unit test
npm run build   # build produksi ke folder dist/
```

## Cara pakai singkat

1. Buka **Pengaturan**, isi nama, judul skripsi, dan **email dosen pembimbing**.
2. Di **Tahapan**, sesuaikan tahapan dengan aturan kampus dan isi target tanggal.
3. Di **Bimbingan → Jadwalkan bimbingan**, isi tanggal & jam lalu klik
   *Simpan & tambah ke Google Calendar*. Di Google Calendar klik **Save** lalu **Send**
   agar undangan terkirim ke dosen.
4. Setelah bimbingan, klik **Tandai selesai**, lalu tulis catatan dan revisi dari dosen.

## Teknologi

- React 19 + Vite
- Vitest untuk unit test
- `localStorage` untuk penyimpanan
- Link template Google Calendar (tanpa API key) dan format iCalendar (.ics)

## Struktur proyek

```
src/
  App.jsx            state utama & navigasi
  components/        tampilan tiap menu
  lib/               logika: progres, kalender, penyimpanan (+ unit test)
CLAUDE.md            aturan proyek untuk AI coding agent
```

## Penggunaan AI

Dikembangkan dengan **Claude (Anthropic)** sebagai coding agent, mengikuti praktik dari
*claude-code-best-practice*: aturan proyek ditulis di `CLAUDE.md`, lalu setiap fitur dikerjakan
dengan alur **pahami → rencanakan → kerjakan → verifikasi** (unit test + build).

AI membantu: perancangan fitur, penulisan kode komponen dan logika, unit test, serta README.
Saya menentukan masalah dan kebutuhan (termasuk integrasi Google Calendar sesuai permintaan
dosen pembimbing), menguji aplikasi, dan meninjau hasilnya.

## Rencana pengembangan

- Sinkronisasi langsung lewat Google Calendar API (login Google)
- Simpan data di cloud agar bisa dibuka di beberapa perangkat
- Export kartu bimbingan ke PDF
