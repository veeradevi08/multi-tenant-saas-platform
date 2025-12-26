// backend/routes/user-routes.js
const express = require('express');
const { addUser, listUsers, updateUser, deleteUser } = require('../controllers/userController');
const { authenticate, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

// All user routes require authentication + tenant_admin role
router.use(authenticate, authorizeRoles('tenant_admin'));

router.post('/:tenantId/users', addUser);
router.get('/:tenantId/users', listUsers);
router.put('/users/:userId', updateUser);
router.delete('/users/:userId', deleteUser);

module.exports = router;