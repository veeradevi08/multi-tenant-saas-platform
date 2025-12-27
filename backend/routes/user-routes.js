// backend/routes/user-routes.js
const express = require('express');
const { addUser, listUsers, updateUser, deleteUser } = require('../controllers/userController');
const { authenticate, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Only tenant_admin can manage users
router.use(authorizeRoles('tenant_admin'));

// Tenant-scoped routes
router.post('/:tenantId/users', addUser);
router.get('/:tenantId/users', listUsers);
router.put('/users/:userId', updateUser);
router.delete('/users/:userId', deleteUser);

module.exports = router;
