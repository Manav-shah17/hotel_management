// backend/routes/dashboard.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET dashboard stats
router.get('/stats', async (req, res) => {
  try {
    const [[{ total_hotels }]] = await db.query('SELECT COUNT(*) AS total_hotels FROM Hotel');
    const [[{ total_rooms }]] = await db.query('SELECT COUNT(*) AS total_rooms FROM Room');
    const [[{ available_rooms }]] = await db.query("SELECT COUNT(*) AS available_rooms FROM Room WHERE status='Available'");
    const [[{ occupied_rooms }]] = await db.query("SELECT COUNT(*) AS occupied_rooms FROM Room WHERE status='Occupied'");
    const [[{ total_guests }]] = await db.query('SELECT COUNT(*) AS total_guests FROM Guest');
    const [[{ total_reservations }]] = await db.query('SELECT COUNT(*) AS total_reservations FROM Reservation');
    const [[{ active_reservations }]] = await db.query("SELECT COUNT(*) AS active_reservations FROM Reservation WHERE status IN ('Confirmed','Checked-In')");
    const [[{ total_revenue }]] = await db.query("SELECT COALESCE(SUM(amount),0) AS total_revenue FROM Payment WHERE status='Completed'");
    const [[{ total_staff }]] = await db.query('SELECT COUNT(*) AS total_staff FROM Staff');
    const [[{ open_maintenance }]] = await db.query("SELECT COUNT(*) AS open_maintenance FROM Maintenance WHERE status != 'Resolved'");
    const [[{ avg_rating }]] = await db.query('SELECT COALESCE(ROUND(AVG(rating),1),0) AS avg_rating FROM Feedback');
    const [[{ low_stock }]] = await db.query('SELECT COUNT(*) AS low_stock FROM Inventory WHERE quantity_in_stock <= reorder_level');

    // Recent reservations
    const [recent_reservations] = await db.query(`
      SELECT res.reservation_id, CONCAT(g.first_name,' ',g.last_name) AS guest_name,
        r.room_number, res.check_in_date, res.check_out_date, res.status, res.total_amount
      FROM Reservation res
      JOIN Guest g ON res.guest_id=g.guest_id
      JOIN Room r ON res.room_id=r.room_id
      ORDER BY res.created_at DESC LIMIT 5
    `);

    res.json({
      total_hotels,
      total_rooms,
      available_rooms,
      occupied_rooms,
      total_guests,
      total_reservations,
      active_reservations,
      total_revenue,
      total_staff,
      open_maintenance,
      avg_rating,
      low_stock,
      recent_reservations
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
