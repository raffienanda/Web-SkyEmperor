# Web-SkyEmperor

Web-SkyEmperor adalah sistem aplikasi web interaktif yang dirancang untuk mengelola member dan menyediakan fitur undian hadiah (Gacha) berupa tambahan waktu billing. Aplikasi ini dilengkapi dengan Dashboard Admin lengkap untuk memantau statistik, mengelola data user, dan mencetak riwayat pemenang.

## ✨ Fitur Utama

### 1. Sistem Autentikasi (Login)
* Akses login terpisah berdasarkan *Role* (Member, Operator, Admin).
* Form login dinamis dengan fitur *show/hide password*.

### 2. Mesin Gacha (Bagi Member)
* **Animasi Slot Interaktif:** Menampilkan undian hadiah billing (1 Jam hingga 50 Jam).
* **Aturan Gacha:**
    * Pembelian billing 5 Jam mendapatkan 1x kesempatan Gacha.
    * Pembelian billing 10 Jam ke atas mendapatkan 2x kesempatan Gacha.
    * Hanya berlaku untuk member berstatus REG / VIP / VVIP.
* **Leaderboard:** Menampilkan riwayat pemenang gacha secara *real-time*.

### 3. Dashboard Admin & Operator
* **Analitik & Dashboard:** Memantau persentase perolehan hadiah dari seluruh sesi gacha.
* **Manajemen User (Member):** Tambah, edit, dan hapus data member beserta perannya (Member/Operator/Admin).
* **Manajemen Prize Pool:** Mengatur dan memperbarui sisa stok hadiah.
* **Riwayat (History):**
    * Melihat log pemenang secara rinci.
    * Filter berdasarkan tanggal dan Admin/Operator yang bertugas.
    * Fitur **Export ke Excel (XLSX)** untuk pelaporan.
    * Fitur cetak struk pemenang gacha.
* **Kontrol Mesin Gacha:** Admin dapat mengaktifkan sesi gacha untuk member tertentu langsung dari dashboard.

## 🚀 Teknologi yang Digunakan

* **Frontend:** HTML5, CSS3, dan Vanilla JavaScript.
* **Backend/Database:** Google Apps Script & Google Spreadsheet (sebagai API dan basis data).
* **Library Tambahan:**
    * [FontAwesome](https://fontawesome.com/) - Untuk ikon antarmuka.
    * [SheetJS (xlsx)](https://sheetjs.com/) - Untuk fungsionalitas Export History ke Excel.

## 📂 Struktur Direktori

```text
Web-SkyEmperor/
├── assets/
│   ├── css/
│   │   ├── admin.css     # Gaya khusus dashboard admin
│   │   ├── gacha.css     # Gaya khusus mesin gacha
│   │   ├── login.css     # Gaya halaman login
│   │   └── style.css     # Gaya global & landing page
│   ├── js/
│   │   ├── admin.js      # Logika interaksi dashboard admin
│   │   ├── gacha.js      # Logika animasi dan sistem gacha
│   │   ├── login.js      # Logika autentikasi
│   │   └── navbar.js     # Logika dropdown & navigasi
│   └── photo/
│       └── Logo_sky.png  # Logo Sky Emperor
├── admin.html            # Halaman Dashboard Admin
├── gacha.html            # Halaman Mesin Gacha
├── index.html            # Entry point (Redirect ke Login)
├── login.html            # Halaman Login
└── README.md             # Dokumentasi proyek
