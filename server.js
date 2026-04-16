require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const path    = require('path');
const fs      = require('fs');
const bcrypt  = require('bcryptjs');
const { pool, testConnection } = require('./config/database');

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

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth',     authRoutes);
app.use('/api/machines', machineRoutes);
app.use('/api/bookings', bookingRoutes);

app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'WashTime API - Laundry Booking System',
    version: '1.0.0',
  });
});

// ── Serve React build in production ──────────────────────────────────────────
const clientDist = path.join(__dirname, 'client', 'dist');

if (process.env.NODE_ENV === 'production' && fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

// ── 404 ───────────────────────────────────────────────────────────────────────
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

// ── Auto-initialize database tables on first run ──────────────────────────────
async function initDbIfNeeded() {
  try {
    const client = await pool.connect();

    // Check if Users table already exists
    const check = await client.query(
      `SELECT to_regclass('public."Users"') AS tbl`
    );

    if (check.rows[0].tbl) {
      console.log('Database tables already exist — skipping init.');
      client.release();
      return;
    }

    console.log('First run — creating database tables...');

    await client.query(`
      CREATE TABLE IF NOT EXISTS Users (
        user_id   SERIAL PRIMARY KEY,
        name      VARCHAR(100) NOT NULL,
        email     VARCHAR(100) UNIQUE NOT NULL,
        password  VARCHAR(255) NOT NULL,
        role      VARCHAR(20) DEFAULT 'Resident' CHECK (role IN ('Resident','Admin')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS LaundryMachines (
        machine_id     SERIAL PRIMARY KEY,
        machine_type   VARCHAR(20) NOT NULL CHECK (machine_type IN ('Washer','Dryer')),
        machine_number VARCHAR(10) NOT NULL,
        is_active      BOOLEAN DEFAULT TRUE,
        created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS Bookings (
        booking_id   SERIAL PRIMARY KEY,
        user_id      INTEGER NOT NULL REFERENCES Users(user_id) ON DELETE CASCADE,
        machine_id   INTEGER NOT NULL REFERENCES LaundryMachines(machine_id) ON DELETE CASCADE,
        booking_date DATE NOT NULL,
        start_time   TIME NOT NULL,
        end_time     TIME NOT NULL,
        status       VARCHAR(20) DEFAULT 'Booked' CHECK (status IN ('Booked','Cancelled')),
        created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(machine_id, booking_date, start_time)
      )
    `);

    await client.query(`CREATE INDEX IF NOT EXISTS idx_users_email     ON Users(email)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_bookings_user   ON Bookings(user_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_bookings_machine ON Bookings(machine_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_bookings_date   ON Bookings(booking_date)`);

    // Seed 4 machines
    await client.query(`
      INSERT INTO LaundryMachines (machine_type, machine_number, is_active) VALUES
        ('Washer','W1',TRUE), ('Washer','W2',TRUE),
        ('Dryer','D1',TRUE),  ('Dryer','D2',TRUE)
    `);

    // Seed admin user  (password: admin123)
    const hashed = await bcrypt.hash('admin123', 10);
    await client.query(
      `INSERT INTO Users (name, email, password, role)
       VALUES ('Admin','admin@washtime.com',$1,'Admin')
       ON CONFLICT (email) DO NOTHING`,
      [hashed]
    );

    console.log('Database initialized — tables, machines, and admin user created.');
    client.release();
  } catch (err) {
    console.error('DB init error:', err.message);
  }
}

// ── Start server ──────────────────────────────────────────────────────────────
async function startServer() {
  // Bind the port first so Render detects the service as live
  app.listen(PORT, () => {
    console.log(`\nWashTime API running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}\n`);
  });

  const dbConnected = await testConnection();
  if (dbConnected) {
    await initDbIfNeeded();
  } else {
    console.error('Database connection failed — check DATABASE_URL environment variable.');
  }
}

startServer();

module.exports = app;
