# DFD Level 2 - Proses 1.0 (Manajemen Data Induk)

Diagram ini merupakan rincian (dekomposisi) dari proses Manajemen Data Induk pada DFD Level 1. Proses memecah manajemen antara data Pengguna, Kartu RFID, dan Terminal Gate.

```mermaid
flowchart TD
    %% Entitas Eksternal
    Admin["Administrator"]
    
    %% Sub-Proses Level 2 untuk Manajemen Induk
    P11(("1.1<br/>Kelola Data<br/>Pengguna"))
    P12(("1.2<br/>Kelola Data<br/>Kartu RFID"))
    P13(("1.3<br/>Kelola Data<br/>Gate"))

    %% Data Store
    D1[("D1: DB Pengguna")]
    D2[("D2: DB Kartu RFID")]
    D3[("D3: DB Gate")]

    %% Aliran Data 1.1 Pengguna
    Admin -->|"1. Input Data Dosen/Mhs/Staf"| P11
    P11 -->|"2. Create/Update/Delete"| D1
    D1 -.->|"3. Result Set Pengguna"| P11
    P11 -->|"4. Status Perubahan Pengguna"| Admin

    %% Aliran Data 1.2 RFID
    Admin -->|"1. Input UID & Assign Pengguna"| P12
    D1 -.->|"2. Validasi ID Pengguna"| P12
    P12 -->|"3. Create/Update RFID"| D2
    D2 -.->|"4. Result Set Kartu"| P12
    P12 -->|"5. Status Perubahan Kartu"| Admin
    
    %% Aliran Data 1.3 Gate
    Admin -->|"1. Konfigurasi Gate Masuk/Keluar"| P13
    P13 -->|"2. Create/Update Gate"| D3
    D3 -.->|"3. Result Set Gate"| P13
    P13 -->|"4. Status Konfigurasi Gate"| Admin

    %% Styling Colors
    classDef process fill:#f9f,stroke:#333,stroke-width:2px,color:#000;
    classDef datastore fill:#bbf,stroke:#333,stroke-width:1px,color:#000;
    classDef external fill:#bfb,stroke:#333,stroke-width:2px,color:#000;

    class P11,P12,P13 process;
    class D1,D2,D3 datastore;
    class Admin external;
```

### Kamus Data Proses 1.0:
- **1.1 Kelola Data Pengguna**: Mengatur rekam jejak pengguna parkir *(Mahasiswa, Dosen, Staf)*. Administrator mengisi atau menghapus nama dan NIM/NIP.
- **1.2 Kelola Data Kartu RFID**: Proses ini mengaitkan kartu fisik dengan akun di D1. Tanpa adanya validasi pengguna di D1, kartu tidak akan bisa di-*assign*.
- **1.3 Kelola Data Gate**: Setup metadata gerbang secara logis (cth: "Gate Timur", "Tipe Keluar"). Ini penting agar *log parkir* tahu darimana kendaraan lewat.
