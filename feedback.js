// backend/routes/feedback.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET all feedback
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT f.*, 
        CONCAT(g.first_name, ' ', g.last_name) AS guest_name,
        r.room_number, h.name AS hotel_name
      FROM Feedback f
      JOIN Guest g ON f.guest_id = g.guest_id
      JOIN Reservation res ON f.reservation_id = res.reservation_id
      JOIN Room r ON res.room_id = r.room_id
      JOIN Hotel h ON r.hotel_id = h.hotel_id
      ORDER BY f.feedback_id DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create feedback
router.post('/', async (req, res) => {
  const { reservation_id, guest_id, rating, comments } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO Feedback (reservation_id, guest_id, rating, comments) VALUES (?, ?, ?, ?)',
      [reservation_id, guest_id, rating, comments]
    );
    res.status(201).json({ feedback_id: result.insertId, message: 'Feedback submitted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update feedback
router.put('/:id', async (req, res) => {
  const { rating, comments } = req.body;
  try {
    await db.query(
      'UPDATE Feedback SET rating=?, comments=? WHERE feedback_id=?',
      [rating, comments, req.params.id]
    );
    res.json({ message: 'Feedback updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM Feedback WHERE feedback_id = ?', [req.params.id]);
    res.json({ message: 'Feedback deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
