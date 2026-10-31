# Plan Your Tasks. Own Your Time.

Aplikasi manajemen tugas berbasis web dengan To-Do List dan Kalender terintegrasi.

---

## Daftar Isi

1. [Gambaran Umum](#gambaran-umum)
2. [Persyaratan](#persyaratan)
3. [Cara Instalasi](#cara-instalasi)
4. [Cara Menjalankan Aplikasi](#cara-menjalankan-aplikasi)
5. [Cara Registrasi dan Login](#cara-registrasi-dan-login)
6. [Cara Mengelola Tugas](#cara-mengelola-tugas)
7. [Cara Menggunakan Kalender](#cara-menggunakan-kalender)
8. [Kategori, Prioritas, dan Status](#kategori-prioritas-dan-status)
9. [Lokasi Penyimpanan Data](#lokasi-penyimpanan-data)
10. [Cara Backup dan Pemulihan Data](#cara-backup-dan-pemulihan-data)
11. [Masalah Umum dan Solusinya](#masalah-umum-dan-solusinya)

---

## Gambaran Umum

**Plan Your Tasks** adalah aplikasi web produktivitas yang membantu Anda:
- Membuat dan mengelola daftar tugas (To-Do List)
- Memantau tenggat waktu melalui kalender terintegrasi
- Mengatur tugas berdasarkan kategori, prioritas, dan status
- Melihat ringkasan aktivitas melalui dashboard pribadi

Aplikasi berjalan **sepenuhnya lokal** di komputer Anda — tidak memerlukan internet saat digunakan.

---

## Persyaratan

Sebelum memulai, pastikan komputer Anda sudah memiliki:

| Perangkat Lunak | Versi Minimum | Cara Cek |
|---|---|---|
| Python | 3.9 | Buka terminal, ketik: `python --version` |
| pip | 21.0 | Ketik: `pip --version` |

> **Belum punya Python?**
> Unduh di [python.org/downloads](https://python.org/downloads) → pilih versi terbaru → centang **"Add Python to PATH"** saat instalasi.

---

## Cara Instalasi

### Langkah 1 — Buka Terminal / Command Prompt

- **Windows:** Tekan `Win + R`, ketik `cmd`, tekan Enter
- **Mac/Linux:** Buka aplikasi Terminal

### Langkah 2 — Masuk ke Folder Proyek

Ganti `C:\Lokasi\PlanYourTasks` dengan lokasi folder proyek di komputer Anda:

```
cd C:\Lokasi\PlanYourTasks
```

### Langkah 3 — Buat Virtual Environment

Virtual environment adalah ruang terisolasi agar library tidak bercampur dengan Python sistem.

```
python -m venv .venv
```

### Langkah 4 — Aktifkan Virtual Environment

**Windows:**
```
.venv\Scripts\activate
```

**Mac / Linux:**
```
source .venv/bin/activate
```

> Berhasil jika muncul `(.venv)` di awal baris terminal.

### Langkah 5 — Install Library yang Dibutuhkan

```
pip install -r requirements.txt
```

Tunggu hingga proses selesai. Ini hanya perlu dilakukan **sekali saja**.

---

## Cara Menjalankan Aplikasi

### Setiap kali ingin membuka aplikasi, ikuti langkah ini:

**Langkah 1 — Buka terminal dan masuk ke folder proyek:**
```
cd C:\Lokasi\PlanYourTasks
```

**Langkah 2 — Aktifkan virtual environment:**

Windows:
```
.venv\Scripts\activate
```
Mac/Linux:
```
source .venv/bin/activate
```

**Langkah 3 — Jalankan aplikasi:**
```
python run.py
```

**Langkah 4 — Buka di browser:**

Buka browser (Chrome, Firefox, Edge) dan ketik di address bar:
```
http://127.0.0.1:5000
```

> Aplikasi siap digunakan! Biarkan terminal tetap terbuka selama menggunakan aplikasi.

**Langkah 5 — Menutup aplikasi:**

Kembali ke terminal dan tekan `Ctrl + C` untuk menghentikan server.

---

## Cara Registrasi dan Login

### Membuat Akun Baru (Registrasi)

1. Buka `http://127.0.0.1:5000` di browser
2. Klik tombol **"Daftar sekarang"**
3. Isi formulir:
   - **Nama Lengkap** — nama Anda
   - **Email** — alamat email (digunakan untuk login)
   - **Kata Sandi** — minimal 8 karakter
   - **Konfirmasi Kata Sandi** — ulangi kata sandi yang sama
4. Klik **"Daftar"**
5. Jika berhasil, Anda akan diarahkan ke halaman login

### Masuk ke Akun (Login)

1. Masukkan **email** dan **kata sandi** yang didaftarkan
2. Klik **"Masuk"**
3. Anda akan masuk ke Dashboard pribadi

### Keluar dari Akun (Logout)

- Klik **"Keluar"** di bagian bawah sidebar kiri

> **Catatan keamanan:** Setiap pengguna hanya dapat melihat tugas miliknya sendiri. Kata sandi disimpan dalam bentuk terenkripsi (hash).

---

## Cara Mengelola Tugas

### Menambahkan Tugas Baru

1. Klik tombol **"Tugas Baru"** (tombol biru di pojok kanan atas halaman To-Do List)
2. Isi formulir:
   - **Judul Tugas** *(wajib)* — nama tugas Anda
   - **Deskripsi** — catatan tambahan (opsional)
   - **Kategori** — misal: Kuliah, Pekerjaan, Pribadi (opsional)
   - **Prioritas** — Rendah / Sedang / Tinggi
   - **Tanggal Tenggat** — batas waktu penyelesaian (opsional)
   - **Jam Tenggat** — jam spesifik (opsional)
   - **Status** — Belum Dikerjakan / Sedang Dikerjakan / Selesai
3. Klik **"Simpan"**

### Melihat Detail Tugas

- Klik pada kartu tugas mana saja untuk melihat detail lengkap

### Mengubah Tugas

1. Arahkan kursor ke kartu tugas → klik ikon **pensil** (✏️)
2. Atau buka detail tugas → klik **"Edit"**
3. Ubah informasi yang diinginkan → klik **"Simpan"**

### Menghapus Tugas

1. Arahkan kursor ke kartu tugas → klik ikon **tempat sampah** (🗑️)
2. Atau buka detail tugas → klik **"Hapus"**
3. Konfirmasi penghapusan → klik **"Hapus"**

> ⚠️ Penghapusan tidak dapat dibatalkan.

### Menandai Tugas Selesai

- Klik **kotak centang** (☐) di sisi kiri kartu tugas
- Tugas yang selesai akan diberi garis coret dan warna berbeda

### Mencari Tugas

- Gunakan kolom **"Cari tugas..."** di bagian atas halaman To-Do List
- Pencarian berlaku untuk judul, deskripsi, dan kategori

### Memfilter dan Mengurutkan Tugas

Di bagian atas halaman To-Do List tersedia filter:
- **Status** — tampilkan hanya tugas dengan status tertentu
- **Prioritas** — tampilkan hanya tugas dengan prioritas tertentu
- **Kategori** — tampilkan hanya tugas dari kategori tertentu
- **Urutan** — urutkan berdasarkan tanggal dibuat, tenggat waktu, prioritas, atau judul

---

## Cara Menggunakan Kalender

### Membuka Kalender

- Klik **"Kalender"** di sidebar kiri

### Tampilan Kalender

Tersedia tiga tampilan, pilih melalui tombol di pojok kanan atas:

| Tampilan | Kegunaan |
|---|---|
| **Bulan** | Melihat seluruh tugas dalam satu bulan |
| **Minggu** | Melihat tugas dalam satu minggu |
| **Hari** | Melihat tugas pada hari tertentu secara detail |

### Navigasi Kalender

- Tombol **‹** (kiri) — mundur ke bulan/minggu/hari sebelumnya
- Tombol **›** (kanan) — maju ke bulan/minggu/hari berikutnya
- Tombol **"Hari Ini"** — kembali ke tanggal hari ini

### Melihat dan Mengelola Tugas dari Kalender

- **Klik chip tugas** (kotak kecil berwarna) di kalender untuk melihat detail
- Di jendela detail: klik **"Edit"** untuk mengubah, atau **"Hapus"** untuk menghapus
- Semua perubahan langsung tersinkronisasi dengan To-Do List

### Indikator Warna Tugas di Kalender

| Warna | Arti |
|---|---|
| 🔴 Merah | Prioritas Tinggi |
| 🟡 Kuning/Oranye | Prioritas Sedang |
| 🔵 Biru | Prioritas Rendah |
| Abu-abu dengan coret | Tugas Selesai |

---

## Kategori, Prioritas, dan Status

### Kategori

- Tulis bebas sesuai kebutuhan, contoh: `Kuliah`, `Pekerjaan`, `Pribadi`, `Belanja`
- Kategori yang sudah pernah dipakai akan muncul sebagai saran otomatis
- Filter berdasarkan kategori tersedia di halaman To-Do List

### Prioritas

| Level | Kapan Digunakan |
|---|---|
| **Tinggi** | Tugas mendesak atau sangat penting |
| **Sedang** | Tugas normal (default) |
| **Rendah** | Tugas tidak mendesak |

### Status

| Status | Artinya |
|---|---|
| **Belum Dikerjakan** | Tugas baru dibuat, belum dimulai |
| **Sedang Dikerjakan** | Tugas sedang dalam proses pengerjaan |
| **Selesai** | Tugas telah diselesaikan |

### Tugas Terlambat

Tugas yang belum selesai dan sudah melewati tanggal/jam tenggat akan otomatis ditandai **"Terlambat"** (ditampilkan dengan latar merah dan ikon peringatan ⚠️).

---

## Lokasi Penyimpanan Data

Semua data disimpan dalam folder `data/` di dalam direktori proyek:

```
PlanYourTasks/
└── data/
    ├── users.json    ← data akun pengguna (email, nama, hash kata sandi)
    └── tasks.json    ← semua data tugas dari semua pengguna
```

> **Catatan:** File `users.json` menyimpan kata sandi dalam bentuk **hash** (terenkripsi), bukan teks biasa. Aman untuk disimpan.

---

## Cara Backup dan Pemulihan Data

### Backup (Mencadangkan Data)

Cukup **salin folder `data/`** ke lokasi lain (flashdisk, Google Drive, dll):

**Windows — melalui File Explorer:**
1. Buka folder `PlanYourTasks`
2. Klik kanan folder `data` → **Salin**
3. Tempel di lokasi backup yang diinginkan

**Windows — melalui terminal:**
```
xcopy data backup_data /E /I
```

**Mac/Linux:**
```
cp -r data/ backup_data/
```

### Pemulihan Data

Untuk memulihkan data dari backup:

1. **Hentikan aplikasi** terlebih dahulu (Ctrl+C di terminal)
2. **Hapus atau ganti nama** folder `data/` yang ada
3. **Salin folder backup** Anda ke lokasi semula dengan nama `data/`
4. **Jalankan kembali** aplikasi dengan `python run.py`

---

## Masalah Umum dan Solusinya

### ❌ "python" tidak dikenali / tidak ditemukan

**Penyebab:** Python belum terinstall atau belum ditambahkan ke PATH.

**Solusi:**
1. Unduh Python di [python.org/downloads](https://python.org/downloads)
2. Saat instalasi, **centang "Add Python to PATH"**
3. Restart terminal

---

### ❌ Perintah `pip install` gagal / error

**Solusi:**
```
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
```

---

### ❌ Error: "Address already in use" atau "Port 5000 sudah digunakan"

**Penyebab:** Ada proses lain yang menggunakan port 5000.

**Solusi — Windows:**
```
netstat -ano | findstr :5000
taskkill /PID <nomor_PID> /F
```
Ganti `<nomor_PID>` dengan angka yang muncul.

---

### ❌ Halaman tidak bisa dibuka di browser

**Pastikan:**
- Terminal masih berjalan (tidak ditutup)
- URL yang diketik tepat: `http://127.0.0.1:5000` (bukan `https://`)
- Tidak ada firewall yang memblokir

---

### ❌ Data tugas hilang setelah restart

**Penyebab:** Folder `data/` belum terbuat atau file JSON rusak.

**Solusi:**
1. Pastikan folder `data/` ada di dalam folder `PlanYourTasks/`
2. Jika file JSON rusak, buka file tersebut dengan teks editor dan periksa apakah formatnya valid
3. Jika tidak bisa diperbaiki, hapus file yang rusak — aplikasi akan membuat file baru secara otomatis (data lama tidak bisa dipulihkan kecuali ada backup)

---

### ❌ Lupa kata sandi

Saat ini belum ada fitur reset kata sandi. Solusi darurat:

1. Buka file `data/users.json` dengan teks editor
2. Hapus entri pengguna yang lupa kata sandi
3. Daftar ulang dengan email yang sama
4. Data tugas lama **tidak akan terhapus**, tetapi tidak bisa diakses karena `user_id` berbeda

> Sebaiknya buat backup sebelum melakukan langkah ini.

---

### ❌ Tampilan berantakan / CSS tidak dimuat

**Solusi:**
1. Bersihkan cache browser: `Ctrl + Shift + R` (hard refresh)
2. Pastikan folder `app/static/css/` berisi file `main.css`

---

*Dikembangkan dengan Python + Flask. Berjalan 100% lokal tanpa ketergantungan layanan eksternal.*
