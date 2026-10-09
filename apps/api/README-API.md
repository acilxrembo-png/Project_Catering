# API Aplikasi Pemesanan Catering

Express 5 + Prisma + JWT (JavaScript/ESM). Struktur: `config/`, `lib/`, `middleware/`, `modules/<nama>/{nama}.controller|routes|service|validation.js`.

## Pasang ke repo
1. Salin folder `apps/api/*` ke `apps/api` (timpa `package.json`).
2. Salin `packages/database/prisma/seed.js` ke `packages/database/prisma/`.
3. Di `packages/database/package.json` tambahkan:
   - scripts: `"seed": "tsx prisma/seed.js"`, `"generate": "prisma generate"`, `"migrate": "prisma migrate dev"`
   - devDependencies: `"tsx": "^4.19.0"`, `"bcryptjs": "^2.4.3"`, `"@types/node": "^22.0.0"`
   - pastikan `"name": "@catering/database"` dan `"main": "src/index.ts"` (ubah di `apps/api/src/lib/prisma.js` jika namanya beda)
4. `apps/api/.env` (dari `.env.example`) -> isi `JWT_ACCESS_SECRET`. `DATABASE_URL` tetap di `packages/database/.env`.
5. Dari root: `pnpm install`
6. `cd packages/database` -> `pnpm generate` -> `pnpm migrate --name init` -> `pnpm seed`
7. `cd ../../apps/api` -> `pnpm dev`  -> http://localhost:4000/api/health

Akun seed (password `password123`): admin@ / kasir@ / dapur@ / pelanggan@catering.com

## Alur pesanan
WAITING_PAYMENT -> PAID (bayar/DP masuk) -> CONFIRMED (admin/kasir; tugas produksi dibuat otomatis)
-> PREPARING (dapur mulai) -> READY (semua tugas selesai; stok bahan terpotong sesuai resep; data pengiriman dibuat)
-> DELIVERING -> COMPLETED. Pembatalan: CANCELLED, lalu refund -> REFUNDED.

## Endpoint (prefix /api, auth: `Authorization: Bearer <accessToken>`)
- auth: POST register, login, refresh, logout; GET me
- users: PATCH /me, POST /me/password, CRUD /me/addresses; admin: GET /, POST / (buat staf), GET/PATCH /:id
- categories, products (+ /products/:id/variants, /products/variants/:id), delivery-zones, vouchers (+ POST /vouchers/check)
- cart: GET /, POST /items, PATCH/DELETE /items/:id, DELETE /
- orders: POST /, GET /, GET /:id, PATCH /:id/status, POST /:id/cancel, PATCH /:id/notes
- payments: POST /gateway (Midtrans Snap), POST /transfer (bukti transfer), POST /manual (kasir), PATCH /:id/verify, GET /, GET /:id, GET /orders/:id/invoices, POST /webhook/midtrans (publik)
- refunds: POST /, GET /, PATCH /:id/approve|reject, POST /:id/process
- production: GET /, GET /summary, PATCH /:id/assign, PATCH /:id/status
- deliveries: GET /, GET /:id, GET /order/:id, PATCH /:id
- inventory: /ingredients, /movements, /suppliers
- kasir: POST /shifts/open, GET /shifts/current, POST /shifts/close, GET /shifts
- expenses, reviews, notifications, dashboard (/stats, /revenue, /kitchen), settings, audit-logs

## Midtrans
Isi `MIDTRANS_SERVER_KEY` (sandbox). Set Payment Notification URL di dashboard Midtrans ke `https://<domain-publik>/api/payments/webhook/midtrans` (saat lokal pakai ngrok/cloudflared). Xendit & DOKU belum diimplementasikan (enum tetap ada).

## Setting (tabel Setting, diubah via PUT /api/settings/:key)
tax_percent, service_fee_percent, default_dp_percent (default 50), payment_due_hours (default 24)
