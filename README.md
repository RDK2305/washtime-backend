# WashTime - Shared Laundry Slot Booking System

A full-stack web application that allows residents to view available laundry time slots and book them in advance, reducing waiting time and improving shared facility usage.

## 🎯 Project Overview

WashTime solves a common shared-living problem by providing a fair and organized laundry booking system for apartments and dormitories with shared laundry rooms.

## 📋 Features

### User Features
- ✅ User registration and secure login
- ✅ View available laundry machines
- ✅ View available time slots
- ✅ Book laundry slots
- ✅ View personal booking history
- ✅ Update existing bookings
- ✅ Cancel bookings

### Admin Features
- ✅ Add new laundry machines
- ✅ Remove machines
- ✅ Activate/deactivate machines
- ✅ View all bookings

## 🛠️ Technology Stack

**Backend:**
- Node.js
- Express.js
- MySQL/MariaDB
- JWT Authentication
- bcryptjs for password hashing

**Key Dependencies:**
- express - Web framework
- mysql2 - MySQL client
- jsonwebtoken - JWT authentication
- bcryptjs - Password hashing
- express-validator - Input validation
- cors - Cross-origin resource sharing
- dotenv - Environment variables

## 📁 Project Structure

```
WashTime/
├── config/
│   └── database.js          # Database configuration
├── middleware/
│   └── auth.js              # Authentication middleware
├── routes/
│   ├── auth.js              # Authentication routes
│   ├── machines.js          # Machine management routes
│   └── bookings.js          # Booking routes
├── scripts/
│   └── initDatabase.js      # Database initialization script
├── .env.example             # Environment variables template
├── .gitignore              # Git ignore file
├── package.json            # Project dependencies
├── server.js               # Main server file
└── README.md               # This file
```

## 🚀 Getting Started

### Prerequisites

1. **Node.js** (v14 or higher)
   - Download from [nodejs.org](https://nodejs.org/)

2. **MySQL or MariaDB**
   - Download MySQL: [mysql.com](https://www.mysql.com/downloads/)
   - OR Download MariaDB: [mariadb.org](https://mariadb.org/download/)

### Installation Steps

1. **Clone or navigate to the project directory:**
   ```bash
   cd WashTime
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   - Copy `.env.example` to `.env`:
     ```bash
     copy .env.example .env
     ```
   - Edit `.env` and update with your database credentials:
     ```
     DB_HOST=localhost
     DB_USER=root
     DB_PASSWORD=your_mysql_password
     DB_NAME=washtime_db
     JWT_SECRET=your_secret_key_here
     ```

4. **Initialize the database:**
   ```bash
   npm run init-db
   ```
   This will:
   - Create the database
   - Create all necessary tables
   - Insert sample laundry machines

5. **Start the server:**
   ```bash
   npm start
   ```
   OR for development with auto-restart:
   ```bash
   npm run dev
   ```

6. **Server should be running on:**
   ```
   http://localhost:3000
   ```

## 📊 Database Schema

### Users Table
- user_id (Primary Key)
- name
- email (Unique)
- password (Hashed)
- role (Resident/Admin)
- created_at

### LaundryMachines Table
- machine_id (Primary Key)
- machine_type (Washer/Dryer)
- machine_number
- is_active
- created_at

### Bookings Table
- booking_id (Primary Key)
- user_id (Foreign Key → Users)
- machine_id (Foreign Key → LaundryMachines)
- booking_date
- start_time
- end_time
- status (Booked/Cancelled)
- created_at

## 🔌 API Endpoints

### Authentication Routes

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "Resident"
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### Machine Routes (Requires Authentication)

#### Get All Machines
```http
GET /api/machines
Authorization: Bearer <your_jwt_token>
```

#### Get Single Machine
```http
GET /api/machines/:id
Authorization: Bearer <your_jwt_token>
```

#### Add Machine (Admin Only)
```http
POST /api/machines
Authorization: Bearer <your_jwt_token>
Content-Type: application/json

{
  "machine_type": "Washer",
  "machine_number": "W3",
  "is_active": true
}
```

#### Update Machine (Admin Only)
```http
PUT /api/machines/:id
Authorization: Bearer <your_jwt_token>
Content-Type: application/json

{
  "is_active": false
}
```

#### Delete Machine (Admin Only)
```http
DELETE /api/machines/:id
Authorization: Bearer <your_jwt_token>
```

### Booking Routes (Requires Authentication)

#### Get User Bookings
```http
GET /api/bookings
Authorization: Bearer <your_jwt_token>
```

#### Get Available Slots
```http
GET /api/bookings/available?date=2025-02-10&machine_id=1
Authorization: Bearer <your_jwt_token>
```

#### Create Booking
```http
POST /api/bookings
Authorization: Bearer <your_jwt_token>
Content-Type: application/json

{
  "machine_id": 1,
  "booking_date": "2025-02-10",
  "start_time": "14:00",
  "end_time": "15:30"
}
```

#### Update Booking
```http
PUT /api/bookings/:id
Authorization: Bearer <your_jwt_token>
Content-Type: application/json

{
  "start_time": "15:00",
  "end_time": "16:30"
}
```

#### Cancel Booking
```http
DELETE /api/bookings/:id
Authorization: Bearer <your_jwt_token>
```

## 🧪 Testing the API

You can test the API using:
1. **Postman** - Download from [postman.com](https://www.postman.com/)
2. **Thunder Client** - VS Code extension
3. **curl** - Command line tool

### Example Testing Flow:

1. **Register a new user:**
   ```bash
   curl -X POST http://localhost:3000/api/auth/register \
     -H "Content-Type: application/json" \
     -d "{\"name\":\"Test User\",\"email\":\"test@example.com\",\"password\":\"password123\"}"
   ```

2. **Login and get token:**
   ```bash
   curl -X POST http://localhost:3000/api/auth/login \
     -H "Content-Type: application/json" \
     -d "{\"email\":\"test@example.com\",\"password\":\"password123\"}"
   ```

3. **Use the token to access protected routes:**
   ```bash
   curl -X GET http://localhost:3000/api/machines \
     -H "Authorization: Bearer YOUR_TOKEN_HERE"
   ```

## 🔒 Security Features

- ✅ Password hashing with bcryptjs
- ✅ JWT-based authentication
- ✅ Role-based authorization (Admin/Resident)
- ✅ Input validation on all routes
- ✅ Protection against overlapping bookings
- ✅ Users can only manage their own bookings

## 📝 Common Issues & Solutions

### Database Connection Failed
- Ensure MySQL/MariaDB is running
- Check your `.env` file has correct credentials
- Verify the database user has proper permissions

### Port Already in Use
- Change the PORT in `.env` file
- Or kill the process using port 3000:
  ```bash
  # Windows
  netstat -ano | findstr :3000
  taskkill /PID <PID> /F
  ```

### JWT Token Errors
- Ensure you're sending the token in the Authorization header
- Format: `Bearer <token>`
- Check that JWT_SECRET in `.env` matches

## 🚀 Deployment

### Prerequisites for Deployment
1. GitHub repository with your code
2. MySQL database (can use services like PlanetScale, Railway, or Heroku)
3. Hosting platform (Render, Heroku, Railway, etc.)

### Deployment Steps (Render Example)

1. **Push code to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Sprint 1"
   git branch -M main
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Create account on Render.com**

3. **Create new Web Service:**
   - Connect your GitHub repository
   - Select the WashTime repository
   - Configure:
     - Environment: Node
     - Build Command: `npm install`
     - Start Command: `npm start`

4. **Add Environment Variables:**
   - Add all variables from your `.env` file
   - Use your production database credentials

5. **Initialize database:**
   - Connect to your production database
   - Run the initialization script

## 📚 Sprint 1 Completion Checklist

✅ **Project Setup**
- [x] Initialize Node.js project
- [x] Install all dependencies
- [x] Set up environment configuration

✅ **Database**
- [x] Create database schema
- [x] Set up Users table
- [x] Set up LaundryMachines table
- [x] Set up Bookings table
- [x] Create database initialization script

✅ **Authentication**
- [x] User registration endpoint
- [x] User login endpoint
- [x] JWT token generation
- [x] Password hashing

✅ **Machine Management**
- [x] Get all machines endpoint
- [x] Get single machine endpoint
- [x] Create machine endpoint (Admin)
- [x] Update machine endpoint (Admin)
- [x] Delete machine endpoint (Admin)

✅ **Booking Management**
- [x] Get user bookings endpoint
- [x] Get available slots endpoint
- [x] Create booking endpoint
- [x] Update booking endpoint
- [x] Cancel booking endpoint
- [x] Overlap validation

✅ **Security**
- [x] Authentication middleware
- [x] Authorization middleware
- [x] Input validation
- [x] Error handling

✅ **Documentation**
- [x] README file
- [x] API documentation
- [x] Setup instructions

## 👨‍💻 Author

rudraksh kharadi - PROG2500 Full Stack Development

## 📄 License

This project is created for educational purposes as part of the Full Stack Development course.
