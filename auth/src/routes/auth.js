const express = require('express')
const router = express.Router()
const { registerController, loginController, getCurrentUser, logoutController } = require('../controllers/auth.controller')
const { validateRegistration, validateLogin } = require('../middleware/validator.middleware')
const { authMiddleware } = require('../middleware/auth.middleware')

// POST /auth/register
router.post('/register', validateRegistration, registerController)
// POST /auth/login
router.post('/login', validateLogin, loginController)
// Get current user profile
router.get('/me', authMiddleware, getCurrentUser)
// POST /auth/logout
router.post('/logout', logoutController)

module.exports = router
