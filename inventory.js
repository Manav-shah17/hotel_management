// backend/routes/inventory.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET all inventory items
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT i.*, h.name AS hotel_name 
      FROM Inventory i 
      JOIN Hotel h ON i.hotel_id = h.hotel_id 
      ORDER BY i.item_id DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single inventory item
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT i.*, h.name AS hotel_name FROM Inventory i JOIN Hotel h ON i.hotel_id=h.hotel_id WHERE i.item_id=?',
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Item not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create item
router.post('/', async (req, res) => {
  const { hotel_id, name, category, quantity_in_stock, reorder_level, unit_cost } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO Inventory (hotel_id, name, category, quantity_in_stock, reorder_level, unit_cost) VALUES (?, ?, ?, ?, ?, ?)',
      [hotel_id, name, category, quantity_in_stock, reorder_level, unit_cost]
    );
    res.status(201).json({ item_id: result.insertId, message: 'Inventory item created successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update item
router.put('/:id', async (req, res) => {
  const { hotel_id, name, category, quantity_in_stock, reorder_level, unit_cost } = req.body;
  try {
    await db.query(
      'UPDATE Inventory SET hotel_id=?, name=?, category=?, quantity_in_stock=?, reorder_level=?, unit_cost=? WHERE item_id=?',
      [hotel_id, name, category, quantity_in_stock, reorder_level, unit_cost, req.params.id]
    );
    res.json({ message: 'Inventory item updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE item
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM Inventory WHERE item_id = ?', [req.params.id]);
    res.json({ message: 'Inventory item deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
