# DFD Level 2 - Proses 3.0 (Pencatatan Keluar Parkir)

Diagram ini menguraikan dekomposisi alur check-out kendaraan. Sistem wajib memastikan kendaraan benar-benar pernah masuk terlebih dahulu sebelum bisa keluar.

```mermaid
flowchart TD
    %% Entitas Eksternal
    Hardware["Hardware / Gate & RFID"]

    %% Sub-Proses Level 2 untuk Keluar
    P31(("3.1<br/>Identifikasi<br/>Kartu Keluar"))
    P32(("3.2<br/>Validasi &<br/>Penyelesaian Log"))
    P33(("3.3<br/>Kendali<br/>Akses Keluar"))

    %% Data Store
    D2[("D2: DB Kartu RFID")]
    D4[("D4: DB Log Parkir")]

    %% Aliran Data Identifikasi
    Hardware -->|"1. Kirim UID & ID GateKeluar"| P31
    P31 -->|"2. Cek Kartu"| D2
    D2 -.->|"3. Respon Kartu Valid"| P31
    P31 -->|"4. Pass UID Keluar"| P32

    %% Aliran Data Validasi Transaksi / Log
    P32 -->|"5. Cari Data Kendaraan Belum Keluar"| D4
    D4 -.->|"6. Row Data Log Parkir (Status=MASUK)"| P32
    Hardware -->|"7. Kirim Foto Kendaraan Keluar"| P32
    P32 -->|"8. Update Record Log (Status=KELUAR)"| D4
    P32 -->|"9. Konfirmasi Update Diterima"| P33

    %% Output Aksi Fisik
    P33 -->|"10. Perintah Buka Gate Keluar"| Hardware

    %% Styling Colors
    classDef process fill:#f9f,stroke:#333,stroke-width:2px,color:#000;
    classDef datastore fill:#bbf,stroke:#333,stroke-width:1px,color:#000;
    classDef external fill:#bfb,stroke:#333,stroke-width:2px,color:#000;

    class P31,P32,P33 process;
    class D2,D4 datastore;
    class Hardware external;
```

### Kamus Data Proses 3.0:
- **3.1 Identifikasi Kartu Keluar**: Memverifikasi kondisi kartu saat ini, apakah masih aktif atau di-suspend ketika pemilik sedang di dalam area (contoh: kartu tiba-tiba di-*disable* oleh Admin).
- **3.2 Validasi & Penyelesaian Log**: Inilah proteksi sistem anti-anomali. Jika UID `A` mencoba menempel keluar *tanpa* log pernah masuk sebelumnya, proses akan ditolak atau ditandai anomali. Apabila ada kecocokan, tabel (D4) akan diperbarui `waktuKeluar` dan statusnya ditutup.
- **3.3 Kendali Akses Keluar**: Pelatuk perangkat keras untuk membuka gerbang *outbound*.
