# Panduan Deploy ke Vercel

## Persiapan

1. **Pastikan semua file sudah di-commit ke Git:**
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   ```

2. **Install dependencies baru (memorystore):**
   ```bash
   npm install
   ```

## Cara Deploy ke Vercel

### Opsi 1: Deploy via Vercel CLI (Recommended)

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Login ke Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   vercel
   ```
   
   Atau untuk production:
   ```bash
   vercel --prod
   ```

### Opsi 2: Deploy via GitHub (Recommended untuk CI/CD)

1. **Push ke GitHub:**
   ```bash
   git push origin main
   ```

2. **Hubungkan ke Vercel:**
   - Buka [vercel.com](https://vercel.com)
   - Login dengan GitHub
   - Klik "Add New Project"
   - Pilih repository Anda
   - Vercel akan otomatis detect konfigurasi dari `vercel.json`
   - Klik "Deploy"

3. **Setelah deploy pertama, setiap push ke branch main akan otomatis deploy**

### Opsi 3: Deploy via Vercel Dashboard

1. Buka [vercel.com](https://vercel.com)
2. Login dan klik "Add New Project"
3. Import dari Git (GitHub/GitLab/Bitbucket)
4. Pilih repository
5. Vercel akan otomatis detect konfigurasi
6. Klik "Deploy"

## Environment Variables (Opsional)

Jika ingin mengubah kredensial admin, tambahkan di Vercel Dashboard:

1. Buka project di Vercel Dashboard
2. Settings > Environment Variables
3. Tambahkan:
   - `ADMIN_USERNAME` = username admin Anda
   - `ADMIN_PASSWORD` = password admin Anda
   - `SESSION_SECRET` = secret key untuk session (random string)

## Catatan Penting

### ⚠️ File Upload di Vercel

**PENTING:** Vercel menggunakan serverless functions yang bersifat stateless. File yang di-upload ke `/tmp` akan **terhapus setelah function selesai dieksekusi**.

**Solusi untuk Production:**
- Gunakan **Vercel Blob Storage** (recommended)
- Atau gunakan **AWS S3**, **Cloudinary**, atau storage service lainnya
- File PDF harus disimpan di cloud storage, bukan di filesystem lokal

### 📁 File Storage

- `materials.json` akan tersimpan di root project (persistent)
- File PDF di folder `pdf/` perlu disimpan di cloud storage untuk production

### 🔒 Session Storage

- Menggunakan MemoryStore (in-memory)
- Session akan hilang saat serverless function restart
- Untuk production, pertimbangkan menggunakan Redis atau database untuk session storage

## Troubleshooting

### Error: Cannot find module 'memorystore'
```bash
npm install memorystore
```

### Error: File upload tidak bekerja
- Pastikan menggunakan cloud storage untuk file upload
- File di `/tmp` hanya temporary

### Error: Session tidak persist
- Normal untuk MemoryStore
- Pertimbangkan menggunakan Redis untuk production

## Setelah Deploy

1. Buka URL yang diberikan Vercel (contoh: `https://your-project.vercel.app`)
2. Test halaman utama: `https://your-project.vercel.app`
3. Test admin panel: `https://your-project.vercel.app/admin.html`
4. Login dengan kredensial default atau yang sudah di-set via environment variables

## Update Deployment

Setelah perubahan kode:
```bash
git add .
git commit -m "Update code"
git push origin main
```

Vercel akan otomatis deploy ulang jika sudah terhubung dengan GitHub.

