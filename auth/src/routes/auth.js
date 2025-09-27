const express = require('express')
const router = express.Router()
const { registerController, loginController, getCurrentUser } = require('../controllers/auth.controller')
const { validateRegistration, validateLogin } = require('../middleware/validator.middleware')
const { authMiddleware } = require('../middleware/auth.middleware')

// POST /auth/register
router.post('/register', validateRegistration, registerController)
// POST /auth/login
router.post('/login', validateLogin, loginController)
router.get('/me', authMiddleware, getCurrentUser)

module.exports = router
