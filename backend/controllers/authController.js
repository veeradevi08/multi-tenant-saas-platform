// backend/controllers/authController.js
const pool = require('../config/db');
const { hashPassword, comparePassword, generateToken, errorResponse, successResponse } = require('../utils/auth');

async function registerTenant(req, res) {
  const { tenantName, subdomain, adminEmail, adminPassword, adminFullName } = req.body;

  if (!tenantName || !subdomain || !adminEmail || !adminPassword || !adminFullName) {
    return errorResponse(res, 400, 'All fields are required');
  }

  if (adminPassword.length < 8) {
    return errorResponse(res, 400, 'Password must be at least 8 characters');
  }

  try {
    await pool.query('BEGIN');

    const tenantResult = await pool.query(
      `INSERT INTO tenants (name, subdomain) 
       VALUES ($1, $2) 
       RETURNING id, name, subdomain`,
      [tenantName, subdomain.toLowerCase()]
    );

    const tenantId = tenantResult.rows[0].id;

    const passwordHash = await hashPassword(adminPassword);

    const userResult = await pool.query(
      `INSERT INTO users (tenant_id, email, password_hash, full_name, role)
       VALUES ($1, $2, $3, $4, 'tenant_admin')
       RETURNING id, email, full_name, role`,
      [tenantId, adminEmail, passwordHash, adminFullName]
    );

    await pool.query('COMMIT');

    const adminUser = userResult.rows[0];
    const token = generateToken({ ...adminUser, tenant_id: tenantId });

    successResponse(res, 201, {
      tenantId,
      subdomain,
      adminUser,
      token,
      expiresIn: 86400
    }, 'Tenant registered successfully');

  } catch (err) {
    await pool.query('ROLLBACK');
    console.error('REGISTER ERROR:', err.stack);
    if (err.code === '23505') {
      if (err.constraint === 'unique_email_per_tenant') {
        return errorResponse(res, 409, 'Email already exists in this tenant');
      }
      if (err.constraint === 'tenants_subdomain_key') {
        return errorResponse(res, 409, 'Subdomain already taken');
      }
    }
    errorResponse(res, 500, 'Internal server error during registration');
  }
}

async function login(req, res) {
  const { email, password, tenantSubdomain } = req.body;

  console.log('LOGIN REQUEST RECEIVED:', { email, tenantSubdomain });

  if (!email || !password || !tenantSubdomain) {
    return errorResponse(res, 400, 'Email, password, and tenant subdomain are required');
  }

  try {
    console.log('Step 1: Querying tenant...');
    const tenantResult = await pool.query(
      'SELECT id, status FROM tenants WHERE subdomain = $1',
      [tenantSubdomain.toLowerCase()]
    );

    console.log('Tenant query rows:', tenantResult.rows.length);

    if (tenantResult.rows.length === 0) {
      return errorResponse(res, 404, 'Tenant not found');
    }

    const tenant = tenantResult.rows[0];

    if (tenant.status !== 'active') {
      return errorResponse(res, 403, 'Tenant is not active');
    }

    console.log('Step 2: Querying user...');
    const userResult = await pool.query(
      'SELECT id, password_hash, full_name, role, tenant_id, is_active FROM users WHERE email = $1 AND tenant_id = $2',
      [email, tenant.id]
    );

    console.log('User query rows:', userResult.rows.length);

    if (userResult.rows.length === 0) {
      return errorResponse(res, 401, 'Invalid credentials');
    }

    const user = userResult.rows[0];

    if (!user.is_active) {
      return errorResponse(res, 403, 'Account is inactive');
    }

    console.log('Step 3: Comparing password...');
    const passwordMatch = await comparePassword(password, user.password_hash);
    if (!passwordMatch) {
      return errorResponse(res, 401, 'Invalid credentials');
    }

    console.log('Login successful - generating token');
    const token = generateToken(user);

    successResponse(res, 200, {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
        tenantId: user.tenant_id
      },
      token,
      expiresIn: 86400
    }, 'Login successful');

  } catch (err) {
    console.error('LOGIN CRITICAL ERROR:', err.stack);
    errorResponse(res, 500, 'Internal server error during login');
  }
}

async function getCurrentUser(req, res) {
  const userId = req.user.userId;

  console.log('Fetching current user for ID:', userId); // debug

  try {
    const userResult = await pool.query(
      `SELECT id, email, full_name AS "fullName", role, tenant_id AS "tenantId"
       FROM users
       WHERE id = $1`,
      [userId]
    );

    if (userResult.rows.length === 0) {
      return errorResponse(res, 404, 'User not found');
    }

    const user = userResult.rows[0];

    // Optionally fetch tenant info if needed
    let tenantInfo = null;
    if (user.tenantId) {
      const tenantResult = await pool.query(
        'SELECT id, name, subdomain, subscription_plan AS "subscriptionPlan" FROM tenants WHERE id = $1',
        [user.tenantId]
      );
      tenantInfo = tenantResult.rows[0] || null;
    }

    successResponse(res, 200, {
      user,
      tenant: tenantInfo
    }, 'Current user fetched successfully');
  } catch (err) {
    console.error('Get current user error:', err.stack);
    errorResponse(res, 500, 'Internal server error fetching user');
  }
}

module.exports = { registerTenant, login, getCurrentUser };