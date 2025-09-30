const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload');
const { createProduct } = require('../controllers/product.controller');


// POST /api/v1/product/product
router.post('/', upload.array('image', 5), createProduct);

module.exports = router;

