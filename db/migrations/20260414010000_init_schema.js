exports.up = async function up(knex) {
  await knex.schema.createTable("admin_users", (table) => {
    table.uuid("id").primary();
    table.string("name").notNullable();
    table.string("email").notNullable().unique();
    table.string("password_hash").notNullable();
    table.string("role").notNullable().defaultTo("admin");
    table.string("status").notNullable().defaultTo("aktif");
    table.timestamp("dibuat_pada").notNullable().defaultTo(knex.fn.now());
  });

  await knex.schema.createTable("pengguna", (table) => {
    table.uuid("id").primary();
    table.string("nama").notNullable();
    table.string("nim_nip").notNullable().unique();
    table.string("peran").notNullable();
    table.string("status").notNullable().defaultTo("aktif");
    table.timestamp("dibuat_pada").notNullable().defaultTo(knex.fn.now());
  });

  await knex.schema.createTable("kartu_rfid", (table) => {
    table.uuid("id").primary();
    table.uuid("pengguna_id").notNullable().references("id").inTable("pengguna").onDelete("CASCADE");
    table.string("uid_kartu").notNullable().unique();
    table.string("status").notNullable().defaultTo("aktif");
    table.timestamp("aktif_dari").notNullable();
    table.timestamp("aktif_hingga").nullable();
  });

  await knex.schema.createTable("gate", (table) => {
    table.uuid("id").primary();
    table.string("nama").notNullable();
    table.string("tipe").notNullable();
    table.string("lokasi").notNullable();
    table.string("status").notNullable().defaultTo("aktif");
  });

  await knex.schema.createTable("kendaraan_tamu", (table) => {
    table.uuid("id").primary();
    table.string("plat_nomor").nullable();
    table.string("nama_tamu").notNullable();
    table.string("keperluan").notNullable();
    table.string("foto_kendaraan").nullable();
    table.timestamp("dibuat_pada").notNullable().defaultTo(knex.fn.now());
  });

  await knex.schema.createTable("log_parkir", (table) => {
    table.uuid("id").primary();
    table.uuid("kartu_rfid_id").nullable().references("id").inTable("kartu_rfid").onDelete("SET NULL");
    table.uuid("tamu_id").nullable().references("id").inTable("kendaraan_tamu").onDelete("SET NULL");
    table.uuid("gate_masuk_id").nullable().references("id").inTable("gate").onDelete("SET NULL");
    table.uuid("gate_keluar_id").nullable().references("id").inTable("gate").onDelete("SET NULL");
    table.string("foto_masuk").nullable();
    table.string("foto_keluar").nullable();
    table.string("plat_nomor_masuk").nullable();
    table.string("plat_nomor_keluar").nullable();
    table.string("sumber").notNullable().defaultTo("hardware");
    table.string("status").notNullable();
    table.timestamp("waktu_masuk").notNullable();
    table.timestamp("waktu_keluar").nullable();
  });

  await knex.raw("ALTER TABLE pengguna ADD CONSTRAINT pengguna_peran_check CHECK (peran in ('mahasiswa', 'dosen', 'staf'))");
  await knex.raw("ALTER TABLE pengguna ADD CONSTRAINT pengguna_status_check CHECK (status in ('aktif', 'nonaktif'))");
  await knex.raw("ALTER TABLE kartu_rfid ADD CONSTRAINT kartu_status_check CHECK (status in ('aktif', 'hilang', 'diblokir'))");
  await knex.raw("ALTER TABLE gate ADD CONSTRAINT gate_tipe_check CHECK (tipe in ('masuk', 'keluar'))");
  await knex.raw("ALTER TABLE gate ADD CONSTRAINT gate_status_check CHECK (status in ('aktif', 'nonaktif'))");
  await knex.raw("ALTER TABLE log_parkir ADD CONSTRAINT log_sumber_check CHECK (sumber in ('hardware', 'demo'))");
  await knex.raw("ALTER TABLE log_parkir ADD CONSTRAINT log_status_check CHECK (status in ('masuk', 'keluar', 'anomali'))");

  await knex.raw("CREATE INDEX idx_kartu_uid_kartu ON kartu_rfid(uid_kartu)");
  await knex.raw("CREATE INDEX idx_log_kartu_rfid_id ON log_parkir(kartu_rfid_id)");
  await knex.raw("CREATE INDEX idx_log_status ON log_parkir(status)");
};

exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists("log_parkir");
  await knex.schema.dropTableIfExists("kendaraan_tamu");
  await knex.schema.dropTableIfExists("gate");
  await knex.schema.dropTableIfExists("kartu_rfid");
  await knex.schema.dropTableIfExists("pengguna");
  await knex.schema.dropTableIfExists("admin_users");
};
