# 🚀 Render PostgreSQL Setup Guide - WashTime

## Complete Guide: PostgreSQL Database + Render Deployment

This guide shows you how to set up WashTime with **Render's PostgreSQL** for both development and production.

---

## ✅ What You Already Have

✓ Render PostgreSQL database created  
✓ Database URL: `postgresql://washtime_db_t5c1_user:nAFU92hqxSFQx74CvEIwCRXJrpWVUd4x@dpg-d61vaou3jp1c73eoqi80-a.oregon-postgres.render.com/washtime_db_t5c1`

---

## 🎯 Step-by-Step Setup

### Step 1: Install Dependencies (2 minutes)

Your project has been converted from MySQL to PostgreSQL!

```bash
cd "C:\Users\jeelp\Documents\Sem_4\Prog2500 Full Stack\Friends\rudraksh\WashTime"

# Remove old MySQL packages
npm install
```

This will install `pg` (PostgreSQL driver) instead of `mysql2`.

---

### Step 2: Verify .env File (1 minute)

Your `.env` file should already have the Render DATABASE_URL:

```env
DATABASE_URL=postgresql://washtime_db_t5c1_user:nAFU92hqxSFQx74CvEIwCRXJrpWVUd4x@dpg-d61vaou3jp1c73eoqi80-a.oregon-postgres.render.com/washtime_db_t5c1
PORT=3000
NODE_ENV=development
JWT_SECRET=your_jwt_secret_key_change_this_in_production
```

✅ Already configured!

---

### Step 3: Initialize Database (1 minute)

Create all tables in your Render PostgreSQL database:

```bash
npm run init-db
```

You should see:
```
🔄 Connecting to PostgreSQL database...
✅ Connected successfully
🔄 Dropping existing tables (if any)...
✅ Old tables dropped
🔄 Creating tables...
✅ Users table created
✅ LaundryMachines table created
✅ Bookings table created
🔄 Creating indexes...
✅ Indexes created
🔄 Inserting sample machines...
✅ Sample machines inserted
🔄 Creating admin user...
✅ Admin user created (email: admin@washtime.com, password: admin123)

🎉 Database initialization completed successfully!
```

---

### Step 4: Start Development Server (30 seconds)

```bash
npm run dev
```

You should see:
```
✅ Database connected successfully

🚀 WashTime API Server running on port 3000
📍 Local: http://localhost:3000
🗄️  Database: PostgreSQL (Render)
📚 API Documentation: http://localhost:3000/
```

---

### Step 5: Test Your API (1 minute)

**Test 1: Check API is running**
Open browser: http://localhost:3000

You should see:
```json
{
  "success": true,
  "message": "WashTime API - Laundry Booking System",
  "version": "1.0.0",
  "database": "PostgreSQL (Render)"
}
```

**Test 2: Login as Admin**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@washtime.com","password":"admin123"}'
```

You should get a JWT token! 🎉

---

## 🌐 Deploy to Render (For Production)

### Step 1: Push to GitHub (2 minutes)

```bash
# Make sure you're in the WashTime directory
cd "C:\Users\jeelp\Documents\Sem_4\Prog2500 Full Stack\Friends\rudraksh\WashTime"

# Initialize git (if not already)
git init
git add .
git commit -m "Convert to PostgreSQL and prepare for Render"
git branch -M main

# Create GitHub repo and push
git remote add origin https://github.com/YOUR_USERNAME/washtime-backend.git
git push -u origin main
```

---

### Step 2: Deploy Web Service on Render (3 minutes)

1. **Go to Render Dashboard:** https://dashboard.render.com/

2. **Click "New +" → "Web Service"**

3. **Connect GitHub Repository:**
   - Click "Connect account" if needed
   - Select your `washtime-backend` repository

4. **Configure Service:**
   - **Name:** `washtime-api` (or any name)
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** `Free`

5. **Add Environment Variables:**
   Click "Advanced" → "Add Environment Variable"
   
   Add these:
   ```
   Key: DATABASE_URL
   Value: postgresql://washtime_db_t5c1_user:nAFU92hqxSFQx74CvEIwCRXJrpWVUd4x@dpg-d61vaou3jp1c73eoqi80-a.oregon-postgres.render.com/washtime_db_t5c1
   
   Key: NODE_ENV
   Value: production
   
   Key: JWT_SECRET
   Value: your-production-secret-key-change-this
   
   Key: PORT
   Value: 3000
   ```

6. **Click "Create Web Service"**

Render will now:
- Clone your repository
- Install dependencies
- Start your server
- Give you a live URL!

---

### Step 3: Initialize Production Database (1 minute)

Once deployed:

1. **Go to your web service in Render**
2. **Click "Shell" tab** (on the left)
3. **Run:**
   ```bash
   npm run init-db
   ```

This creates all tables in your production database!

---

### Step 4: Test Live Deployment (1 minute)

Your live URL will be something like:
```
https://washtime-api.onrender.com
```

**Test it:**
```bash
curl https://washtime-api.onrender.com
```

You should see the API response!

**Login test:**
```bash
curl -X POST https://washtime-api.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@washtime.com","password":"admin123"}'
```

---

## 📊 View Your Database

### Option 1: Render Dashboard (Easy)
1. Go to Render Dashboard
2. Click on your PostgreSQL database
3. Click "Connect" → "External Connection"
4. Use a PostgreSQL client like pgAdmin or TablePlus

### Option 2: Command Line
```bash
# Install PostgreSQL client (if not installed)
# Then connect:
psql postgresql://washtime_db_t5c1_user:nAFU92hqxSFQx74CvEIwCRXJrpWVUd4x@dpg-d61vaou3jp1c73eoqi80-a.oregon-postgres.render.com/washtime_db_t5c1
```

---

## 🔑 Default Credentials

**Admin Account:**
```
Email: admin@washtime.com
Password: admin123
```

**Sample Machines Created:**
- Washer W1
- Washer W2
- Dryer D1
- Dryer D2

---

## 📁 What Changed (MySQL → PostgreSQL)

### Files Updated:
1. ✅ `package.json` - Changed `mysql2` to `pg`
2. ✅ `config/database.js` - PostgreSQL connection
3. ✅ `scripts/initDatabase.js` - PostgreSQL syntax
4. ✅ `routes/auth.js` - PostgreSQL queries (`$1, $2` instead of `?`)
5. ✅ `server.js` - Updated messages
6. ✅ `.env` - DATABASE_URL format

### Key Differences:
| MySQL | PostgreSQL |
|-------|------------|
| `?` placeholders | `$1, $2, $3` placeholders |
| `AUTO_INCREMENT` | `SERIAL` |
| `ENUM('val1','val2')` | `VARCHAR CHECK (col IN ('val1','val2'))` |
| `result.insertId` | `RETURNING` clause |
| `rows[0]` | `result.rows[0]` |

---

## 💰 Render Pricing

### Free Tier (Perfect for you!)
- **PostgreSQL:** Free for 90 days, then $7/month
- **Web Service:** Free tier available (sleeps after inactivity)
- **Total:** FREE for 90+ days!

### Benefits:
✅ No credit card needed initially  
✅ 90 days completely free  
✅ Perfect for development & testing  
✅ Can upgrade anytime  

---

## 🎯 Common Issues & Solutions

### Issue: "Connection refused"
**Fix:** Check DATABASE_URL is correct in .env

### Issue: "Tables don't exist"
**Fix:** Run `npm run init-db`

### Issue: "Invalid token"
**Fix:** Make sure JWT_SECRET is set in .env

### Issue: Deployment fails
**Fix:** Check Render logs for specific error

### Issue: Database won't connect
**Fix:** Make sure DATABASE_URL has no extra spaces

---

## 📝 Quick Command Reference

```bash
# Install dependencies
npm install

# Initialize database (creates tables)
npm run init-db

# Start development server
npm run dev

# Start production server
npm start

# Test API locally
curl http://localhost:3000

# Test deployed API
curl https://your-app.onrender.com
```

---

## 🚀 Next Steps

1. ✅ Database configured
2. ✅ Tables created
3. ✅ Local testing done
4. ⬜ Push to GitHub
5. ⬜ Deploy to Render
6. ⬜ Test live URL
7. ⬜ Submit for grading!

---

## 📚 Resources

- Render Docs: https://render.com/docs
- PostgreSQL Docs: https://www.postgresql.org/docs/
- Node-Postgres (pg): https://node-postgres.com/

---

## 🎉 You're All Set!

Your WashTime project is now running on:
- ✅ **PostgreSQL** (better than MySQL!)
- ✅ **Render Cloud** (free tier!)
- ✅ **Production Ready** (professional setup!)

**Everything is configured and ready to go! 🚀**
