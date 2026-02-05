const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// GET /api/machines - Get all laundry machines
router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM LaundryMachines ORDER BY machine_type, machine_number'
    );

    res.json({
      success: true,
      count: result.rows.length,
      machines: result.rows
    });
  } catch (error) {
    console.error('Get machines error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error fetching machines' 
    });
  }
});

// GET /api/machines/:id - Get single machine
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM LaundryMachines WHERE machine_id = $1',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Machine not found' 
      });
    }

    res.json({
      success: true,
      machine: result.rows[0]
    });
  } catch (error) {
    console.error('Get machine error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error fetching machine' 
    });
  }
});

// POST /api/machines - Add new machine (Admin only)
router.post('/', 
  authMiddleware, 
  adminMiddleware,
  [
    body('machine_type').isIn(['Washer', 'Dryer']).withMessage('Machine type must be Washer or Dryer'),
    body('machine_number').trim().notEmpty().withMessage('Machine number is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false, 
          errors: errors.array() 
        });
      }

      const { machine_type, machine_number, is_active } = req.body;

      const result = await pool.query(
        'INSERT INTO LaundryMachines (machine_type, machine_number, is_active) VALUES ($1, $2, $3) RETURNING *',
        [machine_type, machine_number, is_active !== undefined ? is_active : true]
      );

      res.status(201).json({
        success: true,
        message: 'Machine added successfully',
        machine: result.rows[0]
      });
    } catch (error) {
      console.error('Add machine error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error adding machine' 
      });
    }
  }
);

// PUT /api/machines/:id - Update machine (Admin only)
router.put('/:id', 
  authMiddleware, 
  adminMiddleware,
  async (req, res) => {
    try {
      const { machine_type, machine_number, is_active } = req.body;
      const { id } = req.params;

      // Check if machine exists
      const checkResult = await pool.query(
        'SELECT * FROM LaundryMachines WHERE machine_id = $1',
        [id]
      );

      if (checkResult.rows.length === 0) {
        return res.status(404).json({ 
          success: false, 
          message: 'Machine not found' 
        });
      }

      // Build update query dynamically
      const updates = [];
      const values = [];
      let paramCount = 1;

      if (machine_type) {
        updates.push(`machine_type = $${paramCount++}`);
        values.push(machine_type);
      }
      if (machine_number) {
        updates.push(`machine_number = $${paramCount++}`);
        values.push(machine_number);
      }
      if (is_active !== undefined) {
        updates.push(`is_active = $${paramCount++}`);
        values.push(is_active);
      }

      if (updates.length === 0) {
        return res.status(400).json({ 
          success: false, 
          message: 'No updates provided' 
        });
      }

      values.push(id);

      await pool.query(
        `UPDATE LaundryMachines SET ${updates.join(', ')} WHERE machine_id = $${paramCount}`,
        values
      );

      // Get updated machine
      const updatedResult = await pool.query(
        'SELECT * FROM LaundryMachines WHERE machine_id = $1',
        [id]
      );

      res.json({
        success: true,
        message: 'Machine updated successfully',
        machine: updatedResult.rows[0]
      });
    } catch (error) {
      console.error('Update machine error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error updating machine' 
      });
    }
  }
);

// DELETE /api/machines/:id - Delete machine (Admin only)
router.delete('/:id', 
  authMiddleware, 
  adminMiddleware,
  async (req, res) => {
    try {
      const { id } = req.params;

      // Check if machine exists
      const result = await pool.query(
        'SELECT * FROM LaundryMachines WHERE machine_id = $1',
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ 
          success: false, 
          message: 'Machine not found' 
        });
      }

      await pool.query('DELETE FROM LaundryMachines WHERE machine_id = $1', [id]);

      res.json({
        success: true,
        message: 'Machine deleted successfully'
      });
    } catch (error) {
      console.error('Delete machine error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error deleting machine' 
      });
    }
  }
);

module.exports = router;
