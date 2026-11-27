/**
 * FJR Buah - Store Frontend Logic & Interactions (API Connected)
 */

// Global State
let products = [];
let config = {};
let cart = [];
let activeCategory = "all";
let searchQuery = "";
let currentSort = "featured";
let activeProductForModal = null;
let appliedDiscount = 0;
let appliedPromoCode = "";
let isBackendConnected = false;

// Initialize
document.addEventListener("DOMContentLoaded", async () => {
  cart = getStoredCart();
  config = getStoredConfig();

  // Try fetching from Backend API first
  await loadStoreData();

  renderCategories();
  renderProducts();
  updateCartUI();
  setupEventListeners();

  if (window.lucide) {
    window.lucide.createIcons();
  }
});

async function loadStoreData() {
  try {
    const res = await fetch("/api/products");
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.data) && data.data.length > 0) {
        products = data.data;
        isBackendConnected = true;
      } else {
        products = getStoredProducts();
      }
    } else {
      products = getStoredProducts();
    }
  } catch (err) {
    products = getStoredProducts();
  }

  try {
    const cfgRes = await fetch("/api/config");
    if (cfgRes.ok) {
      const cfgData = await cfgRes.json();
      if (cfgData.success && cfgData.data) {
        config = {
          ...config,
          storeName: cfgData.data.store_name || config.storeName,
          storeTagline: cfgData.data.store_tagline || config.storeTagline,
          whatsappNumber: cfgData.data.whatsapp_number || config.whatsappNumber
        };
      }
    }
  } catch (e) {
    // Keep local
  }

  applyStoreConfig();
}

function applyStoreConfig() {
  const storeBrandName = document.querySelectorAll(".store-name-text");
  storeBrandName.forEach(el => el.textContent = config.storeName || "FJR BUAH");
  
  const storeTagline = document.querySelectorAll(".store-tagline-text");
  storeTagline.forEach(el => el.textContent = config.storeTagline || "Pusat Buah Segar & Parcel Premium");
}

function getStoredCart() {
  const stored = localStorage.getItem("fjr_cart");
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch (e) {
    return [];
  }
}

function saveCart(newCart) {
  cart = newCart;
  localStorage.setItem("fjr_cart", JSON.stringify(cart));
  updateCartUI();
}

// Category Tabs
function renderCategories() {
  const container = document.getElementById("categoryList");
  if (!container) return;

  container.innerHTML = INITIAL_CATEGORIES.map(cat => {
    const isActive = cat.id === activeCategory;
    return `
      <button onclick="setCategory('${cat.id}')" 
        class="category-btn px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
          isActive 
            ? 'bg-emerald-500 text-slate-950 font-bold shadow-lg shadow-emerald-500/25' 
            : 'bg-slate-900/80 text-slate-300 border border-emerald-950 hover:border-emerald-700 hover:text-white'
        }">
        <i data-lucide="${cat.icon}" class="w-4 h-4"></i>
        ${cat.name}
      </button>
    `;
  }).join("");

  if (window.lucide) window.lucide.createIcons();
}

function setCategory(catId) {
  activeCategory = catId;
  renderCategories();
  renderProducts();
}

// Product Grid Rendering
function renderProducts() {
  const grid = document.getElementById("productGrid");
  const countLabel = document.getElementById("productCount");
  if (!grid) return;

  // Filter
  let filtered = products.filter(p => {
    const matchesCategory = activeCategory === "all" || p.category === activeCategory;
    const matchesSearch = 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Sort
  if (currentSort === "price-low") {
    filtered.sort((a, b) => a.price - b.price);
  } else if (currentSort === "price-high") {
    filtered.sort((a, b) => b.price - a.price);
  } else if (currentSort === "sold") {
    filtered.sort((a, b) => (b.soldCount || b.sold_count || 0) - (a.soldCount || a.sold_count || 0));
  } else if (currentSort === "rating") {
    filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  }

  if (countLabel) {
    countLabel.textContent = `Menampilkan ${filtered.length} jenis buah ${isBackendConnected ? '(Database Buah Aktif)' : ''}`;
  }

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="col-span-full py-16 text-center">
        <div class="inline-flex p-4 rounded-full bg-slate-900 border border-emerald-950 text-slate-500 mb-4">
          <i data-lucide="apple" class="w-10 h-10 text-emerald-500/50"></i>
        </div>
        <h3 class="text-lg font-semibold text-white">Buah yang dicari belum tersedia</h3>
        <p class="text-sm text-slate-400 mt-1">Coba gunakan kata kunci pencarian lain atau pilih kategori buah berbeda.</p>
        <button onclick="resetFilters()" class="mt-4 px-4 py-2 bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-emerald-400 rounded-lg text-sm font-medium transition-all">
          Reset Filter Buah
        </button>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons();
    return;
  }

  grid.innerHTML = filtered.map(item => {
    const origPrice = item.originalPrice || item.original_price;
    const discountPercent = origPrice && origPrice > item.price 
      ? Math.round(((origPrice - item.price) / origPrice) * 100) 
      : 0;

    const mainImg = Array.isArray(item.images) && item.images.length > 0 
      ? item.images[0] 
      : (typeof item.images === 'string' ? JSON.parse(item.images || '[]')[0] : 'https://images.unsplash.com/photo-1596363505729-4190a9506133?auto=format&fit=crop&w=800&q=80');

    return `
      <div class="glow-card group bg-slate-900/60 border border-emerald-950 rounded-2xl overflow-hidden flex flex-col justify-between">
        <!-- Thumbnail & Badges -->
        <div class="relative overflow-hidden bg-slate-950 aspect-square cursor-pointer" onclick="openProductModal('${item.id}')">
          <img src="${mainImg}" alt="${item.name}" 
            class="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
            loading="lazy"
          />
          
          <!-- Badges -->
          <div class="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
            ${item.badge ? `
              <span class="px-2.5 py-1 text-[11px] font-bold rounded-md bg-emerald-500 text-slate-950 uppercase tracking-wider backdrop-blur-md shadow-md">
                ${item.badge}
              </span>
            ` : ''}
            ${discountPercent > 0 ? `
              <span class="px-2 py-0.5 text-[10px] font-bold rounded bg-rose-500 text-white w-fit">
                -${discountPercent}%
              </span>
            ` : ''}
          </div>

          <!-- Quick action overlay button -->
          <div class="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-4">
            <button onclick="event.stopPropagation(); openProductModal('${item.id}')" 
              class="p-2.5 rounded-xl bg-slate-900/90 hover:bg-emerald-500 text-white hover:text-slate-950 transition-colors shadow-lg backdrop-blur-md"
              title="Lihat Detail Buah">
              <i data-lucide="eye" class="w-5 h-5"></i>
            </button>
            <button onclick="event.stopPropagation(); quickAddToCart('${item.id}')" 
              class="p-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors shadow-lg font-bold"
              title="Tambah ke Keranjang">
              <i data-lucide="shopping-basket" class="w-5 h-5"></i>
            </button>
          </div>

          <div class="absolute bottom-2.5 right-2.5 bg-slate-950/80 backdrop-blur-md px-2 py-1 rounded-md text-[11px] text-slate-300 flex items-center gap-1">
            <i data-lucide="star" class="w-3.5 h-3.5 text-amber-400 fill-amber-400"></i>
            <span>${item.rating || 5.0}</span>
            <span class="text-slate-500">(${item.soldCount || item.sold_count || 100}+ kg)</span>
          </div>
        </div>

        <!-- Info Card -->
        <div class="p-4 sm:p-5 flex flex-col flex-1 justify-between">
          <div>
            <span class="text-[11px] font-bold tracking-wider text-emerald-400 uppercase">
              ${item.category}
            </span>
            <h4 class="text-sm sm:text-base font-bold text-white mt-1 group-hover:text-emerald-300 transition-colors cursor-pointer line-clamp-2 leading-snug"
              onclick="openProductModal('${item.id}')">
              ${item.name}
            </h4>
          </div>

          <div class="mt-4 pt-3 border-t border-emerald-950/80 flex items-end justify-between gap-2">
            <div>
              <div class="flex items-center gap-2">
                <span class="text-base sm:text-lg font-extrabold text-white">
                  ${formatRupiah(item.price)}
                </span>
              </div>
              ${origPrice ? `
                <span class="text-xs text-slate-500 line-through">
                  ${formatRupiah(origPrice)}
                </span>
              ` : ''}
            </div>

            <button onclick="openProductModal('${item.id}')" 
              class="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-emerald-500 text-slate-300 hover:text-slate-950 font-bold text-xs transition-all flex items-center gap-1.5">
              <span>Beli</span>
              <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  }).join("");

  if (window.lucide) window.lucide.createIcons();
}

function resetFilters() {
  activeCategory = "all";
  searchQuery = "";
  currentSort = "featured";
  const searchInput = document.getElementById("searchInput");
  if (searchInput) searchInput.value = "";
  const sortSelect = document.getElementById("sortSelect");
  if (sortSelect) sortSelect.value = "featured";
  renderCategories();
  renderProducts();
}

// Quick Add to Cart with default options
function quickAddToCart(productId) {
  const prod = products.find(p => p.id === productId);
  if (!prod) return;

  const sizes = Array.isArray(prod.sizes) ? prod.sizes : (typeof prod.sizes === 'string' ? JSON.parse(prod.sizes || '[]') : []);
  const colors = Array.isArray(prod.colors) ? prod.colors : (typeof prod.colors === 'string' ? JSON.parse(prod.colors || '[]') : []);
  const images = Array.isArray(prod.images) ? prod.images : (typeof prod.images === 'string' ? JSON.parse(prod.images || '[]') : []);

  const defaultSize = sizes.length > 0 ? sizes[0] : "1 Kg";
  const defaultColor = colors.length > 0 ? colors[0] : "Segar Siap Santap";
  const defaultImage = images.length > 0 ? images[0] : "";

  addToCartItem({
    id: prod.id,
    name: prod.name,
    price: prod.price,
    image: defaultImage,
    size: defaultSize,
    color: defaultColor,
    quantity: 1
  });

  showToast(`"${prod.name}" berhasil masuk ke keranjang buah!`);
}

// Modal Product Detail
function openProductModal(productId) {
  const prod = products.find(p => p.id === productId);
  if (!prod) return;

  activeProductForModal = prod;
  const modal = document.getElementById("productModal");
  if (!modal) return;

  const origPrice = prod.originalPrice || prod.original_price;
  const sizes = Array.isArray(prod.sizes) ? prod.sizes : (typeof prod.sizes === 'string' ? JSON.parse(prod.sizes || '[]') : []);
  const colors = Array.isArray(prod.colors) ? prod.colors : (typeof prod.colors === 'string' ? JSON.parse(prod.colors || '[]') : []);
  const images = Array.isArray(prod.images) ? prod.images : (typeof prod.images === 'string' ? JSON.parse(prod.images || '[]') : []);

  document.getElementById("modalTitle").textContent = prod.name;
  document.getElementById("modalPrice").textContent = formatRupiah(prod.price);
  document.getElementById("modalCategory").textContent = prod.category.toUpperCase();
  document.getElementById("modalDesc").textContent = prod.description;
  document.getElementById("modalStock").textContent = `Stok tersedia: ${prod.stock} paket / kg`;
  
  const originalEl = document.getElementById("modalOriginalPrice");
  if (origPrice) {
    originalEl.textContent = formatRupiah(origPrice);
    originalEl.classList.remove("hidden");
  } else {
    originalEl.classList.add("hidden");
  }

  // Gallery
  const mainImg = document.getElementById("modalMainImage");
  mainImg.src = images.length > 0 ? images[0] : '';

  const thumbsContainer = document.getElementById("modalThumbs");
  thumbsContainer.innerHTML = images.map((img, idx) => `
    <button onclick="switchModalImage('${img}')" class="w-14 h-14 rounded-lg overflow-hidden border-2 ${idx === 0 ? 'border-emerald-500' : 'border-emerald-950'} hover:border-emerald-400 transition-all flex-shrink-0">
      <img src="${img}" class="w-full h-full object-cover" />
    </button>
  `).join("");

  // Weight / Packaging Selector
  const sizeContainer = document.getElementById("modalSizes");
  if (sizes.length > 0) {
    sizeContainer.innerHTML = sizes.map((sz, i) => `
      <label class="cursor-pointer">
        <input type="radio" name="modal_size" value="${sz}" ${i === 0 ? 'checked' : ''} class="peer sr-only" />
        <span class="inline-block px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 border border-emerald-900 text-slate-300 peer-checked:bg-emerald-500 peer-checked:text-slate-950 peer-checked:border-emerald-500 transition-all">
          ${sz}
        </span>
      </label>
    `).join("");
    document.getElementById("modalSizeWrapper").classList.remove("hidden");
  } else {
    document.getElementById("modalSizeWrapper").classList.add("hidden");
  }

  // Ripeness / Condition Selector
  const colorContainer = document.getElementById("modalColors");
  if (colors.length > 0) {
    colorContainer.innerHTML = colors.map((col, i) => `
      <label class="cursor-pointer">
        <input type="radio" name="modal_color" value="${col}" ${i === 0 ? 'checked' : ''} class="peer sr-only" />
        <span class="inline-block px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 border border-emerald-900 text-slate-300 peer-checked:bg-emerald-500 peer-checked:text-slate-950 peer-checked:border-emerald-500 transition-all">
          ${col}
        </span>
      </label>
    `).join("");
    document.getElementById("modalColorWrapper").classList.remove("hidden");
  } else {
    document.getElementById("modalColorWrapper").classList.add("hidden");
  }

  // Reset Quantity
  document.getElementById("modalQty").value = 1;

  modal.classList.add("active");
  document.body.classList.add("overflow-hidden");
  if (window.lucide) window.lucide.createIcons();
}

function switchModalImage(src) {
  const mainImg = document.getElementById("modalMainImage");
  if (mainImg) mainImg.src = src;
}

function closeProductModal() {
  const modal = document.getElementById("productModal");
  if (modal) modal.classList.remove("active");
  document.body.classList.remove("overflow-hidden");
}

function changeModalQty(delta) {
  const input = document.getElementById("modalQty");
  let val = parseInt(input.value) || 1;
  val = Math.max(1, Math.min(activeProductForModal ? activeProductForModal.stock : 99, val + delta));
  input.value = val;
}

function submitModalAddToCart(directCheckout = false) {
  if (!activeProductForModal) return;

  const sizeInput = document.querySelector('input[name="modal_size"]:checked');
  const colorInput = document.querySelector('input[name="modal_color"]:checked');
  const qtyInput = document.getElementById("modalQty");

  const images = Array.isArray(activeProductForModal.images) ? activeProductForModal.images : (typeof activeProductForModal.images === 'string' ? JSON.parse(activeProductForModal.images || '[]') : []);

  const size = sizeInput ? sizeInput.value : "1 Kg";
  const color = colorInput ? colorInput.value : "Segar Siap Santap";
  const qty = parseInt(qtyInput.value) || 1;

  addToCartItem({
    id: activeProductForModal.id,
    name: activeProductForModal.name,
    price: activeProductForModal.price,
    image: images.length > 0 ? images[0] : "",
    size: size,
    color: color,
    quantity: qty
  });

  closeProductModal();

  if (directCheckout) {
    openCartDrawer();
  } else {
    showToast(`"${activeProductForModal.name}" (${qty}x) ditambahkan ke keranjang!`);
  }
}

// Cart Management
function addToCartItem(item) {
  const existingIdx = cart.findIndex(c => 
    c.id === item.id && c.size === item.size && c.color === item.color
  );

  if (existingIdx > -1) {
    cart[existingIdx].quantity += item.quantity;
  } else {
    cart.push(item);
  }

  saveCart(cart);
}

function updateCartItemQty(index, delta) {
  if (!cart[index]) return;
  cart[index].quantity += delta;
  if (cart[index].quantity <= 0) {
    cart.splice(index, 1);
  }
  saveCart(cart);
}

function removeCartItem(index) {
  cart.splice(index, 1);
  saveCart(cart);
  showToast("Item dihapus dari keranjang buah");
}

function clearCart() {
  saveCart([]);
  appliedDiscount = 0;
  appliedPromoCode = "";
}

function calculateSubtotal() {
  return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

function calculateTotal() {
  const subtotal = calculateSubtotal();
  const discountAmount = Math.round((subtotal * appliedDiscount) / 100);
  return Math.max(0, subtotal - discountAmount);
}

function updateCartUI() {
  const countBadges = document.querySelectorAll(".cart-count-badge");
  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  
  countBadges.forEach(b => {
    b.textContent = totalCount;
    b.classList.toggle("hidden", totalCount === 0);
  });

  const cartItemsList = document.getElementById("cartItemsList");
  const cartSubtotalEl = document.getElementById("cartSubtotal");
  const cartDiscountEl = document.getElementById("cartDiscount");
  const cartDiscountRow = document.getElementById("cartDiscountRow");
  const cartTotalEl = document.getElementById("cartTotal");
  const emptyState = document.getElementById("cartEmptyState");
  const footerEl = document.getElementById("cartFooter");

  if (!cartItemsList) return;

  if (cart.length === 0) {
    cartItemsList.innerHTML = "";
    if (emptyState) emptyState.classList.remove("hidden");
    if (footerEl) footerEl.classList.add("hidden");
    return;
  }

  if (emptyState) emptyState.classList.add("hidden");
  if (footerEl) footerEl.classList.remove("hidden");

  const subtotal = calculateSubtotal();
  const total = calculateTotal();
  const discountAmount = subtotal - total;

  if (cartSubtotalEl) cartSubtotalEl.textContent = formatRupiah(subtotal);
  if (cartTotalEl) cartTotalEl.textContent = formatRupiah(total);

  if (appliedDiscount > 0 && cartDiscountRow && cartDiscountEl) {
    cartDiscountRow.classList.remove("hidden");
    cartDiscountEl.textContent = `-${formatRupiah(discountAmount)} (${appliedDiscount}%)`;
  } else if (cartDiscountRow) {
    cartDiscountRow.classList.add("hidden");
  }

  cartItemsList.innerHTML = cart.map((item, index) => `
    <div class="flex gap-3 py-3 border-b border-emerald-950/80 items-center justify-between">
      <img src="${item.image}" alt="${item.name}" class="w-14 h-14 rounded-xl object-cover bg-slate-900 border border-emerald-950 flex-shrink-0" />
      <div class="flex-1 min-w-0 pr-2">
        <h5 class="text-sm font-semibold text-white truncate">${item.name}</h5>
        <div class="text-[11px] text-slate-400 mt-0.5 flex flex-wrap gap-2">
          ${item.size !== '-' ? `<span>Kemasan: <strong class="text-emerald-300">${item.size}</strong></span>` : ''}
          ${item.color !== '-' ? `<span>Kondisi: <strong class="text-slate-200">${item.color}</strong></span>` : ''}
        </div>
        <div class="text-xs font-bold text-emerald-400 mt-1">
          ${formatRupiah(item.price)}
        </div>
      </div>
      <div class="flex flex-col items-end gap-1.5">
        <button onclick="removeCartItem(${index})" class="text-slate-500 hover:text-rose-400 text-xs transition-colors p-1" title="Hapus">
          <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
        </button>
        <div class="flex items-center border border-emerald-900 bg-slate-950 rounded-lg overflow-hidden">
          <button onclick="updateCartItemQty(${index}, -1)" class="w-6 h-6 flex items-center justify-center text-slate-300 hover:bg-slate-800 text-xs">
            -
          </button>
          <span class="w-6 text-center text-xs font-bold text-white">${item.quantity}</span>
          <button onclick="updateCartItemQty(${index}, 1)" class="w-6 h-6 flex items-center justify-center text-slate-300 hover:bg-slate-800 text-xs">
            +
          </button>
        </div>
      </div>
    </div>
  `).join("");

  if (window.lucide) window.lucide.createIcons();
}

function applyPromoCode() {
  const input = document.getElementById("promoInput");
  const code = (input ? input.value : "").trim().toUpperCase();
  const subtotal = calculateSubtotal();

  if (!code) {
    showToast("Masukkan kode promo terlebih dahulu!", true);
    return;
  }

  const promo = config.promoCodes ? config.promoCodes[code] : null;

  if (!promo) {
    showToast("Kode promo tidak valid / kadaluarsa!", true);
    return;
  }

  if (subtotal < promo.minPurchase) {
    showToast(`Minimal belanja ${formatRupiah(promo.minPurchase)} untuk kode ini!`, true);
    return;
  }

  appliedDiscount = promo.discountPercent;
  appliedPromoCode = code;
  updateCartUI();
  showToast(`Voucher berhasil! Diskon ${promo.discountPercent}% telah diterapkan.`);
}

// Drawer Controls
function openCartDrawer() {
  const drawer = document.getElementById("cartDrawer");
  if (drawer) drawer.classList.add("active");
  document.body.classList.add("overflow-hidden");
}

function closeCartDrawer() {
  const drawer = document.getElementById("cartDrawer");
  if (drawer) drawer.classList.remove("active");
  document.body.classList.remove("overflow-hidden");
}

// Checkout Modal & WhatsApp Order Formatter
function openCheckoutModal() {
  if (cart.length === 0) {
    showToast("Keranjang buah Anda masih kosong!", true);
    return;
  }
  closeCartDrawer();
  const modal = document.getElementById("checkoutModal");
  if (modal) modal.classList.add("active");
  document.body.classList.add("overflow-hidden");

  const total = calculateTotal();
  const totalAmountEl = document.getElementById("checkoutTotalDisplay");
  if (totalAmountEl) totalAmountEl.textContent = formatRupiah(total);
}

function closeCheckoutModal() {
  const modal = document.getElementById("checkoutModal");
  if (modal) modal.classList.remove("active");
  document.body.classList.remove("overflow-hidden");
}

async function submitWhatsAppOrder(event) {
  event.preventDefault();

  const name = document.getElementById("orderName").value.trim();
  const phone = document.getElementById("orderPhone").value.trim();
  const address = document.getElementById("orderAddress").value.trim();
  const courier = document.getElementById("orderCourier").value;
  const note = document.getElementById("orderNote").value.trim();
  const paymentMethod = document.getElementById("orderPayment").value;

  if (!name || !phone || !address) {
    showToast("Mohon lengkapi nama, nomor WhatsApp, dan alamat pengiriman!", true);
    return;
  }

  const subtotal = calculateSubtotal();
  const total = calculateTotal();
  const discountAmount = subtotal - total;

  // 1. Send Order to Backend API if available
  try {
    const orderPayload = {
      customerName: name,
      customerPhone: phone,
      courier,
      paymentMethod,
      shippingAddress: address,
      notes: note,
      subtotal,
      discount: discountAmount,
      totalAmount: total,
      items: cart
    };

    fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderPayload)
    }).catch(e => console.log('Static mode / backend unreached'));
  } catch (e) {
    // Graceful fallback
  }

  // 2. Format Structured WhatsApp Message for Fruit Store
  let text = `*🍎 PESANAN BUAH SEGAR - ${config.storeName || "FJR BUAH"}*\n`;
  text += `-------------------------------------------\n`;
  text += `*Halo Admin FJR Buah, saya ingin konfirmasi pemesanan buah segar:*\n\n`;
  text += `👤 *Data Penerima:*\n`;
  text += `• Nama: ${name}\n`;
  text += `• No. WA/HP: ${phone}\n`;
  text += `• Alamat Lengkap: ${address}\n`;
  text += `• Pilihan Kurir: ${courier}\n`;
  text += `• Metode Bayar: ${paymentMethod}\n`;
  if (note) text += `• Catatan / Ucapan Parcel: ${note}\n`;
  text += `\n🍇 *Daftar Buah yang Dipesan:*\n`;

  cart.forEach((item, idx) => {
    text += `${idx + 1}. *${item.name}*\n`;
    text += `   - Kemasan/Berat: ${item.size}\n`;
    if (item.color !== '-') text += `   - Tingkat Kematangan: ${item.color}\n`;
    text += `   - Jumlah: ${item.quantity} x ${formatRupiah(item.price)}\n`;
    text += `   - Subtotal: ${formatRupiah(item.price * item.quantity)}\n`;
  });

  text += `\n💰 *Ringkasan Tagihan Buah:*\n`;
  text += `• Subtotal: ${formatRupiah(subtotal)}\n`;
  if (appliedDiscount > 0) {
    text += `• Diskon Voucher (${appliedPromoCode}): -${formatRupiah(discountAmount)}\n`;
  }
  text += `• *Total Pembayaran:* *${formatRupiah(total)}*\n`;
  text += `-------------------------------------------\n`;
  text += `Mohon info kesiapan buah & estimasi kurir pengiriman ya Admin FJR Buah. Terima kasih! 🍏`;

  const waTarget = config.whatsappNumber || "6281234567890";
  const waUrl = `https://wa.me/${waTarget.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(text)}`;

  // Open WhatsApp
  window.open(waUrl, "_blank");

  closeCheckoutModal();
  showToast("Pesanan buah tersimpan & siap dikirim ke WhatsApp!");
}

// QRIS Modal Simulator
function openQrisModal() {
  closeCheckoutModal();
  const modal = document.getElementById("qrisModal");
  if (modal) {
    const total = calculateTotal();
    document.getElementById("qrisAmount").textContent = formatRupiah(total);
    modal.classList.add("active");
    document.body.classList.add("overflow-hidden");
  }
}

function closeQrisModal() {
  const modal = document.getElementById("qrisModal");
  if (modal) modal.classList.remove("active");
  document.body.classList.remove("overflow-hidden");
}

function verifyQrisPayment() {
  closeQrisModal();
  clearCart();
  showToast("Pembayaran QRIS Berhasil! Buah Anda segera disiapkan.");
}

// Toast Notifications
function showToast(message, isError = false) {
  const toast = document.getElementById("toastNotification");
  const msgEl = document.getElementById("toastMessage");
  const iconEl = document.getElementById("toastIcon");

  if (!toast || !msgEl) return;

  msgEl.textContent = message;
  toast.classList.remove("border-emerald-500", "border-rose-500", "bg-slate-900");
  
  if (isError) {
    toast.classList.add("border-rose-500", "bg-rose-950/90");
    if (iconEl) iconEl.innerHTML = `<i data-lucide="alert-circle" class="w-5 h-5 text-rose-400"></i>`;
  } else {
    toast.classList.add("border-emerald-500", "bg-slate-900/95");
    if (iconEl) iconEl.innerHTML = `<i data-lucide="check-circle" class="w-5 h-5 text-emerald-400"></i>`;
  }

  if (window.lucide) window.lucide.createIcons();

  toast.classList.remove("translate-y-24", "opacity-0");
  toast.classList.add("translate-y-0", "opacity-100");

  setTimeout(() => {
    toast.classList.remove("translate-y-0", "opacity-100");
    toast.classList.add("translate-y-24", "opacity-0");
  }, 3500);
}

// Setup Event Listeners
function setupEventListeners() {
  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      searchQuery = e.target.value;
      renderProducts();
    });
  }

  const sortSelect = document.getElementById("sortSelect");
  if (sortSelect) {
    sortSelect.addEventListener("change", (e) => {
      currentSort = e.target.value;
      renderProducts();
    });
  }
}
