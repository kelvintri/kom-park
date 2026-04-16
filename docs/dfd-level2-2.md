# DFD Level 2 - Proses 2.0 (Pencatatan Masuk Parkir)

Diagram ini mendekomposisi alur check-in kendaraan. Titik pemicunya adalah sensor perangkat keras saat menangkap UID Kartu.

```mermaid
flowchart TD
    %% Entitas Eksternal
    Hardware["Hardware / Gate & RFID"]

    %% Sub-Proses Level 2 untuk Masuk
    P21(("2.1<br/>Identifikasi &<br/>Verifikasi Kartu"))
    P22(("2.2<br/>Pembuatan Log<br/>Tiket Masuk"))
    P23(("2.3<br/>Kendali<br/>Akses Gate"))

    %% Data Store
    D2[("D2: DB Kartu RFID")]
    D4[("D4: DB Log Parkir")]

    %% Aliran Data Verifikasi
    Hardware -->|"1. Kirim UID Kartu & ID Gate"| P21
    P21 -->|"2. Kueri Status Kartu"| D2
    D2 -.->|"3. Respon Status (AKTIF)"| P21
    P21 -->|"4. Data Valid (Pass UID)"| P22
    
    %% Aliran Data Pembuatan Log
    Hardware -->|"5. Kirim Foto Kendaraan Masuk"| P22
    P22 -->|"6. Insert Data Log (Status MASUK)"| D4
    P22 -->|"7. Sinyal Log Sukses Tersimpan"| P23
    
    %% Output Aksi Fisik
    P23 -->|"8. Perintah Buka Gate Masuk"| Hardware

    %% Styling Colors
    classDef process fill:#f9f,stroke:#333,stroke-width:2px,color:#000;
    classDef datastore fill:#bbf,stroke:#333,stroke-width:1px,color:#000;
    classDef external fill:#bfb,stroke:#333,stroke-width:2px,color:#000;

    class P21,P22,P23 process;
    class D2,D4 datastore;
    class Hardware external;
```

### Kamus Data Proses 2.0:
- **2.1 Identifikasi & Verifikasi Kartu**: Bertindak sebagai satpam sistem. Menolak mentah-mentah jika `uidKartu` belum teregistrasi, kedaluwarsa, atau berstatus *HILANG*.
- **2.2 Pembuatan Log Tiket Masuk**: Ketika lolos dari 2.1, proses ini mencatat riwayat ke `LogParkir` (D4). Waktu kedatangan (*waktuMasuk*) terbentuk secara otomats.
- **2.3 Kendali Akses Gate**: Menerjemahkan sirkuit logika sukses dari database (D4) menuju sinyal komando agar palang pintu fisik terangkat.
