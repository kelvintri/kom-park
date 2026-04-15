-- CreateEnum
CREATE TYPE "Peran" AS ENUM ('MAHASISWA', 'DOSEN', 'STAF');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('AKTIF', 'NONAKTIF');

-- CreateEnum
CREATE TYPE "StatusKartu" AS ENUM ('AKTIF', 'HILANG', 'DIBLOKIR');

-- CreateEnum
CREATE TYPE "TipeGate" AS ENUM ('MASUK', 'KELUAR');

-- CreateEnum
CREATE TYPE "Sumber" AS ENUM ('HARDWARE', 'DEMO');

-- CreateEnum
CREATE TYPE "StatusLog" AS ENUM ('MASUK', 'KELUAR', 'ANOMALI');

-- CreateTable
CREATE TABLE "Pengguna" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "nimNip" TEXT NOT NULL,
    "peran" "Peran" NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'AKTIF',
    "dibuatPada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Pengguna_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KartuRfid" (
    "id" TEXT NOT NULL,
    "penggunaId" TEXT NOT NULL,
    "uidKartu" TEXT NOT NULL,
    "status" "StatusKartu" NOT NULL DEFAULT 'AKTIF',
    "aktifDari" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "aktifHingga" TIMESTAMP(3),

    CONSTRAINT "KartuRfid_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Gate" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "tipe" "TipeGate" NOT NULL,
    "lokasi" TEXT NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'AKTIF',

    CONSTRAINT "Gate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LogParkir" (
    "id" TEXT NOT NULL,
    "kartuRfidId" TEXT,
    "gateMasukId" TEXT,
    "gateKeluarId" TEXT,
    "fotoMasuk" TEXT,
    "fotoKeluar" TEXT,
    "platNomorMasuk" TEXT,
    "platNomorKeluar" TEXT,
    "sumber" "Sumber" NOT NULL DEFAULT 'DEMO',
    "status" "StatusLog" NOT NULL,
    "waktuMasuk" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "waktuKeluar" TIMESTAMP(3),

    CONSTRAINT "LogParkir_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Pengguna_nimNip_key" ON "Pengguna"("nimNip");

-- CreateIndex
CREATE UNIQUE INDEX "KartuRfid_uidKartu_key" ON "KartuRfid"("uidKartu");

-- CreateIndex
CREATE INDEX "KartuRfid_uidKartu_idx" ON "KartuRfid"("uidKartu");

-- CreateIndex
CREATE INDEX "LogParkir_kartuRfidId_status_idx" ON "LogParkir"("kartuRfidId", "status");

-- AddForeignKey
ALTER TABLE "KartuRfid" ADD CONSTRAINT "KartuRfid_penggunaId_fkey" FOREIGN KEY ("penggunaId") REFERENCES "Pengguna"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LogParkir" ADD CONSTRAINT "LogParkir_kartuRfidId_fkey" FOREIGN KEY ("kartuRfidId") REFERENCES "KartuRfid"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LogParkir" ADD CONSTRAINT "LogParkir_gateMasukId_fkey" FOREIGN KEY ("gateMasukId") REFERENCES "Gate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LogParkir" ADD CONSTRAINT "LogParkir_gateKeluarId_fkey" FOREIGN KEY ("gateKeluarId") REFERENCES "Gate"("id") ON DELETE SET NULL ON UPDATE CASCADE;
