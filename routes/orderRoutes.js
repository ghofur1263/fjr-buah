/**
 * FJR Project - Orders REST API Routes
 */
const express = require('express');
const router = express.Router();
const { dbAll, dbGet, dbRun } = require('../config/db');
const authMiddleware = require('../middleware/authMiddleware');

const formatOrder = (o) => {
  if (!o) return null;
  return {
    ...o,
    items: typeof o.items === 'string' ? JSON.parse(o.items || '[]') : o.items
  };
};

// POST /api/orders (Public - Create new order)
router.post('/', async (req, res) => {
  try {
    const {
      customerName,
      customerPhone,
      courier,
      paymentMethod,
      shippingAddress,
      notes,
      items,
      subtotal,
      discount,
      totalAmount
    } = req.body;

    if (!customerName || !customerPhone || !shippingAddress || !items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Data pesanan tidak lengkap (Nama, nomor telepon, alamat, dan item keranjang wajib ada).'
      });
    }

    const orderId = 'ORD-' + Date.now().toString().slice(-6);

    await dbRun(`
      INSERT INTO orders (
        id, customer_name, customer_phone, courier, payment_method, shipping_address, notes, subtotal, discount, total_amount, status, items
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      orderId,
      customerName.trim(),
      customerPhone.trim(),
      courier || 'J&T Express',
      paymentMethod || 'Transfer Bank',
      shippingAddress.trim(),
      notes ? notes.trim() : '',
      parseFloat(subtotal) || 0,
      parseFloat(discount) || 0,
      parseFloat(totalAmount) || 0,
      'pending',
      JSON.stringify(items)
    ]);

    // Optional: Reduce stock for ordered items
    for (const item of items) {
      if (item.id && item.quantity) {
        await dbRun('UPDATE products SET stock = MAX(0, stock - ?), sold_count = sold_count + ? WHERE id = ?', [
          item.quantity,
          item.quantity,
          item.id
        ]);
      }
    }

    const created = await dbGet('SELECT * FROM orders WHERE id = ?', [orderId]);

    res.status(201).json({
      success: true,
      message: 'Pesanan berhasil dibuat dan tersimpan di database server.',
      order: formatOrder(created)
    });
  } catch (err) {
    console.error('Error create order:', err);
    res.status(500).json({ success: false, message: 'Gagal membuat pesanan.' });
  }
});

// GET /api/orders (Admin only - List all orders)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { status } = req.query;
    let sql = 'SELECT * FROM orders';
    const params = [];

    if (status) {
      sql += ' WHERE status = ?';
      params.push(status);
    }

    sql += ' ORDER BY created_at DESC';

    const rows = await dbAll(sql, params);
    res.json({
      success: true,
      count: rows.length,
      data: rows.map(formatOrder)
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal mengambil daftar pesanan.' });
  }
});

// GET /api/orders/:id (Public / Customer tracking)
router.get('/:id', async (req, res) => {
  try {
    const order = await dbGet('SELECT * FROM orders WHERE id = ?', [req.params.id]);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan.' });
    }
    res.json({ success: true, data: formatOrder(order) });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal mengambil detail pesanan.' });
  }
});

// PUT /api/orders/:id/status (Admin only - Update order status)
router.put('/:id/status', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'processing', 'shipped', 'completed', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status tidak valid. Pilihan: ${validStatuses.join(', ')}`
      });
    }

    const order = await dbGet('SELECT * FROM orders WHERE id = ?', [req.params.id]);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan.' });
    }

    await dbRun('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id]);
    const updated = await dbGet('SELECT * FROM orders WHERE id = ?', [req.params.id]);

    res.json({
      success: true,
      message: `Status pesanan #${req.params.id} berhasil diubah menjadi "${status}".`,
      order: formatOrder(updated)
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal memperbarui status pesanan.' });
  }
});

module.exports = router;
