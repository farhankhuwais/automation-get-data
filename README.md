# Automation Get Data

Sistem otomatisasi scroll YouTube Shorts dengan 3 komponen: Backend API (Laravel), Frontend (Next.js), dan Python Service (Selenium).

## Tech Stack

| Komponen | Teknologi | Port |
|----------|------------|------|
| Backend | Laravel 12 + PHP 8.2 | 8000 |
| Frontend | Next.js 14 + TypeScript + Tailwind CSS | 80 |
| Python | Selenium 4 + Chrome headless | - |
| Queue | Redis 7 | 6379 |
| Database | MySQL 8 | 3306 |

## Prerequisites

- [Docker Desktop](https://docs.docker.com/desktop/install/windows-install/) (Windows) / Docker + Docker Compose (Linux/Mac)
- Git

## Struktur Project

```
automation-get-data/
├── backend/              # Laravel API
├── frontend/             # Next.js App
├── python-service/       # Selenium Automation
├── docker-compose.yml    # Orchestrate semua service
├── README.md
├── DEVELOPER.md          # Dokumentasi teknis
└── .agents/              # PRD, Tech Spec, Tasks
```

---

## Cara Menjalankan

### 1. Docker (Recommended)

```bash
# Clone repository
git clone https://github.com/YOUR_USERNAME/test-programmer-2026.git
cd test-programmer-2026

# Build dan start semua service
docker-compose up --build -d

# Tunggu sampai semua service ready
docker-compose ps

# Setup database & generate keys
docker exec automation-backend php artisan migrate --force
docker exec automation-backend php artisan key:generate --force
docker exec automation-backend php artisan jwt:secret --force

# Clear config cache
docker exec automation-backend php artisan config:clear
```

Service URLs:

| Service | URL |
|---------|-----|
| Frontend | http://localhost |
| Backend API | http://localhost:8000/api |
| MySQL | localhost:3306 |
| Redis | localhost:6379 |

### 2. Development Lokal (Tanpa Docker)

#### Backend (Laravel)

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan jwt:secret --force
php artisan migrate --seed
php artisan serve
```

#### Frontend (Next.js)

```bash
cd frontend
npm install
npm run dev
```

#### Python Service

```bash
cd python-service
pip install -r requirements.txt
export REDIS_HOST=localhost
export REDIS_PORT=6379
export BACKEND_URL=http://localhost:8000
python -m src.main
```

---

## Testing

### Register

```bash
Invoke-RestMethod -Uri http://localhost:8000/api/auth/register -Method POST -ContentType "application/json" -Body '{"name":"Test User","email":"test@example.com","password":"password123","password_confirmation":"password123"}'
```

### Login

```bash
Invoke-RestMethod -Uri http://localhost:8000/api/auth/login -Method POST -ContentType "application/json" -Body '{"email":"test@example.com","password":"password123"}'
```

### Submit Job

```powershell
$token = "YOUR_ACCESS_TOKEN"
Invoke-RestMethod -Uri http://localhost:8000/api/jobs -Method POST -ContentType "application/json" -Headers @{"Authorization"="Bearer $token"} -Body '{"durasi": 10}'
```

### Get History

```powershell
$token = "YOUR_ACCESS_TOKEN"
Invoke-RestMethod -Uri "http://localhost:8000/api/jobs/history" -Headers @{"Authorization"="Bearer $token"}
```

---

## API Endpoints

### Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /api/auth/register | Registrasi | No |
| POST | /api/auth/login | Login | No |
| POST | /api/auth/logout | Logout | Yes |
| POST | /api/auth/refresh | Refresh token | Yes |

### Jobs

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /api/jobs | Submit scroll job | Yes |
| GET | /api/jobs/history | Get history | Yes |
| GET | /api/jobs/{id} | Get job detail | Yes |
| POST | /api/jobs/callback | Callback Python | No |

---

## Environment Variables

### Backend (.env)

```env
APP_NAME=AutomationGetData
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=mysql
DB_PORT=3306
DB_DATABASE=automation
DB_USERNAME=root
DB_PASSWORD=secret

REDIS_HOST=redis
REDIS_PORT=6379

QUEUE_CONNECTION=redis
SESSION_DRIVER=file

JWT_SECRET=your-secret-here
JWT_TTL=15
JWT_REFRESH_TTL=10080
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

### Python (.env)

```env
REDIS_HOST=localhost
REDIS_PORT=6379
BACKEND_URL=http://localhost:8000
```

---

## Docker Commands

```bash
# Start
docker-compose up --build -d

# Stop
docker-compose down

# Rebuild
docker-compose down
docker-compose up --build -d

# Logs
docker-compose logs -f
docker-compose logs -f backend

# Restart
docker-compose restart backend

# Shell into container
docker exec -it automation-backend bash
docker exec -it automation-python sh
```

---

## Alur Sistem

```
User Login (Frontend)
    ↓
Backend (Laravel) → Generate JWT
    ↓
User Submit Job (durasi: 60 detik)
    ↓
Laravel → Redis Queue 'scroll_jobs'
    ↓
Python Service (BRPOP)
    ↓
Selenium Chrome headless → YouTube Shorts
    ↓
Scroll 60 detik → Extract videos metadata
    ↓
POST callback ke Backend
    ↓
ScrollJob.updated (status: completed, videos_json)
    ↓
User GET History
```

---

## Scoring (100 Poin)

| Komponen | Poin |
|----------|------|
| Backend Auth & API | 30 |
| Python Automation | 20 |
| Queue Integration | 15 |
| Frontend | 25 |
| Docker Deployment | 10 |
| **Total** | **100** |

---

## Catatan Penting

1. **Automation REAL** - Selenium scroll, bukan sleep/loop
2. **Mono-repo** - 3 folder terpisah dalam 1 repo
3. Pengumpulan via Git public
4. **Jangan ubah repo setelah submit** = diskualifikasi

---

## Troubleshooting

### Backend restart loop

```bash
docker-compose logs backend
docker exec automation-backend php artisan config:clear
```

### Redis connection failed

```bash
docker-compose restart redis
```

### Frontend 500

```bash
docker-compose up --build -d frontend
```

### Database migration

```bash
docker exec automation-backend php artisan migrate --force
```

### Reset all

```bash
docker-compose down -v
docker-compose up --build -d
docker exec automation-backend php artisan migrate --force
docker exec automation-backend php artisan key:generate --force
docker exec automation-backend php artisan jwt:secret --force
docker exec automation-backend php artisan config:clear
```

---

## License

MIT
