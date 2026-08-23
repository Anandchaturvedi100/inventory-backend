const db = require('../config/db');

// Get all items or search by text
exports.getItems = async (req, res) => {
  try {
    const { search } = req.query;
    let query = 'SELECT * FROM items ORDER BY id DESC';
    let params = [];

    if (search) {
      query = 'SELECT * FROM items WHERE name LIKE ? OR location_rack LIKE ? OR category LIKE ? ORDER BY id DESC';
      params = [`%${search}%`, `%${search}%`, `%${search}%`];
    }

    const [rows] = await db.query(query, params);

    const itemsWithStatus = rows.map(item => ({
      ...item,
      isLowStock: item.quantity <= item.min_quantity
    }));

    res.json(itemsWithStatus);
  } catch (err) {
    console.error('--- DATABASE ERROR START ---');
    console.error(err.message || err); // Full error text print karega
    console.error('--- DATABASE ERROR END ---');
    res.status(500).json({ error: err.message });
  }
};

// Add new item
exports.addItem = async (req, res) => {
  try {
    const { name, category, location_rack, quantity, min_quantity } = req.body;
    const image_url = req.file ? req.file.path : '';

    const [result] = await db.query(
      'INSERT INTO items (name, category, location_rack, quantity, min_quantity, image_url) VALUES (?, ?, ?, ?, ?, ?)',
      [name, category || '', location_rack, Number(quantity) || 0, Number(min_quantity) || 2, image_url]
    );

    res.status(201).json({ message: 'Item added successfully', itemId: result.insertId, image_url });
  } catch (err) {
    console.error('--- ADD ITEM ERROR START ---');
    console.error(err.message || err);
    console.error('--- ADD ITEM ERROR END ---');
    res.status(500).json({ error: err.message });
  }
};

// Update stock quantity
exports.updateQuantity = async (req, res) => {
  try {
    const { id } = req.params;
    const { change } = req.body;

    await db.query('UPDATE items SET quantity = GREATEST(0, quantity + ?) WHERE id = ?', [Number(change), id]);
    res.json({ message: 'Quantity updated successfully' });
  } catch (err) {
    console.error(err.message || err);
    res.status(500).json({ error: err.message });
  }
};