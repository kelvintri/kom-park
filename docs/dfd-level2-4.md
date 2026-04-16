# DFD Level 2 - Proses 4.0 (Pembuatan Laporan)

Proses ini menangani sisi manajerial di mana Administrator melakukan agregasi data dan pelaporan mengenai aktivitas parkir dalam sistem.

```mermaid
flowchart TD
    %% Entitas Eksternal
    Admin["Administrator"]

    %% Sub-Proses Level 2 untuk Laporan
    P41(("4.1<br/>Konfigurasi &<br/>Kueri Filter"))
    P42(("4.2<br/>Agregasi &<br/>Kompilasi Data"))
    P43(("4.3<br/>Generasi<br/>Laporan"))

    %% Data Store
    D4[("D4 DB Log Parkir")]
    D1[("D1 DB Pengguna")]

    %% Aliran
    Admin -->|"1. Input Kriteria (Range Tanggal, Tipe Gate)"| P41
    P41 -->|"2. Parameter Filter Kueri"| P42
    
    P42 -->|"3. Akses Data Terfilter"| D4
    D4 -.->|"4. Set Raw Log Parkir"| P42
    
    P42 -->|"5. Resolve ID Pengguna"| D1
    D1 -.->|"6. Detail Nama & Tipe"| P42
    
    P42 -->|"7. Data Parkir Matang (Joined)"| P43
    P43 -->|"8. Dashboard View / Download Laporan"| Admin

    %% Styling Colors
    classDef process fill:#f9f,stroke:#333,stroke-width:2px,color:#000;
    classDef datastore fill:#bbf,stroke:#333,stroke-width:1px,color:#000;
    classDef external fill:#bfb,stroke:#333,stroke-width:2px,color:#000;

    class P41,P42,P43 process;
    class D1,D4 datastore;
    class Admin external;
```

### Kamus Data Proses 4.0:
- **4.1 Konfigurasi & Kueri Filter**: Menerima input kriteria visual dari UI, misalnya Administrator ingin melihat parkir dari tanggal *1 April - 30 April*.
- **4.2 Agregasi & Kompilasi Data**: Sub-proses terberat yang melakukan JOIN SQL (atau `include` jika di Prisma). Data murni dari `LogParkir` (D4) akan dirajut dengan master `Pengguna` (D1) supaya laporan mencantumkan "Nama Pemilik Kartu".
- **4.3 Generasi Laporan**: Melakukan *formatting* *raw* JSON/objek tersebut menjadi statistik Dashboard atau ekspor Excel/PDF.
