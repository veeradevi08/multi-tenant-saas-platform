const pool = require('./config/db');
const fs = require('fs');
const path = require('path');

const migrationPath = path.join(__dirname, 'migrations', '001_create_tenants.sql');
const sql = fs.readFileSync(migrationPath, 'utf8');

console.log('Running migration: 001_create_tenants.sql...');

pool.query(sql)
  .then(res => {
    console.log('✅ Tenants table created successfully!');
    console.log('You can now verify in the database.');
    pool.end();
  })
  .catch(err => {
    console.error('❌ Migration failed:', err.message);
    pool.end();
  });