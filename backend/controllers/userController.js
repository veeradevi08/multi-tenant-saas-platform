// backend/controllers/userController.js
const pool = require('../config/db');
const { hashPassword, errorResponse, successResponse } = require('../utils/auth');

async function addUser(req, res) {
  const tenantId = req.tenantId;
  const { email, password, fullName, role = 'user' } = req.body;

  if (!email || !password || !fullName) {
    return errorResponse(res, 400, 'Email, password, and full name required');
  }

  try {
    // Check limit
    const count = await pool.query('SELECT COUNT(*) AS count FROM users WHERE tenant_id = $1', [tenantId]);
    const current = parseInt(count.rows[0].count);

    const tenant = await pool.query('SELECT max_users FROM tenants WHERE id = $1', [tenantId]);
    if (current >= tenant.rows[0].max_users) {
      return errorResponse(res, 403, 'Subscription limit reached: max users exceeded');
    }

    const passwordHash = await hashPassword(password);

    const result = await pool.query(
      `INSERT INTO users (tenant_id, email, password_hash, full_name, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, full_name, role, is_active`,
      [tenantId, email, passwordHash, fullName, role]
    );

    successResponse(res, 201, { user: result.rows[0] }, 'User created');
  } catch (err) {
    if (err.code === '23505') return errorResponse(res, 409, 'Email already exists');
    errorResponse(res, 500, 'Error creating user');
  }
}

async function listUsers(req, res) {
  const tenantId = req.tenantId;

  try {
    const result = await pool.query(
      'SELECT id, email, full_name AS "fullName", role, is_active FROM users WHERE tenant_id = $1 ORDER BY created_at DESC',
      [tenantId]
    );
    successResponse(res, 200, { users: result.rows }, 'Users list');
  } catch (err) {
    errorResponse(res, 500, 'Error fetching users');
  }
}

async function updateUser(req, res) {
  const { userId } = req.params;
  const tenantId = req.tenantId;
  const { fullName, role, isActive } = req.body;

  const canUpdateRole = req.user.role === 'tenant_admin';

  try {
    const fields = [];
    const values = [];
    let idx = 1;

    if (fullName) {
      fields.push(`full_name = $${idx++}`);
      values.push(fullName);
    }
    if (canUpdateRole && role) {
      fields.push(`role = $${idx++}`);
      values.push(role);
    }
    if (canUpdateRole && isActive !== undefined) {
      fields.push(`is_active = $${idx++}`);
      values.push(isActive);
    }

    if (fields.length === 0) return errorResponse(res, 400, 'No fields to update');

    values.push(tenantId, userId);
    const query = `
      UPDATE users
      SET ${fields.join(', ')}
      WHERE tenant_id = $${idx++} AND id = $${idx}
      RETURNING id, email, full_name, role, is_active
    `;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) return errorResponse(res, 404, 'User not found');

    successResponse(res, 200, { user: result.rows[0] }, 'User updated');
  } catch (err) {
    errorResponse(res, 500, 'Error updating user');
  }
}

async function deleteUser(req, res) {
  const { userId } = req.params;
  const tenantId = req.tenantId;
  const currentUserId = req.user.userId;

  if (userId === currentUserId) return errorResponse(res, 403, 'Cannot delete yourself');

  try {
    const result = await pool.query(
      'DELETE FROM users WHERE tenant_id = $1 AND id = $2 RETURNING id',
      [tenantId, userId]
    );

    if (result.rows.length === 0) return errorResponse(res, 404, 'User not found');

    successResponse(res, 200, {}, 'User deleted');
  } catch (err) {
    errorResponse(res, 500, 'Error deleting user');
  }
}

module.exports = { addUser, listUsers, updateUser, deleteUser };