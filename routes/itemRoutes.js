const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');
const { upload } = require('../config/cloudinary');

router.get('/', itemController.getItems);
router.post('/', upload.single('image'), itemController.addItem);
router.patch('/:id/quantity', itemController.updateQuantity);

// Yeh line sabse zaroori hai:
module.exports = router;