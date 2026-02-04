# WashTime - Deployment Guide

This guide will help you deploy your WashTime backend to Render (free hosting).

## 📋 Prerequisites

- GitHub account
- Render account (free) - [render.com](https://render.com)
- Your code pushed to GitHub

## 🚀 Step-by-Step Deployment

### Step 1: Prepare Your Code for Deployment

1. **Ensure your .gitignore is set up correctly:**
   - `.env` should be in .gitignore
   - `node_modules/` should be in .gitignore

2. **Create a start script in package.json** (already done):
   ```json
   "scripts": {
     "start": "node server.js"
   }
   ```

3. **Make sure your server.js uses environment PORT**:
   ```javascript
   const PORT = process.env.PORT || 3000;
   ```

### Step 2: Push to GitHub

1. **Initialize Git (if not already done):**
   ```bash
   cd WashTime
   git init
   ```

2. **Add all files:**
   ```bash
   git add .
   ```

3. **Commit:**
   ```bash
   git commit -m "Sprint 1 - Complete backend API"
   ```

4. **Create a new repository on GitHub:**
   - Go to github.com
   - Click "New repository"
   - Name it "washtime-backend" or "WashTime"
   - Don't initialize with README (we already have one)
   - Click "Create repository"

5. **Push your code:**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/washtime-backend.git
   git branch -M main
   git push -u origin main
   ```

### Step 3: Set Up Database on Render

1. **Go to Render Dashboard:** [dashboard.render.com](https://dashboard.render.com)

2. **Create PostgreSQL Database** (Free tier available):
   - Click "New +" → "PostgreSQL"
   - Name: `washtime-db`
   - Database: `washtime_db`
   - User: (auto-generated)
   - Region: Choose closest to you
   - Select "Free" plan
   - Click "Create Database"

3. **Wait for database to be created** (2-3 minutes)

4. **Get Database Credentials:**
   - Once created, you'll see connection details
   - Save these for later:
     - Hostname
     - Port
     - Database
     - Username
     - Password
     - Internal Database URL (we'll use this)

### Step 4: Modify Code for PostgreSQL (Optional - if using PostgreSQL)

**Note:** Render's free database is PostgreSQL, not MySQL. You have two options:

**Option A: Use MySQL on another service** (Railway, PlanetScale)
- Keep your code as is
- Use a MySQL database from another provider
- More complex but uses your existing code

**Option B: Convert to PostgreSQL** (Recommended for free deployment)
- Simpler deployment
- Free on Render
- Requires small code changes

#### If choosing Option B (PostgreSQL):

1. **Update package.json dependencies:**
   ```json
   "dependencies": {
     "express": "^4.18.2",
     "pg": "^8.11.3",
     "dotenv": "^16.3.1",
     "bcryptjs": "^2.4.3",
     "jsonwebtoken": "^9.0.2",
     "cors": "^2.8.5",
     "express-validator": "^7.0.1"
   }
   ```

2. **Update config/database.js:**
   ```javascript
   const { Pool } = require('pg');
   require('dotenv').config();

   const pool = new Pool({
     connectionString: process.env.DATABASE_URL,
     ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
   });

   const testConnection = async () => {
     try {
       const client = await pool.connect();
       console.log('✅ Database connected successfully');
       client.release();
       return true;
     } catch (error) {
       console.error('❌ Database connection failed:', error.message);
       return false;
     }
   };

   module.exports = { pool, testConnection };
   ```

3. **Update scripts/initDatabase.js for PostgreSQL:**
   ```javascript
   const { Pool } = require('pg');
   require('dotenv').config();

   const initDatabase = async () => {
     const pool = new Pool({
       connectionString: process.env.DATABASE_URL,
       ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
     });

     try {
       console.log('🔄 Creating tables...');

       await pool.query(`
         CREATE TABLE IF NOT EXISTS Users (
           user_id SERIAL PRIMARY KEY,
           name VARCHAR(100) NOT NULL,
           email VARCHAR(100) UNIQUE NOT NULL,
           password VARCHAR(255) NOT NULL,
           role VARCHAR(20) DEFAULT 'Resident' CHECK (role IN ('Resident', 'Admin')),
           created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
         )
       `);

       await pool.query(`
         CREATE TABLE IF NOT EXISTS LaundryMachines (
           machine_id SERIAL PRIMARY KEY,
           machine_type VARCHAR(20) NOT NULL CHECK (machine_type IN ('Washer', 'Dryer')),
           machine_number VARCHAR(10) NOT NULL,
           is_active BOOLEAN DEFAULT TRUE,
           created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
         )
       `);

       await pool.query(`
         CREATE TABLE IF NOT EXISTS Bookings (
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

       console.log('✅ All tables created');

       await pool.query(`
         INSERT INTO LaundryMachines (machine_type, machine_number, is_active) 
         VALUES 
           ('Washer', 'W1', TRUE),
           ('Washer', 'W2', TRUE),
           ('Dryer', 'D1', TRUE),
           ('Dryer', 'D2', TRUE)
         ON CONFLICT DO NOTHING
       `);

       console.log('✅ Sample machines inserted');
       console.log('🎉 Database initialization completed!');

       await pool.end();
     } catch (error) {
       console.error('❌ Error:', error);
       await pool.end();
       process.exit(1);
     }
   };

   initDatabase();
   ```

### Step 5: Deploy on Render

1. **Go to Render Dashboard**

2. **Create New Web Service:**
   - Click "New +" → "Web Service"
   - Click "Connect a repository"
   - Authorize GitHub if needed
   - Select your `washtime-backend` repository

3. **Configure the Web Service:**
   - **Name:** `washtime-api` (or your choice)
   - **Region:** Same as your database
   - **Branch:** `main`
   - **Root Directory:** Leave blank
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** Free

4. **Add Environment Variables:**
   Click "Advanced" → "Add Environment Variable"
   
   Add these variables:
   ```
   NODE_ENV=production
   PORT=10000
   DATABASE_URL=<your_postgres_internal_url>
   JWT_SECRET=your_super_secret_jwt_key_change_this
   JWT_EXPIRE=24h
   ```

   **Important:** Get DATABASE_URL from your PostgreSQL database page on Render (Internal Database URL)

5. **Click "Create Web Service"**

6. **Wait for deployment** (5-10 minutes for first deploy)

### Step 6: Initialize Production Database

1. **Go to your Web Service on Render**

2. **Click "Shell" tab** (top right)

3. **Run initialization:**
   ```bash
   npm run init-db
   ```

4. **Verify tables are created** - You should see success messages

### Step 7: Test Your Deployment

1. **Get your service URL:**
   - It will be something like: `https://washtime-api.onrender.com`

2. **Test the root endpoint:**
   ```
   https://washtime-api.onrender.com/
   ```
   You should see the API documentation JSON

3. **Test registration:**
   Using Postman or curl:
   ```bash
   curl -X POST https://washtime-api.onrender.com/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
   ```

## 🎉 You're Deployed!

Your API is now live at: `https://your-service-name.onrender.com`

## 📝 Important Notes

### Free Tier Limitations:
- Service spins down after 15 minutes of inactivity
- First request after spin-down takes 30-60 seconds
- 750 hours/month of runtime (enough for development)

### Keep Your Service Active:
- Use a service like UptimeRobot to ping your API every 15 minutes
- Or upgrade to paid plan ($7/month) for always-on service

## 🔄 Updating Your Deployment

When you make changes:

1. **Commit and push to GitHub:**
   ```bash
   git add .
   git commit -m "Update: description of changes"
   git push origin main
   ```

2. **Render auto-deploys** from GitHub!
   - Watch the deployment logs in Render dashboard

## 🐛 Troubleshooting

### Deployment Failed
- Check the Render logs for errors
- Ensure all environment variables are set
- Verify your build command is correct

### Database Connection Errors
- Verify DATABASE_URL is correct
- Check if database is in the same region as web service
- Ensure SSL is configured correctly

### Application Crashes
- Check logs in Render dashboard
- Verify all dependencies are in package.json
- Test locally with NODE_ENV=production

## 📊 For Sprint 1 Submission

### Create Submission File:

Create a file called `DEPLOYMENT_INFO.txt`:

```
WashTime - Sprint 1 Deployment Information

Student Name: rudraksh kharadi
Course: PROG2500 Full Stack Development

GitHub Repository: https://github.com/YOUR_USERNAME/washtime-backend
Live API URL: https://your-service-name.onrender.com

API Endpoints:
- Root: https://your-service-name.onrender.com/
- Register: POST https://your-service-name.onrender.com/api/auth/register
- Login: POST https://your-service-name.onrender.com/api/auth/login
- Machines: GET https://your-service-name.onrender.com/api/machines
- Bookings: GET https://your-service-name.onrender.com/api/bookings

Test Credentials:
Email: test@example.com
Password: password123

Admin Credentials:
Email: admin@example.com
Password: admin123

Notes:
- All endpoints tested and working
- Database initialized with sample machines
- JWT authentication implemented
- Role-based authorization working
```

Submit this file to the assignment folder!

## ✅ Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] Database created on Render
- [ ] Web service created and connected to GitHub
- [ ] Environment variables configured
- [ ] Database initialized
- [ ] API tested and working
- [ ] Test users created
- [ ] Deployment info file created
- [ ] Ready for demo!

Congratulations! Your backend is deployed and ready for Sprint 1 review! 🎉
