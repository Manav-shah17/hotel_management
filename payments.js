// backend/routes/payments.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET all payments
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT p.*, res.check_in_date, res.check_out_date,
        CONCAT(g.first_name, ' ', g.last_name) AS guest_name,
        r.room_number
      FROM Payment p
      JOIN Reservation res ON p.reservation_id = res.reservation_id
      JOIN Guest g ON res.guest_id = g.guest_id
      JOIN Room r ON res.room_id = r.room_id
      ORDER BY p.payment_id DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create payment
router.post('/', async (req, res) => {
  const { reservation_id, amount, method, status } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO Payment (reservation_id, amount, method, status) VALUES (?, ?, ?, ?)',
      [reservation_id, amount, method, status || 'Pending']
    );
    res.status(201).json({ payment_id: result.insertId, message: 'Payment recorded successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update payment
router.put('/:id', async (req, res) => {
  const { reservation_id, amount, method, status } = req.body;
  try {
    await db.query(
      'UPDATE Payment SET reservation_id=?, amount=?, method=?, status=? WHERE payment_id=?',
      [reservation_id, amount, method, status, req.params.id]
    );
    res.json({ message: 'Payment updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM Payment WHERE payment_id = ?', [req.params.id]);
    res.json({ message: 'Payment deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
