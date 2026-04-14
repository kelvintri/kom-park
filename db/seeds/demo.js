const { v4: uuidv4 } = require("uuid");

exports.seed = async function seed(knex) {
  await knex("log_parkir").del();
  await knex("kendaraan_tamu").del();
  await knex("kartu_rfid").del();
  await knex("gate").del();
  await knex("pengguna").del();
  await knex("admin_users").del();

  const users = [
    { id: uuidv4(), nama: "Budi Santoso", nim_nip: "2021001", peran: "mahasiswa", status: "aktif" },
    { id: uuidv4(), nama: "Sari Dewi", nim_nip: "2021002", peran: "mahasiswa", status: "aktif" },
    { id: uuidv4(), nama: "Dr. Ahmad", nim_nip: "198001", peran: "dosen", status: "aktif" },
    { id: uuidv4(), nama: "Rina Staf", nim_nip: "199001", peran: "staf", status: "aktif" },
    { id: uuidv4(), nama: "Kartu Nonaktif", nim_nip: "2021005", peran: "mahasiswa", status: "aktif" }
  ];

  const cardMap = {
    "2021001": "AA:BB:CC:01",
    "2021002": "AA:BB:CC:02",
    "198001": "AA:BB:CC:03",
    "199001": "AA:BB:CC:04",
    "2021005": "AA:BB:CC:05"
  };

  await knex("admin_users").insert({
    id: uuidv4(),
    name: "Admin Demo",
    email: "admin@kompark.local",
    password_hash: "$2b$10$5MoS9UyNIma0zufkCayiEOK2FbORwNrclWQmGKZQXhIOV38t2GH2W",
    role: "admin",
    status: "aktif"
  });

  await knex("pengguna").insert(users);

  await knex("kartu_rfid").insert(
    users.map((user) => ({
      id: uuidv4(),
      pengguna_id: user.id,
      uid_kartu: cardMap[user.nim_nip],
      status: user.nim_nip === "2021005" ? "diblokir" : "aktif",
      aktif_dari: new Date()
    }))
  );

  await knex("gate").insert([
    {
      id: "7f3c7c56-dbf7-4647-a0d1-111111111111",
      nama: "gate-masuk-01",
      tipe: "masuk",
      lokasi: "Pintu Utara",
      status: "aktif"
    },
    {
      id: "411e0e60-0718-4ab7-a86b-222222222222",
      nama: "gate-keluar-01",
      tipe: "keluar",
      lokasi: "Pintu Utara",
      status: "aktif"
    }
  ]);
};
