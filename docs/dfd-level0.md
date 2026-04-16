# DFD Level 0 (Context Diagram) - Kom-Park

DFD Level 0 atau **Diagram Konteks** memberikan gambaran sistem secara keseluruhan dari sudut pandang paling luar *(bird's-eye view)*. Pada level ini, **Data Store (Database) sengaja tidak ditampilkan** karena database itu sendiri adalah bagian tertutup dari keseluruhan entitas sistem.

Diagram ini menyoroti bagaimana dua entitas eksternal kita saling melempar input dan output mendasar kepada seluruh Sistem Kom-Park.

```mermaid
flowchart TD
    %% Entitas Eksternal
    Admin["Administrator"]
    Hardware["Hardware / Gate & RFID"]
    
    %% Proses Utama (Sistem Keseluruhan)
    System(("0.0<br/>Sistem Manajemen<br/>Parkir (Kom-Park)"))

    %% Aliran Data Admin <--> Sistem
    Admin -->|"1. Kredensial Login<br/>2. Parameter Data Induk (Mhs/RFID/Gate)<br/>3. Parameter Pencarian Laporan"| System
    
    System -.->|"1. Session Token Akses<br/>2. Status Konfirmasi Tersimpan<br/>3. File/View Laporan Parkir"| Admin

    %% Aliran Data Hardware <--> Sistem
    Hardware -->|"1. Tap UID Kartu (Masuk/Keluar)<br/>2. Foto Kendaraan<br/>3. ID Terminal Gate"| System
    
    System -.->|"1. Sinyal Komando Buka Palang<br/>2. Status Akses Ditolak (Anomali)"| Hardware

    %% Styling Colors
    classDef process fill:#f9f,stroke:#333,stroke-width:2px,color:#000;
    classDef external fill:#bfb,stroke:#333,stroke-width:2px,color:#000;

    class System process;
    class Admin,Hardware external;
```

### Kamus Data Context Diagram:

- **Entitas Sistem (0.0)**: Kotak hitam *(black-box)* dari keseluruhan baris kode perangkat lunak Kom-Park. Sistem menyembunyikan perhitungan rumitnya di tahapan level ini.
- **Entitas Administrator**: Sumber penggerak administrasi manusia. Hanya bisa saling bertukar rekam data mentah *(Input Kelola data, Output Konfirmasi Laporan).*
- **Entitas Hardware**: Merupakan "mata, telinga, dan anggota tubuh fisik" sistem di lapangan. Menyuplai sensor (*UID kartu & Foto*) kepada sistem pusat, lalu menerima instruksi balik (*Angkat Palang Pintu*) dari sistem pusat.
