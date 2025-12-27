// backend/utils/auth.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = '24h';

// Ensure tenantId is always included in token
function generateToken(user) {
  const payload = {
    userId: user.id,
    tenantId: user.tenantId || user.tenant_id || null,  // ensure correct mapping
    role: user.role,
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

async function hashPassword(password) {
  return bcrypt.hash(password, 12);
}

async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

function errorResponse(res, status, message) {
  res.status(status).json({ success: false, message });
}

function successResponse(res, status, data, message = '') {
  res.status(status).json({ success: true, message, data });
}

module.exports = {
  generateToken,
  hashPassword,
  comparePassword,
  errorResponse,
  successResponse
};
