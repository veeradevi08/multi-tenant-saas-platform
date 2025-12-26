// backend/routes/auth-routes.js
const express = require('express');
const { registerTenant, login, getCurrentUser } = require('../controllers/authController');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

// Tenant Registration - Public
router.post('/register-tenant', registerTenant);

// User Login - Public
router.post('/login', login);

// Get Current User - Protected (requires token)
router.get('/me', authenticate, getCurrentUser);

console.log('Auth routes file executed - router created');

module.exports = router;