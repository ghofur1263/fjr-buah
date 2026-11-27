/**
 * FJR Project - Auth Routes (Admin Login & Verification)
 */
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { dbGet, dbRun } = require('../config/db');
const authMiddleware = require('../middleware/authMiddleware');

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username dan password wajib diisi.'
      });
    }

    const admin = await dbGet('SELECT * FROM admins WHERE username = ?', [username.trim()]);
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Username atau password salah.'
      });
    }

    const isMatch = await bcrypt.compare(password, admin.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Username atau password salah.'
      });
    }

    const secret = process.env.JWT_SECRET || 'fjr_project_secret_key_2026_super_secure_token';
    const token = jwt.sign(
      { id: admin.id, username: admin.username },
      secret,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login berhasil.',
      token,
      admin: {
        id: admin.id,
        username: admin.username
      }
    });
  } catch (err) {
    console.error('Error saat login:', err);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server.' });
  }
});

// GET /api/auth/me (Check current login status)
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const admin = await dbGet('SELECT id, username, created_at FROM admins WHERE id = ?', [req.admin.id]);
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin tidak ditemukan.' });
    }
    res.json({ success: true, admin });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server.' });
  }
});

// PUT /api/auth/change-password
router.put('/change-password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password baru minimal harus 6 karakter.'
      });
    }

    const admin = await dbGet('SELECT * FROM admins WHERE id = ?', [req.admin.id]);
    const isMatch = await bcrypt.compare(currentPassword, admin.password_hash);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Password saat ini salah.'
      });
    }

    const newHashed = await bcrypt.hash(newPassword, 10);
    await dbRun('UPDATE admins SET password_hash = ? WHERE id = ?', [newHashed, req.admin.id]);

    res.json({
      success: true,
      message: 'Password berhasil diperbarui.'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal memperbarui password.' });
  }
});

module.exports = router;
