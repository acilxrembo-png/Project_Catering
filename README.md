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
- [Panduan Git](#panduan-git)
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
git --version
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

> File `.env` tidak boleh ikut ter-commit. Pastikan sudah masuk `.gitignore`. Yang di-commit hanya `.env.example` (isi kerangkanya saja, tanpa password asli).

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

## Panduan Git

### 1. Setup awal (sekali saja per komputer)

```bash
git config --global user.name "Nama Kamu"
git config --global user.email "email@kamu.com"
git config --global init.defaultBranch main
```

### 2. Menyiapkan `.gitignore`

Pastikan `.gitignore` di root minimal berisi:

```gitignore
# dependency
node_modules/

# environment (jangan pernah di-commit)
.env
.env.*
!.env.example

# build output
dist/
build/
.turbo/

# database lokal & log
*.db
*.log

# editor & OS
.vscode/
.DS_Store
Thumbs.db
```

> `pnpm-lock.yaml` **harus** ikut di-commit agar semua orang memakai versi dependency yang sama.

### 3. Menghubungkan project ke GitHub (pertama kali)

1. Buat repository kosong di GitHub (tanpa README, tanpa .gitignore).
2. Jalankan dari root project:

   ```bash
   git init
   git add .
   git commit -m "chore: initial commit"
   git branch -M main
   git remote add origin https://github.com/USERNAME/NAMA-REPO.git
   git push -u origin main
   ```

3. Cek koneksi remote:

   ```bash
   git remote -v
   ```

### 4. Struktur branch

| Branch      | Fungsi                                               |
| ----------- | ---------------------------------------------------- |
| `main`      | Kode stabil, siap dipakai. Jangan kerja langsung di sini. |
| `develop`   | (opsional) Tempat menggabungkan fitur sebelum rilis. |
| `fitur/*`   | Pengembangan fitur baru, contoh: `fitur/manajemen-menu` |
| `fix/*`     | Perbaikan bug, contoh: `fix/total-harga-salah`       |
| `chore/*`   | Perawatan (dependency, konfigurasi), contoh: `chore/update-prisma` |

### 5. Alur kerja harian

```bash
# 1. Ambil kode terbaru
git checkout main
git pull origin main

# 2. Buat branch baru untuk pekerjaanmu
git checkout -b fitur/manajemen-menu

# 3. Kerjakan kodenya, lalu cek perubahan
git status
git diff

# 4. Tambahkan dan commit (boleh berkali-kali)
git add .
git commit -m "feat(api): tambah endpoint daftar menu"

# 5. Kirim branch ke GitHub
git push -u origin fitur/manajemen-menu
```

Setelah itu buka GitHub dan buat **Pull Request** dari `fitur/manajemen-menu` ke `main`. Setelah di-review dan di-merge:

```bash
git checkout main
git pull origin main
git branch -d fitur/manajemen-menu
```

### 6. Format pesan commit

Gunakan format [Conventional Commits](https://www.conventionalcommits.org/):

```
<tipe>(<area>): <deskripsi singkat>
```

| Tipe       | Kapan dipakai                              |
| ---------- | ------------------------------------------ |
| `feat`     | Menambah fitur baru                        |
| `fix`      | Memperbaiki bug                            |
| `docs`     | Mengubah dokumentasi                       |
| `style`    | Perubahan tampilan/format, bukan logika    |
| `refactor` | Merapikan kode tanpa mengubah perilaku     |
| `chore`    | Konfigurasi, dependency, tugas rutin       |
| `test`     | Menambah atau memperbaiki test             |

Contoh:

```bash
git commit -m "feat(web): tambah halaman daftar pesanan"
git commit -m "fix(database): perbaiki relasi Order dan OrderItem"
git commit -m "docs: update panduan instalasi"
git commit -m "chore(database): update prisma ke 6.19"
```

`area` biasanya berisi nama folder: `web`, `api`, `database`.

### 7. Menyinkronkan branch dengan `main`

Jika `main` sudah berubah saat kamu masih mengerjakan fitur:

```bash
git checkout fitur/manajemen-menu
git fetch origin
git merge origin/main
```

Jika muncul **conflict**:

1. Buka file yang ditandai conflict di VS Code, pilih *Accept Current*, *Accept Incoming*, atau *Accept Both*.
2. Hapus penanda `<<<<<<<`, `=======`, `>>>>>>>` yang tersisa.
3. Selesaikan merge:

   ```bash
   git add .
   git commit
   ```

### 8. Perubahan pada database (Prisma)

- Selalu **commit folder `prisma/migrations/`** bersama perubahan `schema.prisma`.
- Jangan edit atau hapus file migrasi yang sudah di-merge ke `main`. Buat migrasi baru saja.
- Setelah `git pull`, jalankan migrasi jika ada file migrasi baru:

  ```bash
  pnpm install
  cd packages/database
  pnpm exec prisma migrate dev
  ```

### 9. Perintah berguna lainnya

| Kebutuhan                                   | Perintah                                   |
| ------------------------------------------- | ------------------------------------------ |
| Lihat riwayat commit                        | `git log --oneline --graph`                |
| Lihat semua branch                          | `git branch -a`                            |
| Batalkan perubahan file yang belum di-add   | `git restore <file>`                       |
| Keluarkan file dari staging                 | `git restore --staged <file>`              |
| Ubah pesan commit terakhir (belum di-push)  | `git commit --amend -m "pesan baru"`       |
| Simpan perubahan sementara                  | `git stash` lalu `git stash pop`           |
| Batalkan commit yang sudah di-push (aman)   | `git revert <hash-commit>`                 |

> Hindari `git push --force` di branch `main` atau branch yang dipakai bersama, karena bisa menimpa pekerjaan orang lain.

### 10. Kalau tidak sengaja meng-commit `.env`

Menghapus file dari commit berikutnya **tidak cukup**, karena password masih ada di riwayat. Langkah aman:

1. **Ganti password/secret** yang bocor (password database, API key, dan sebagainya).
2. Hentikan pelacakan file:

   ```bash
   git rm --cached .env
   git commit -m "chore: hapus .env dari repository"
   ```

3. Pastikan `.env` sudah ada di `.gitignore`.
4. Jika repository publik, bersihkan riwayat dengan `git filter-repo` atau BFG Repo-Cleaner.

## Kontribusi

Ikuti [Panduan Git](#panduan-git) di atas, dengan ringkasan:

1. Buat branch dari `main`: `git checkout -b fitur/nama-fitur`
2. Commit perubahan dengan format Conventional Commits
3. Push branch: `git push -u origin fitur/nama-fitur`
4. Buat Pull Request ke `main` dan tunggu review

## Lisensi

Project ini menggunakan lisensi [ISC](https://opensource.org/licenses/ISC).