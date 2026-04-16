require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const path    = require('path');
const { testConnection } = require('./config/database');

// Route files
const authRoutes    = require('./routes/auth');
const machineRoutes = require('./routes/machines');
const bookingRoutes = require('./routes/bookings');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic request logger
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth',     authRoutes);
app.use('/api/machines', machineRoutes);
app.use('/api/bookings', bookingRoutes);

// Health-check / docs endpoint (useful for Render uptime checks)
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'WashTime API - Laundry Booking System',
    version: '1.0.0',
    endpoints: {
      auth:     { register: 'POST /api/auth/register', login: 'POST /api/auth/login' },
      machines: { getAll: 'GET /api/machines', create: 'POST /api/machines (Admin)' },
      bookings: { getUserBookings: 'GET /api/bookings', create: 'POST /api/bookings' },
    },
  });
});

// ── Serve React build in production ──────────────────────────────────────────
if (process.env.NODE_ENV === 'production') {
  const clientDist = path.join(__dirname, 'client', 'dist');
  app.use(express.static(clientDist));

  // All non-API routes hand off to React Router
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

// ── 404 (dev only — in prod the wildcard above catches unknown routes) ────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// ── Start server ──────────────────────────────────────────────────────────────
async function startServer() {
  // Start listening first so Render can detect the open port
  app.listen(PORT, () => {
    console.log(`\nWashTime API running on port ${PORT}`);
    console.log(`Local: http://localhost:${PORT}`);
    console.log(`Database: PostgreSQL (Render)\n`);
  });

  // Test DB connection after the port is open
  const dbConnected = await testConnection();
  if (!dbConnected) {
    console.error('Database connection failed — check environment variables.');
  }
}

startServer();

module.exports = app;
