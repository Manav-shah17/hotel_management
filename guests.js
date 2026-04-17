// backend/routes/guests.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET all guests
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM Guest ORDER BY guest_id DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single guest
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM Guest WHERE guest_id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Guest not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create guest
router.post('/', async (req, res) => {
  const { first_name, last_name, email, phone, id_proof } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO Guest (first_name, last_name, email, phone, id_proof) VALUES (?, ?, ?, ?, ?)',
      [first_name, last_name, email, phone, id_proof]
    );
    res.status(201).json({ guest_id: result.insertId, message: 'Guest created successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update guest
router.put('/:id', async (req, res) => {
  const { first_name, last_name, email, phone, id_proof } = req.body;
  try {
    await db.query(
      'UPDATE Guest SET first_name=?, last_name=?, email=?, phone=?, id_proof=? WHERE guest_id=?',
      [first_name, last_name, email, phone, id_proof, req.params.id]
    );
    res.json({ message: 'Guest updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE guest
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM Guest WHERE guest_id = ?', [req.params.id]);
    res.json({ message: 'Guest deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
