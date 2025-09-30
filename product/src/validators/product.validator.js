const { body } = require('express-validator');
const handelVAlidationError = require('../middlewares/validate')

const createProductValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('title is required'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('description is required')
    .isLength({ max: 500 })
    .withMessage('description max lenght is 500 characters'),
  body('priceAmount')
    .notEmpty()
    .withMessage('priceAmount is required')
    .bail()
    .isNumeric()
    .withMessage('priceAmount must be a number')
    .bail()
    .custom(value => Number(value) > 0)
    .withMessage('priceAmount must be greater than 0'),

  body('priceCurrency')
    .optional()
    .isIn(['INR', 'USD'])
    .withMessage('priceCurrency must be INR or USD'),

  // seller is taken from req.user in controller; but still allow passing seller in body optionally
  body('seller')
    .optional()
    .isMongoId()
    .withMessage('seller must be a valid Mongo id'),
  handelVAlidationError
];



module.exports = { createProductValidator };
