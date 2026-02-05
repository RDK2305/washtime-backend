const { Pool } = require('pg');
require('dotenv').config();

// Create PostgreSQL connection pool with SSL enabled
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    rejectUnauthorized: false  // Required for Render PostgreSQL
  },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// Test database connection
const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ Database connected successfully');
    const result = await client.query('SELECT NOW() as current_time');
    console.log('✅ Connection verified at:', result.rows[0].current_time);
    client.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('\nPlease check your .env file:');
    console.error('  DB_HOST:', process.env.DB_HOST ? '✓' : '✗ MISSING');
    console.error('  DB_PORT:', process.env.DB_PORT ? '✓' : '✗ MISSING');
    console.error('  DB_USER:', process.env.DB_USER ? '✓' : '✗ MISSING');
    console.error('  DB_PASSWORD:', process.env.DB_PASSWORD ? '✓' : '✗ MISSING');
    console.error('  DB_NAME:', process.env.DB_NAME ? '✓' : '✗ MISSING');
    return false;
  }
};

// Handle pool errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

module.exports = { pool, testConnection };
