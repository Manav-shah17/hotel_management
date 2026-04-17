// backend/routes/maintenance.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET all maintenance requests
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT m.*, r.room_number, h.name AS hotel_name, s.full_name AS staff_name
      FROM Maintenance m
      JOIN Room r ON m.room_id = r.room_id
      JOIN Hotel h ON r.hotel_id = h.hotel_id
      LEFT JOIN Staff s ON m.staff_id = s.staff_id
      ORDER BY m.maintenance_id DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT m.*, r.room_number, h.name AS hotel_name, s.full_name AS staff_name
      FROM Maintenance m
      JOIN Room r ON m.room_id = r.room_id
      JOIN Hotel h ON r.hotel_id = h.hotel_id
      LEFT JOIN Staff s ON m.staff_id = s.staff_id
      WHERE m.maintenance_id = ?
    `, [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Maintenance record not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create maintenance
router.post('/', async (req, res) => {
  const { room_id, staff_id, issue, status } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO Maintenance (room_id, staff_id, issue, status) VALUES (?, ?, ?, ?)',
      [room_id, staff_id || null, issue, status || 'Reported']
    );

    // Set room to Maintenance status
    await db.query("UPDATE Room SET status='Maintenance' WHERE room_id=?", [room_id]);

    res.status(201).json({ maintenance_id: result.insertId, message: 'Maintenance request created' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update maintenance
router.put('/:id', async (req, res) => {
  const { room_id, staff_id, issue, status } = req.body;
  try {
    await db.query(
      'UPDATE Maintenance SET room_id=?, staff_id=?, issue=?, status=? WHERE maintenance_id=?',
      [room_id, staff_id || null, issue, status, req.params.id]
    );

    // If resolved, set room back to Available
    if (status === 'Resolved') {
      await db.query("UPDATE Room SET status='Available' WHERE room_id=?", [room_id]);
    }

    res.json({ message: 'Maintenance updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM Maintenance WHERE maintenance_id = ?', [req.params.id]);
    res.json({ message: 'Maintenance record deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
