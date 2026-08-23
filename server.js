require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const app = express();
const PORT = process.env.PORT || 5000;
const DB_FILE = './inventory.json';

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET
});

// Multer Storage for Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'inventory_app_uploads',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp']
  }
});
const upload = multer({ storage });

// Local JSON Database Setup
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify([], null, 2));
}

const readDB = () => {
  try {
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data || '[]');
  } catch (err) {
    return [];
  }
};

const writeDB = (data) => {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
};

// GET ALL ITEMS
app.get('/api/items', (req, res) => {
  const search = (req.query.search || '').toLowerCase();
  let items = readDB();

  if (search) {
    items = items.filter(item =>
      (item.name && item.name.toLowerCase().includes(search)) ||
      (item.category && item.category.toLowerCase().includes(search)) ||
      (item.location_rack && item.location_rack.toLowerCase().includes(search))
    );
  }

  items = items.map(item => ({
    ...item,
    isLowStock: Number(item.quantity) <= Number(item.min_quantity)
  }));

  return res.json(items);
});

// ADD NEW ITEM (Image direct Cloudinary par jayegi)
app.post('/api/items', upload.single('image'), (req, res) => {
  try {
    const { name, category, location_rack, quantity, min_quantity, unit, selling_price, cost_price } = req.body;

    if (!name || !location_rack) {
      return res.status(400).json({ error: 'Item Name and Rack Location are required' });
    }

    const items = readDB();
    const newItem = {
      id: Date.now(),
      name,
      category: category || 'General',
      location_rack,
      quantity: Number(quantity) || 0,
      min_quantity: Number(min_quantity) || 2,
      unit: unit || 'pcs',
      selling_price: Number(selling_price) || 0,
      cost_price: Number(cost_price) || 0,
      image_url: req.file ? req.file.path : null, // Cloudinary Online URL
      created_at: new Date().toISOString()
    };

    items.unshift(newItem);
    writeDB(items);

    return res.status(200).json({ id: newItem.id, message: 'Item added successfully' });
  } catch (error) {
    console.error('Error adding item:', error);
    return res.status(500).json({ error: 'Failed to save item' });
  }
});

// UPDATE ITEM
app.put('/api/items/:id', upload.single('image'), (req, res) => {
  try {
    const id = Number(req.params.id);
    const { name, category, location_rack, quantity, min_quantity, unit, selling_price, cost_price } = req.body;

    let items = readDB();
    const index = items.findIndex(item => item.id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Item not found' });
    }

    items[index] = {
      ...items[index],
      name: name || items[index].name,
      category: category || items[index].category,
      location_rack: location_rack || items[index].location_rack,
      quantity: quantity !== undefined ? Number(quantity) : items[index].quantity,
      min_quantity: min_quantity !== undefined ? Number(min_quantity) : items[index].min_quantity,
      unit: unit || items[index].unit,
      selling_price: selling_price !== undefined ? Number(selling_price) : items[index].selling_price,
      cost_price: cost_price !== undefined ? Number(cost_price) : items[index].cost_price,
      image_url: req.file ? req.file.path : items[index].image_url
    };

    writeDB(items);
    return res.status(200).json({ message: 'Item updated successfully' });
  } catch (error) {
    console.error('Error updating item:', error);
    return res.status(500).json({ error: 'Failed to update item' });
  }
});

// DELETE ITEM
app.delete('/api/items/:id', (req, res) => {
  try {
    const id = Number(req.params.id);
    let items = readDB();
    items = items.filter(item => item.id !== id);
    writeDB(items);
    return res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete item' });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));