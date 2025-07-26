
# Dokumentasi Pengembangan Timeblck v2.0

Dokumen ini berfungsi sebagai "checkpoint" dan panduan teknis untuk aplikasi Timeblck, mendokumentasikan status stabil proyek per **versi 2.0**. Tujuannya adalah untuk mencatat arsitektur, fitur, dan konvensi kode yang telah kita bangun bersama.

## 1. Ikhtisar Proyek

Timeblck adalah aplikasi web modern yang dirancang untuk membantu pengguna mengelola waktu mereka secara visual dan melacak kebiasaan mereka untuk pengembangan diri. Aplikasi ini dibangun dengan pendekatan 'Bento UI' yang bersih dan fungsional.

## 2. Fitur Utama

Berikut adalah fitur-fitur utama yang telah diimplementasikan dan distabilkan:

- **Penjadwalan Blok Waktu (Halaman Utama):**
  - **Tiga Gaya Visualisasi Blok:**
    - **`Rounded` & `Sharp`:** Tampilan *horizontal* unik di mana setiap jam adalah satu baris, dan durasi blok direpresentasikan oleh kotak-kotak 10 menit yang tersusun menyamping di dalam baris tersebut.
    - **`Solid`:** Tampilan *vertikal* di mana blok waktu adalah satu kesatuan visual yang memanjang ke bawah sesuai durasinya.
  - Membuat blok baru dengan menyeret kursor pada slot waktu kosong, dengan animasi seleksi yang intuitif.
  - Mengedit, menghapus, dan mengubah warna blok.
  - Indikator garis visual untuk waktu saat ini.
  - Opsi pengingat spesifik (misalnya, 5, 10, atau 15 menit sebelumnya).

- **Pelacak Kebiasaan (Habit Tracker):**
  - Menambah, mengedit, dan menghapus kebiasaan.
  - Setiap kebiasaan memiliki judul, deskripsi, ikon, warna, dan pilar pengembangan diri.
  - Melakukan "check-in" harian dengan 4 tingkat intensitas.
  - Visualisasi kemajuan dalam bentuk *heat map* per tahun.

- **Kalender:**
  - Tampilan mingguan, bulanan, dan tahunan.
  - Tampilan bulanan terintegrasi dengan jadwal harian.
  - Tampilan tahunan menunjukkan "peta panas" kesibukan sepanjang tahun.

- **Laporan & Wawasan:**
  - **Radar Pengembangan Diri:** Menganalisis keseimbangan 5 pilar kehidupan (Mind, Body, Soul, Social, Wealth) dalam rentang waktu tertentu.
  - **Distribusi Waktu:** Visualisasi alokasi waktu dalam bentuk 'Tetris-style' chart.
  - **Statistik Kebiasaan:** Kartu ringkasan untuk performa mingguan, termasuk total check-in, jam terjadwal, skor, dan konsistensi.
  - Tata letak yang sepenuhnya responsif untuk semua ukuran layar.

- **Template (Fitur Premium):**
  - Membuat blok waktu berulang (misalnya, untuk tidur, kerja, olahraga) yang secara otomatis muncul di jadwal harian.
  - Dilindungi oleh *Premium Gate* yang dapat diaktifkan melalui halaman Pengaturan.

- **Pengaturan:**
  - Mengelola template.
  - Menyesuaikan tampilan: waktu mulai jadwal, format waktu (12/24 jam), gaya blok (`Rounded`/`Sharp`/`Solid`), dan bahasa (Inggris/Indonesia).
  - Mengaktifkan/menonaktifkan notifikasi browser.
  - Menyimulasikan akun premium.

## 3. Tumpukan Teknologi (Tech Stack)

- **Framework:** Next.js (dengan App Router)
- **Bahasa:** TypeScript
- **Styling:** Tailwind CSS
- **Komponen UI:** ShadCN UI
- **Manajemen Tanggal:** `date-fns`
- **Drag and Drop:** `dnd-kit` (saat ini tidak digunakan aktif di jadwal utama, diganti dengan interaksi `onMouseDown`/`onMouseEnter`)
- **State Management:** React Hooks (`useState`, `useEffect`, `useContext`) & Local Storage.
- **AI (Masa Depan):** Genkit

## 4. Struktur Proyek

Struktur folder utama yang perlu diperhatikan:

```
/
├── src/
│   ├── app/                # Rute aplikasi. Halaman yang berhubungan dengan pengaturan ada di dalam /settings.
│   │   └── settings/
│   │       ├── appearance/ # Halaman pengaturan tampilan
│   │       └── templates/  # Halaman pengaturan template
│   ├── components/         # Komponen React yang dapat digunakan kembali, diorganisir berdasarkan fitur.
│   │   ├── layout/         # Komponen tata letak utama (sidebar, header, dll.)
│   │   ├── notifications/  # Komponen terkait notifikasi.
│   │   ├── schedule/       # Komponen untuk penjadwalan (halaman utama).
│   │   ├── habits/         # Komponen untuk fitur Habit.
│   │   ├── goals/          # Komponen untuk fitur Goals.
│   │   ├── templates/      # Komponen untuk fitur Template.
│   │   ├── reports/        # Komponen khusus untuk halaman laporan.
│   │   ├── shared/         # Komponen yang digunakan di banyak tempat.
│   │   └── ui/             # Komponen dasar dari ShadCN.
│   ├── hooks/              # Custom hooks untuk logika & state management.
│   ├── lib/                # Utilitas, definisi tipe, dan terjemahan.
│   └── ai/                 # Dicadangkan untuk fitur AI dengan Genkit.
├── public/                 # Aset statis (logo, ikon)
└── DOCUMENTATION.md        # File ini
```

## 5. Manajemen State (Client-Side)

Logika inti aplikasi berada di dalam **Custom Hooks** di `src/hooks/`. State disimpan di **Local Storage** browser untuk persistensi data.

- **`useTimeBlocks.ts`**: Mengelola semua operasi CRUD untuk blok waktu sekali pakai.
- **`useRecurringBlocks.ts`**: Mengelola template blok waktu berulang.
- **`useHabits.ts`**: Mengelola data kebiasaan dan riwayat check-in.
- **`useAppSettings.ts`**: Mengelola semua pengaturan pengguna (tema, bahasa, dll).

Komponen-komponen di dalam aplikasi kemudian menggunakan *state* ini melalui **React Context Providers** (`TimeBlocksProvider`, `AppSettingsProvider`, dll.) yang membungkus layout utama di `src/app/layout.tsx`.

## 6. Panduan Pengembangan

### Menambah Halaman Baru

1.  Buat folder baru di `src/app/nama-halaman-baru/`.
2.  Di dalamnya, buat file `page.tsx`.
3.  Tambahkan komponen React dasar di sana.
4.  Tambahkan tautan navigasi di `src/components/layout/app-sidebar.tsx` dan `src/components/layout/bottom-nav.tsx`.

### Memodifikasi State

Untuk membaca atau memodifikasi data (misalnya, menambah blok waktu), gunakan *hooks* yang relevan di dalam komponen Anda. Contoh:

```tsx
// Di dalam komponen React Anda
import { useTimeBlocks } from '@/hooks/time-blocks-provider';

const { blocksByDate, addBlock } = useTimeBlocks();

// Gunakan `addBlock(date, newBlockData)` untuk menambah blok baru.
```
