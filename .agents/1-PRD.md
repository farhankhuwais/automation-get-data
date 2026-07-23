# PRD: Automation Get Data - Test Kompetensi Fullstack Developer

**Versi:** 1.0  
**Tanggal:** 2026-07-23  
**Status:** Draft  
**Total Poin:** 100

---

## 1. Visi & Tujuan Produk

### Visi Produk
Sistem **Automation Get Data** adalah platform berbasis web yang memungkinkan pengguna melakukan otomatisasi scroll pada YouTube Shorts, mengumpulkan data video yang muncul, dan menyimpan history untuk analisis.

### Tujuan Utama

1. **Autentikasi & Otorisasi** - Sistem login/register dengan JWT token management (access + refresh) - 20 poin
2. **Job Queue Automation** - Backend menerima request scroll, meneruskan ke Python service via queue - 15 poin
3. **Web Automation** - Python service menjalankan scroll real pada YouTube Shorts dan mengumpulkan metadata video - 20 poin
4. **Dashboard Interaktif** - Frontend untuk submit job, monitoring, dan melihat history - 25 poin
5. **Docker Deployment** - Seluruh service berjalan dalam container docker - 10 poin

### Value Proposition
- Automation scroll yang **bukan simulasi** (bukan sleep/loop kosong)
- Data video yang dikumpulkan: judul, link, channel, timestamp
- History job tersimpan dan bisa diakses user
- Auto-refresh token untuk seamless UX

---

## 2. User Persona

### Persona 1: Kandidat Programmer
- **Level Teknis:** Menengah-Mahir (pengalaman backend, frontend, Python)
- **Tujuan:** Menyelesaikan test dalam waktu 3-4 jam dengan nilai maksimal
- **Pain Points:** Harus mengimplementasikan 3 komponen berbeda (BE, FE, Python) dalam waktu terbatas
- **Motivasi:** Lolos test dan bergabung dengan Pemerintah Provinsi Bengkulu

### Persona 2: Admin/Verifier (Internal)
- **Level Teknis:** Mahir
- **Tujuan:** Memverifikasi hasil kerja kandidat berdasarkan poin penilaian
- **Pain Points:** Butuh cara objektif menilai kemampuan kandidat
- **Motivasi:** Menemukan programmer yang kompeten

---

## 3. User Stories

### Modul: Autentikasi
- Sebagai **pengguna baru**, saya ingin **mendaftar dengan email dan password**, agar **bisa membuat akun untuk mengakses sistem**.
- Sebagai **pengguna terdaftar**, saya ingin **login dan mendapatkan access token + refresh token**, agar **bisa mengakses endpoint yang dilindungi**.
- Sebagai **pengguna**, saya ingin **logout dan token diinvalidasi**, agar **tidak ada yang bisa pakai akun saya**.
- Sebagai **pengguna**, saya ingin **refresh token saat expired**, agar **tidak perlu login ulang**.

### Modul: Job Management
- Sebagai **pengguna**, saya ingin **submit request scroll dengan parameter durasi**, agar **sistem mulai memproses automation**.
- Sebagai **pengguna**, saya ingin **melihat history job** dengan pagination, agar **bisa melacak hasil scroll sebelumnya**.
- Sebagai **sistem**, saya ingin **push job ke queue** saat request masuk, agar **job diproses secara async**.

### Modul: Automation
- Sebagai **Python service**, saya ingin **consume job dari queue**, agar **tau apa yang harus dilakukan**.
- Sebagai **Python service**, saya ingin **scroll YouTube Shorts sesuai durasi**, agar **bukan simulasi tapi automation real**.
- Sebagai **Python service**, saya ingin **kumpulkan metadata video** (judul, link, channel), agar **hasil bisa disimpan**.
- Sebagai **Python service**, saya ingin **kirim hasil ke backend**, agar **data tersimpan di database**.

### Modul: Frontend
- Sebagai **pengguna**, saya ingin **form login/register yang bersih**, agar **mudah digunakan**.
- Sebagai **pengguna**, saya ingin **auto refresh token via interceptor**, agar **tidak perlu login ulang saat token expired**.
- Sebagai **pengguna**, saya ingin **protected route**, agar **hanya pengguna terautentikasi yang bisa akses dashboard**.
- Sebagai **pengguna**, saya ingin **lihat history dengan loading state**, agar **tau sistem sedang memproses**.

---

## 4. Functional Requirements

### FR-01: Registrasi Pengguna
- **Input:** Email, password, nama
- **Proses:** Validasi email unik, hash password, buat user record
- **Output:** Response sukses/gagal dengan status code 201/422
- **Aturan:** Email harus unik, password min 8 karakter

### FR-02: Login Pengguna
- **Input:** Email, password
- **Proses:** Verifikasi kredensial, generate JWT access token + refresh token
- **Output:** { access_token, refresh_token, user_info }
- **Aturan:** JWT access token expiry 15-60 menit, refresh token expiry lebih lama

### FR-03: Logout Pengguna
- **Input:** Refresh token
- **Proses:** Revoke/invalidate token di database
- **Output:** Response sukses
- **Aturan:** Token yang di-revoke tidak bisa digunakan lagi

### FR-04: Refresh Token
- **Input:** Refresh token valid
- **Proses:** Validasi refresh token, generate access token baru
- **Output:** Access token baru
- **Aturan:** Refresh token di-rotate atau reuse policy diterapkan

### FR-05: Submit Scroll Job
- **Input:** durasi (detik), user_id
- **Proses:** Validasi input, push job ke Redis queue
- **Output:** { job_id, status: "queued" }
- **Aturan:** Durasi harus angka positif, max durasi bisa dibatasi

### FR-06: Get History
- **Input:** user_id, page, limit (query params)
- **Proses:** Ambil data dari tabel scroll_jobs dengan pagination
- **Output:** { data: [...], pagination: { page, limit, total } }
- **Aturan:** Hanya job milik user yang login

### FR-07: Queue Producer (Backend)
- **Input:** Job payload { job_id, durasi, callback_url }
- **Proses:** Push ke Redis queue dengan LPUSH/RPUSH
- **Output:** Job masuk queue
- **Aturan:** Payload harus lengkap dan valid

### FR-08: Queue Consumer (Python)
- **Input:** Job dari queue (BRPOP)
- **Proses:** Parse payload, jalankan automation
- **Output:** -
- **Aturan:** Handle graceful shutdown, retry on failure

### FR-09: YouTube Shorts Automation
- **Input:** durasi (detik)
- **Proses:** Buka browser -> navigate ke YouTube -> scroll otomatis selama durasi -> kumpulkan video elements
- **Output:** Array video metadata [{ title, url, channel, thumbnail }]
- **Aturan:** **WAJIB real automation, bukan sleep/simulation**

### FR-10: Callback ke Backend
- **Input:** job_id, status, durasi_aktual, videos[], timestamp
- **Proses:** POST ke backend endpoint dengan hasil
- **Output:** -
- **Aturan:** Include error message jika gagal

### FR-11: Save Job Result
- **Input:** job_id, status, durasi_aktual, videos[], timestamp
- **Proses:** Update record di database
- **Output:** Response sukses
- **Aturan:** Validasi ownership user

### FR-12: Docker Build BE
- **Input:** Source code backend
- **Proses:** Multi-stage build, install dependencies, expose port
- **Output:** Image backend:latest
- **Aturan:** WORKDIR, CMD properly configured

### FR-13: Docker Build FE
- **Input:** Source code frontend
- **Proses:** Multi-stage build, build production assets
- **Output:** Image frontend:latest (nginx)
- **Aturan:** Static files served via nginx

### FR-14: Docker Build Python
- **Input:** Source code Python service
- **Proses:** Install Python, selenium/playwright, dependencies
- **Output:** Image python-service:latest
- **Aturan:** Include Chrome/Chromium for selenium

---

## 5. Non-Functional Requirements

### Performa
- Backend API response < 500ms
- Queue processing latency < 5 detik setelah job diqueue
- Frontend initial load < 3 detik

### Keamanan
- Password di-hash dengan bcrypt/argon2
- JWT tokens signed dengan secret key kuat
- CORS policy diterapkan
- No hardcoded credentials di codebase

### Skalabilitas
- Docker-compose untuk development
- Siap untuk scaling horizontal (stateless services)
- Redis sebagai centralized queue

### Reliability
- Error handling di setiap komponen
- Graceful shutdown untuk Python automation
- Retry mechanism untuk failed jobs

### Usability
- Responsive design (mobile-friendly)
- Loading states & error feedback di frontend
- Clear error messages

---

## 6. Out of Scope & Dependensi

### Out of Scope
- Real-time notification (WebSocket) - bonus points only
- Unit/integration tests - bonus points only
- Swagger/Postman documentation - bonus points only
- User management dashboard (admin panel)
- Multi-tenant architecture
- Cloud deployment (AWS/GCP/Azure)

### Dependensi
- **Redis** - untuk job queue
- **Database** (MySQL/PostgreSQL/MongoDB) - untuk persistence
- **Selenium/Playwright** - untuk web automation
- **Chrome/Chromium** - browser untuk automation
- **Docker & Docker Compose** - untuk containerization

### Tech Stack Pilihan
| Komponen | Rekomendasi | Alternatif |
|----------|--------------|------------|
| Backend | Laravel | Express.js, NestJS, Golang |
| Python | Selenium | Playwright |
| Frontend | Next.js | React, Vue |
| Queue | Redis + BullMQ | RabbitMQ |
| Database | MySQL | PostgreSQL, MongoDB |

### Asumsi
- Kandidat memiliki koneksi internet stabil (untuk YouTube automation)
- Environment memiliki RAM cukup (min 4GB) untuk menjalankan Chrome headless
- Docker dan Docker Compose sudah terinstall
- Git sudah terinstall untuk version control

---

## Scoring Summary

| Komponen | Poin |
|----------|------|
| Backend Auth & API | 30 |
| Python Automation | 20 |
| Queue Integration | 15 |
| Frontend | 25 |
| Docker Deployment | 10 |
| **Total** | **100** |

### Bonus Points
- Unit/Integration Tests
- API Documentation (Swagger)
- Real-time notification (WebSocket)
