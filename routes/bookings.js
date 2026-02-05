const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

// Validation rules for booking
const bookingValidation = [
  body('machine_id').isInt().withMessage('Valid machine ID is required'),
  body('booking_date').isDate().withMessage('Valid date is required (YYYY-MM-DD)'),
  body('start_time').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid start time is required (HH:MM)'),
  body('end_time').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid end time is required (HH:MM)')
];

// GET /api/bookings - Get all bookings for logged-in user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT b.*, m.machine_type, m.machine_number 
       FROM Bookings b
       JOIN LaundryMachines m ON b.machine_id = m.machine_id
       WHERE b.user_id = $1
       ORDER BY b.booking_date DESC, b.start_time DESC`,
      [req.user.user_id]
    );

    res.json({
      success: true,
      count: result.rows.length,
      bookings: result.rows
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error fetching bookings' 
    });
  }
});

// GET /api/bookings/available - Get available time slots for a date and machine
router.get('/available', authMiddleware, async (req, res) => {
  try {
    const { date, machine_id } = req.query;

    if (!date) {
      return res.status(400).json({ 
        success: false, 
        message: 'Date parameter is required' 
      });
    }

    let query = `
      SELECT b.*, m.machine_type, m.machine_number 
      FROM Bookings b
      JOIN LaundryMachines m ON b.machine_id = m.machine_id
      WHERE b.booking_date = $1 AND b.status = 'Booked'
    `;
    const params = [date];

    if (machine_id) {
      query += ' AND b.machine_id = $2';
      params.push(machine_id);
    }

    query += ' ORDER BY b.start_time';

    const result = await pool.query(query, params);

    res.json({
      success: true,
      date,
      machine_id: machine_id || 'all',
      booked_slots: result.rows
    });
  } catch (error) {
    console.error('Get available slots error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error fetching available slots' 
    });
  }
});

// GET /api/bookings/:id - Get single booking
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT b.*, m.machine_type, m.machine_number 
       FROM Bookings b
       JOIN LaundryMachines m ON b.machine_id = m.machine_id
       WHERE b.booking_id = $1 AND b.user_id = $2`,
      [req.params.id, req.user.user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Booking not found or access denied' 
      });
    }

    res.json({
      success: true,
      booking: result.rows[0]
    });
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error fetching booking' 
    });
  }
});

// POST /api/bookings - Create new booking
router.post('/', authMiddleware, bookingValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { machine_id, booking_date, start_time, end_time } = req.body;

    // Validate end_time is after start_time
    if (start_time >= end_time) {
      return res.status(400).json({ 
        success: false, 
        message: 'End time must be after start time' 
      });
    }

    // Check if machine exists and is active
    const machineResult = await pool.query(
      'SELECT * FROM LaundryMachines WHERE machine_id = $1 AND is_active = TRUE',
      [machine_id]
    );

    if (machineResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Machine not found or inactive' 
      });
    }

    // Check for overlapping bookings
    const overlapResult = await pool.query(
      `SELECT * FROM Bookings 
       WHERE machine_id = $1 
       AND booking_date = $2 
       AND status = 'Booked'
       AND (
         (start_time < $3 AND end_time > $4) OR
         (start_time < $5 AND end_time > $6) OR
         (start_time >= $7 AND end_time <= $8)
       )`,
      [machine_id, booking_date, end_time, start_time, end_time, start_time, start_time, end_time]
    );

    if (overlapResult.rows.length > 0) {
      return res.status(409).json({ 
        success: false, 
        message: 'This time slot overlaps with an existing booking' 
      });
    }

    // Create booking
    const insertResult = await pool.query(
      'INSERT INTO Bookings (user_id, machine_id, booking_date, start_time, end_time) VALUES ($1, $2, $3, $4, $5) RETURNING booking_id',
      [req.user.user_id, machine_id, booking_date, start_time, end_time]
    );

    // Get created booking with machine details
    const newBookingResult = await pool.query(
      `SELECT b.*, m.machine_type, m.machine_number 
       FROM Bookings b
       JOIN LaundryMachines m ON b.machine_id = m.machine_id
       WHERE b.booking_id = $1`,
      [insertResult.rows[0].booking_id]
    );

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      booking: newBookingResult.rows[0]
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error creating booking' 
    });
  }
});

// PUT /api/bookings/:id - Update booking
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { machine_id, booking_date, start_time, end_time } = req.body;

    // Check if booking exists and belongs to user
    const bookingResult = await pool.query(
      'SELECT * FROM Bookings WHERE booking_id = $1 AND user_id = $2',
      [id, req.user.user_id]
    );

    if (bookingResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Booking not found or access denied' 
      });
    }

    const booking = bookingResult.rows[0];

    // Check if booking is in the past
    const now = new Date();
    const bookingDateTime = new Date(`${booking.booking_date.toISOString().split('T')[0]}T${booking.start_time}`);
    
    if (bookingDateTime < now) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot update past bookings' 
      });
    }

    // Build update query
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (machine_id) {
      updates.push(`machine_id = $${paramCount++}`);
      values.push(machine_id);
    }
    if (booking_date) {
      updates.push(`booking_date = $${paramCount++}`);
      values.push(booking_date);
    }
    if (start_time) {
      updates.push(`start_time = $${paramCount++}`);
      values.push(start_time);
    }
    if (end_time) {
      updates.push(`end_time = $${paramCount++}`);
      values.push(end_time);
    }

    if (updates.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'No updates provided' 
      });
    }

    // Check for overlapping bookings (excluding current booking)
    const checkMachineId = machine_id || booking.machine_id;
    const checkDate = booking_date || booking.booking_date.toISOString().split('T')[0];
    const checkStartTime = start_time || booking.start_time;
    const checkEndTime = end_time || booking.end_time;

    const overlapResult = await pool.query(
      `SELECT * FROM Bookings 
       WHERE machine_id = $1 
       AND booking_date = $2 
       AND status = 'Booked'
       AND booking_id != $3
       AND (
         (start_time < $4 AND end_time > $5) OR
         (start_time < $6 AND end_time > $7) OR
         (start_time >= $8 AND end_time <= $9)
       )`,
      [checkMachineId, checkDate, id, checkEndTime, checkStartTime, checkEndTime, checkStartTime, checkStartTime, checkEndTime]
    );

    if (overlapResult.rows.length > 0) {
      return res.status(409).json({ 
        success: false, 
        message: 'Updated time slot overlaps with an existing booking' 
      });
    }

    values.push(id);

    await pool.query(
      `UPDATE Bookings SET ${updates.join(', ')} WHERE booking_id = $${paramCount}`,
      values
    );

    // Get updated booking
    const updatedResult = await pool.query(
      `SELECT b.*, m.machine_type, m.machine_number 
       FROM Bookings b
       JOIN LaundryMachines m ON b.machine_id = m.machine_id
       WHERE b.booking_id = $1`,
      [id]
    );

    res.json({
      success: true,
      message: 'Booking updated successfully',
      booking: updatedResult.rows[0]
    });
  } catch (error) {
    console.error('Update booking error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error updating booking' 
    });
  }
});

// DELETE /api/bookings/:id - Cancel booking
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if booking exists and belongs to user
    const result = await pool.query(
      'SELECT * FROM Bookings WHERE booking_id = $1 AND user_id = $2',
      [id, req.user.user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Booking not found or access denied' 
      });
    }

    // Update status to Cancelled instead of deleting
    await pool.query(
      'UPDATE Bookings SET status = $1 WHERE booking_id = $2',
      ['Cancelled', id]
    );

    res.json({
      success: true,
      message: 'Booking cancelled successfully'
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error cancelling booking' 
    });
  }
});

module.exports = router;
