# Environment Variables untuk Vercel

## 📋 Daftar Environment Variables

Berikut adalah environment variables yang bisa Anda set di Vercel Dashboard:

### 🔐 **OPSIONAL (Recommended untuk Security)**

#### 1. `SESSION_SECRET`
- **Deskripsi**: Secret key untuk enkripsi session cookies
- **Default**: `time-academy-secret-key-2025` (jika tidak di-set)
- **Rekomendasi**: **WAJIB di-set untuk production!**
- **Cara Generate**: Gunakan random string yang panjang dan aman
- **Contoh Value**: 
  ```
  a7f3b9c2d4e6f8a1b3c5d7e9f0a2b4c6d8e0f2a4b6c8d0e2f4a6b8c0d2e4f6a8b0c2d4e6f8a0
  ```
- **Cara Generate di Terminal**:
  ```bash
  # Linux/Mac
  openssl rand -hex 32
  # atau
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```

#### 2. `ADMIN_USERNAME`
- **Deskripsi**: Username untuk login admin panel
- **Default**: `davian` (jika tidak di-set)
- **Rekomendasi**: **Sangat disarankan untuk diubah!**
- **Contoh Value**: 
  ```
  admin
  ```
  atau
  ```
  your-username
  ```

#### 3. `ADMIN_PASSWORD`
- **Deskripsi**: Password untuk login admin panel
- **Default**: `timeacademy` (jika tidak di-set)
- **Rekomendasi**: **WAJIB diubah untuk production!**
- **Contoh Value**: 
  ```
  YourStrongPassword123!
  ```
- **Tips**: Gunakan password yang kuat (minimal 12 karakter, kombinasi huruf, angka, simbol)

### 🔄 **OTOMATIS (Tidak Perlu Di-set)**

Environment variables berikut **otomatis di-set oleh Vercel**, jadi **TIDAK PERLU** Anda isi:

- `NODE_ENV` - Otomatis `production` di Vercel
- `VERCEL` - Otomatis `1` di Vercel
- `VERCEL_ENV` - Otomatis `production`, `preview`, atau `development`

---

## 📝 Cara Set Environment Variables di Vercel

### Via Vercel Dashboard (Recommended)

1. **Buka Vercel Dashboard**
   - Login ke [vercel.com](https://vercel.com)
   - Pilih project Anda

2. **Masuk ke Settings**
   - Klik nama project
   - Klik tab **"Settings"**
   - Klik **"Environment Variables"** di sidebar kiri

3. **Tambah Environment Variable**
   - Klik tombol **"Add New"**
   - Isi:
     - **Key**: Nama variable (contoh: `SESSION_SECRET`)
     - **Value**: Nilai variable (contoh: `a7f3b9c2d4e6f8a1b3c5d7e9f0a2b4c6d8e0f2a4b6c8d0e2f4a6b8c0d2e4f6a8b0c2d4e6f8a0`)
     - **Environment**: Pilih:
       - ✅ **Production** (untuk production)
       - ✅ **Preview** (untuk preview deployments)
       - ✅ **Development** (untuk local development, opsional)
   - Klik **"Save"**

4. **Redeploy**
   - Setelah menambah environment variables, **redeploy** project:
     - Klik tab **"Deployments"**
     - Klik **"..."** pada deployment terbaru
     - Pilih **"Redeploy"**

### Via Vercel CLI

```bash
# Set environment variable
vercel env add SESSION_SECRET production
vercel env add ADMIN_USERNAME production
vercel env add ADMIN_PASSWORD production

# List semua environment variables
vercel env ls

# Pull environment variables ke local (untuk .env.local)
vercel env pull .env.local
```

---

## 🎯 Rekomendasi Setup Minimum

Untuk **production**, setidaknya set:

1. ✅ **SESSION_SECRET** - Untuk keamanan session
2. ✅ **ADMIN_PASSWORD** - Ganti password default

**Contoh Setup Minimum:**

| Key | Value | Environment |
|-----|-------|-------------|
| `SESSION_SECRET` | `[generate-random-32-char-hex]` | Production, Preview |
| `ADMIN_PASSWORD` | `YourStrongPassword123!` | Production, Preview |

---

## 🔒 Security Best Practices

1. **Jangan commit** environment variables ke Git
   - Pastikan `.env` ada di `.gitignore`
   - Vercel sudah otomatis mengabaikan file `.env`

2. **Gunakan password yang kuat**
   - Minimal 12 karakter
   - Kombinasi huruf besar, huruf kecil, angka, simbol
   - Jangan gunakan password yang mudah ditebak

3. **Generate SESSION_SECRET yang unik**
   - Jangan gunakan default value di production
   - Gunakan random generator yang aman

4. **Review environment variables secara berkala**
   - Pastikan tidak ada yang ter-expose
   - Rotate password secara berkala

---

## 🧪 Testing Environment Variables

Setelah set environment variables, test dengan:

1. **Redeploy project**
2. **Login ke admin panel** dengan kredensial baru
3. **Cek console logs** (jika ada) untuk memastikan variables ter-load

---

## ❓ Troubleshooting

### Environment variable tidak ter-load?

1. **Pastikan sudah redeploy** setelah menambah variable
2. **Cek environment** (Production/Preview/Development) sudah benar
3. **Cek typo** pada nama variable (case-sensitive)
4. **Cek value** tidak ada spasi di awal/akhir

### Cara cek apakah variable ter-load?

Tambahkan di `api/index.js` (temporary, untuk debugging):

```javascript
console.log('ADMIN_USERNAME:', process.env.ADMIN_USERNAME);
console.log('SESSION_SECRET:', process.env.SESSION_SECRET ? 'Set' : 'Not set');
```

**Jangan lupa hapus** console.log setelah testing!

---

## 📚 Referensi

- [Vercel Environment Variables Docs](https://vercel.com/docs/concepts/projects/environment-variables)
- [Vercel CLI Environment Variables](https://vercel.com/docs/cli/env)

