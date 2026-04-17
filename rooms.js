// backend/routes/rooms.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET all rooms (with hotel name)
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT r.*, h.name AS hotel_name 
      FROM Room r 
      JOIN Hotel h ON r.hotel_id = h.hotel_id 
      ORDER BY r.room_id DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single room
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT r.*, h.name AS hotel_name FROM Room r JOIN Hotel h ON r.hotel_id=h.hotel_id WHERE r.room_id=?',
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Room not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create room
router.post('/', async (req, res) => {
  const { hotel_id, room_number, room_type, price_per_night, status } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO Room (hotel_id, room_number, room_type, price_per_night, status) VALUES (?, ?, ?, ?, ?)',
      [hotel_id, room_number, room_type, price_per_night, status || 'Available']
    );
    res.status(201).json({ room_id: result.insertId, message: 'Room created successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update room
router.put('/:id', async (req, res) => {
  const { hotel_id, room_number, room_type, price_per_night, status } = req.body;
  try {
    await db.query(
      'UPDATE Room SET hotel_id=?, room_number=?, room_type=?, price_per_night=?, status=? WHERE room_id=?',
      [hotel_id, room_number, room_type, price_per_night, status, req.params.id]
    );
    res.json({ message: 'Room updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE room
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM Room WHERE room_id = ?', [req.params.id]);
    res.json({ message: 'Room deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
