// backend/routes/staff.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET all staff
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT s.*, h.name AS hotel_name 
      FROM Staff s 
      JOIN Hotel h ON s.hotel_id = h.hotel_id 
      ORDER BY s.staff_id DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single staff
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT s.*, h.name AS hotel_name FROM Staff s JOIN Hotel h ON s.hotel_id=h.hotel_id WHERE s.staff_id=?',
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Staff not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create staff
router.post('/', async (req, res) => {
  const { hotel_id, full_name, role, department, salary } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO Staff (hotel_id, full_name, role, department, salary) VALUES (?, ?, ?, ?, ?)',
      [hotel_id, full_name, role, department, salary]
    );
    res.status(201).json({ staff_id: result.insertId, message: 'Staff created successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update staff
router.put('/:id', async (req, res) => {
  const { hotel_id, full_name, role, department, salary } = req.body;
  try {
    await db.query(
      'UPDATE Staff SET hotel_id=?, full_name=?, role=?, department=?, salary=? WHERE staff_id=?',
      [hotel_id, full_name, role, department, salary, req.params.id]
    );
    res.json({ message: 'Staff updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE staff
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM Staff WHERE staff_id = ?', [req.params.id]);
    res.json({ message: 'Staff deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
