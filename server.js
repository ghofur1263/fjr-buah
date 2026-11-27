/**
 * FJR PROJECT - Express Backend Entry Point
 */
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDatabase } = require('./config/db');

// Route Handlers
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const configRoutes = require('./routes/configRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve Uploaded Files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve Frontend statically (index.html, admin.html, css, js)
app.use(express.static(__dirname));

// Register API Endpoints
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/config', configRoutes);
app.use('/api/upload', uploadRoutes);

// Root fallback to frontend index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Admin page route
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

// API 404 Handler
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint API tidak ditemukan.'
  });
});

// Start Server and Database
async function startServer() {
  try {
    await initDatabase();
    app.listen(PORT, () => {
      console.log('====================================================');
      console.log(`🚀 Server Backend FJR PROJECT Aktif!`);
      console.log(`🌐 Akses Web Toko : http://localhost:${PORT}`);
      console.log(`⚙️  Akses Admin    : http://localhost:${PORT}/admin`);
      console.log(`📡 REST API Base  : http://localhost:${PORT}/api`);
      console.log('====================================================');
    });
  } catch (err) {
    console.error('❌ Gagal memulai server:', err);
  }
}

startServer();
