const { Pool } = require('pg');
require('dotenv').config();

const initDatabase = async () => {
  // Support both DATABASE_URL and individual parameters
  let poolConfig;

  if (process.env.DATABASE_URL) {
    poolConfig = {
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      }
    };
  } else {
    poolConfig = {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 5432,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: {
        rejectUnauthorized: false
      }
    };
  }

  const pool = new Pool(poolConfig);

  try {
    console.log('🔄 Connecting to PostgreSQL database...');
    if (process.env.DATABASE_URL) {
      console.log('📍 Using DATABASE_URL');
    } else {
      console.log(`📍 Host: ${process.env.DB_HOST}`);
      console.log(`📍 Database: ${process.env.DB_NAME}`);
    }
    console.log('🔒 SSL: Enabled');
    
    const client = await pool.connect();
    console.log('✅ Connected successfully');

    console.log('🔄 Dropping existing tables (if any)...');
    await client.query('DROP TABLE IF EXISTS Bookings CASCADE');
    await client.query('DROP TABLE IF EXISTS LaundryMachines CASCADE');
    await client.query('DROP TABLE IF EXISTS Users CASCADE');
    console.log('✅ Old tables dropped');

    console.log('🔄 Creating tables...');

    // Create Users table
    await client.query(`
      CREATE TABLE Users (
        user_id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'Resident' CHECK (role IN ('Resident', 'Admin')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Users table created');

    // Create LaundryMachines table
    await client.query(`
      CREATE TABLE LaundryMachines (
        machine_id SERIAL PRIMARY KEY,
        machine_type VARCHAR(20) NOT NULL CHECK (machine_type IN ('Washer', 'Dryer')),
        machine_number VARCHAR(10) NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ LaundryMachines table created');

    // Create Bookings table
    await client.query(`
      CREATE TABLE Bookings (
        booking_id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES Users(user_id) ON DELETE CASCADE,
        machine_id INTEGER NOT NULL REFERENCES LaundryMachines(machine_id) ON DELETE CASCADE,
        booking_date DATE NOT NULL,
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        status VARCHAR(20) DEFAULT 'Booked' CHECK (status IN ('Booked', 'Cancelled')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(machine_id, booking_date, start_time)
      )
    `);
    console.log('✅ Bookings table created');

    // Create indexes for better performance
    console.log('🔄 Creating indexes...');
    await client.query('CREATE INDEX IF NOT EXISTS idx_users_email ON Users(email)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_bookings_user ON Bookings(user_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_bookings_machine ON Bookings(machine_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_bookings_date ON Bookings(booking_date)');
    console.log('✅ Indexes created');

    // Insert sample laundry machines
    console.log('🔄 Inserting sample machines...');
    await client.query(`
      INSERT INTO LaundryMachines (machine_type, machine_number, is_active) VALUES
      ('Washer', 'W1', TRUE),
      ('Washer', 'W2', TRUE),
      ('Dryer', 'D1', TRUE),
      ('Dryer', 'D2', TRUE)
    `);
    console.log('✅ Sample machines inserted');

    // Create admin user (password: admin123)
    console.log('🔄 Creating admin user...');
    const bcrypt = require('bcryptjs');
    const adminPassword = await bcrypt.hash('admin123', 10);
    
    await client.query(`
      INSERT INTO Users (name, email, password, role) VALUES
      ('Admin', 'admin@washtime.com', $1, 'Admin')
      ON CONFLICT (email) DO NOTHING
    `, [adminPassword]);
    console.log('✅ Admin user created (email: admin@washtime.com, password: admin123)');

    console.log('\n🎉 Database initialization completed successfully!\n');
    console.log('📊 Summary:');
    console.log('   ✅ 3 tables created (Users, LaundryMachines, Bookings)');
    console.log('   ✅ 4 indexes created');
    console.log('   ✅ 4 sample machines inserted');
    console.log('   ✅ 1 admin user created\n');
    
    client.release();
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

// Run initialization
initDatabase();
