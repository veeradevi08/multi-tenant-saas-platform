// backend/seed-super-admin.js
const pool = require('./config/db');
const bcrypt = require('bcrypt');

async function seedSuperAdmin() {
  try {
    const hashedPassword = await bcrypt.hash('Admin@123', 12);

    await pool.query(`
      INSERT INTO users (email, password_hash, full_name, role, tenant_id)
      VALUES ($1, $2, $3, $4, NULL)
      ON CONFLICT (email) DO NOTHING;
    `, ['superadmin@system.com', hashedPassword, 'Super Admin', 'super_admin']);

    console.log('Super admin seeded successfully!');
  } catch (err) {
    console.error('Seed failed:', err.message);
  } finally {
    pool.end();
  }
}

seedSuperAdmin();