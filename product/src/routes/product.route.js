const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload');
const createAuthMiddleware = require('../middlewares/auth.middleware')
const { createProduct } = require('../controllers/product.controller');
const { createProductValidator } = require('../validators/product.validator');


// POST /api/v1/product/product
router.post('/',
  createAuthMiddleware(['admin', 'seller']),
  upload.array('images',5),
  createProductValidator,
  createProduct
);

module.exports = router;

