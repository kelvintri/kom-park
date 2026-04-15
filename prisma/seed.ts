import 'dotenv/config'
import { Peran, Status, StatusKartu, TipeGate } from '@prisma/client'
import prisma from '../lib/prisma'

async function main() {
  console.log('Seeding data...')

  // 1. Create Gates
  const gateMasuk = await prisma.gate.upsert({
    where: { id: 'gate-utara-masuk' },
    update: {},
    create: {
      id: 'gate-utara-masuk',
      nama: 'Gate Utara Masuk',
      tipe: TipeGate.MASUK,
      lokasi: 'Pintu Utara',
      status: Status.AKTIF,
    },
  })

  const gateKeluar = await prisma.gate.upsert({
    where: { id: 'gate-utara-keluar' },
    update: {},
    create: {
      id: 'gate-utara-keluar',
      nama: 'Gate Utara Keluar',
      tipe: TipeGate.KELUAR,
      lokasi: 'Pintu Utara',
      status: Status.AKTIF,
    },
  })

  console.log('Gates created:', { gateMasuk, gateKeluar })

  // 2. Create Pengguna + KartuRfid
  const demoData = [
    { nama: 'Budi Santoso', nimNip: '2021001', peran: Peran.MAHASISWA, uid: 'AA:BB:CC:01', statusKartu: StatusKartu.AKTIF },
    { nama: 'Sari Dewi', nimNip: '2021002', peran: Peran.MAHASISWA, uid: 'AA:BB:CC:02', statusKartu: StatusKartu.AKTIF },
    { nama: 'Dr. Ahmad', nimNip: '198001', peran: Peran.DOSEN, uid: 'AA:BB:CC:03', statusKartu: StatusKartu.AKTIF },
    { nama: 'Rina Staf', nimNip: '199001', peran: Peran.STAF, uid: 'AA:BB:CC:04', statusKartu: StatusKartu.AKTIF },
    { nama: 'Test Blokir', nimNip: '2021005', peran: Peran.MAHASISWA, uid: 'AA:BB:CC:05', statusKartu: StatusKartu.DIBLOKIR },
  ]

  for (const item of demoData) {
    await prisma.pengguna.upsert({
      where: { nimNip: item.nimNip },
      update: {},
      create: {
        nama: item.nama,
        nimNip: item.nimNip,
        peran: item.peran,
        status: Status.AKTIF,
        kartuRfid: {
          create: {
            uidKartu: item.uid,
            status: item.statusKartu,
            aktifDari: new Date(),
          }
        }
      },
    })
  }

  console.log('Seed completed successfully.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
