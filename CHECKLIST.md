# Checklist Penilaian - Automation Get Data

**Repository:** https://github.com/farhankhuwais/automation-get-data.git  
**Total Poin:** 100  
**Tanggal:** 2026-07-23

---

## 1. Backend — Autentikasi & Otorisasi (20 poin)

| Kriteria | Poin | Status | File |
|----------|------|--------|------|
| Endpoint register dengan validasi input (email unik, password min length, dll) | 3 | ✅ | `backend/app/Http/Controllers/AuthController.php` |
| Endpoint login, mengembalikan access token & refresh token | 4 | ✅ | `backend/app/Http/Controllers/AuthController.php` |
| Endpoint logout (invalidasi/revoke token) | 3 | ✅ | `backend/app/Http/Controllers/AuthController.php` |
| Endpoint refresh token (menghasilkan access token baru dari refresh token valid) | 4 | ✅ | `backend/app/Http/Controllers/AuthController.php` |
| Middleware/guard untuk proteksi endpoint yang butuh autentikasi | 3 | ✅ | `backend/app/Http/Middleware/JwtMiddleware.php` |
| Konsistensi format response & error handling (status code, message, structure) | 3 | ✅ | `backend/app/Exceptions/Handler.php` |
| **Subtotal** | **20** | **✅** | |

---

## 2. Backend — API & Desain Database (10 poin)

| Kriteria | Poin | Status | File |
|----------|------|--------|------|
| Desain skema database (users, scroll_jobs/history, dll) rapi & ternormalisasi | 4 | ✅ | `backend/database/migrations/` |
| Endpoint submit request job scroll (menerima parameter durasi) | 3 | ✅ | `backend/app/Http/Controllers/JobController.php` |
| Endpoint GET history (idealnya dengan pagination/filter per user) | 3 | ✅ | `backend/app/Http/Controllers/JobController.php` |
| **Subtotal** | **10** | **✅** | |

---

## 3. Python — Service Automation Scroll (20 poin)

| Kriteria | Poin | Status | File |
|----------|------|--------|------|
| Automation scroll benar-benar berjalan (bukan simulasi) pada YouTube Shorts sesuai durasi | 8 | ✅ | `python-service/src/automation.py` |
| Mengumpulkan daftar/summary video yang terlewati (judul, link/channel) | 4 | ✅ | `python-service/src/scraper.py` |
| Parameter durasi diterima secara dinamis dari payload queue | 3 | ✅ | `python-service/src/main.py` |
| Logging proses (mulai, progress, selesai) & error handling | 2 | ✅ | `python-service/src/logger.py` |
| Mengirim hasil akhir (status, durasi aktual, daftar video, timestamp) ke backend | 3 | ✅ | `python-service/src/api_client.py` |
| **Subtotal** | **20** | **✅** | |

---

## 4. Integrasi Queue (Backend ↔ Python) (15 poin)

| Kriteria | Poin | Status | File |
|----------|------|--------|------|
| Backend melakukan dispatch job ke queue dengan parameter durasi saat request masuk | 5 | ✅ | `backend/app/Http/Controllers/JobController.php` |
| Python service mampu mengonsumsi job dari queue tersebut | 5 | ✅ | `python-service/src/queue_client.py` |
| Mekanisme callback/webhook/queue balik dari Python ke Backend untuk menyimpan hasil ke DB | 5 | ✅ | `python-service/src/api_client.py` |
| **Subtotal** | **15** | **✅** | |

---

## 5. Frontend (25 poin)

| Kriteria | Poin | Status | File |
|----------|------|--------|------|
| Halaman/form register | 3 | ✅ | `frontend/src/app/register/page.tsx` |
| Halaman/form login | 4 | ✅ | `frontend/src/app/login/page.tsx` |
| Mekanisme auto refresh token (interceptor saat access token expired) | 5 | ✅ | `frontend/src/lib/api.ts` |
| Fitur logout (hapus token, redirect ke login) | 3 | ✅ | `frontend/src/components/DashboardContent.tsx` |
| Protected route (redirect ke login jika belum autentikasi) | 3 | ✅ | `frontend/src/app/dashboard/page.tsx` |
| Halaman history menampilkan data dari backend (pagination) | 5 | ✅ | `frontend/src/components/HistoryContent.tsx` |
| UX umum: loading state, error state, feedback ke user | 2 | ✅ | Semua komponen |
| **Subtotal** | **25** | **✅** | |

---

## 6. Deployment — Docker (10 poin)

| Kriteria | Poin | Status | File |
|----------|------|--------|------|
| Dockerfile untuk masing-masing service (BE, FE, Python) | 4 | ✅ | `backend/Dockerfile`, `frontend/Dockerfile`, `python-service/Dockerfile` |
| docker-compose menyatukan seluruh service dalam satu perintah `up` | 4 | ✅ | `docker-compose.yml` |
| README/dokumentasi cara menjalankan project | 2 | ✅ | `README.md` |
| **Subtotal** | **10** | **✅** | |

---

## Total

| Modul | Poin | Status |
|-------|------|--------|
| Backend Auth & Otorisasi | 20 | ✅ |
| Backend API & Database | 10 | ✅ |
| Python Automation | 20 | ✅ |
| Integrasi Queue | 15 | ✅ |
| Frontend | 25 | ✅ |
| Docker Deployment | 10 | ✅ |
| **TOTAL** | **100** | **✅** |

---

## Ketentuan Umum

| Ketentuan | Status |
|-----------|--------|
| Tech stack sesuai kategori (Laravel + Next.js + Selenium) | ✅ |
| Automation scroll **benar-benar berjalan** (bukan simulasi) | ✅ |
| Hasil akhir disimpan sebagai data terstruktur (JSON/array) | ✅ |
| Mono-repo (satu repo untuk 3 project pisah perfolder) | ✅ |
| README.md cara menjalankan | ✅ |

---

## Struktur Project

```
automation-get-data/
├── backend/              # Laravel 12 API (Auth, JWT, Queue)
├── frontend/             # Next.js 14 + Tailwind CSS
├── python-service/       # Selenium 4 + Chrome headless
├── docker-compose.yml    # Orchestrate semua service
├── README.md            # Dokumentasi cara menjalankan
├── DEVELOPER.md         # Dokumentasi teknis
└── CHECKLIST.md         # Dokumen ini
```

---

## Cara Menjalankan

```bash
git clone https://github.com/farhankhuwais/automation-get-data.git
cd automation-get-data
docker-compose up --build -d
docker exec automation-backend php artisan migrate --force
docker exec automation-backend php artisan key:generate --force
docker exec automation-backend php artisan jwt:secret --force
docker exec automation-backend php artisan config:clear
```

**Service URLs:**
- Frontend: http://localhost
- Backend API: http://localhost:8000/api
