// backend/routes/reservations.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET all reservations (with guest and room details)
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        res.*,
        CONCAT(g.first_name, ' ', g.last_name) AS guest_name,
        g.email AS guest_email,
        r.room_number,
        r.room_type,
        r.price_per_night,
        h.name AS hotel_name
      FROM Reservation res
      JOIN Guest g ON res.guest_id = g.guest_id
      JOIN Room r ON res.room_id = r.room_id
      JOIN Hotel h ON r.hotel_id = h.hotel_id
      ORDER BY res.reservation_id DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single reservation
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT res.*, CONCAT(g.first_name, ' ', g.last_name) AS guest_name,
        r.room_number, r.room_type, r.price_per_night, h.name AS hotel_name
      FROM Reservation res
      JOIN Guest g ON res.guest_id = g.guest_id
      JOIN Room r ON res.room_id = r.room_id
      JOIN Hotel h ON r.hotel_id = h.hotel_id
      WHERE res.reservation_id = ?
    `, [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Reservation not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create reservation (auto-calculate total_amount) - FIXED VERSION
router.post('/', async (req, res) => {
  const { guest_id, room_id, check_in_date, check_out_date, status } = req.body;
  
  try {
    // FIX: Format dates to YYYY-MM-DD
    const formatDate = (dateString) => {
      if (!dateString) return null;
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const formattedCheckIn = formatDate(check_in_date);
    const formattedCheckOut = formatDate(check_out_date);

    // Get room price
    const [roomRows] = await db.query('SELECT price_per_night FROM Room WHERE room_id = ?', [room_id]);
    if (roomRows.length === 0) {
      return res.status(404).json({ error: 'Room not found' });
    }

    const pricePerNight = parseFloat(roomRows[0].price_per_night);
    
    // Calculate nights using the formatted dates
    const checkIn = new Date(formattedCheckIn);
    const checkOut = new Date(formattedCheckOut);
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));

    if (nights <= 0) {
      return res.status(400).json({ error: 'Check-out must be after check-in' });
    }

    const total_amount = pricePerNight * nights;

    // Insert with formatted dates
    const [result] = await db.query(
      'INSERT INTO Reservation (guest_id, room_id, check_in_date, check_out_date, status, total_amount) VALUES (?, ?, ?, ?, ?, ?)',
      [guest_id, room_id, formattedCheckIn, formattedCheckOut, status || 'Pending', total_amount]
    );

    // Update room status to Occupied if Confirmed or Checked-In
    if (status === 'Confirmed' || status === 'Checked-In') {
      await db.query("UPDATE Room SET status='Occupied' WHERE room_id=?", [room_id]);
    }

    res.status(201).json({
      reservation_id: result.insertId,
      total_amount,
      nights,
      message: 'Reservation created successfully'
    });
  } catch (err) {
    console.error('Reservation error:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT update reservation - FIXED VERSION
router.put('/:id', async (req, res) => {
  const { guest_id, room_id, check_in_date, check_out_date, status } = req.body;
  
  try {
    // FIX: Format dates to YYYY-MM-DD
    const formatDate = (dateString) => {
      if (!dateString) return null;
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const formattedCheckIn = formatDate(check_in_date);
    const formattedCheckOut = formatDate(check_out_date);

    // Recalculate total_amount
    const [roomRows] = await db.query('SELECT price_per_night FROM Room WHERE room_id = ?', [room_id]);
    if (roomRows.length === 0) {
      return res.status(404).json({ error: 'Room not found' });
    }

    const pricePerNight = parseFloat(roomRows[0].price_per_night);
    const checkIn = new Date(formattedCheckIn);
    const checkOut = new Date(formattedCheckOut);
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    
    if (nights <= 0) {
      return res.status(400).json({ error: 'Check-out must be after check-in' });
    }
    
    const total_amount = pricePerNight * nights;

    await db.query(
      'UPDATE Reservation SET guest_id=?, room_id=?, check_in_date=?, check_out_date=?, status=?, total_amount=? WHERE reservation_id=?',
      [guest_id, room_id, formattedCheckIn, formattedCheckOut, status, total_amount, req.params.id]
    );

    // Update room status
    if (status === 'Checked-Out' || status === 'Cancelled') {
      await db.query("UPDATE Room SET status='Available' WHERE room_id=?", [room_id]);
    } else if (status === 'Checked-In' || status === 'Confirmed') {
      await db.query("UPDATE Room SET status='Occupied' WHERE room_id=?", [room_id]);
    }

    res.json({ 
      message: 'Reservation updated successfully', 
      total_amount,
      nights 
    });
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE reservation
router.delete('/:id', async (req, res) => {
  try {
    // First, get the room_id to update its status
    const [reservation] = await db.query(
      'SELECT room_id FROM Reservation WHERE reservation_id = ?', 
      [req.params.id]
    );
    
    if (reservation.length > 0) {
      // Set room back to Available
      await db.query(
        "UPDATE Room SET status='Available' WHERE room_id=?", 
        [reservation[0].room_id]
      );
    }
    
    await db.query('DELETE FROM Reservation WHERE reservation_id = ?', [req.params.id]);
    res.json({ message: 'Reservation deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
