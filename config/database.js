const { Pool } = require('pg');
require('dotenv').config();

// Create PostgreSQL connection pool
// Support both DATABASE_URL and individual parameters
let poolConfig;

if (process.env.DATABASE_URL) {
  // Use connection string (for Render deployment)
  poolConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  };
} else {
  // Use individual parameters (for local development)
  poolConfig = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: {
      rejectUnauthorized: false
    },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  };
}

const pool = new Pool(poolConfig);

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
    if (!process.env.DATABASE_URL && !process.env.DB_HOST) {
      console.error('\n⚠️  No database configuration found!');
      console.error('Please set either:');
      console.error('  - DATABASE_URL environment variable, OR');
      console.error('  - DB_HOST, DB_USER, DB_PASSWORD, DB_NAME variables');
    }
    return false;
  }
};

// Handle pool errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

module.exports = { pool, testConnection };
