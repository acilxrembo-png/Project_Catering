# Project Catering

Aplikasi manajemen catering untuk mengelola menu, pelanggan, dan pesanan dalam satu tempat. Project ini menggunakan struktur **monorepo** dengan **pnpm workspace**.

## Daftar Isi

- [Tech Stack](#tech-stack)
- [Struktur Project](#struktur-project)
- [Prasyarat](#prasyarat)
- [Instalasi](#instalasi)
- [Konfigurasi Environment](#konfigurasi-environment)
- [Setup Database](#setup-database)
- [Menjalankan Aplikasi](#menjalankan-aplikasi)
- [Script yang Tersedia](#script-yang-tersedia)
- [Fitur](#fitur)
- [Kontribusi](#kontribusi)
- [Lisensi](#lisensi)

## Tech Stack

| Bagian     | Teknologi                  |
| ---------- | -------------------------- |
| Frontend   | Vite + TypeScript          |
| Database   | PostgreSQL                 |
| ORM        | Prisma 6                   |
| Monorepo   | pnpm workspace             |
| Runtime    | Node.js                    |

## Struktur Project

```
project-name/
│
├── apps/
│   │
│   ├── web/                         # Frontend React
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── pages/
│   │   │   ├── layouts/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   ├── utils/
│   │   │   ├── assets/
│   │   │   ├── App.jsx
│   │   │   └── main.jsx
│   │   ├── public/
│   │   ├── package.json
│   │   └── vite.config.js
│   │
│   └── api/                         # Backend Node.js
│       ├── src/
│       │   ├── controllers/
│       │   ├── middleware/
│       │   ├── routes/
│       │   ├── services/
│       │   ├── validators/
│       │   ├── utils/
│       │   └── index.js
│       │
│       ├── package.json
│       └── .env
│
├── packages/
│   │
│   ├── database/                   # Prisma ORM
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   ├── migrations/
│   │   │   └── seed.js
│   │   │
│   │   ├── src/
│   │   │   └── index.js
│   │   │
│   │   └── package.json
│   │
│   │
│   │
│   └── eslint-config/
│       ├── index.js
│       └── package.json
│
├── docs/
│   ├── architecture/
│   ├── api/
│   └── database/
│
├── scripts/
│
├── .env
├── .env.example
├── .gitignore
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
└── README.md
```

> Prisma hanya boleh dijalankan di sisi server. `apps/web` tidak mengakses `@repo/database` secara langsung, melainkan lewat API backend.

## Prasyarat

Pastikan sudah terpasang:

- [Node.js](https://nodejs.org/) versi 20 atau lebih baru
- [pnpm](https://pnpm.io/) versi 10 atau lebih baru
- [PostgreSQL](https://www.postgresql.org/) versi 14 atau lebih baru (atau Docker)
- [Git](https://git-scm.com/)

Cek versi:

```bash
node -v
pnpm -v
psql --version
```

## Instalasi

1. Clone repository:

   ```bash
   git clone <url-repository>
   cd Project_Catering
   ```

2. Install semua dependency dari root:

   ```bash
   pnpm install
   ```

   Pastikan `pnpm-workspace.yaml` mengizinkan build script Prisma:

   ```yaml
   packages:
     - "apps/*"
     - "packages/*"

   onlyBuiltDependencies:
     - "@prisma/client"
     - "@prisma/engines"
     - "prisma"
   ```

## Konfigurasi Environment

Buat file `.env` di `packages/database/`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/catering?schema=public"
```

Ganti `USER`, `PASSWORD`, dan nama database sesuai PostgreSQL kamu. Jika password mengandung karakter khusus (`@`, `#`, `/`), lakukan URL-encode (misalnya `@` menjadi `%40`).

> File `.env` tidak boleh ikut ter-commit. Pastikan sudah masuk `.gitignore`.

## Setup Database

1. Buat database di PostgreSQL:

   ```bash
   psql -U postgres -c "CREATE DATABASE catering;"
   ```

   Atau dengan Docker:

   ```bash
   docker run --name catering-db \
     -e POSTGRES_PASSWORD=password \
     -e POSTGRES_DB=catering \
     -p 5432:5432 -d postgres:16
   ```

2. Jalankan migrasi:

   ```bash
   cd packages/database
   pnpm exec prisma migrate dev --name init
   ```

3. Isi data awal (opsional):

   ```bash
   pnpm db:seed
   ```

4. Buka Prisma Studio untuk melihat data:

   ```bash
   pnpm db:studio
   ```

## Menjalankan Aplikasi

Jalankan frontend:

```bash
pnpm --filter web dev
```

Aplikasi biasanya tersedia di `http://localhost:5173`.

> Nama filter `web` mengikuti field `name` di `apps/web/package.json`. Sesuaikan jika berbeda.

## Script yang Tersedia

### Package `@repo/database`

| Perintah          | Fungsi                                      |
| ----------------- | ------------------------------------------- |
| `pnpm db:generate` | Generate Prisma Client                     |
| `pnpm db:migrate`  | Membuat dan menjalankan migrasi (development) |
| `pnpm db:deploy`   | Menjalankan migrasi di production          |
| `pnpm db:seed`     | Mengisi database dengan data awal          |
| `pnpm db:studio`   | Membuka Prisma Studio                      |

Jalankan dari folder `packages/database`, atau dari root dengan:

```bash
pnpm --filter @repo/database <nama-script>
```

## Fitur

Daftar fitur yang direncanakan (sesuaikan dengan progres project):

- [ ] Manajemen menu (tambah, ubah, hapus, kategori)
- [ ] Manajemen pelanggan
- [ ] Pembuatan dan pelacakan pesanan
- [ ] Status pesanan (menunggu, diproses, dikirim, selesai)
- [ ] Perhitungan total harga dan riwayat transaksi
- [ ] Autentikasi dan hak akses admin

## Kontribusi

1. Fork repository ini
2. Buat branch fitur: `git checkout -b fitur/nama-fitur`
3. Commit perubahan: `git commit -m "feat: deskripsi singkat"`
4. Push ke branch: `git push origin fitur/nama-fitur`
5. Buat Pull Request

## Lisensi

Project ini menggunakan lisensi [ISC](https://opensource.org/licenses/ISC).