const { body, param, validationResult } = require('express-validator')

const respondWithValidationErrors = (req, res, next) => {
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
  respondWithValidationErrors
]


const validateLogin = [
  body("email")
    .optional()
    .isEmail().withMessage("Invalid email format"),

  body("username")
    .optional()
    .isString().withMessage("Username must be a string"),

  body("password")
    .notEmpty().withMessage("Password is required")
    .isLength({ min: 8 }).withMessage("Password must be at least 8 characters long"),

  (req, res, next) => {
    // Require either email OR username
    if (!req.body.email && !req.body.username) {
      return res
        .status(400)
        .json({ errors: [{ msg: "Either email or username is required" }] });
    }

    // Collect express-validator errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    next();
  },
];

const validateAddress = [
  body('street')
    .isString()
    .notEmpty()
    .withMessage('Street is required'),

  body('city')
    .isString()
    .notEmpty()
    .withMessage('City is required'),

  body('state')
    .isString()
    .notEmpty()
    .withMessage('State is required'),

  body('country')
    .isString()
    .notEmpty()
    .withMessage('Country is required'),

  body('zipCode')
    .isString()
    .withMessage('zipCode must be a string')
    .matches(/^\d+$/)
    .withMessage('zipCode must contain only digits')
    .isLength({ min: 3, max: 10 })
    .withMessage('zipCode length is invalid'),

  body('phone')
    .optional()
    .isMobilePhone('any')
    .withMessage('Invalid phone number'),

  respondWithValidationErrors
];


const validateAddressId = [
  param('addressID')
    .isMongoId()
    .withMessage('Invalid address ID'),

  respondWithValidationErrors
];

module.exports = {
  validateRegistration,
  validateLogin,
  validateAddress,
  validateAddressId
}