export const mockCards = [
  { uid: 'AA:BB:CC:01', nama: 'Budi Santoso', nimNip: '2021001', peran: 'MAHASISWA', statusKartu: 'AKTIF', sedangParkir: false },
  { uid: 'AA:BB:CC:02', nama: 'Sari Dewi', nimNip: '2021002', peran: 'MAHASISWA', statusKartu: 'AKTIF', sedangParkir: true },
  { uid: 'AA:BB:CC:03', nama: 'Dr. Ahmad', nimNip: '198001', peran: 'DOSEN', statusKartu: 'AKTIF', sedangParkir: false },
  { uid: 'AA:BB:CC:04', nama: 'Rina Staf', nimNip: '199001', peran: 'STAF', statusKartu: 'AKTIF', sedangParkir: false },
  { uid: 'AA:BB:CC:05', nama: 'Test Blokir', nimNip: '2021005', peran: 'MAHASISWA', statusKartu: 'DIBLOKIR', sedangParkir: false },
];

export const mockGates = [
  { id: 'gate-1', nama: 'Gate Utara Masuk', tipe: 'MASUK', lokasi: 'Pintu Utara' },
  { id: 'gate-2', nama: 'Gate Utara Keluar', tipe: 'KELUAR', lokasi: 'Pintu Utara' },
];

export const mockStatus = {
  totalDiDalam: 12,
  totalMasukHariIni: 45,
  totalKeluarHariIni: 33,
  logTerbaru: [
    { id: '1', nama: 'Sari Dewi', nimNip: '2021002', gate: 'Gate Utara Masuk', status: 'MASUK', waktu: new Date().toISOString(), sumber: 'DEMO' },
    { id: '2', nama: 'Budi Santoso', nimNip: '2021001', gate: 'Gate Utara Keluar', status: 'KELUAR', waktu: new Date(Date.now() - 1000 * 60 * 15).toISOString(), sumber: 'DEMO' },
    { id: '3', nama: 'Dr. Ahmad', nimNip: '198001', gate: 'Gate Utara Masuk', status: 'MASUK', waktu: new Date(Date.now() - 1000 * 60 * 45).toISOString(), sumber: 'DEMO' },
  ]
};
