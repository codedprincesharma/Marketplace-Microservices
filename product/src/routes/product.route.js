const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload');
const createAuthMiddleware = require('../middlewares/auth.middleware')
const { createProductValidator } = require('../validators/product.validator');
const { createProduct, getProduct, getProductById } = require('../controllers/product.controller');


// POST /api/v1/product/product
router.post('/',
  createAuthMiddleware(['admin', 'seller']),
  upload.array('images', 5),
  createProductValidator,
  createProduct
);

router.get('/', createAuthMiddleware(['admin', 'seller', 'user']), getProduct)
router.get('/:id', createAuthMiddleware(['admin', 'seller', 'user']), getProductById)

module.exports = router;

