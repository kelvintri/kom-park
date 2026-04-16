flowchart TD
%% Entitas Eksternal
Admin["Administrator"]
Hardware["Hardware / Gate & RFID"]

    %% Proses
    P1(("1.0<br/>Manajemen<br/>Data Induk"))
    P2(("2.0<br/>Pencatatan<br/>Masuk Parkir"))
    P3(("3.0<br/>Pencatatan<br/>Keluar Parkir"))
    P4(("4.0<br/>Pembuatan<br/>Laporan"))
    P5(("5.0<br/>Autentikasi<br/>Sistem"))

    %% Data Store (menggunakan notasi silinder untuk DB pada Mermaid)
    D1[("D1: DB Pengguna")]
    D2[("D2: DB Kartu RFID")]
    D3[("D3: DB Gate")]
    D4[("D4: DB Log Parkir")]
    D5[("D5: DB User Auth")]

    %% Aliran Data: 1.0 Manajemen Data Induk
    Admin -->|"Input (Data Pengguna, Info RFID, Identitas Gate)"| P1
    P1 -->|"Output (Konfirmasi Data Tersimpan)"| Admin

    P1 -->|"Simpan Data Pengguna"| D1
    P1 -->|"Simpan Data RFID"| D2
    P1 -->|"Simpan Data Gate"| D3

    D1 -.->|"Daftar Pengguna"| P1
    D2 -.->|"Daftar Kartu RFID"| P1
    D3 -.->|"Daftar Gate"| P1

    %% Aliran Data: 2.0 Pencatatan Masuk Parkir
    Hardware -->|"Input (UID Kartu, ID Gate, Foto Masuk)"| P2
    P2 -->|"Output (Perintah Buka Gate Masuk)"| Hardware

    P2 -->|"Cari Status & Info Kartu"| D2
    D2 -.->|"Status Aktif Kartu"| P2

    P2 -->|"Rekam Kendaraan Masuk"| D4

    %% Aliran Data: 3.0 Pencatatan Keluar Parkir
    Hardware -->|"Input (UID Kartu, ID Gate, Foto Keluar)"| P3
    P3 -->|"Output (Perintah Buka Gate Keluar)"| Hardware

    P3 -->|"Cari Kecocokan Log Masuk"| D4
    D4 -.->|"Data Log Parkir Belum Selesai"| P3

    P3 -->|"Update Status & Waktu Keluar"| D4

    %% Aliran Data: 4.0 Pembuatan Laporan
    Admin -->|"Input (Kriteria Rentang Waktu/Gate)"| P4
    P4 -->|"Output (Laporan Parkir & Statistik)"| Admin

    P4 -->|"Minta Riwayat Parkir"| D4
    D4 -.->|"Raw Data Log Parkir"| P4

    %% Aliran Data: 5.0 Autentikasi Sistem
    Admin -->|"Input (Email & Password)"| P5
    P5 -->|"Output (Session Token / Hak Akses)"| Admin
    
    P5 -->|"Verifikasi Akun"| D5
    D5 -.->|"Status Kredensial Valid"| P5

    %% Styling Colors
    classDef process fill:#f9f,stroke:#333,stroke-width:2px,color:#000;
    classDef datastore fill:#bbf,stroke:#333,stroke-width:1px,color:#000;
    classDef external fill:#bfb,stroke:#333,stroke-width:2px,color:#000;

    class P1,P2,P3,P4,P5 process;
    class D1,D2,D3,D4,D5 datastore;
    class Admin,Hardware external;

Penjelasan Keseimbangan Input/Output DFD Level 1
Untuk menjamin kelengkapan data flow (masukan = keluaran pada semua simpul), berikut ini adalah Data Dictionary yang menyeimbangkan sistem di atas:

Proses 1.0 : Manajemen Data Induk
Bertujuan untuk mengelola entitas master (Dosen, Mahasiswa, Staf, serta perangkat Gate dan Kartu).

Input Keluar masuk dari Entitas Eksternal: Administrator memberikan data parameter (Nama, NIM/NIP, UID RFID, data Gate/Kamera).
Akses ke Data Store: Proses ini menyimpan/menyarikan (write) relasi data langsung menuju store D1 (Pengguna), D2 (Kartu RFID), dan D3 (Gate).
Output: Mengeluarkan umpan balik "Konfirmasi Data Tersimpan" untuk di-render di UI Administrator.
Proses 2.0 : Pencatatan Masuk Parkir
Bertujuan memverifikasi validitas tap masuk kartu RFID.

Input: Perangkat Keras / Gate Reader mengirim UID Kartu, foto mobil dan ID Gate saat kendaraan hendak masuk.
Akses ke Data Store:
Sistem wajib me-read D2 (Kartu RFID) untuk melihat apakah kartu statusnya AKTIF.
Sistem me-write record baru ke D4 (Log Parkir) dengan status = MASUK dan mengisi timestamps waktuMasuk.
Output: Mengirim kembali aksi fisik (Perintah Buka Gate Masuk) jika pemeriksaan database tervalidasi.
Proses 3.0 : Pencatatan Keluar Parkir
Berperan sebagai penyelesaian alur parkir (Check-out).

Input: Entitas Hardware menangkap UID Kartu yang sedang Tap Out beserta foto keluar.
Akses ke Data Store:
Meng-kueri (read) D4 (Log Parkir) berdasarkan UID yang aktif / belum melakukan check-out.
Jika sah, sistem menimpa (update/write) tabel D4 (Log Parkir) dengan mengisi data fotoKeluar, waktuKeluar dan mengubah log parkir ke status = KELUAR.
Output: Membuka palang keluar lewat perintah perangkat keras.
Proses 4.0 : Pembuatan Laporan
Sistem memfasilitasi audit dan rekapitulasi penggunaan parkir.

Input: Administrator mengajukan serangkaian input berupa filter (misal kriteria tanggal / tipe gate).
Akses ke Data Store: Proses melakukan agregasi dan read dalam jumlah banyak pada D4 (Log Parkir) untuk mengkalkulasi waktu parkir maupun daftar kendaraan anomali.
Output: Memulangkan agregasi data/informasi yang sudah final menjadi Laporan Parkir.
Proses 5.0 : Autentikasi Sistem
Mencegah akses ilegal dengan memverifikasi identitas pengguna dashboard (Administrator).

Input: Administrator memasukkan Kredensial (Email & Password) dari halaman Login.
Akses ke Data Store: Proses membaca (read) dan mencocokkan password ke D5 (DB User Auth) untuk validasi, dan me-write sesi login.
Output: Mengirimkan state/Token Session sebagai penanda berhasil masuk, atau peringatan akses ditolak ke UI Administrator.
