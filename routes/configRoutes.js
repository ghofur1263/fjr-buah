/**
 * FJR Project - Store Settings API
 */
const express = require('express');
const router = express.Router();
const { dbAll, dbRun } = require('../config/db');
const authMiddleware = require('../middleware/authMiddleware');

// GET /api/config (Public)
router.get('/', async (req, res) => {
  try {
    const rows = await dbAll('SELECT * FROM store_settings');
    const settings = {};
    rows.forEach(r => settings[r.key] = r.value);
    res.json({ success: true, data: settings });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal mengambil konfigurasi toko.' });
  }
});

// PUT /api/config (Admin only)
router.put('/', authMiddleware, async (req, res) => {
  try {
    const { store_name, store_tagline, whatsapp_number } = req.body;

    if (store_name) {
      await dbRun('INSERT OR REPLACE INTO store_settings (key, value) VALUES (?, ?)', ['store_name', store_name.trim()]);
    }
    if (store_tagline) {
      await dbRun('INSERT OR REPLACE INTO store_settings (key, value) VALUES (?, ?)', ['store_tagline', store_tagline.trim()]);
    }
    if (whatsapp_number) {
      const cleanWa = whatsapp_number.replace(/[^0-9]/g, '');
      await dbRun('INSERT OR REPLACE INTO store_settings (key, value) VALUES (?, ?)', ['whatsapp_number', cleanWa]);
    }

    const rows = await dbAll('SELECT * FROM store_settings');
    const settings = {};
    rows.forEach(r => settings[r.key] = r.value);

    res.json({
      success: true,
      message: 'Pengaturan toko berhasil diperbarui di database.',
      data: settings
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal menyimpan konfigurasi toko.' });
  }
});

module.exports = router;
