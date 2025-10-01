const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload');
const createAuthMiddleware = require('../middlewares/auth.middleware')
const { createProductValidator } = require('../validators/product.validator');
const { createProduct, getProduct, getProductById, updateProduct, deleteProduct } = require('../controllers/product.controller');


// POST /api/v1/product/product
router.post('/',
  createAuthMiddleware(['admin', 'seller']),
  upload.array('images', 5),
  createProductValidator,
  createProduct
);

router.get('/', getProduct)
router.get('/:id', getProductById)
router.patch('/:id', createAuthMiddleware(['admin', 'seller']), updateProduct)
router.delete('/:id', createAuthMiddleware(['admin', 'seller']), deleteProduct)


module.exports = router;

