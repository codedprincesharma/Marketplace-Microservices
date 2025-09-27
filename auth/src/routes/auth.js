const express = require('express')
const router = express.Router()
const { registerController, loginController } = require('../controllers/auth.controller')
const { validateRegistration, validateLogin } = require('../middleware/validator.middleware')

// POST /auth/register
router.post('/register', validateRegistration, registerController)
// POST /auth/login
router.post('/login', validateLogin, loginController)

module.exports = router
