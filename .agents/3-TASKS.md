# TASK LIST: Automation Get Data

**Versi:** 1.0  
**Tanggal:** 2026-07-23  
**Based on:** Tech Spec v1.0 + PRD v1.0  
**Total Poin:** 100  
**Estimasi:** 3-4 jam

---

## PRIORITAS UTAMA

- **A) Modul Backend** (30 poin) - Auth + API
- **B) Modul Python** (20 poin) - Automation
- **C) Modul Queue** (15 poin) - Redis Integration
- **D) Modul Frontend** (25 poin) - UI Dashboard
- **E) Modul Docker** (10 poin) - Containerization

---

## MODUL 1: SETUP PROJECT

### T-01: Inisialisasi Mono-repo Structure
- **File:** root/README.md
- **Deskripsi:** Buat struktur folder mono-repo dengan 3 direktori utama
- **Kode:**
  `
  automation-get-data/
  ├── backend/
  ├── frontend/
  ├── python-service/
  ├── docker-compose.yml
  └── README.md
  `
- **Verifikasi:** ls -la di root folder
- **Prioritas:** High | **Status:** Todo

### T-02: Setup Laravel Backend
- **File:** backend/
- **Deskripsi:** Buat project Laravel baru dengan composer create-project
- **Kode:** composer create-project laravel/laravel backend
- **Verifikasi:** php artisan --version
- **Prioritas:** High | **Status:** Todo

### T-03: Setup Next.js Frontend
- **File:** frontend/
- **Deskripsi:** Buat project Next.js dengan TypeScript dan Tailwind
- **Kode:** 
px create-next-app@latest frontend --typescript --tailwind --eslint
- **Verifikasi:** 
pm run dev harus jalan
- **Prioritas:** High | **Status:** Todo

### T-04: Setup Python Service
- **File:** python-service/
- **Deskripsi:** Buat direktori dan file requirements.txt
- **Kode:** pip install selenium redis webdriver-manager
- **Verifikasi:** python -c "import selenium; import redis"
- **Prioritas:** High | **Status:** Todo

---

## MODUL 2: BACKEND - DATABASE

### T-05: Generate User Model & Migration
- **File:** backend/app/Models/User.php, backend/database/migrations/xxxx_create_users_table.php
- **Deskripsi:** Generate User model dengan email unique constraint
- **Kode:**
  `php
  // User Model
  class User extends Authenticatable {
      use HasApiTokens, HasFactory, Notifiable;
      protected  = ['name', 'email', 'password'];
  }
  `
- **Verifikasi:** php artisan migrate
- **Prioritas:** High | **Status:** Todo | **Dependensi:** T-02

### T-06: Generate ScrollJob Model & Migration
- **File:** backend/app/Models/ScrollJob.php, backend/database/migrations/xxxx_create_scroll_jobs_table.php
- **Deskripsi:** Buat tabel scroll_jobs dengan field: user_id, durasi, status, videos_json, timestamps
- **Kode:**
  `php
  // ScrollJob Model
  class ScrollJob extends Model {
      protected  = ['user_id', 'durasi', 'durasi_aktual', 'status', 'videos_json', 'error_message', 'started_at', 'completed_at'];
      public function user() { return ->belongsTo(User::class); }
  }
  `
- **Verifikasi:** php artisan migrate
- **Prioritas:** High | **Status:** Todo | **Dependensi:** T-02

### T-07: Generate PersonalAccessToken Migration
- **File:** backend/database/migrations/xxxx_create_personal_access_tokens_table.php
- **Deskripsi:** Buat tabel untuk menyimpan refresh tokens
- **Verifikasi:** php artisan migrate
- **Prioritas:** High | **Status:** Todo | **Dependensi:** T-02

---

## MODUL 3: BACKEND - AUTHENTICATION (20 POIN)

### T-08: Install JWT Package
- **File:** backend/composer.json
- **Deskripsi:** Install tymon/jwt-auth untuk Laravel
- **Kode:** composer require tymon/jwt-auth
- **Verifikasi:** php artisan jwt:secret
- **Prioritas:** High | **Status:** Todo | **Dependensi:** T-02

### T-09: Setup JWT Config
- **File:** backend/config/auth.php, backend/.env
- **Deskripsi:** Konfigurasi JWT sebagai guard dan provider
- **Kode:**
  `php
  'guards' => [
      'api' => ['driver' => 'jwt', 'provider' => 'users'],
  ]
  `
- **Verifikasi:** php artisan config:clear
- **Prioritas:** High | **Status:** Todo | **Dependensi:** T-08

### T-10: Create RegisterRequest Validation
- **File:** backend/app/Http/Requests/RegisterRequest.php
- **Deskripsi:** Form request untuk validasi registrasi
- **Kode:**
  `php
  class RegisterRequest extends FormRequest {
      public function rules() {
          return [
              'name' => 'required|string|max:255',
              'email' => 'required|email|unique:users',
              'password' => 'required|string|min:8|confirmed',
          ];
      }
  }
  `
- **Verifikasi:** php artisan route:list --path=api/auth
- **Prioritas:** High | **Status:** Todo | **Dependensi:** T-05

### T-11: Create AuthController - Register
- **File:** backend/app/Http/Controllers/AuthController.php
- **Deskripsi:** Endpoint POST /api/auth/register
- **Kode:**
  `php
  public function register(RegisterRequest ) {
       = User::create([
          'name' => ->name,
          'email' => ->email,
          'password' => Hash::make(->password),
      ]);
      return response()->json(['success' => true, 'data' => ['user' => ]], 201);
  }
  `
- **Verifikasi:** php artisan route:list | grep register
- **Prioritas:** High | **Status:** Todo | **Dependensi:** T-10

### T-12: Create AuthController - Login
- **File:** backend/app/Http/Controllers/AuthController.php
- **Deskripsi:** Endpoint POST /api/auth/login dengan JWT generation
- **Kode:**
  `php
  public function login(Request ) {
       = ->only('email', 'password');
      if (! = auth('api')->attempt()) {
          return response()->json(['success' => false, 'message' => 'Invalid credentials'], 401);
      }
      return ->respondWithToken();
  }
  `
- **Verifikasi:** curl -X POST http://localhost:8000/api/auth/login -d email=test@test.com -d password=test
- **Prioritas:** High | **Status:** Todo | **Dependensi:** T-09

### T-13: Create AuthController - Refresh Token
- **File:** backend/app/Http/Controllers/AuthController.php
- **Deskripsi:** Endpoint POST /api/auth/refresh
- **Kode:**
  `php
  public function refresh() {
      return ->respondWithToken(auth('api')->refresh());
  }
  `
- **Verifikasi:** curl -X POST http://localhost:8000/api/auth/refresh -d refresh_token=xxx
- **Prioritas:** High | **Status:** Todo | **Dependensi:** T-12

### T-14: Create AuthController - Logout
- **File:** backend/app/Http/Controllers/AuthController.php
- **Deskripsi:** Endpoint POST /api/auth/logout (invalidate token)
- **Kode:**
  `php
  public function logout() {
      auth('api')->logout();
      return response()->json(['success' => true, 'message' => 'Successfully logged out']);
  }
  `
- **Verifikasi:** Token tidak bisa digunakan setelah logout
- **Prioritas:** High | **Status:** Todo | **Dependensi:** T-12

### T-15: Create JwtMiddleware
- **File:** backend/app/Http/Middleware/JwtMiddleware.php
- **Deskripsi:** Middleware untuk proteksi endpoint yang butuh autentikasi
- **Kode:**
  `php
  class JwtMiddleware {
      public function handle(, Closure ) {
          try {
               = auth('api')->parseToken()->authenticate();
              if (!) return response()->json(['success' => false, 'message' => 'User not found'], 404);
          } catch (Exception ) {
              return response()->json(['success' => false, 'message' => 'Token invalid'], 401);
          }
          return ();
      }
  }
  `
- **Verifikasi:** Endpoint tanpa token harus return 401
- **Prioritas:** High | **Status:** Todo | **Dependensi:** T-08

### T-16: Setup API Routes
- **File:** backend/routes/api.php
- **Deskripsi:** Definisikan semua route API
- **Kode:**
  `php
  Route::prefix('auth')->group(function () {
      Route::post('/register', [AuthController::class, 'register']);
      Route::post('/login', [AuthController::class, 'login']);
      Route::post('/refresh', [AuthController::class, 'refresh'])->middleware('jwt.refresh');
      Route::post('/logout', [AuthController::class, 'logout'])->middleware('jwt.auth');
  });
  `
- **Verifikasi:** php artisan route:list --path=api
- **Prioritas:** High | **Status:** Todo | **Dependensi:** T-11, T-12, T-13, T-14

---

## MODUL 4: BACKEND - API & JOBS (10 POIN)

### T-17: Create SubmitJobRequest
- **File:** backend/app/Http/Requests/SubmitJobRequest.php
- **Deskripsi:** Validasi input durasi
- **Kode:**
  `php
  class SubmitJobRequest extends FormRequest {
      public function rules() {
          return ['durasi' => 'required|integer|min:1|max:300'];
      }
  }
  `
- **Verifikasi:** Validasi error jika durasi > 300
- **Prioritas:** High | **Status:** Todo | **Dependensi:** T-06

### T-18: Create JobController - Submit Job
- **File:** backend/app/Http/Controllers/JobController.php
- **Deskripsi:** Endpoint POST /api/jobs - buat job + push ke queue
- **Kode:**
  `php
  public function store(SubmitJobRequest ) {
       = ScrollJob::create([
          'user_id' => auth('api')->id(),
          'durasi' => ->durasi,
          'status' => 'pending',
      ]);
      // Push to Redis queue
      dispatch(new ProcessScrollJob());
      return response()->json(['success' => true, 'data' => ['job_id' => ->id, 'status' => 'queued']], 201);
  }
  `
- **Verifikasi:** Job tersimpan dengan status 'pending'
- **Prioritas:** High | **Status:** Todo | **Dependensi:** T-17, T-20

### T-19: Create JobController - Get History
- **File:** backend/app/Http/Controllers/JobController.php
- **Deskripsi:** Endpoint GET /api/jobs/history dengan pagination
- **Kode:**
  `php
  public function history() {
       = ScrollJob::where('user_id', auth('api')->id())
          ->orderBy('created_at', 'desc')
          ->paginate(15);
      return response()->json(['success' => true, 'data' => ]);
  }
  `
- **Verifikasi:** GET /api/jobs/history return paginated data
- **Prioritas:** High | **Status:** Todo | **Dependensi:** T-15

### T-20: Create ProcessScrollJob Job Class
- **File:** backend/app/Jobs/ProcessScrollJob.php
- **Deskripsi:** Laravel Job untuk push ke Redis queue
- **Kode:**
  `php
  class ProcessScrollJob implements ShouldQueue {
      use Dispatchable, Queueable;
      public function __construct(public ScrollJob ) {}
      public function handle() {
          Redis::lpush('scroll_jobs', json_encode([
              'job_id' => ->job->id,
              'durasi' => ->job->durasi,
              'callback_url' => config('app.url') . '/api/jobs/callback',
          ]));
      }
  }
  `
- **Verifikasi:** Data masuk ke Redis queue
- **Prioritas:** High | **Status:** Todo | **Dependensi:** T-18

### T-21: Create JobController - Callback
- **File:** backend/app/Http/Controllers/JobController.php
- **Deskripsi:** Endpoint POST /api/jobs/callback dari Python service
- **Kode:**
  `php
  public function callback(Request ) {
       = ScrollJob::find(->job_id);
      if (!) return response()->json(['success' => false], 404);
      ->update([
          'status' => ->status,
          'durasi_aktual' => ->durasi_aktual,
          'videos_json' => json_encode(->videos),
          'completed_at' => ->timestamp,
          'error_message' => ->error_message ?? null,
      ]);
      return response()->json(['success' => true]);
  }
  `
- **Verifikasi:** Job updated dari Python service
- **Prioritas:** High | **Status:** Todo | **Dependensi:** T-20

---

## MODUL 5: PYTHON SERVICE - AUTOMATION (20 POIN)

### T-22: Create Python config.py
- **File:** python-service/config.py
- **Deskripsi:** Konfigurasi untuk Redis dan Backend URL
- **Kode:**
  `python
  import os
  REDIS_HOST = os.getenv('REDIS_HOST', 'localhost')
  REDIS_PORT = int(os.getenv('REDIS_PORT', 6379))
  BACKEND_URL = os.getenv('BACKEND_URL', 'http://localhost:8000')
  QUEUE_NAME = 'scroll_jobs'
  `
- **Verifikasi:** python config.py tanpa error
- **Prioritas:** High | **Status:** Todo

### T-23: Create Python browser.py
- **File:** python-service/src/browser.py
- **Deskripsi:** Setup Chrome WebDriver headless
- **Kode:**
  `python
  from selenium import webdriver
  from selenium.webdriver.chrome.options import Options
  def get_browser():
      options = Options()
      options.add_argument('--headless')
      options.add_argument('--no-sandbox')
      options.add_argument('--disable-dev-shm-usage')
      driver = webdriver.Chrome(options=options)
      return driver
  `
- **Verifikasi:** python -c "from browser import get_browser; print('OK')"
- **Prioritas:** High | **Status:** Todo | **Dependensi:** T-04

### T-24: Create Python scraper.py
- **File:** python-service/src/scraper.py
- **Deskripsi:** Extract video metadata dari YouTube Shorts
- **Kode:**
  `python
  def get_video_data(driver):
      videos = []
      elements = driver.find_elements('a[id=\"video-title\"]')
      for el in elements[:20]:
          videos.append({
              'title': el.get_attribute('title'),
              'url': el.get_attribute('href'),
              'channel': el.find_element('ytd-channel-name').text
          })
      return videos
  `
- **Verifikasi:** Test extraction dengan mock data
- **Prioritas:** High | **Status:** Todo | **Dependensi:** T-23

### T-25: Create Python automation.py
- **File:** python-service/src/automation.py
- **Deskripsi:** Logic scroll YouTube Shorts selama durasi
- **Kode:**
  `python
  def scroll_youtube(driver, duration_seconds):
      driver.get('https://www.youtube.com/shorts')
      import time
      start = time.time()
      while time.time() - start < duration_seconds:
          driver.execute_script('window.scrollBy(0, 500)')
          time.sleep(1)
      return get_video_data(driver)
  `
- **Verifikasi:** Scroll berjalan sesuai durasi (bukan simulasi!)
- **Prioritas:** High | **Status:** Todo | **Dependensi:** T-24

### T-26: Create Python queue_client.py
- **File:** python-service/src/queue_client.py
- **Deskripsi:** Consume job dari Redis queue
- **Kode:**
  `python
  import redis
  import json
  def consume_job():
      r = redis.Redis(host=REDIS_HOST, port=REDIS_PORT)
      while True:
          data = r.brpop(QUEUE_NAME, timeout=5)
          if data:
              job = json.loads(data[1])
              process_job(job)
  `
- **Verifikasi:** Consumer menerima job dari queue
- **Prioritas:** High | **Status:** Todo | **Dependensi:** T-22

### T-27: Create Python api_client.py
- **File:** python-service/src/api_client.py
- **Deskripsi:** Callback ke Backend setelah job selesai
- **Kode:**
  `python
  import requests
  def send_result(job_id, status, durasi_aktual, videos, error=None):
      payload = {
          'job_id': job_id,
          'status': status,
          'durasi_aktual': durasi_aktual,
          'videos': videos,
          'timestamp': datetime.now().isoformat(),
          'error_message': error
      }
      requests.post(f'{BACKEND_URL}/api/jobs/callback', json=payload)
  `
- **Verifikasi:** Backend menerima callback
- **Prioritas:** High | **Status:** Todo | **Dependensi:** T-26

### T-28: Create Python main.py (Entry Point)
- **File:** python-service/src/main.py
- **Deskripsi:** Entry point dengan error handling dan logging
- **Kode:**
  `python
  import logging
  import sys
  def main():
      logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
      logger = logging.getLogger(__name__)
      logger.info('Starting Python Service...')
      try:
          consume_job()
      except KeyboardInterrupt:
          logger.info('Shutting down...')
      except Exception as e:
          logger.error(f'Error: {e}')
  if __name__ == '__main__':
      main()
  `
- **Verifikasi:** python src/main.py jalan dan listen queue
- **Prioritas:** High | **Status:** Todo | **Dependensi:** T-25, T-26, T-27

---

## MODUL 6: FRONTEND - SETUP & LAYOUT (25 POIN)

### T-29: Setup Tailwind CSS
- **File:** frontend/tailwind.config.ts, frontend/postcss.config.js
- **Deskripsi:** Konfigurasi Tailwind CSS
- **Verifikasi:** 
pm run build sukses
- **Prioritas:** High | **Status:** Todo | **Dependensi:** T-03

### T-30: Create API Client lib
- **File:** frontend/src/lib/api.ts
- **Deskripsi:** Setup axios instance dengan interceptor
- **Kode:**
  `	ypescript
  import axios from 'axios';
  const api = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_URL });
  api.interceptors.response.use(
    response => response,
    async error => {
      if (error.response?.status === 401) {
        const refreshed = await refreshToken();
        if (refreshed) {
          error.config.headers.Authorization = \Bearer \\;
          return api(error.config);
        }
        logout();
      }
      return Promise.reject(error);
    }
  );
  `
- **Verifikasi:** Interceptor handle 401
- **Prioritas:** High | **Status:** Todo | **Dependensi:** T-29

### T-31: Create Auth Store (Zustand)
- **File:** frontend/src/stores/authStore.ts
- **Deskripsi:** State management untuk auth
- **Kode:**
  `	ypescript
  import { create } from 'zustand';
  interface AuthState {
    accessToken: string | null;
    setAccessToken: (token: string) => void;
    logout: () => void;
  }
  export const useAuthStore = create<AuthState>((set) => ({
    accessToken: null,
    setAccessToken: (token) => set({ accessToken: token }),
    logout: () => set({ accessToken: null }),
  }));
  `
- **Verifikasi:** Token tersimpan dan bisa diakses
- **Prioritas:** High | **Status:** Todo | **Dependensi:** T-30

### T-32: Create Login Page
- **File:** frontend/src/app/\(auth\)/login/page.tsx
- **Deskripsi:** Form login dengan validasi
- **Kode:**
  `	ypescript
  'use client';
  export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const handleSubmit = async (e: FormEvent) => {
      e.preventDefault();
      await login(email, password);
    };
    return (
      <form onSubmit={handleSubmit}>
        <input value={email} onChange={e => setEmail(e.target.value)} />
        <input type=\"password\" value={password} onChange={e => setPassword(e.target.value)} />
        <button type=\"submit\">Login</button>
      </form>
    );
  }
  `
- **Verifikasi:** Login berhasil, token tersimpan
- **Prioritas:** High | **Status:** Todo | **Dependensi:** T-31

### T-33: Create Register Page
- **File:** frontend/src/app/\(auth\)/register/page.tsx
- **Deskripsi:** Form registrasi
- **Verifikasi:** Registrasi berhasil, redirect ke login
- **Prioritas:** High | **Status:** Todo | **Dependensi:** T-31

### T-34: Create Protected Layout
- **File:** frontend/src/app/\(dashboard\)/layout.tsx
- **Deskripsi:** Layout dengan proteksi route
- **Kode:**
  `	ypescript
  'use client';
  export default function DashboardLayout({ children }) {
    const { accessToken } = useAuthStore();
    const router = useRouter();
    useEffect(() => {
      if (!accessToken) router.push('/login');
    }, [accessToken, router]);
    if (!accessToken) return null;
    return <>{children}</>;
  }
  `
- **Verifikasi:** User tanpa token di-redirect ke /login
- **Prioritas:** High | **Status:** Todo | **Dependensi:** T-31

### T-35: Create Dashboard Page
- **File:** frontend/src/app/\(dashboard\)/page.tsx
- **Deskripsi:** Form submit job + status
- **Verifikasi:** Job submit berhasil, status update
- **Prioritas:** High | **Status:** Todo | **Dependensi:** T-34

### T-36: Create History Page
- **File:** frontend/src/app/\(dashboard\)/history/page.tsx
- **Deskripsi:** Tabel history dengan pagination
- **Verifikasi:** Data history tampil dengan pagination
- **Prioritas:** High | **Status:** Todo | **Dependensi:** T-34

### T-37: Add Loading & Error States
- **File:** frontend/src/components/
- **Deskripsi:** Loading spinner dan error messages
- **Verifikasi:** UX feedback saat loading/error
- **Prioritas:** Mid | **Status:** Todo | **Dependensi:** T-32, T-35, T-36

---

## MODUL 7: DOCKER (10 POIN)

### T-38: Create Backend Dockerfile
- **File:** backend/Dockerfile
- **Deskripsi:** Multi-stage build untuk Laravel
- **Kode:**
  `dockerfile
  FROM php:8.2-cli
  WORKDIR /var/www/html
  COPY composer.json composer.lock ./
  RUN composer install --no-dev --optimize-autoloader
  COPY . .
  EXPOSE 8000
  CMD [\"php\", \"artisan\", \"serve\", \"--host=0.0.0.0\"]
  `
- **Verifikasi:** docker build -t backend ./backend
- **Prioritas:** High | **Status:** Todo | **Dependensi:** T-11

### T-39: Create Frontend Dockerfile
- **File:** frontend/Dockerfile
- **Deskripsi:** Multi-stage build untuk Next.js + nginx
- **Kode:**
  `dockerfile
  FROM node:20-alpine AS builder
  WORKDIR /app
  COPY package*.json ./
  RUN npm ci
  COPY . .
  RUN npm run build
  FROM nginx:alpine
  COPY --from=builder /app/.next /usr/share/nginx/html
  COPY nginx.conf /etc/nginx/conf.d/default.conf
  EXPOSE 3000
  CMD [\"nginx\", \"-g\", \"daemon off;\"]
  `
- **Verifikasi:** docker build -t frontend ./frontend
- **Prioritas:** High | **Status:** Todo | **Dependensi:** T-36

### T-40: Create Python Dockerfile
- **File:** python-service/Dockerfile
- **Deskripsi:** Build image dengan Chrome
- **Kode:**
  `dockerfile
  FROM python:3.11-slim
  RUN apt-get update && apt-get install -y wget gnupg
  RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - && \\
      echo \"deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main\" >> /etc/apt/sources.list
  RUN apt-get update && apt-get install -y google-chrome-stable
  WORKDIR /app
  COPY requirements.txt .
  RUN pip install -r requirements.txt
  COPY . .
  CMD [\"python\", \"src/main.py\"]
  `
- **Verifikasi:** docker build -t python-service ./python-service
- **Prioritas:** High | **Status:** Todo | **Dependensi:** T-28

### T-41: Create docker-compose.yml
- **File:** root/docker-compose.yml
- **Deskripsi:** Orchestrate semua service
- **Kode:**
  `yaml
  version: '3.8'
  services:
    backend:
      build: ./backend
      ports: [\"8000:8000\"]
      environment:
        - DB_HOST=mysql
        - REDIS_HOST=redis
      depends_on: [mysql, redis]
    frontend:
      build: ./frontend
      ports: [\"3000:3000\"]
      environment:
        - NEXT_PUBLIC_API_URL=http://localhost:8000
    python-service:
      build: ./python-service
      depends_on: [redis, backend]
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
      ports: [\"6379:6379\"]
  `
- **Verifikasi:** docker-compose up semua service jalan
- **Prioritas:** High | **Status:** Todo | **Dependensi:** T-38, T-39, T-40

### T-42: Create nginx.conf
- **File:** frontend/nginx.conf
- **Deskripsi:** Nginx config untuk Next.js
- **Verifikasi:** Frontend accessible via nginx
- **Prioritas:** Mid | **Status:** Todo | **Dependensi:** T-39

### T-43: Create README.md
- **File:** root/README.md
- **Deskripsi:** Dokumentasi cara menjalankan project
- **Verifikasi:** README lengkap dan akurat
- **Prioritas:** Mid | **Status:** Todo | **Dependensi:** T-41

---

## TASK SUMMARY

| ID | Task | Modul | Poin | Prioritas | Status |
|----|------|-------|------|------------|--------|
| T-01 | Mono-repo Structure | Setup | - | High | Todo |
| T-02 | Setup Laravel | Setup | - | High | Todo |
| T-03 | Setup Next.js | Setup | - | High | Todo |
| T-04 | Setup Python | Setup | - | High | Todo |
| T-05 | User Model & Migration | Backend | - | High | Todo |
| T-06 | ScrollJob Model & Migration | Backend | - | High | Todo |
| T-07 | PersonalAccessToken Migration | Backend | - | High | Todo |
| T-08 | Install JWT Package | Backend Auth | 3 | High | Todo |
| T-09 | Setup JWT Config | Backend Auth | - | High | Todo |
| T-10 | RegisterRequest Validation | Backend Auth | 3 | High | Todo |
| T-11 | AuthController - Register | Backend Auth | 3 | High | Todo |
| T-12 | AuthController - Login | Backend Auth | 4 | High | Todo |
| T-13 | AuthController - Refresh | Backend Auth | 4 | High | Todo |
| T-14 | AuthController - Logout | Backend Auth | 3 | High | Todo |
| T-15 | JwtMiddleware | Backend Auth | 3 | High | Todo |
| T-16 | Setup API Routes | Backend | 3 | High | Todo |
| T-17 | SubmitJobRequest | Backend API | 3 | High | Todo |
| T-18 | JobController - Submit | Backend API | 3 | High | Todo |
| T-19 | JobController - History | Backend API | 3 | High | Todo |
| T-20 | ProcessScrollJob | Backend Queue | 5 | High | Todo |
| T-21 | JobController - Callback | Backend Queue | 5 | High | Todo |
| T-22 | Python config.py | Python | - | High | Todo |
| T-23 | Python browser.py | Python | 8 | High | Todo |
| T-24 | Python scraper.py | Python | 4 | High | Todo |
| T-25 | Python automation.py | Python | 8 | High | Todo |
| T-26 | Python queue_client.py | Python | 5 | High | Todo |
| T-27 | Python api_client.py | Python | 3 | High | Todo |
| T-28 | Python main.py | Python | 2 | High | Todo |
| T-29 | Setup Tailwind | Frontend | - | High | Todo |
| T-30 | Create API Client | Frontend | 5 | High | Todo |
| T-31 | Auth Store | Frontend | 3 | High | Todo |
| T-32 | Login Page | Frontend | 4 | High | Todo |
| T-33 | Register Page | Frontend | 3 | High | Todo |
| T-34 | Protected Layout | Frontend | 3 | High | Todo |
| T-35 | Dashboard Page | Frontend | - | High | Todo |
| T-36 | History Page | Frontend | 5 | High | Todo |
| T-37 | Loading/Error States | Frontend | 2 | Mid | Todo |
| T-38 | Backend Dockerfile | Docker | 4/3 | High | Todo |
| T-39 | Frontend Dockerfile | Docker | 4/3 | High | Todo |
| T-40 | Python Dockerfile | Docker | 4/3 | High | Todo |
| T-41 | docker-compose.yml | Docker | 4 | High | Todo |
| T-42 | nginx.conf | Docker | - | Mid | Todo |
| T-43 | README.md | Docker | 2 | Mid | Todo |

---

## MODUL PRIORITY ORDER

1. **Setup Project** (T-01 s/d T-04)
2. **Backend Auth** (T-05 s/d T-16)
3. **Backend API & Queue** (T-17 s/d T-21)
4. **Python Automation** (T-22 s/d T-28)
5. **Frontend** (T-29 s/d T-37)
6. **Docker** (T-38 s/d T-43)
