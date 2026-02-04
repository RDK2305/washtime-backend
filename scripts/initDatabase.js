const mysql = require('mysql2/promise');
require('dotenv').config();

const initDatabase = async () => {
  let connection;
  
  try {
    // Connect without database first
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT || 3306
    });

    console.log('🔄 Creating database...');
    
    // Create database
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'washtime_db'}`);
    await connection.query(`USE ${process.env.DB_NAME || 'washtime_db'}`);
    
    console.log('✅ Database created successfully');
    console.log('🔄 Creating tables...');

    // Create Users table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS Users (
        user_id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('Resident', 'Admin') DEFAULT 'Resident',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Users table created');

    // Create LaundryMachines table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS LaundryMachines (
        machine_id INT PRIMARY KEY AUTO_INCREMENT,
        machine_type ENUM('Washer', 'Dryer') NOT NULL,
        machine_number VARCHAR(10) NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ LaundryMachines table created');

    // Create Bookings table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS Bookings (
        booking_id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        machine_id INT NOT NULL,
        booking_date DATE NOT NULL,
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        status ENUM('Booked', 'Cancelled') DEFAULT 'Booked',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
        FOREIGN KEY (machine_id) REFERENCES LaundryMachines(machine_id) ON DELETE CASCADE,
        UNIQUE KEY unique_booking (machine_id, booking_date, start_time)
      )
    `);
    console.log('✅ Bookings table created');

    // Insert sample laundry machines
    console.log('🔄 Inserting sample machines...');
    await connection.query(`
      INSERT INTO LaundryMachines (machine_type, machine_number, is_active) VALUES
      ('Washer', 'W1', TRUE),
      ('Washer', 'W2', TRUE),
      ('Dryer', 'D1', TRUE),
      ('Dryer', 'D2', TRUE)
      ON DUPLICATE KEY UPDATE machine_id=machine_id
    `);
    console.log('✅ Sample machines inserted');

    console.log('🎉 Database initialization completed successfully!');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

// Run initialization
initDatabase();
