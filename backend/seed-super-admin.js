// backend/seed-super-admin.js
const pool = require('./config/db');
const bcrypt = require('bcrypt');

const superAdminEmail = 'superadmin@system.com';
const superAdminPassword = 'Admin@123'; 
const superAdminName = 'Super Admin';

async function seedSuperAdmin() {
  try {
    // Check if super admin already exists
    const checkQuery = 'SELECT * FROM users WHERE email = $1 AND role = $2';
    const checkResult = await pool.query(checkQuery, [superAdminEmail, 'super_admin']);

    if (checkResult.rows.length > 0) {
      console.log('Super admin already exists. Skipping creation.');
      return;
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(superAdminPassword, saltRounds);

    // Insert super admin (tenant_id = NULL)
    const insertQuery = `
      INSERT INTO users (email, password_hash, full_name, role, tenant_id, is_active)
      VALUES ($1, $2, $3, $4, NULL, true)
      RETURNING id, email, role
    `;

    const result = await pool.query(insertQuery, [
      superAdminEmail,
      passwordHash,
      superAdminName,
      'super_admin'
    ]);

    console.log('✅ Super Admin created successfully!');
    console.log('Details:', result.rows[0]);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
  } finally {
    pool.end();
  }
}

seedSuperAdmin();