# KomPark MVP

MVP demo sistem parkir kampus berbasis Next.js, TypeScript, PostgreSQL, Knex, dan NextAuth.

## Fitur saat ini

- Login admin via email dan password
- Dashboard dengan polling 5 detik
- Simulator tap masuk dan tap keluar dari browser
- Snapshot webcam browser dengan fallback placeholder lokal
- Log parkir dan foto lokal
- Manajemen pengguna dan status kartu RFID
- Placeholder menu `Tiket/Karcis`

## Setup

1. Salin `.env.example` menjadi `.env` lalu isi `DATABASE_URL`, `NEXTAUTH_SECRET`, dan `GATE_SECRET`.
2. Jalankan `npm install` jika dependensi belum ada.
3. Jalankan `npm run db:migrate`.
4. Jalankan `npm run db:seed`.
5. Jalankan `npm run dev`.

## Login Demo

- Email: `admin@kompark.local`
- Password: `Admin123!`
