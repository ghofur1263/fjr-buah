/**
 * FJR Buah - SQLite Database Initialization & Helper
 * Toko Buah Segar Pilihan & Parcel Buah
 */
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

// Ensure data folder exists
const dataDir = path.resolve(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = process.env.DB_PATH 
  ? path.resolve(__dirname, '..', process.env.DB_PATH)
  : path.join(dataDir, 'fjr_store.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Gagal membuka database SQLite:', err.message);
  } else {
    console.log('✅ Terhubung ke database SQLite di:', dbPath);
  }
});

// Promise-based query helpers
const dbRun = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
};

const dbGet = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

const dbAll = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
};

// Initialize schema & seeds for FJR Buah
async function initDatabase() {
  // 1. Admins Table
  await dbRun(`
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 2. Categories Table
  await dbRun(`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      icon TEXT
    )
  `);

  // 3. Products Table
  await dbRun(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      price REAL NOT NULL,
      original_price REAL,
      stock INTEGER DEFAULT 0,
      badge TEXT,
      rating REAL DEFAULT 5.0,
      sold_count INTEGER DEFAULT 0,
      images TEXT,
      sizes TEXT,
      colors TEXT,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 4. Orders Table
  await dbRun(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      customer_name TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      courier TEXT NOT NULL,
      payment_method TEXT NOT NULL,
      shipping_address TEXT NOT NULL,
      notes TEXT,
      subtotal REAL NOT NULL,
      discount REAL DEFAULT 0,
      total_amount REAL NOT NULL,
      status TEXT DEFAULT 'pending',
      items TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 5. Store Settings Table
  await dbRun(`
    CREATE TABLE IF NOT EXISTS store_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `);

  // Seed Default Admin
  const adminCount = await dbGet('SELECT COUNT(*) as count FROM admins');
  if (adminCount.count === 0) {
    const defaultUser = process.env.ADMIN_DEFAULT_USER || 'admin';
    const defaultPass = process.env.ADMIN_DEFAULT_PASS || 'fjrproject2026';
    const hashed = await bcrypt.hash(defaultPass, 10);
    await dbRun('INSERT INTO admins (username, password_hash) VALUES (?, ?)', [defaultUser, hashed]);
    console.log(`🔑 Admin FJR Buah: Username "${defaultUser}", Password "${defaultPass}"`);
  }

  // Update / Seed Store Settings for FJR Buah
  await dbRun('INSERT OR REPLACE INTO store_settings (key, value) VALUES (?, ?)', ['store_name', 'FJR BUAH']);
  await dbRun('INSERT OR REPLACE INTO store_settings (key, value) VALUES (?, ?)', ['store_tagline', 'Pusat Buah Segar Pilihan & Parcel Buah Premium']);
  await dbRun('INSERT OR REPLACE INTO store_settings (key, value) VALUES (?, ?)', ['whatsapp_number', '6281234567890']);
  console.log('🍎 Pengaturan Toko FJR Buah berhasil diaktifkan.');

  // Seed / Refresh Fruit Categories
  await dbRun('DELETE FROM categories');
  const fruitCategories = [
    { id: "all", name: "Semua Buah", icon: "sparkles" },
    { id: "impor", name: "Buah Impor Premium", icon: "globe" },
    { id: "lokal", name: "Buah Lokal Segar", icon: "sun" },
    { id: "parcel", name: "Parcel & Gift Box", icon: "gift" },
    { id: "potong", name: "Buah Potong & Jus", icon: "cup-soda" },
    { id: "organik", name: "Berry & Organik", icon: "leaf" }
  ];
  for (const cat of fruitCategories) {
    await dbRun('INSERT INTO categories (id, name, icon) VALUES (?, ?, ?)', [cat.id, cat.name, cat.icon]);
  }

  // Check if products are currently the old apparel or empty -> replace with fresh fruits
  const prodCheck = await dbGet('SELECT id FROM products LIMIT 1');
  const needsFruitSeed = !prodCheck || prodCheck.id.startsWith('fjr-00');

  if (needsFruitSeed) {
    await dbRun('DELETE FROM products');
    const initialFruits = [
      {
        id: "fjr-buah-001",
        name: "Anggur Hijau Shine Muscat Seedless Manis Renyah",
        category: "impor",
        price: 85000,
        original_price: 110000,
        stock: 35,
        badge: "Best Seller",
        rating: 5.0,
        sold_count: 420,
        images: JSON.stringify([
          "https://images.unsplash.com/photo-1596363505729-4190a9506133?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1537640538966-79f369143f8f?auto=format&fit=crop&w=800&q=80"
        ]),
        sizes: JSON.stringify(["Pack 500 Gram", "Box 1 Kg", "Karton 3 Kg"]),
        colors: JSON.stringify(["Segar Siap Santap", "Tingkat Manis 18+ Brix"]),
        description: "Anggur hijau Shine Muscat premium tanpa biji dengan rasa manis seperti madu dan aroma floral yang khas. Daging buah sangat renyah dan berair, kulit tipis tanpa rasa sepat."
      },
      {
        id: "fjr-buah-002",
        name: "Mangga Harum Manis Super Matang Pohon",
        category: "lokal",
        price: 32000,
        original_price: 40000,
        stock: 50,
        badge: "Panen Baru",
        rating: 4.9,
        sold_count: 380,
        images: JSON.stringify([
          "https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?auto=format&fit=crop&w=800&q=80"
        ]),
        sizes: JSON.stringify(["1 Kg (~2-3 Buah)", "3 Kg Hemat", "1 Dus 5 Kg"]),
        colors: JSON.stringify(["Matang Pohon Manis", "Mengkal Segar Gurih"]),
        description: "Mangga Harum Manis pilihan asal Probolinggo dengan daging buah tebal berserat halus, aroma harum semerbak, dan rasa manis legit alami. Garansi buah diganti jika busuk di dalam!"
      },
      {
        id: "fjr-buah-003",
        name: "Apel Fuji RRC Wangi Manis & Sangat Garing",
        category: "impor",
        price: 42000,
        original_price: 50000,
        stock: 45,
        badge: "Favorit Keluarga",
        rating: 4.9,
        sold_count: 290,
        images: JSON.stringify([
          "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?auto=format&fit=crop&w=800&q=80"
        ]),
        sizes: JSON.stringify(["1 Kg (~4-5 Buah)", "2 Kg", "Karton Box 10 Kg"]),
        colors: JSON.stringify(["Grade A Super Garing"]),
        description: "Apel Fuji kualitas terbaik dengan semburat merah cerah, tekstur daging buah sangat padat, renyah (garing), dan kadar air tinggi. Kaya akan serat dan antioksidan."
      },
      {
        id: "fjr-buah-004",
        name: "Alpukat Mentega Super Pulen Tanpa Serat",
        category: "lokal",
        price: 38000,
        original_price: 45000,
        stock: 40,
        badge: "Garansi Manis",
        rating: 4.8,
        sold_count: 310,
        images: JSON.stringify([
          "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=800&q=80"
        ]),
        sizes: JSON.stringify(["1 Kg (~3-4 Buah)", "2 Kg Paket Hemat"]),
        colors: JSON.stringify(["Siap Santap Hari Ini", "Matang 2-3 Hari Lagi"]),
        description: "Alpukat mentega pilihan dengan daging tebal berwarna kuning keemasan, tekstur lumer seperti mentega, tanpa rasa pahit dan bebas serat hitam. Sangat cocok untuk jus dan salad."
      },
      {
        id: "fjr-buah-005",
        name: "Jeruk Santang Madu Daun Super Manis",
        category: "impor",
        price: 35000,
        original_price: 42000,
        stock: 60,
        badge: "Super Juicy",
        rating: 4.9,
        sold_count: 520,
        images: JSON.stringify([
          "https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?auto=format&fit=crop&w=800&q=80"
        ]),
        sizes: JSON.stringify(["1 Kg", "Keranjang 2 Kg", "1 Dus 7 Kg"]),
        colors: JSON.stringify(["Kondisi Segar Berdaun"]),
        description: "Jeruk Santang Madu berukuran mungil dengan kulit yang sangat mudah dikupas. Bulir jeruk kaya air dengan sensasi rasa manis madu tanpa asam menusuk."
      },
      {
        id: "fjr-buah-006",
        name: "Semangka Merah Manis Non-Biji Segar",
        category: "lokal",
        price: 38000,
        original_price: 48000,
        stock: 25,
        badge: "Segar Dingin",
        rating: 4.8,
        sold_count: 195,
        images: JSON.stringify([
          "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=800&q=80"
        ]),
        sizes: JSON.stringify(["1 Butir Utuh (~3.5-4 Kg)", "Potong Setengah (~1.8 Kg)"]),
        colors: JSON.stringify(["Merah Merona Non-Biji"]),
        description: "Semangka merah tanpa biji dengan daging buah padat, renyah, dan kandungan air melimpah. Manis alami penuntas dahaga di siang hari."
      },
      {
        id: "fjr-buah-007",
        name: "Parcel Buah Segar Premium Eksklusif Deluxe",
        category: "parcel",
        price: 275000,
        original_price: 320000,
        stock: 15,
        badge: "Hantaran Spesial",
        rating: 5.0,
        sold_count: 88,
        images: JSON.stringify([
          "https://images.unsplash.com/photo-1618897996318-5a901fa6ca71?auto=format&fit=crop&w=800&q=80"
        ]),
        sizes: JSON.stringify(["Keranjang Rotan + Pita + Kartu Ucapan", "Box Hantaran Kayu Mewah"]),
        colors: JSON.stringify(["Kombinasi 7 Jenis Buah Premium"]),
        description: "Parcel buah cantik dan higienis berisi kurasi buah terbaik: Anggur Shine Muscat, Apel Fuji, Pir Century, Jeruk Santang, Buah Naga, Kiwi, dan Pisang Cavendish."
      },
      {
        id: "fjr-buah-008",
        name: "Pisang Cavendish Sunpride Matang Pohon",
        category: "lokal",
        price: 28000,
        original_price: 35000,
        stock: 35,
        badge: "Paling Laris",
        rating: 4.9,
        sold_count: 460,
        images: JSON.stringify([
          "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=800&q=80"
        ]),
        sizes: JSON.stringify(["1 Sisir Utuh (~1.3 - 1.6 Kg)", "Setengah Sisir"]),
        colors: JSON.stringify(["Kuning Mulus Siap Santap"]),
        description: "Pisang Cavendish dengan kulit mulus bersih, tekstur lembut pulen, dan rasa manis pas. Sumber kalium dan energi instan ideal untuk sarapan dan camilan sehat."
      }
    ];

    for (const p of initialFruits) {
      await dbRun(`
        INSERT INTO products (
          id, name, category, price, original_price, stock, badge, rating, sold_count, images, sizes, colors, description
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        p.id, p.name, p.category, p.price, p.original_price, p.stock, p.badge, p.rating, p.sold_count, p.images, p.sizes, p.colors, p.description
      ]);
    }
    console.log(`🍎 Katalog buah segar FJR Buah berhasil di-seed ke SQLite (${initialFruits.length} produk).`);
  }
}

module.exports = {
  db,
  dbRun,
  dbGet,
  dbAll,
  initDatabase
};
