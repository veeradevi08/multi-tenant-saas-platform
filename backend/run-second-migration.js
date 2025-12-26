const pool = require('./config/db');
const fs = require('fs');
const path = require('path');

const migrationPath = path.join(__dirname, 'migrations', '002_create_users.sql');
const sql = fs.readFileSync(migrationPath, 'utf8');

console.log('Running migration: 002_create_users.sql...');

pool.query(sql)
  .then(res => {
    console.log('✅ Users table created successfully!');
    console.log('You can now verify in the database.');
    pool.end();
  })
  .catch(err => {
    console.error('❌ Migration failed:', err.message);
    pool.end();
  });