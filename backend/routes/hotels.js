// backend/routes/hotels.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET all hotels
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM Hotel ORDER BY hotel_id DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single hotel
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM Hotel WHERE hotel_id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Hotel not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create hotel
router.post('/', async (req, res) => {
  const { name, city, phone, star_rating } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO Hotel (name, city, phone, star_rating) VALUES (?, ?, ?, ?)',
      [name, city, phone, star_rating]
    );
    res.status(201).json({ hotel_id: result.insertId, message: 'Hotel created successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update hotel
router.put('/:id', async (req, res) => {
  const { name, city, phone, star_rating } = req.body;
  try {
    await db.query(
      'UPDATE Hotel SET name=?, city=?, phone=?, star_rating=? WHERE hotel_id=?',
      [name, city, phone, star_rating, req.params.id]
    );
    res.json({ message: 'Hotel updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE hotel
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM Hotel WHERE hotel_id = ?', [req.params.id]);
    res.json({ message: 'Hotel deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
