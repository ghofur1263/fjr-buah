# 🍎 Web Toko Fullstack "FJR BUAH"
> **Pusat Buah Segar Pilihan, Parcel Buah Eksklusif & Grosir Buah Premium**

Aplikasi web e-commerce modern untuk toko buah **FJR BUAH** yang dilengkapi dengan server backend Node.js (Express), database terpusat SQLite, autentikasi admin JWT, serta sistem checkout WhatsApp dan QRIS otomatis.

---

## 🌟 Fitur Unggulan FJR Buah

1. **Tema Segar & Higienis (Fresh Emerald & Citrus Orange):**
   - Mengusung palet warna hijau segar (*Fresh Emerald*) dengan aksen *Citrus Gold/Amber*.
   - Desain responsif (*mobile-friendly*) untuk belanja buah harian maupun pemesanan parcel.

2. **Katalog Buah Lengkap & Pilihan Varian Berat:**
   - **Kategori:** *Buah Impor Premium, Buah Lokal Segar, Parcel & Gift Box, Buah Potong & Jus, Berry & Buah Organik*.
   - **Varian Kemasan/Timbangan:** 500 Gram, 1 Kg, Box 3 Kg, Karton Dus.
   - **Tingkat Kematangan:** Siap Santap Hari Ini, Mengkal 2-3 Hari.
   - **Garansi Buah:** 100% Manis & Segar, garansi ganti baru jika buah busuk/rusak.

3. **Keranjang Belanja & Kode Promo:**
   - Slide-over drawer dengan perhitungan otomatis subtotal, potongan kupon diskon (contoh voucher aktif: `BUAHSEGAR` diskon 10%), dan bebas ongkir minimal belanja Rp 150.000.

4. **Metode Pengiriman Khusus Buah Segar:**
   - Mendukung pilihan kurir **Instant (Gojek / GrabExpress / ShopeeFood)** agar buah tetap dingin dan segar sampai di rumah pembeli.
   - Pilihan **Kurir Toko Khusus Parcel** dan **Ambil Sendiri di Toko**.

5. **Panel Backend & Admin Portal ([`admin.html`](file:///C:/Users/LENOVO/.gemini/antigravity/scratch/fjr-project-store/admin.html)):**
   - Manajemen produk buah (tambah, edit harga per kg, perbarui stok).
   - Upload foto buah langsung dari komputer lokal.
   - Manajemen pesanan masuk secara *real-time* dari tabel SQLite (*Pending &rarr; Sedang Disiapkan &rarr; Dalam Pengiriman &rarr; Selesai Diterima*).
   - Pengaturan nomor WhatsApp toko dan ganti password admin.

---

## 📁 Struktur Direktori

```
fjr-project-store/
├── server.js                  # Server Node.js Express
├── package.json               # Dependensi backend
├── .env                       # Pengaturan port & database
├── config/
│   └── db.js                  # Inisialisasi SQLite & data awal buah
├── middleware/
│   └── authMiddleware.js      # Verifikasi token JWT admin
├── routes/
│   ├── authRoutes.js          # API Login admin
│   ├── productRoutes.js       # API Katalog Buah (CRUD)
│   ├── orderRoutes.js         # API Pesanan Buah Masuk
│   ├── configRoutes.js        # API Pengaturan Toko Buah
│   └── uploadRoutes.js        # API Upload Foto Buah (Multer)
├── data/
│   └── fjr_store.db           # File database SQLite
├── uploads/                   # Folder file foto buah
├── css/
│   └── style.css              # Custom styling fresh emerald
├── js/
│   ├── data.js                # Katalog default & data FJR Buah
│   ├── store.js               # Logika belanja & pemesanan buah
│   └── admin.js               # Logika admin & manajemen pesanan
├── index.html                 # Halaman utama etalase FJR Buah
└── admin.html                 # Portal admin toko buah
```

---

## 🚀 Cara Menjalankan di VS Code

1. Buka folder ini di **VS Code**:
   ```
   C:\Users\LENOVO\.gemini\antigravity\scratch\fjr-project-store
   ```
2. Buka Terminal (`Ctrl + \``) dan install dependensi:
   ```bash
   npm install
   ```
3. Jalankan server:
   ```bash
   npm start
   ```
4. Akses melalui browser:
   - 🍏 **Web Toko Buah:** [**`http://localhost:5000`**](http://localhost:5000)
   - ⚙️ **Panel Admin Buah:** [**`http://localhost:5000/admin`**](http://localhost:5000/admin)

---

## 🔑 Login Admin Default:
- **Username:** `admin`
- **Password:** `fjrproject2026`
