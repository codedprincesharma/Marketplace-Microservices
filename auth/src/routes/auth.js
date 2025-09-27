const express = require('express')
const router = express.Router()
const { registerController } = require('../controllers/auth.controller')
const { validateRegistration } = require('../middleware/validator.middleware')

// POST /auth/register
router.post('/register', validateRegistration, registerController)

module.exports = router
