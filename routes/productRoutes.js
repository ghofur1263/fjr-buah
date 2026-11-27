/**
 * FJR Project - Products REST API Routes
 */
const express = require('express');
const router = express.Router();
const { dbAll, dbGet, dbRun } = require('../config/db');
const authMiddleware = require('../middleware/authMiddleware');

// Helper to format product data from SQLite (parse JSON columns)
const formatProduct = (p) => {
  if (!p) return null;
  return {
    ...p,
    images: typeof p.images === 'string' ? JSON.parse(p.images || '[]') : p.images,
    sizes: typeof p.sizes === 'string' ? JSON.parse(p.sizes || '[]') : p.sizes,
    colors: typeof p.colors === 'string' ? JSON.parse(p.colors || '[]') : p.colors
  };
};

// GET /api/products (Public with Category, Search, & Sort filters)
router.get('/', async (req, res) => {
  try {
    const { category, search, sort } = req.query;

    let query = 'SELECT * FROM products WHERE 1=1';
    const params = [];

    if (category && category !== 'all') {
      query += ' AND category = ?';
      params.push(category);
    }

    if (search) {
      query += ' AND (name LIKE ? OR description LIKE ? OR category LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    if (sort === 'price-low') {
      query += ' ORDER BY price ASC';
    } else if (sort === 'price-high') {
      query += ' ORDER BY price DESC';
    } else if (sort === 'sold') {
      query += ' ORDER BY sold_count DESC';
    } else if (sort === 'rating') {
      query += ' ORDER BY rating DESC';
    } else {
      query += ' ORDER BY created_at DESC';
    }

    const rows = await dbAll(query, params);
    const formatted = rows.map(formatProduct);

    res.json({
      success: true,
      count: formatted.length,
      data: formatted
    });
  } catch (err) {
    console.error('Error get products:', err);
    res.status(500).json({ success: false, message: 'Gagal mengambil daftar produk.' });
  }
});

// GET /api/products/categories (Public list of categories)
router.get('/meta/categories', async (req, res) => {
  try {
    const categories = await dbAll('SELECT * FROM categories');
    res.json({ success: true, data: categories });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal mengambil kategori.' });
  }
});

// GET /api/products/:id (Public single product detail)
router.get('/:id', async (req, res) => {
  try {
    const product = await dbGet('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Produk tidak ditemukan.' });
    }
    res.json({ success: true, data: formatProduct(product) });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal mengambil detail produk.' });
  }
});

// POST /api/products (Admin only - Add new product)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const {
      name,
      category,
      price,
      originalPrice,
      stock,
      badge,
      images,
      sizes,
      colors,
      description
    } = req.body;

    if (!name || !category || !price) {
      return res.status(400).json({
        success: false,
        message: 'Nama, kategori, dan harga produk wajib diisi.'
      });
    }

    const id = 'fjr-' + Date.now().toString().slice(-6);
    const imagesArr = Array.isArray(images) ? images : (images ? images.split(',').map(s => s.trim()) : []);
    const sizesArr = Array.isArray(sizes) ? sizes : (sizes ? sizes.split(',').map(s => s.trim()) : ['All Size']);
    const colorsArr = Array.isArray(colors) ? colors : (colors ? colors.split(',').map(s => s.trim()) : ['Black']);

    await dbRun(`
      INSERT INTO products (
        id, name, category, price, original_price, stock, badge, rating, sold_count, images, sizes, colors, description
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id,
      name.trim(),
      category,
      parseFloat(price),
      originalPrice ? parseFloat(originalPrice) : null,
      parseInt(stock) || 0,
      badge || null,
      5.0,
      0,
      JSON.stringify(imagesArr),
      JSON.stringify(sizesArr),
      JSON.stringify(colorsArr),
      description || ''
    ]);

    const created = await dbGet('SELECT * FROM products WHERE id = ?', [id]);
    res.status(201).json({
      success: true,
      message: 'Produk berhasil ditambahkan ke database.',
      data: formatProduct(created)
    });
  } catch (err) {
    console.error('Error create product:', err);
    res.status(500).json({ success: false, message: 'Gagal menambahkan produk baru.' });
  }
});

// PUT /api/products/:id (Admin only - Update existing product)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await dbGet('SELECT * FROM products WHERE id = ?', [id]);

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Produk tidak ditemukan.' });
    }

    const {
      name,
      category,
      price,
      originalPrice,
      stock,
      badge,
      images,
      sizes,
      colors,
      description
    } = req.body;

    const imagesArr = Array.isArray(images) ? images : (images ? images.split(',').map(s => s.trim()) : JSON.parse(existing.images || '[]'));
    const sizesArr = Array.isArray(sizes) ? sizes : (sizes ? sizes.split(',').map(s => s.trim()) : JSON.parse(existing.sizes || '[]'));
    const colorsArr = Array.isArray(colors) ? colors : (colors ? colors.split(',').map(s => s.trim()) : JSON.parse(existing.colors || '[]'));

    await dbRun(`
      UPDATE products SET
        name = ?,
        category = ?,
        price = ?,
        original_price = ?,
        stock = ?,
        badge = ?,
        images = ?,
        sizes = ?,
        colors = ?,
        description = ?
      WHERE id = ?
    `, [
      name ? name.trim() : existing.name,
      category || existing.category,
      price ? parseFloat(price) : existing.price,
      originalPrice !== undefined ? (originalPrice ? parseFloat(originalPrice) : null) : existing.original_price,
      stock !== undefined ? parseInt(stock) : existing.stock,
      badge !== undefined ? badge : existing.badge,
      JSON.stringify(imagesArr),
      JSON.stringify(sizesArr),
      JSON.stringify(colorsArr),
      description !== undefined ? description : existing.description,
      id
    ]);

    const updated = await dbGet('SELECT * FROM products WHERE id = ?', [id]);
    res.json({
      success: true,
      message: 'Produk berhasil diperbarui.',
      data: formatProduct(updated)
    });
  } catch (err) {
    console.error('Error update product:', err);
    res.status(500).json({ success: false, message: 'Gagal memperbarui produk.' });
  }
});

// DELETE /api/products/:id (Admin only - Delete product)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await dbGet('SELECT * FROM products WHERE id = ?', [id]);

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Produk tidak ditemukan.' });
    }

    await dbRun('DELETE FROM products WHERE id = ?', [id]);
    res.json({
      success: true,
      message: `Produk "${existing.name}" berhasil dihapus dari database.`
    });
  } catch (err) {
    console.error('Error delete product:', err);
    res.status(500).json({ success: false, message: 'Gagal menghapus produk.' });
  }
});

module.exports = router;
