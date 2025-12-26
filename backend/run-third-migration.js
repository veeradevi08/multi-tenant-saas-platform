const pool = require('./config/db');
const fs = require('fs');
const path = require('path');

const migrationPath = path.join(__dirname, 'migrations', '003_create_projects.sql');
const sql = fs.readFileSync(migrationPath, 'utf8');

console.log('Running migration: 003_create_projects.sql...');

pool.query(sql)
  .then(() => {
    console.log('✅ Projects table created successfully!');
    pool.end();
  })
  .catch(err => {
    console.error('❌ Migration failed:', err.message);
    pool.end();
  });