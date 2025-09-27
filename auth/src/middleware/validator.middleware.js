const { body, validationResult } = require('express-validator')

const responWithValidationErrors = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }
  next()
}

const validateRegistration = [
  body('username')
    .isString()
    .withMessage('Username must be a string')
    .isLength({ min: 3, max: 30 })
    .withMessage('Username is allows 3-30 characters'),
  body('email')
    .isEmail()
    .withMessage('Invalid email format'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/[a-z]/)
    .withMessage('Password must contain at least one lowercase letter')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/[0-9]/)
    .withMessage('Password must contain at least one number')
    .matches(/[\W_]/)
    .withMessage('Password must contain at least one special character'),
  body('fullName.firstName')
    .isString()
    .withMessage('First name must be a string')
    .notEmpty()
    .withMessage('First name is required'),
  body('fullName.lastName')
    .isString()
    .withMessage('Last name must be a string')
    .notEmpty()
    .withMessage('Last name is required'),
  responWithValidationErrors
]



module.exports = {
  validateRegistration
}