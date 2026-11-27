/**
 * FJR Buah - Initial Catalog Data & Configuration
 * Pusat Buah Segar Pilihan, Parcel Buah & Grosir
 */

const FJR_CONFIG_DEFAULT = {
  storeName: "FJR BUAH",
  storeTagline: "Pusat Buah Segar Pilihan & Parcel Buah Premium",
  whatsappNumber: "6281234567890", // Ganti dengan nomor WhatsApp Toko FJR Buah
  currency: "IDR",
  freeShippingThreshold: 150000,
  promoCodes: {
    "BUAHSEGAR": { discountPercent: 10, minPurchase: 75000, desc: "Diskon 10% untuk pesanan minimal Rp 75.000" },
    "FJRFRUIT": { discountPercent: 15, minPurchase: 150000, desc: "Diskon Segar 15% min. belanja Rp 150.000" }
  }
};

const INITIAL_CATEGORIES = [
  { id: "all", name: "Semua Buah", icon: "sparkles" },
  { id: "impor", name: "Buah Impor Premium", icon: "globe" },
  { id: "lokal", name: "Buah Lokal Segar", icon: "sun" },
  { id: "parcel", name: "Parcel & Gift Box", icon: "gift" },
  { id: "potong", name: "Buah Potong & Jus", icon: "cup-soda" },
  { id: "organik", name: "Berry & Organik", icon: "leaf" }
];

const INITIAL_PRODUCTS = [
  {
    id: "fjr-buah-001",
    name: "Anggur Hijau Shine Muscat Seedless Manis Renyah",
    category: "impor",
    price: 85000,
    originalPrice: 110000,
    stock: 35,
    badge: "Best Seller",
    rating: 5.0,
    soldCount: 420,
    images: [
      "https://images.unsplash.com/photo-1596363505729-4190a9506133?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1537640538966-79f369143f8f?auto=format&fit=crop&w=800&q=80"
    ],
    sizes: ["Pack 500 Gram", "Box 1 Kg", "Karton 3 Kg"],
    colors: ["Segar Siap Santap", "Tingkat Manis 18+ Brix"],
    description: "Anggur hijau Shine Muscat premium tanpa biji dengan rasa manis seperti madu dan aroma floral yang khas. Daging buah sangat renyah dan berair, kulit tipis tanpa rasa sepat. Dipetik langsung dari kebun pendingin berstandar tinggi."
  },
  {
    id: "fjr-buah-002",
    name: "Mangga Harum Manis Super Matang Pohon",
    category: "lokal",
    price: 32000,
    originalPrice: 40000,
    stock: 50,
    badge: "Panen Baru",
    rating: 4.9,
    soldCount: 380,
    images: [
      "https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?auto=format&fit=crop&w=800&q=80"
    ],
    sizes: ["1 Kg (~2-3 Buah)", "3 Kg Hemat", "1 Dus 5 Kg"],
    colors: ["Matang Pohon Manis", "Mengkal Segar Gurih"],
    description: "Mangga Harum Manis pilihan asal Probolinggo dengan daging buah tebal berserat halus, aroma harum semerbak, dan rasa manis legit alami. Garansi diganti jika buah busuk di dalam!"
  },
  {
    id: "fjr-buah-003",
    name: "Apel Fuji RRC Wangi Manis & Sangat Garing",
    category: "impor",
    price: 42000,
    originalPrice: 50000,
    stock: 45,
    badge: "Favorit Keluarga",
    rating: 4.9,
    soldCount: 290,
    images: [
      "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?auto=format&fit=crop&w=800&q=80"
    ],
    sizes: ["1 Kg (~4-5 Buah)", "2 Kg", "Karton Box 10 Kg"],
    colors: ["Grade A Super Garing"],
    description: "Apel Fuji kualitas terbaik dengan semburat merah cerah, tekstur daging buah sangat padat, renyah (garing), dan kadar air tinggi. Kaya akan serat dan antioksidan untuk kesehatan jantung harian."
  },
  {
    id: "fjr-buah-004",
    name: "Alpukat Mentega Super Pulen Tanpa Serat",
    category: "lokal",
    price: 38000,
    originalPrice: 45000,
    stock: 40,
    badge: "Garansi Manis",
    rating: 4.8,
    soldCount: 310,
    images: [
      "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1601039641847-7857b994d704?auto=format&fit=crop&w=800&q=80"
    ],
    sizes: ["1 Kg (~3-4 Buah)", "2 Kg Paket Hemat"],
    colors: ["Siap Santap Hari Ini", "Matang 2-3 Hari Lagi"],
    description: "Alpukat mentega pilihan dengan daging tebal berwarna kuning keemasan, tekstur lumer seperti mentega, tanpa rasa pahit dan bebas serat hitam. Sangat cocok untuk jus kental, MPASI bayi, dan salad diet sehat."
  },
  {
    id: "fjr-buah-005",
    name: "Jeruk Santang Madu Daun Super Manis",
    category: "impor",
    price: 35000,
    originalPrice: 42000,
    stock: 60,
    badge: "Super Juicy",
    rating: 4.9,
    soldCount: 520,
    images: [
      "https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1582979512210-99b6a53386f9?auto=format&fit=crop&w=800&q=80"
    ],
    sizes: ["1 Kg", "Keranjang 2 Kg", "1 Dus 7 Kg"],
    colors: ["Kondisi Segar Berdaun"],
    description: "Jeruk Santang Madu berukuran mungil dengan kulit yang sangat mudah dikupas. Bulir jeruk kaya air dengan sensasi rasa manis madu tanpa asam menusuk. Anak-anak dan keluarga pasti suka!"
  },
  {
    id: "fjr-buah-006",
    name: "Semangka Merah Manis Non-Biji Segar",
    category: "lokal",
    price: 38000,
    originalPrice: 48000,
    stock: 25,
    badge: "Segar Dingin",
    rating: 4.8,
    soldCount: 195,
    images: [
      "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=800&q=80"
    ],
    sizes: ["1 Butir Utuh (~3.5-4 Kg)", "Potong Setengah (~1.8 Kg)"],
    colors: ["Merah Merona Non-Biji"],
    description: "Semangka merah tanpa biji dengan daging buah padat, renyah, dan kandungan air melimpah. Manis alami penuntas dahaga di siang hari, bisa langsung dimakan atau diblender jadi jus semangka dingin."
  },
  {
    id: "fjr-buah-007",
    name: "Parcel Buah Segar Premium Eksklusif Deluxe",
    category: "parcel",
    price: 275000,
    originalPrice: 320000,
    stock: 15,
    badge: "Hantaran Spesial",
    rating: 5.0,
    soldCount: 88,
    images: [
      "https://images.unsplash.com/photo-1618897996318-5a901fa6ca71?auto=format&fit=crop&w=800&q=80"
    ],
    sizes: ["Keranjang Rotan + Pita + Kartu Ucapan", "Box Hantaran Kayu Mewah"],
    colors: ["Kombinasi 7 Jenis Buah Premium"],
    description: "Parcel buah cantik dan higienis berisi kurasi buah terbaik: Anggur Shine Muscat, Apel Fuji, Pir Century, Jeruk Santang, Buah Naga, Kiwi, dan Pisang Cavendish. Dilengkapi keranjang rotan kokoh, pita satin, dan kartu ucapan gratis."
  },
  {
    id: "fjr-buah-008",
    name: "Pisang Cavendish Sunpride Matang Pohon",
    category: "lokal",
    price: 28000,
    originalPrice: 35000,
    stock: 35,
    badge: "Paling Laris",
    rating: 4.9,
    soldCount: 460,
    images: [
      "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=800&q=80"
    ],
    sizes: ["1 Sisir Utuh (~1.3 - 1.6 Kg)", "Setengah Sisir"],
    colors: ["Kuning Mulus Siap Santap"],
    description: "Pisang Cavendish dengan kulit mulus bersih, tekstur lembut pulen, dan rasa manis pas. Sumber kalium dan energi instan ideal untuk sarapan, bekal olahraga, dan camilan sehat keluarga."
  },
  {
    id: "fjr-buah-009",
    name: "Stroberi Manis Segar Ciwidey Bandung",
    category: "organik",
    price: 26000,
    originalPrice: 32000,
    stock: 28,
    badge: "Petik Pagi",
    rating: 4.7,
    soldCount: 230,
    images: [
      "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=800&q=80"
    ],
    sizes: ["Mika 250 Gram", "Paket 500 Gram"],
    colors: ["Merah Segar Berbintik"],
    description: "Stroberi segar dipetik subuh dari dataran tinggi Ciwidey. Buah merah merona dengan perpaduan rasa manis dan segar yang menyegarkan. Sempurna untuk salad buah, jus, topping yoghurt, dan smoothies."
  },
  {
    id: "fjr-buah-010",
    name: "Kiwi Gold Zespri New Zealand Super Manis",
    category: "impor",
    price: 48000,
    originalPrice: 55000,
    stock: 30,
    badge: "Kaya Vitamin C",
    rating: 4.9,
    soldCount: 175,
    images: [
      "https://images.unsplash.com/photo-1585059895524-72359e06133a?auto=format&fit=crop&w=800&q=80"
    ],
    sizes: ["Pack isi 3 Pcs", "Pack isi 6 Pcs", "Dus 10 Pcs"],
    colors: ["Daging Emas Manis Madu"],
    description: "Kiwi Gold varietas Zespri asal Selandia Baru dengan daging buah berwarna kuning keemasan. Rasa jauh lebih manis dibanding kiwi hijau, tidak masam, dan mengandung 3x vitamin C lebih tinggi dari jeruk."
  }
];

// Helper to access and persist settings & catalog in localStorage
function getStoredProducts() {
  const stored = localStorage.getItem("fjr_products");
  if (!stored) {
    localStorage.setItem("fjr_products", JSON.stringify(INITIAL_PRODUCTS));
    return INITIAL_PRODUCTS;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    return INITIAL_PRODUCTS;
  }
}

function saveStoredProducts(products) {
  localStorage.setItem("fjr_products", JSON.stringify(products));
}

function getStoredConfig() {
  const stored = localStorage.getItem("fjr_config");
  if (!stored) {
    localStorage.setItem("fjr_config", JSON.stringify(FJR_CONFIG_DEFAULT));
    return FJR_CONFIG_DEFAULT;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    return FJR_CONFIG_DEFAULT;
  }
}

function saveStoredConfig(config) {
  localStorage.setItem("fjr_config", JSON.stringify(config));
}

function formatRupiah(number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(number);
}
