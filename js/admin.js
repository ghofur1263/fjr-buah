/**
 * FJR Buah - Admin Dashboard & Backend Integration Logic
 */

let adminProducts = [];
let adminOrders = [];
let adminConfig = {};
let editingProductId = null;
let authToken = localStorage.getItem("fjr_admin_token") || "";

document.addEventListener("DOMContentLoaded", async () => {
  if (!authToken) {
    showLoginModal();
  } else {
    hideLoginModal();
    await verifyTokenAndLoad();
  }

  setupAdminListeners();

  if (window.lucide) {
    window.lucide.createIcons();
  }
});

// Auth Guard & Login
function showLoginModal() {
  const modal = document.getElementById("loginModal");
  if (modal) modal.classList.add("active");
  document.body.classList.add("overflow-hidden");
}

function hideLoginModal() {
  const modal = document.getElementById("loginModal");
  if (modal) modal.classList.remove("active");
  document.body.classList.remove("overflow-hidden");
}

async function handleLoginSubmit(e) {
  e.preventDefault();
  const username = document.getElementById("loginUsername").value.trim();
  const password = document.getElementById("loginPassword").value.trim();

  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();
    if (res.ok && data.success) {
      authToken = data.token;
      localStorage.setItem("fjr_admin_token", authToken);
      hideLoginModal();
      showAdminToast("Login berhasil! Selamat datang di Admin FJR Buah.");
      await verifyTokenAndLoad();
    } else {
      showAdminToast(data.message || "Username atau password salah!", true);
    }
  } catch (err) {
    // If running offline / static file directly
    if (username === "admin" && password === "fjrproject2026") {
      authToken = "offline-mock-token";
      localStorage.setItem("fjr_admin_token", authToken);
      hideLoginModal();
      showAdminToast("Login offline FJR Buah berhasil!");
      await loadDataOffline();
    } else {
      showAdminToast("Gagal terhubung ke server backend.", true);
    }
  }
}

function handleLogout() {
  localStorage.removeItem("fjr_admin_token");
  authToken = "";
  showLoginModal();
  showAdminToast("Anda telah keluar dari sesi admin.");
}

async function verifyTokenAndLoad() {
  try {
    const res = await fetch("/api/auth/me", {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    if (!res.ok) {
      handleLogout();
      return;
    }

    await Promise.all([
      loadAdminProducts(),
      loadAdminOrders(),
      loadAdminConfig()
    ]);
  } catch (err) {
    await loadDataOffline();
  }
}

async function loadDataOffline() {
  adminProducts = getStoredProducts();
  adminConfig = getStoredConfig();
  loadConfigIntoForm();
  updateOverviewCards();
  renderAdminTable();
}

// Tab Switcher
function switchTab(tab) {
  const tabs = ["products", "orders", "settings"];
  tabs.forEach(t => {
    const content = document.getElementById(`tabContent${capitalize(t)}`);
    const btn = document.getElementById(`tabBtn${capitalize(t)}`);
    if (content && btn) {
      if (t === tab) {
        content.classList.remove("hidden");
        btn.classList.add("bg-emerald-500", "text-slate-950", "shadow-md");
        btn.classList.remove("bg-slate-900", "text-slate-300", "border");
      } else {
        content.classList.add("hidden");
        btn.classList.remove("bg-emerald-500", "text-slate-950", "shadow-md");
        btn.classList.add("bg-slate-900", "text-slate-300", "border");
      }
    }
  });

  if (tab === "orders") {
    loadAdminOrders();
  }
  if (window.lucide) window.lucide.createIcons();
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// Fetch Products from API
async function loadAdminProducts() {
  try {
    const res = await fetch("/api/products");
    if (res.ok) {
      const data = await res.json();
      adminProducts = data.data || [];
    } else {
      adminProducts = getStoredProducts();
    }
  } catch (e) {
    adminProducts = getStoredProducts();
  }
  updateOverviewCards();
  renderAdminTable();
}

// Fetch Orders from API
async function loadAdminOrders() {
  try {
    const res = await fetch("/api/orders", {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    if (res.ok) {
      const data = await res.json();
      adminOrders = data.data || [];
    } else {
      adminOrders = [];
    }
  } catch (e) {
    adminOrders = [];
  }
  renderOrdersTable();
  updateOverviewCards();
}

// Fetch Config from API
async function loadAdminConfig() {
  try {
    const res = await fetch("/api/config");
    if (res.ok) {
      const data = await res.json();
      adminConfig = {
        storeName: data.data.store_name,
        storeTagline: data.data.store_tagline,
        whatsappNumber: data.data.whatsapp_number
      };
    } else {
      adminConfig = getStoredConfig();
    }
  } catch (e) {
    adminConfig = getStoredConfig();
  }
  loadConfigIntoForm();
  updateOverviewCards();
}

function loadConfigIntoForm() {
  const nameInput = document.getElementById("cfgStoreName");
  const tagInput = document.getElementById("cfgStoreTagline");
  const waInput = document.getElementById("cfgStoreWa");

  if (nameInput) nameInput.value = adminConfig.storeName || "FJR BUAH";
  if (tagInput) tagInput.value = adminConfig.storeTagline || "Pusat Buah Segar & Parcel Premium";
  if (waInput) waInput.value = adminConfig.whatsappNumber || "6281234567890";
}

function updateOverviewCards() {
  const totalCountEl = document.getElementById("ovTotalProducts");
  const totalOrdersEl = document.getElementById("ovTotalOrders");
  const totalStockValueEl = document.getElementById("ovStockValue");
  const activeWaEl = document.getElementById("ovActiveWa");
  const badgeOrdersEl = document.getElementById("orderBadgeCount");

  if (totalCountEl) totalCountEl.textContent = adminProducts.length;
  if (totalOrdersEl) totalOrdersEl.textContent = adminOrders.length;
  if (badgeOrdersEl) badgeOrdersEl.textContent = adminOrders.length;

  if (totalStockValueEl) {
    const totalValue = adminProducts.reduce((sum, p) => sum + (p.price * (p.stock || 0)), 0);
    totalStockValueEl.textContent = formatRupiah(totalValue);
  }

  if (activeWaEl) {
    activeWaEl.textContent = "+" + (adminConfig.whatsappNumber || "6281234567890");
  }
}

// Render Products Table
function renderAdminTable(filterQuery = "") {
  const tbody = document.getElementById("productTableBody");
  if (!tbody) return;

  const filtered = adminProducts.filter(p => 
    p.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(filterQuery.toLowerCase())
  );

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="py-8 text-center text-xs text-slate-500">
          Tidak ada buah yang cocok dengan pencarian.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtered.map(p => {
    const img = Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : (typeof p.images === 'string' ? JSON.parse(p.images || '[]')[0] : '');

    return `
      <tr class="border-b border-emerald-950/60 hover:bg-slate-900/40 transition-colors">
        <td class="py-3 px-4">
          <img src="${img}" alt="${p.name}" class="w-12 h-12 rounded-lg object-cover bg-slate-950 border border-emerald-950" />
        </td>
        <td class="py-3 px-4">
          <div class="font-bold text-sm text-white">${p.name}</div>
          <div class="text-[11px] text-slate-400 mt-0.5">ID: ${p.id}</div>
        </td>
        <td class="py-3 px-4">
          <span class="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800/40 uppercase">
            ${p.category}
          </span>
        </td>
        <td class="py-3 px-4 font-bold text-sm text-white">
          ${formatRupiah(p.price)}
        </td>
        <td class="py-3 px-4">
          <span class="px-2 py-0.5 rounded text-xs font-semibold ${p.stock > 10 ? 'text-emerald-400 bg-emerald-950/60' : 'text-amber-400 bg-amber-950/60'}">
            ${p.stock} kg / pack
          </span>
        </td>
        <td class="py-3 px-4 text-right">
          <div class="flex items-center justify-end gap-1.5">
            <button onclick="editProduct('${p.id}')" class="p-2 rounded-lg bg-slate-800 hover:bg-emerald-500 text-slate-300 hover:text-slate-950 transition-colors" title="Edit">
              <i data-lucide="edit-3" class="w-4 h-4"></i>
            </button>
            <button onclick="deleteProduct('${p.id}')" class="p-2 rounded-lg bg-slate-800 hover:bg-rose-500 text-slate-300 hover:text-white transition-colors" title="Hapus">
              <i data-lucide="trash-2" class="w-4 h-4"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join("");

  if (window.lucide) window.lucide.createIcons();
}

// Render Orders Table
function renderOrdersTable() {
  const tbody = document.getElementById("ordersTableBody");
  if (!tbody) return;

  if (adminOrders.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="py-12 text-center text-xs text-slate-500">
          Belum ada pesanan buah masuk di database server.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = adminOrders.map(order => {
    const items = Array.isArray(order.items) ? order.items : [];
    const itemsSummary = items.map(it => `${it.name} (${it.quantity}x)`).join(", ");

    const statusBadgeClass = {
      pending: "bg-amber-950/70 text-amber-400 border border-amber-800",
      processing: "bg-blue-950/70 text-blue-400 border border-blue-800",
      shipped: "bg-purple-950/70 text-purple-400 border border-purple-800",
      completed: "bg-emerald-950/70 text-emerald-400 border border-emerald-800",
      cancelled: "bg-rose-950/70 text-rose-400 border border-rose-800"
    }[order.status] || "bg-slate-800 text-slate-300";

    return `
      <tr class="border-b border-emerald-950/60 hover:bg-slate-900/40 transition-colors">
        <td class="py-3 px-4 font-mono font-bold text-emerald-400 text-xs">
          #${order.id}
          <div class="text-[10px] text-slate-500 font-sans mt-0.5">${new Date(order.created_at).toLocaleString('id-ID')}</div>
        </td>
        <td class="py-3 px-4">
          <div class="font-bold text-white">${order.customer_name}</div>
          <a href="https://wa.me/${order.customer_phone.replace(/[^0-9]/g, '')}" target="_blank" class="text-[11px] text-emerald-400 hover:underline flex items-center gap-1 mt-0.5">
            <i data-lucide="message-circle" class="w-3 h-3"></i>
            ${order.customer_phone}
          </a>
        </td>
        <td class="py-3 px-4 max-w-xs">
          <div class="font-semibold text-slate-300 text-xs">${order.courier}</div>
          <div class="text-[11px] text-slate-400 truncate mt-0.5" title="${order.shipping_address}">${order.shipping_address}</div>
        </td>
        <td class="py-3 px-4 max-w-xs">
          <div class="text-xs text-slate-300 truncate" title="${itemsSummary}">${itemsSummary}</div>
          <div class="text-[10px] text-slate-500 mt-0.5">${order.payment_method}</div>
        </td>
        <td class="py-3 px-4 font-bold text-white text-xs">
          ${formatRupiah(order.total_amount)}
        </td>
        <td class="py-3 px-4">
          <select onchange="updateOrderStatus('${order.id}', this.value)" class="text-xs px-2.5 py-1.5 rounded-lg bg-slate-950 border border-emerald-900 ${statusBadgeClass} font-semibold focus:outline-none">
            <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Menunggu (Pending)</option>
            <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>Sedang Disiapkan</option>
            <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>Dalam Pengiriman</option>
            <option value="completed" ${order.status === 'completed' ? 'selected' : ''}>Selesai Diterima</option>
            <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Dibatalkan</option>
          </select>
        </td>
      </tr>
    `;
  }).join("");

  if (window.lucide) window.lucide.createIcons();
}

async function updateOrderStatus(orderId, newStatus) {
  try {
    const res = await fetch(`/api/orders/${orderId}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify({ status: newStatus })
    });

    const data = await res.json();
    if (res.ok && data.success) {
      showAdminToast(`Status pesanan #${orderId} diubah ke "${newStatus}".`);
      await loadAdminOrders();
    } else {
      showAdminToast(data.message || "Gagal mengubah status.", true);
    }
  } catch (err) {
    showAdminToast("Gagal terhubung ke server.", true);
  }
}

// Upload Product Image via Multer API
async function handleImageUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append("image", file);

  try {
    showAdminToast("Mengunggah foto buah ke server...");
    const res = await fetch("/api/upload", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authToken}`
      },
      body: formData
    });

    const data = await res.json();
    if (res.ok && data.success) {
      const imgInput = document.getElementById("pImages");
      if (imgInput) {
        imgInput.value = data.url;
      }
      showAdminToast("Foto buah berhasil diunggah ke server!");
    } else {
      showAdminToast(data.message || "Gagal mengunggah foto.", true);
    }
  } catch (err) {
    showAdminToast("Gagal mengunggah foto ke server.", true);
  }
}

// Product Create / Edit Submission
async function handleProductFormSubmit(e) {
  e.preventDefault();

  const name = document.getElementById("pName").value.trim();
  const category = document.getElementById("pCategory").value;
  const price = parseInt(document.getElementById("pPrice").value) || 0;
  const originalPrice = parseInt(document.getElementById("pOriginalPrice").value) || 0;
  const stock = parseInt(document.getElementById("pStock").value) || 0;
  const badge = document.getElementById("pBadge").value.trim();
  const imagesRaw = document.getElementById("pImages").value.trim();
  const sizesRaw = document.getElementById("pSizes").value.trim();
  const colorsRaw = document.getElementById("pColors").value.trim();
  const description = document.getElementById("pDesc").value.trim();

  const payload = {
    name,
    category,
    price,
    originalPrice: originalPrice > price ? originalPrice : null,
    stock,
    badge,
    images: imagesRaw,
    sizes: sizesRaw,
    colors: colorsRaw,
    description
  };

  try {
    let res;
    if (editingProductId) {
      res = await fetch(`/api/products/${editingProductId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify(payload)
      });
    } else {
      res = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify(payload)
      });
    }

    const data = await res.json();
    if (res.ok && data.success) {
      showAdminToast(editingProductId ? "Data buah berhasil diperbarui di database!" : "Buah baru berhasil ditambahkan!");
      resetProductForm();
      await loadAdminProducts();
    } else {
      showAdminToast(data.message || "Gagal menyimpan buah.", true);
    }
  } catch (err) {
    showAdminToast("Gagal terhubung ke database server.", true);
  }
}

function editProduct(id) {
  const prod = adminProducts.find(p => p.id === id);
  if (!prod) return;

  editingProductId = id;
  document.getElementById("formTitle").textContent = "Edit Data Buah";
  document.getElementById("submitBtnText").textContent = "Simpan Perubahan";
  document.getElementById("cancelEditBtn").classList.remove("hidden");

  const images = Array.isArray(prod.images) ? prod.images : JSON.parse(prod.images || '[]');
  const sizes = Array.isArray(prod.sizes) ? prod.sizes : JSON.parse(prod.sizes || '[]');
  const colors = Array.isArray(prod.colors) ? prod.colors : JSON.parse(prod.colors || '[]');

  document.getElementById("pName").value = prod.name;
  document.getElementById("pCategory").value = prod.category;
  document.getElementById("pPrice").value = prod.price;
  document.getElementById("pOriginalPrice").value = prod.original_price || prod.originalPrice || "";
  document.getElementById("pStock").value = prod.stock;
  document.getElementById("pBadge").value = prod.badge || "";
  document.getElementById("pImages").value = images.join(", ");
  document.getElementById("pSizes").value = sizes.join(", ");
  document.getElementById("pColors").value = colors.join(", ");
  document.getElementById("pDesc").value = prod.description;

  document.getElementById("productFormCard").scrollIntoView({ behavior: "smooth" });
}

function cancelEdit() {
  resetProductForm();
}

function resetProductForm() {
  editingProductId = null;
  document.getElementById("formTitle").textContent = "Tambah Buah Baru";
  document.getElementById("submitBtnText").textContent = "+ Tambah Buah ke Katalog";
  document.getElementById("cancelEditBtn").classList.add("hidden");
  document.getElementById("productForm").reset();
}

async function deleteProduct(id) {
  if (!confirm("Apakah Anda yakin ingin menghapus buah ini dari database?")) return;

  try {
    const res = await fetch(`/api/products/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${authToken}` }
    });

    const data = await res.json();
    if (res.ok && data.success) {
      showAdminToast("Buah berhasil dihapus dari database.");
      await loadAdminProducts();
    } else {
      showAdminToast(data.message || "Gagal menghapus produk.", true);
    }
  } catch (err) {
    showAdminToast("Gagal terhubung ke server.", true);
  }
}

// Config Form Submit
async function handleConfigFormSubmit(e) {
  e.preventDefault();

  const store_name = document.getElementById("cfgStoreName").value.trim();
  const store_tagline = document.getElementById("cfgStoreTagline").value.trim();
  const whatsapp_number = document.getElementById("cfgStoreWa").value.trim();

  try {
    const res = await fetch("/api/config", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify({ store_name, store_tagline, whatsapp_number })
    });

    const data = await res.json();
    if (res.ok && data.success) {
      showAdminToast("Pengaturan FJR Buah berhasil disimpan!");
      await loadAdminConfig();
    } else {
      showAdminToast(data.message || "Gagal menyimpan pengaturan.", true);
    }
  } catch (err) {
    showAdminToast("Gagal terhubung ke database.", true);
  }
}

// Change Password
async function handleChangePassword(e) {
  e.preventDefault();

  const currentPassword = document.getElementById("curPassword").value;
  const newPassword = document.getElementById("newPassword").value;

  try {
    const res = await fetch("/api/auth/change-password", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify({ currentPassword, newPassword })
    });

    const data = await res.json();
    if (res.ok && data.success) {
      showAdminToast("Password admin berhasil diperbarui!");
      document.getElementById("curPassword").value = "";
      document.getElementById("newPassword").value = "";
    } else {
      showAdminToast(data.message || "Gagal mengganti password.", true);
    }
  } catch (err) {
    showAdminToast("Gagal terhubung ke server.", true);
  }
}

function setupAdminListeners() {
  const tableSearch = document.getElementById("adminTableSearch");
  if (tableSearch) {
    tableSearch.addEventListener("input", (e) => {
      renderAdminTable(e.target.value);
    });
  }
}

// Toast
function showAdminToast(msg, isError = false) {
  const toast = document.getElementById("adminToast");
  if (!toast) return;

  toast.textContent = msg;
  toast.classList.remove("text-emerald-300", "border-emerald-500", "text-rose-300", "border-rose-500");

  if (isError) {
    toast.classList.add("text-rose-300", "border-rose-500", "bg-rose-950/90");
  } else {
    toast.classList.add("text-emerald-300", "border-emerald-500", "bg-slate-900/95");
  }

  toast.classList.remove("opacity-0", "translate-y-12");
  toast.classList.add("opacity-100", "translate-y-0");

  setTimeout(() => {
    toast.classList.remove("opacity-100", "translate-y-0");
    toast.classList.add("opacity-0", "translate-y-12");
  }, 3500);
}
