# Time Academy - Sistem Manajemen Materi

Sistem back office untuk mengelola materi pembelajaran dengan upload PDF otomatis.

## Instalasi

### Cara 1: Menggunakan Script (Paling Mudah)

**Windows:**
- Double-click file `start-server.bat`
- Script akan otomatis install dependencies jika belum ada, lalu menjalankan server

**Linux/Mac:**
```bash
chmod +x start-server.sh
./start-server.sh
```

### Cara 2: Manual

1. Install dependencies:
```bash
npm install
```

2. Jalankan server:
```bash
npm start
```

Atau untuk development dengan auto-reload:
```bash
npm run dev
```

**PENTING:** Server harus berjalan sebelum Anda bisa login ke admin panel!

Server akan berjalan di `http://localhost:3000`

Setelah server berjalan, buka browser dan akses:
- Halaman utama: `http://localhost:3000/index.html` atau `http://localhost:3000/`
- Admin panel: `http://localhost:3000/admin.html` (setelah login)

## Penggunaan

### Akses Admin Panel

Buka browser dan akses: `http://localhost:3000/admin.html`

### Menambah Materi Baru

1. Buka halaman admin panel
2. Isi form:
   - **Judul Materi**: Contoh: "Pertemuan 1"
   - **Subtitle**: Deskripsi materi
   - **Status Ketersediaan**: Centang jika materi sudah tersedia
   - **Tanggal Ketersediaan**: Isi jika materi belum tersedia
   - **Upload PDF**: Pilih file PDF yang akan diunggah
3. Klik "Simpan Materi"

### Mengedit Materi

1. Di daftar materi, klik tombol "Edit"
2. Ubah data yang diperlukan
3. Jika ingin mengganti PDF, pilih file baru
4. Klik "Simpan Materi"

### Menghapus Materi

1. Di daftar materi, klik tombol "Hapus"
2. Konfirmasi penghapusan
3. File PDF juga akan ikut terhapus

## Struktur File

- `server.js` - Backend server dengan API endpoints
- `admin.html` - Halaman admin untuk mengelola materi
- `index.html` - Halaman utama yang menampilkan materi secara dinamis
- `materials.json` - Database JSON untuk menyimpan data materi
- `pdf/` - Folder untuk menyimpan file PDF materi

## API Endpoints

- `GET /api/materials` - Ambil semua materi
- `GET /api/materials/:id` - Ambil satu materi
- `POST /api/materials` - Buat materi baru
- `PUT /api/materials/:id` - Update materi
- `DELETE /api/materials/:id` - Hapus materi
- `POST /api/upload` - Upload file PDF

## Login Admin

**PENTING:** Pastikan server sudah berjalan sebelum mencoba login!

Untuk mengakses halaman admin:

1. Pastikan server berjalan (lihat bagian Instalasi di atas)
2. Buka halaman utama di browser: `http://localhost:3000`
3. Scroll ke bawah dan klik tombol **"Login Admin"** di bagian footer
4. Masukkan kredensial:
   - **Username**: `davian`
   - **Password**: `timeacademy`
5. Klik icon mata untuk melihat/menyembunyikan password
6. Setelah login berhasil, Anda akan diarahkan ke halaman admin

**Troubleshooting:**
- Jika muncul error "Terjadi kesalahan. Pastikan server berjalan", pastikan:
  - Server sudah berjalan (cek terminal/command prompt)
  - Port 3000 tidak digunakan aplikasi lain
  - Tidak ada firewall yang memblokir

## Catatan

- File PDF akan otomatis disimpan di folder `pdf/`
- Nama file PDF akan mengikuti nama file yang diunggah
- Materi yang sudah diunggah PDF-nya akan otomatis muncul di halaman utama
- Materi yang belum tersedia akan menampilkan tanggal ketersediaan
- Session login akan berlangsung selama 24 jam
- Pastikan untuk logout setelah selesai menggunakan admin panel

