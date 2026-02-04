# WashTime API - Testing Guide

This guide will help you test all the API endpoints for your Sprint 1 review.

## 📋 Prerequisites

1. Server is running on `http://localhost:3000`
2. Database is initialized with sample machines
3. You have Postman, Thunder Client, or similar tool installed

## 🧪 Testing Workflow

### Step 1: Register a User

**Endpoint:** `POST /api/auth/register`

**Request Body:**
```json
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "password123"
}
```

**Expected Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "user_id": 1,
    "name": "Test User",
    "email": "test@example.com",
    "role": "Resident"
  }
}
```

### Step 2: Register an Admin User

**Endpoint:** `POST /api/auth/register`

**Request Body:**
```json
{
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "admin123",
  "role": "Admin"
}
```

### Step 3: Login as Regular User

**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "user_id": 1,
    "name": "Test User",
    "email": "test@example.com",
    "role": "Resident"
  }
}
```

**⚠️ IMPORTANT:** Save the token! You'll need it for all subsequent requests.

### Step 4: View All Machines

**Endpoint:** `GET /api/machines`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN_HERE
```

**Expected Response (200):**
```json
{
  "success": true,
  "count": 4,
  "machines": [
    {
      "machine_id": 1,
      "machine_type": "Washer",
      "machine_number": "W1",
      "is_active": 1,
      "created_at": "2025-02-02T..."
    },
    ...
  ]
}
```

### Step 5: Create a Booking

**Endpoint:** `POST /api/bookings`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json
```

**Request Body:**
```json
{
  "machine_id": 1,
  "booking_date": "2025-02-10",
  "start_time": "14:00",
  "end_time": "15:30"
}
```

**Expected Response (201):**
```json
{
  "success": true,
  "message": "Booking created successfully",
  "booking": {
    "booking_id": 1,
    "user_id": 1,
    "machine_id": 1,
    "booking_date": "2025-02-10",
    "start_time": "14:00:00",
    "end_time": "15:30:00",
    "status": "Booked",
    "machine_type": "Washer",
    "machine_number": "W1"
  }
}
```

### Step 6: View Your Bookings

**Endpoint:** `GET /api/bookings`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN_HERE
```

**Expected Response (200):**
```json
{
  "success": true,
  "count": 1,
  "bookings": [
    {
      "booking_id": 1,
      "user_id": 1,
      "machine_id": 1,
      "booking_date": "2025-02-10",
      "start_time": "14:00:00",
      "end_time": "15:30:00",
      "status": "Booked",
      "machine_type": "Washer",
      "machine_number": "W1"
    }
  ]
}
```

### Step 7: Check Available Slots

**Endpoint:** `GET /api/bookings/available?date=2025-02-10&machine_id=1`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN_HERE
```

**Expected Response (200):**
```json
{
  "success": true,
  "date": "2025-02-10",
  "machine_id": "1",
  "booked_slots": [
    {
      "booking_id": 1,
      "machine_id": 1,
      "booking_date": "2025-02-10",
      "start_time": "14:00:00",
      "end_time": "15:30:00",
      "status": "Booked",
      "machine_type": "Washer",
      "machine_number": "W1"
    }
  ]
}
```

### Step 8: Update a Booking

**Endpoint:** `PUT /api/bookings/1`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json
```

**Request Body:**
```json
{
  "start_time": "15:00",
  "end_time": "16:30"
}
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Booking updated successfully",
  "booking": {
    "booking_id": 1,
    "start_time": "15:00:00",
    "end_time": "16:30:00",
    ...
  }
}
```

### Step 9: Cancel a Booking

**Endpoint:** `DELETE /api/bookings/1`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN_HERE
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Booking cancelled successfully"
}
```

### Step 10: Admin - Login as Admin

**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "admin123"
}
```

**⚠️ Save the admin token!**

### Step 11: Admin - Add New Machine

**Endpoint:** `POST /api/machines`

**Headers:**
```
Authorization: Bearer ADMIN_TOKEN_HERE
Content-Type: application/json
```

**Request Body:**
```json
{
  "machine_type": "Washer",
  "machine_number": "W3",
  "is_active": true
}
```

**Expected Response (201):**
```json
{
  "success": true,
  "message": "Machine added successfully",
  "machine": {
    "machine_id": 5,
    "machine_type": "Washer",
    "machine_number": "W3",
    "is_active": true
  }
}
```

### Step 12: Admin - Update Machine

**Endpoint:** `PUT /api/machines/5`

**Headers:**
```
Authorization: Bearer ADMIN_TOKEN_HERE
Content-Type: application/json
```

**Request Body:**
```json
{
  "is_active": false
}
```

### Step 13: Admin - Delete Machine

**Endpoint:** `DELETE /api/machines/5`

**Headers:**
```
Authorization: Bearer ADMIN_TOKEN_HERE
```

## 🧪 Testing Edge Cases

### Test 1: Overlapping Booking (Should Fail)

Try to create a booking that overlaps with an existing one:

**Request:**
```json
{
  "machine_id": 1,
  "booking_date": "2025-02-10",
  "start_time": "14:30",
  "end_time": "15:00"
}
```

**Expected Response (409):**
```json
{
  "success": false,
  "message": "This time slot overlaps with an existing booking"
}
```

### Test 2: Invalid Time Range (Should Fail)

**Request:**
```json
{
  "machine_id": 1,
  "booking_date": "2025-02-10",
  "start_time": "16:00",
  "end_time": "15:00"
}
```

**Expected Response (400):**
```json
{
  "success": false,
  "message": "End time must be after start time"
}
```

### Test 3: Non-Admin Try to Add Machine (Should Fail)

Use a regular user token to try adding a machine.

**Expected Response (403):**
```json
{
  "success": false,
  "message": "Access denied. Admin privileges required."
}
```

### Test 4: No Token (Should Fail)

Try accessing `/api/machines` without Authorization header.

**Expected Response (401):**
```json
{
  "success": false,
  "message": "Access denied. No token provided."
}
```

### Test 5: Duplicate Email Registration (Should Fail)

Try registering with an email that already exists.

**Expected Response (400):**
```json
{
  "success": false,
  "message": "User already exists with this email"
}
```

## 📊 Quick Test Checklist for Sprint Review

Use this checklist during your live demo:

- [ ] Server starts without errors
- [ ] Database connection successful
- [ ] Register a new user successfully
- [ ] Login successfully and receive token
- [ ] View all machines
- [ ] Create a booking
- [ ] View your bookings
- [ ] Check available slots
- [ ] Update a booking
- [ ] Cancel a booking
- [ ] Admin can add a machine
- [ ] Admin can update a machine
- [ ] Regular user cannot add machine (403 error)
- [ ] Overlapping bookings are prevented (409 error)

## 🎯 Demo Tips for Sprint Review

1. **Have Postman/Thunder Client ready** with all requests pre-configured
2. **Show the code** - Be ready to navigate to:
   - `server.js` - Main server setup
   - `routes/auth.js` - Authentication logic
   - `routes/bookings.js` - Booking logic
   - `config/database.js` - Database connection
   - `middleware/auth.js` - JWT verification

3. **Be prepared to answer:**
   - "Where are your routes defined?"
   - "How do you handle authentication?"
   - "Show me the database schema"
   - "How do you prevent overlapping bookings?"
   - "Where do you validate user input?"

4. **Have error scenarios ready** - Show that validation works

## 🔍 Common Technical Questions & Answers

**Q: "How does JWT authentication work in your app?"**
A: "When a user logs in, we generate a JWT token containing their user_id, email, and role. This token is sent back to the client and must be included in the Authorization header for protected routes. The authMiddleware verifies this token before allowing access."

**Q: "Where do you prevent double bookings?"**
A: "In `routes/bookings.js`, before creating a booking, we query the database to check for overlapping time slots on the same machine and date. If an overlap exists, we return a 409 error."

**Q: "How are passwords stored?"**
A: "Passwords are hashed using bcryptjs before being stored in the database. During login, we use bcrypt.compare() to verify the password."

**Q: "What's the difference between Resident and Admin roles?"**
A: "Admins can create, update, and delete machines. Residents can only view machines and manage their own bookings. This is enforced through the adminMiddleware."

## 🚀 Ready for Deployment?

Before deployment, ensure:
- [ ] All routes tested and working
- [ ] .env file configured properly
- [ ] Database initialized successfully
- [ ] No console errors
- [ ] Code pushed to GitHub
- [ ] README is complete

Good luck with your Sprint 1 review! 🎉
