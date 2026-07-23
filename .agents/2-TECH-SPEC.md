# TECH SPEC: Automation Get Data

**Versi:** 1.0  
**Tanggal:** 2026-07-23  
**Based on:** PRD v1.0  
**Tech Stack:** Laravel + Next.js + Selenium + Redis + MySQL  
**Struktur:** Mono-repo (3 folder terpisah)

---

## BAGIAN 1: Tech Stack & Arsitektur

### Tech Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Backend | Laravel (PHP) | 12.x |
| PHP Version | PHP | 8.2+ |
| Frontend | Next.js (React) | 14.x |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS | 3.x |
| State Management | Zustand / React Query | latest |
| Python | Python | 3.11+ |
| Automation | Selenium | 4.x |
| Browser | Chrome/Chromium (headless) | latest |
| Queue | Redis + BullMQ | latest |
| Database | MySQL | 8.x |
| ORM | Eloquent (Laravel) | - |
| Auth | JWT (tymon/jwt-auth) | 2.x |
| Container | Docker + Docker Compose | latest |

### Arsitektur Sistem

`
┌─────────────────────────────────────────────────────────────────┐
│                         MONO REPO                                │
├─────────────────┬─────────────────┬───────────────────────────────┤
│    backend/    │    frontend/   │      python-service/          │
│    (Laravel)  │   (Next.js)    │        (Selenium)            │
└────────┬───────┴────────┬───────┴──────────────┬──────────────┘
         │                │                       │
         │   ┌────────────┘                       │
         │   │                                    │
         ▼   ▼                                    ▼
┌─────────────────┐                    ┌─────────────────┐
│     MySQL       │◄──────────────────│     Redis       │
│   (Database)   │                    │    (Queue)      │
└─────────────────┘                    └────────┬────────┘
                                              │
                                              ▼
                                    ┌─────────────────┐
                                    │   YouTube API   │
                                    │  (Web Browser)  │
                                    └─────────────────┘
`

### Struktur Folder Mono-repo

`
automation-get-data/
├── backend/                    # Laravel API
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/
│   │   │   │   ├── AuthController.php
│   │   │   │   ├── JobController.php
│   │   │   │   └── HistoryController.php
│   │   │   ├── Middleware/
│   │   │   │   └── JwtMiddleware.php
│   │   │   └── Requests/
│   │   │       ├── RegisterRequest.php
│   │   │       └── SubmitJobRequest.php
│   │   ├── Models/
│   │   │   ├── User.php
│   │   │   ├── ScrollJob.php
│   │   │   └── Token.php
│   │   ├── Services/
│   │   │   ├── AuthService.php
│   │   │   └── JobService.php
│   │   └── Jobs/
│   │       └── ProcessScrollJob.php
│   ├── config/
│   ├── database/
│   │   └── migrations/
│   ├── routes/
│   │   └── api.php
│   ├── tests/
│   ├── .env.example
│   ├── Dockerfile
│   └── composer.json
│
├── frontend/                  # Next.js App
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/
│   │   │   │   ├── login/page.tsx
│   │   │   │   └── register/page.tsx
│   │   │   ├── (dashboard)/
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── page.tsx
│   │   │   │   └── history/page.tsx
│   │   │   └── api/
│   │   ├── components/
│   │   │   ├── ui/
│   │   │   ├── AuthForm.tsx
│   │   │   ├── JobForm.tsx
│   │   │   └── HistoryTable.tsx
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   └── useJobs.ts
│   │   ├── lib/
│   │   │   ├── api.ts
│   │   │   └── auth.ts
│   │   └── types/
│   │       └── index.ts
│   ├── public/
│   ├── Dockerfile
│   ├── next.config.js
│   └── package.json
│
├── python-service/           # Selenium Automation
│   ├── src/
│   │   ├── __init__.py
│   │   ├── main.py          # Entry point, queue consumer
│   │   ├── automation.py     # YouTube automation logic
│   │   ├── browser.py       # Browser setup (Selenium)
│   │   ├── scraper.py       # Video data extraction
│   │   ├── queue_client.py  # Redis queue consumer
│   │   └── api_client.py    # Callback to backend
│   ├── requirements.txt
│   ├── Dockerfile
│   └── config.py
│
├── docker-compose.yml        # Orchestrate all services
├── .env.example
└── README.md
`

### Justifikasi Tech Stack

| Component | Pilihan | Alasan |
|-----------|---------|--------|
| Backend | Laravel | Rekomendasi resmi, robust auth & queue ecosystem |
| Frontend | Next.js | SSR, API routes, React ecosystem, easy deployment |
| Python | Selenium | Dukungan mature untuk YouTube automation |
| Queue | Redis + BullMQ | Async job processing, retry mechanism |
| Database | MySQL | Rekomendasi, ACID compliance, familiar syntax |

---

## BAGIAN 2: Database Design

### Ringkasan Database

| Item | Detail |
|------|--------|
| Database | MySQL 8.x |
| ORM | Eloquent (Laravel) |
| Pendekatan | Relational |
| Migration | Laravel Migrate |

### Entity Overview

| Entity | Key Fields | Relasi |
|--------|-----------|--------|
| users | id, name, email, password, created_at, updated_at | 1:N → scroll_jobs |
| scroll_jobs | id, user_id, durasi, durasi_aktual, status, videos_json, started_at, completed_at, created_at | N:1 → users |
| personal_access_tokens | id, tokenable_type, tokenable_id, name, token, abilities, last_used_at, expires_at, created_at | Polymorphic |

### Tabel: users

| Column | Type | Constraints |
|--------|------|------------|
| id | bigint unsigned | PK, AUTO_INCREMENT |
| name | varchar(255) | NOT NULL |
| email | varchar(255) | UNIQUE, NOT NULL |
| password | varchar(255) | NOT NULL |
| created_at | timestamp | |
| updated_at | timestamp | |

### Tabel: scroll_jobs

| Column | Type | Constraints |
|--------|------|------------|
| id | bigint unsigned | PK, AUTO_INCREMENT |
| user_id | bigint unsigned | FK → users.id, NOT NULL |
| durasi | int unsigned | Durasi request dalam detik |
| durasi_aktual | int unsigned | Durasi aktual proses |
| status | enum | 'pending', 'processing', 'completed', 'failed' |
| videos_json | json | Data video yang dikumpulkan |
| error_message | text | Nullable, pesan error jika gagal |
| started_at | timestamp | Nullable |
| completed_at | timestamp | Nullable |
| created_at | timestamp | |
| updated_at | timestamp | |

### Index Strategy

| Tabel | Kolom | Tipe Index | Purpose |
|-------|-------|------------|---------|
| users | email | UNIQUE | Lookup by email |
| scroll_jobs | user_id | INDEX | Filter by user |
| scroll_jobs | status | INDEX | Filter by status |
| scroll_jobs | created_at | INDEX | Sorting history |

### Data Flow

`
1. User Register/Login → AuthController → User created/authenticated
2. User Submit Job → JobController → ScrollJob created (status: pending) → Push to Redis Queue
3. Python Service consumes job → Updates ScrollJob (status: processing)
4. Python Service completes → Calls callback API → ScrollJob updated (status: completed, videos_json populated)
5. User GET History → HistoryController → Returns paginated ScrollJob data
`

---

## BAGIAN 3: Interface Design

### Backend API Routes (Laravel)

#### Auth Endpoints

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | /api/auth/register | Registrasi pengguna baru | No |
| POST | /api/auth/login | Login, return tokens | No |
| POST | /api/auth/logout | Revoke refresh token | Yes |
| POST | /api/auth/refresh | Get new access token | No (uses refresh_token) |

#### Job Endpoints

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | /api/jobs | Submit scroll job | Yes |
| GET | /api/jobs/history | Get user's job history | Yes |
| GET | /api/jobs/{id} | Get job detail | Yes |
| POST | /api/jobs/callback | Callback from Python service | API Token |

#### Request/Response Schemas

**POST /api/auth/register**
`json
// Request
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "password_confirmation": "password123"
}

// Response 201
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": { "id": 1, "name": "John Doe", "email": "john@example.com" }
  }
}
`

**POST /api/auth/login**
`json
// Request
{
  "email": "john@example.com",
  "password": "password123"
}

// Response 200
{
  "success": true,
  "data": {
    "access_token": "eyJ...",
    "refresh_token": "eyJ...",
    "token_type": "Bearer",
    "expires_in": 3600
  }
}
`

**POST /api/auth/refresh**
`json
// Request
{
  "refresh_token": "eyJ..."
}

// Response 200
{
  "success": true,
  "data": {
    "access_token": "eyJ...",
    "expires_in": 3600
  }
}
`

**POST /api/jobs**
`json
// Request
{
  "durasi": 60
}

// Response 201
{
  "success": true,
  "data": {
    "job_id": "uuid-string",
    "status": "queued"
  }
}
`

**GET /api/jobs/history**
`json
// Response 200
{
  "success": true,
  "data": [
    {
      "id": 1,
      "durasi": 60,
      "durasi_aktual": 62,
      "status": "completed",
      "videos_count": 15,
      "created_at": "2026-07-23T10:00:00Z"
    }
  ],
  "pagination": {
    "current_page": 1,
    "per_page": 15,
    "total": 50,
    "last_page": 4
  }
}
`

**POST /api/jobs/callback**
`json
// Request (from Python service)
{
  "job_id": "uuid-string",
  "status": "completed",
  "durasi_aktual": 62,
  "videos": [
    { "title": "Video Title", "url": "https://youtube.com/...", "channel": "Channel Name" }
  ],
  "timestamp": "2026-07-23T10:01:02Z"
}
`

### Frontend Pages

| Route | Component | Description |
|-------|-----------|-------------|
| /login | LoginPage | Form login |
| /register | RegisterPage | Form registrasi |
| / | DashboardPage | Form submit job, status |
| /history | HistoryPage | Tabel history job |

---

## BAGIAN 4: Alur Logika & Business Rules

### Alur: Registrasi

1. User buka /register
2. User isi form (name, email, password)
3. Frontend POST /api/auth/register
4. Backend validasi:
   - Email unik (check database)
   - Password min 8 karakter
   - Password confirmation match
5. Backend buat user record (password di-hash bcrypt)
6. Backend return response 201
7. Frontend redirect ke /login

### Alur: Login

1. User buka /login
2. User isi form (email, password)
3. Frontend POST /api/auth/login
4. Backend validasi credentials
5. Backend generate JWT access_token (15 menit) + refresh_token (7 hari)
6. Backend simpan refresh_token di database (untuk revocation)
7. Backend return tokens
8. Frontend simpan di localStorage/httpOnly cookie
9. Frontend redirect ke /dashboard

### Alur: Submit Job

1. User di dashboard, input durasi (detik)
2. User klik submit
3. Frontend POST /api/jobs dengan access_token
4. Backend JwtMiddleware validasi access_token
5. Backend buat ScrollJob record (status: pending)
6. Backend push job payload ke Redis queue
7. Backend return { job_id, status: "queued" }
8. Frontend tampilkan job_id dan status

### Alur: Queue Processing (Python Service)

1. Python service BRPOP dari Redis queue
2. Parse job payload { job_id, durasi, callback_url }
3. Python update job status → "processing" via callback
4. Selenium buka Chrome headless, navigate ke YouTube Shorts
5. Scroll automation selama {durasi} detik
6. Selenium extract video metadata (title, url, channel)
7. Selenium close browser
8. Python POST results ke callback_url
9. Backend update ScrollJob (status: completed, videos_json)

### Alur: Auto Refresh Token

1. React interceptor on all API calls
2. Jika response 401 (Unauthorized):
   - Ambil refresh_token dari storage
   - POST /api/auth/refresh
   - Simpan access_token baru
   - Retry original request
3. Jika refresh gagal → redirect ke /login

### Alur: Logout

1. User klik logout
2. Frontend POST /api/auth/logout dengan access_token
3. Backend invalidate refresh_token di database
4. Backend return success
5. Frontend hapus tokens dari storage
6. Frontend redirect ke /login

### Business Rules

| Rule | Detail |
|------|--------|
| Password | Min 8 karakter, hashed dengan bcrypt |
| JWT Access Token | Expiry 15 menit |
| JWT Refresh Token | Expiry 7 hari, stored in DB for revocation |
| Durasi | Positif integer, max 300 detik (5 menit) |
| Video Data | JSON array [{ title, url, channel }] |
| History | Paginated, 15 per page, ordered by created_at DESC |

---

## BAGIAN 5: Keamanan, Performa, & Deployment

### Keamanan

| Item | Implementasi |
|------|--------------|
| Password | bcrypt hashing via Laravel Hash |
| JWT Secret | Environment variable, min 32 chars |
| Token Expiry | Access: 15 min, Refresh: 7 days |
| Token Revocation | Refresh tokens stored in DB, can be revoked |
| CORS | Laravel CORS middleware, allow frontend origin |
| Input Validation | Form Request classes, validated before processing |
| SQL Injection | Eloquent ORM parameterization |
| XSS | Laravel Blade escaping, React auto-escaping |

### Performa

| Item | Target |
|------|--------|
| API Response | < 500ms |
| FE Initial Load | < 3s |
| Queue Latency | < 5s after job dispatch |
| DB Query | Indexed columns for common queries |

### Docker Services

`yaml
# docker-compose.yml
services:
  backend:
    build: ./backend
    ports: ["8000:8000"]
    environment:
      - DB_HOST=mysql
      - REDIS_HOST=redis
    depends_on:
      - mysql
      - redis

  frontend:
    build: ./frontend
    ports: ["3000:3000"]
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:8000

  python-service:
    build: ./python-service
    depends_on:
      - redis
    environment:
      - REDIS_HOST=redis
      - BACKEND_URL=http://backend:8000

  mysql:
    image: mysql:8
    environment:
      - MYSQL_ROOT_PASSWORD=secret
      - MYSQL_DATABASE=automation

  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]
`

### Development Setup

`ash
# Clone repo
git clone https://github.com/YOUR_USERNAME/test-programmer-2026.git
cd test-programmer-2026

# Copy environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local

# Start all services
docker-compose up --build

# Or for local development:

# Backend
cd backend
composer install
php artisan key:generate
php artisan migrate
php artisan serve

# Frontend
cd frontend
npm install
npm run dev

# Python Service
cd python-service
pip install -r requirements.txt
python src/main.py
`

### Verification Steps

1. Backend: php artisan route:list - Cek semua endpoint
2. Frontend: 
pm run build - Pastikan no TypeScript errors
3. Python: python src/main.py --test - Test queue connection
4. Docker: docker-compose up - Semua service harus running

---

## Scoring Checklist

| Komponen | File | Poin |
|----------|-------|-------|
| **Backend Auth** | | 20 |
| - Register | backend/app/Http/Controllers/AuthController.php | 3 |
| - Login | backend/app/Http/Controllers/AuthController.php | 4 |
| - Logout | backend/app/Http/Controllers/AuthController.php | 3 |
| - Refresh Token | backend/app/Http/Controllers/AuthController.php | 4 |
| - Middleware | backend/app/Http/Middleware/JwtMiddleware.php | 3 |
| - Error Handling | backend/app/Http/Controllers/AuthController.php | 3 |
| **Backend API** | | 10 |
| - Database Schema | backend/database/migrations/ | 4 |
| - Submit Job API | backend/app/Http/Controllers/JobController.php | 3 |
| - History API | backend/app/Http/Controllers/HistoryController.php | 3 |
| **Python Automation** | | 20 |
| - Real Scroll | python-service/src/automation.py | 8 |
| - Data Collection | python-service/src/scraper.py | 4 |
| - Dynamic Duration | python-service/src/main.py | 3 |
| - Logging & Error | python-service/src/main.py | 2 |
| - Callback | python-service/src/api_client.py | 3 |
| **Queue Integration** | | 15 |
| - Producer | backend/app/Jobs/ProcessScrollJob.php | 5 |
| - Consumer | python-service/src/queue_client.py | 5 |
| - Callback Mechanism | backend/app/Http/Controllers/JobController.php | 5 |
| **Frontend** | | 25 |
| - Register Page | frontend/src/app/(auth)/register/page.tsx | 3 |
| - Login Page | frontend/src/app/(auth)/login/page.tsx | 4 |
| - Auto Refresh | frontend/src/lib/api.ts (interceptor) | 5 |
| - Logout | frontend/src/hooks/useAuth.ts | 3 |
| - Protected Route | frontend/src/app/(dashboard)/layout.tsx | 3 |
| - History Page | frontend/src/app/(dashboard)/history/page.tsx | 5 |
| - UX States | frontend/src/components/ | 2 |
| **Docker** | | 10 |
| - Dockerfiles | backend/Dockerfile, frontend/Dockerfile, python-service/Dockerfile | 4 |
| - docker-compose.yml | docker-compose.yml | 4 |
| - README.md | README.md | 2 |
