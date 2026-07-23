# Developer Guide - Automation Get Data

## Overview

Sistem **Automation Get Data** adalah platform untuk otomatisasi scroll YouTube Shorts dengan 3 komponen utama:

1. **Backend (Laravel 12)** - API dengan autentikasi JWT
2. **Frontend (Next.js 14)** - Dashboard untuk submit job & lihat history
3. **Python Service (Selenium 4)** - Automation real scroll YouTube

---

## Tech Stack

| Komponen | Teknologi | Port |
|----------|------------|------|
| Backend | Laravel 12 + PHP 8.2 | 8000 |
| Frontend | Next.js 14 + TypeScript + Tailwind CSS | 80 |
| Python | Selenium 4 + Chrome headless | - |
| Database | MySQL 8 | 3306 |
| Queue | Redis 7 | 6379 |
| Container | Docker + Docker Compose | - |

---

## Struktur Project

```
automation-get-data/
├── backend/                      # Laravel 12 API
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/
│   │   │   │   ├── AuthController.php      # Register, Login, Logout, Refresh
│   │   │   │   ├── JobController.php       # Submit, History, Callback
│   │   │   │   └── Controller.php
│   │   │   ├── Middleware/
│   │   │   │   ├── JwtMiddleware.php       # JWT auth guard
│   │   │   │   └── JwtRefreshMiddleware.php
│   │   │   └── Requests/
│   │   │       ├── RegisterRequest.php     # email unique, password min 8
│   │   │       ├── LoginRequest.php
│   │   │       └── SubmitJobRequest.php    # durasi 1-300
│   │   ├── Models/
│   │   │   ├── User.php                   # implements JWTSubject
│   │   │   └── ScrollJob.php              # status enum, videos_json
│   │   ├── Jobs/
│   │   │   └── ProcessScrollJob.php       # Push ke Redis queue
│   │   └── Providers/
│   │       └── AppServiceProvider.php
│   ├── config/
│   │   ├── app.php
│   │   ├── auth.php                        # guard api = jwt
│   │   ├── jwt.php                         # from tymon/jwt-auth
│   │   ├── database.php                    # mysql + redis
│   │   └── queue.php                       # redis queue
│   ├── database/
│   │   ├── migrations/
│   │   │   ├── *_create_users_table.php
│   │   │   ├── *_create_scroll_jobs_table.php
│   │   │   └── *_create_personal_access_tokens_table.php
│   │   └── seeders/
│   ├── routes/
│   │   ├── api.php                         # API routes
│   │   └── web.php
│   ├── bootstrap/app.php                   # Laravel 12 config
│   ├── public/index.php
│   ├── artisan
│   ├── composer.json
│   ├── .env
│   ├── .env.example
│   └── Dockerfile
│
├── frontend/                     # Next.js 14 + TypeScript
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx                   # Landing page
│   │   │   ├── login/page.tsx             # Form login
│   │   │   ├── register/page.tsx          # Form registrasi
│   │   │   ├── dashboard/page.tsx         # Protected - Submit job
│   │   │   └── history/page.tsx           # Protected - History
│   │   ├── components/
│   │   │   ├── DashboardContent.tsx
│   │   │   └── HistoryContent.tsx
│   │   ├── hooks/
│   │   │   └── useAuth.ts                 # login, register, logout
│   │   ├── lib/
│   │   │   └── api.ts                     # Axios + interceptor
│   │   └── stores/
│   │       └── authStore.ts               # Zustand persist
│   ├── nginx.conf                         # Reverse proxy to backend
│   ├── package.json
│   ├── tailwind.config.ts
│   ├── next.config.js
│   └── Dockerfile
│
├── python-service/                # Selenium 4 + Chrome
│   ├── src/
│   │   ├── main.py                        # Entry point
│   │   ├── automation.py                  # Scroll YouTube Shorts
│   │   ├── browser.py                     # Chrome WebDriver headless
│   │   ├── scraper.py                     # Extract video metadata
│   │   ├── queue_client.py                # Redis BRPOP consumer
│   │   ├── api_client.py                  # Callback ke backend
│   │   └── logger.py                      # JSON logging
│   ├── config.py
│   ├── requirements.txt
│   └── Dockerfile
│
├── docker-compose.yml
├── README.md
└── DEVELOPER.md
```

---

## Database Schema

### users

| Column | Type | Constraints |
|--------|------|-------------|
| id | bigint | PK, AUTO_INCREMENT |
| name | varchar(255) | NOT NULL |
| email | varchar(255) | UNIQUE |
| password | varchar(255) | bcrypt hashed |
| created_at | timestamp | |
| updated_at | timestamp | |

### scroll_jobs

| Column | Type | Constraints |
|--------|------|-------------|
| id | bigint | PK, AUTO_INCREMENT |
| user_id | bigint | FK → users.id, INDEX |
| durasi | int | Request duration (seconds) |
| durasi_aktual | int | Actual duration |
| status | enum | pending, processing, completed, failed |
| videos_json | json | Array [{title, url, channel}] |
| error_message | text | Nullable |
| started_at | timestamp | Nullable |
| completed_at | timestamp | Nullable |
| created_at | timestamp | |

---

## API Endpoints

### Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /api/auth/register | Register new user | No |
| POST | /api/auth/login | Login, returns JWT | No |
| POST | /api/auth/logout | Invalidate token | Yes |
| POST | /api/auth/refresh | Refresh access token | Yes |

### Jobs

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /api/jobs | Submit scroll job | Yes |
| GET | /api/jobs/history | Get paginated history | Yes |
| GET | /api/jobs/{id} | Get job detail | Yes |
| POST | /api/jobs/callback | Callback from Python | No |

---

## JWT Flow

```
1. POST /api/auth/login
2. Backend verify credentials via auth('api')->attempt()
3. Generate JWT access_token (TTL: 15 min)
4. Return { access_token, token_type, expires_in }
5. Frontend store in Zustand persist
6. Axios interceptor attach Authorization: Bearer {token}
7. On 401: POST /api/auth/refresh with current token
8. Get new access_token, retry request
```

---

## Queue Flow

```
1. POST /api/jobs → JobController::store()
2. Create ScrollJob (status: pending)
3. ProcessScrollJob::dispatch() → Redis LPUSH 'scroll_jobs'
4. Python Service: BRPOP 'scroll_jobs'
5. Selenium: Buka Chrome headless → youtube.com/shorts
6. Scroll sesuai durasi + extract video metadata
7. POST callback ke /api/jobs/callback
8. JobController::callback() → update ScrollJob
```

---

## Frontend Architecture

### Pages

| Route | Description | Auth Required |
|-------|-------------|---------------|
| `/` | Landing page | No |
| `/login` | Form login | No |
| `/register` | Form registrasi | No |
| `/dashboard` | Submit job + status | Yes |
| `/history` | Job history table | Yes |

### State Management (Zustand)

```typescript
interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  setAccessToken: (token: string) => void;
  logout: () => void;
}
```

### API Interceptor

Axios interceptor handles:
- Attach `Authorization: Bearer {token}` header
- On 401: try refresh token
- On refresh fail: redirect to login

---

## Docker Services

```yaml
services:
  backend:      port 8000  # Laravel API
  frontend:     port 80    # Next.js (nginx)
  python-service:          # Selenium consumer
  mysql:        port 3306  # Database
  redis:        port 6379  # Queue
```

---

## Scoring Checklist

| Komponen | Poin | Status |
|----------|------|--------|
| **Backend Auth** | 20 | |
| Register | 3 | ✅ |
| Login | 4 | ✅ |
| Logout | 3 | ✅ |
| Refresh Token | 4 | ✅ |
| JWT Middleware | 3 | ✅ |
| Error handling | 3 | ✅ |
| **Backend API** | 10 | |
| Database schema | 4 | ✅ |
| Submit job API | 3 | ✅ |
| History API | 3 | ✅ |
| **Python Automation** | 20 | |
| Real scroll | 8 | ✅ |
| Data collection | 4 | ✅ |
| Dynamic duration | 3 | ✅ |
| Logging & error | 2 | ✅ |
| Callback | 3 | ✅ |
| **Queue Integration** | 15 | |
| Producer | 5 | ✅ |
| Consumer | 5 | ✅ |
| Callback | 5 | ✅ |
| **Frontend** | 25 | |
| Register page | 3 | ✅ |
| Login page | 4 | ✅ |
| Auto refresh token | 5 | ✅ |
| Logout | 3 | ✅ |
| Protected route | 3 | ✅ |
| History page | 5 | ✅ |
| UX states | 2 | ✅ |
| **Docker** | 10 | |
| Dockerfiles (3) | 4 | ✅ |
| docker-compose.yml | 4 | ✅ |
| README.md | 2 | ✅ |
| **TOTAL** | **100** | |

---

## Quick Reset

```bash
docker-compose down -v
docker-compose up --build -d
docker exec automation-backend php artisan migrate --force
docker exec automation-backend php artisan key:generate --force
docker exec automation-backend php artisan jwt:secret --force
docker exec automation-backend php artisan config:clear
```
