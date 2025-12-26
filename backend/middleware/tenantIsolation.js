// backend/middleware/tenantIsolation.js
const { errorResponse } = require('../utils/auth');

function tenantIsolation(req, res, next) {
  const user = req.user;

  if (!user) {
    return errorResponse(res, 401, 'Unauthorized');
  }

  // Super admin can access everything (no tenant filter)
  if (user.role === 'super_admin') {
    console.log('Super admin access - no tenant isolation');
    return next();
  }

  // For tenant_admin & user → must have tenantId in token
  if (!user.tenantId) {
    return errorResponse(res, 403, 'Tenant ID missing from token');
  }

  // Attach tenantId to request for controllers to use
  req.tenantId = user.tenantId;
  console.log('Tenant isolation applied - tenantId:', req.tenantId);

  next();
}

module.exports = { tenantIsolation };