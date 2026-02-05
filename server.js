require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { testConnection } = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth');
const machineRoutes = require('./routes/machines');
const bookingRoutes = require('./routes/bookings');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'WashTime API - Laundry Booking System',
    version: '1.0.0',
    database: 'PostgreSQL (Render)',
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login'
      },
      machines: {
        getAll: 'GET /api/machines',
        getOne: 'GET /api/machines/:id',
        create: 'POST /api/machines (Admin)',
        update: 'PUT /api/machines/:id (Admin)',
        delete: 'DELETE /api/machines/:id (Admin)'
      },
      bookings: {
        getUserBookings: 'GET /api/bookings',
        getAvailableSlots: 'GET /api/bookings/available?date=YYYY-MM-DD&machine_id=1',
        getOne: 'GET /api/bookings/:id',
        create: 'POST /api/bookings',
        update: 'PUT /api/bookings/:id',
        cancel: 'DELETE /api/bookings/:id'
      }
    }
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/machines', machineRoutes);
app.use('/api/bookings', bookingRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
const startServer = async () => {
  try {
    // Test database connection
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
      console.error('❌ Failed to connect to database. Please check your .env file.');
      console.log('💡 Make sure DATABASE_URL is set correctly in .env');
      console.log('💡 Run "npm run init-db" to initialize the database first.');
      process.exit(1);
    }

    app.listen(PORT, () => {
      console.log(`\n🚀 WashTime API Server running on port ${PORT}`);
      console.log(`📍 Local: http://localhost:${PORT}`);
      console.log(`🗄️  Database: PostgreSQL (Render)`);
      console.log(`📚 API Documentation: http://localhost:${PORT}/\n`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
