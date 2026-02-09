# Inventaris - Sistem Manajemen Asset Sekolah

Aplikasi web untuk manajemen inventaris dan asset sekolah. Dibangun dengan Next.js untuk frontend dan Express.js untuk backend, dengan database PostgreSQL.

## Fitur Utama

- 📦 **Manajemen Asset** - Kelola semua asset sekolah (tambah, edit, hapus, lihat detail)
- 📊 **Dashboard Analytics** - Lihat statistik asset, kondisi, dan kategori
- 🏷️ **Kategori & Lokasi** - Organisir asset berdasarkan kategori dan lokasi
- 👥 **Multi-role** - Support untuk berbagai role user
- 🔐 **Autentikasi** - Sistem login yang aman dengan JWT
- 📝 **Logging** - Tracking histori perubahan asset

## Tech Stack

**Frontend:**
- Next.js 14 (App Router)
- React 18
- Tailwind CSS
- Axios
- React Hot Toast

**Backend:**
- Express.js
- Sequelize ORM
- PostgreSQL
- JWT Authentication
- bcryptjs

## Setup & Instalasi

### 1. Clone Repository

```bash
git clone https://github.com/Rustaman1280/tefacontoh.git
cd tefacontoh
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Buat file `.env` di folder backend:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=inventaris_db
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
```

Jalankan database migration dan seeder:

```bash
npm run startup
```

Start backend server:

```bash
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Buat file `.env.local` di folder frontend:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Start frontend:

```bash
npm run dev
```

Aplikasi akan berjalan di:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## Cara Menggunakan

Tinggal daftar akun baru lewat halaman register, terus login. Setelah itu bisa langsung kelola asset, tambah kategori, atur lokasi, dan lain-lain.

## Struktur Project

```
tefacontoh/
├── backend/              # Express.js API
│   ├── src/
│   │   ├── config/      # Database config
│   │   ├── models/      # Sequelize models
│   │   ├── routes/      # API routes
│   │   ├── controllers/ # Route controllers
│   │   ├── middlewares/ # Auth middleware
│   │   └── seeders/     # Database seeders
│   └── package.json
│
└── frontend/            # Next.js App
    ├── src/
    │   ├── app/        # App router pages
    │   ├── components/ # React components
    │   ├── hooks/      # Custom hooks
    │   └── lib/        # Utilities & API client
    └── package.json
```

## API Endpoints

Base URL: `http://localhost:5000/api`

### Authentication
- `POST /auth/register` - Daftar user baru
- `POST /auth/login` - Login
- `GET /auth/me` - Get user info

### Assets
- `GET /assets` - List semua asset
- `GET /assets/:id` - Detail asset
- `POST /assets` - Tambah asset baru
- `PUT /assets/:id` - Update asset
- `DELETE /assets/:id` - Hapus asset

### Categories
- `GET /categories` - List kategori
- `POST /categories` - Tambah kategori
- `PUT /categories/:id` - Update kategori
- `DELETE /categories/:id` - Hapus kategori

Dan masih banyak lagi...

## BTW, YOU CAN TRY WITH JUST REGISTER😉
