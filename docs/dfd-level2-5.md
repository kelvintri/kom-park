# DFD Level 2 - Proses 5.0 (Autentikasi Sistem)

Diagram ini menguraikan dekomposisi langkah keamanan yang wajib dilalui Administrator untuk mengamankan Data Parkir dan Manajemen Identitas.

```mermaid
flowchart TD
    %% Entitas Eksternal
    Admin["Administrator"]

    %% Sub-Proses Level 2 untuk Auth
    P51(("5.1<br/>Evaluasi<br/>Kredensial"))
    P52(("5.2<br/>Inisialisasi<br/>Sesi Login"))

    %% Data Store
    D5[("D5: DB User Auth")]

    %% Aliran
    Admin -->|"1. Input (Email & Password)"| P51
    P51 -->|"2. Cek Kesesuaian Kredensial"| D5
    D5 -.->|"3. Respon Kredensial (Valid/Tidak)"| P51
    
    P51 -->|"4. Kredensial (OK)"| P52
    P52 -->|"5. Create / Update Session Token"| D5
    D5 -.->|"6. Session ID Teregistrasi"| P52
    
    P52 -->|"7. Cookie / Token Hak Akses"| Admin
    P51 -->|"4b. Pesan Login Gagal"| Admin

    %% Styling Colors
    classDef process fill:#f9f,stroke:#333,stroke-width:2px,color:#000;
    classDef datastore fill:#bbf,stroke:#333,stroke-width:1px,color:#000;
    classDef external fill:#bfb,stroke:#333,stroke-width:2px,color:#000;

    class P51,P52 process;
    class D5 datastore;
    class Admin external;
```

### Kamus Data Proses 5.0:
- **5.1 Evaluasi Kredensial**: Memeriksa *email* dan mengomparasi *hash password* yang masuk dari kolom isian Administrator dengan database User Auth (D5).
- **5.2 Inisialisasi Sesi Login**: Otomatis menyimpan `token_session` yang unik bila kata sandi benar, untuk menjaga kondisi aktif pengguna (*stay-logged-in*) tanpa harus mengisi kata sandi terus saat berpindah menu.
