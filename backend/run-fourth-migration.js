const pool = require('./config/db');
const fs = require('fs');
const path = require('path');

const migrationPath = path.join(__dirname, 'migrations', '004_create_tasks.sql');
const sql = fs.readFileSync(migrationPath, 'utf8');

console.log('Running migration: 004_create_tasks.sql...');

pool.query(sql)
  .then(() => {
    console.log('✅ Tasks table created successfully!');
    pool.end();
  })
  .catch(err => {
    console.error('❌ Migration failed:', err.message);
    pool.end();
  });