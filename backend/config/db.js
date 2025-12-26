// backend/config/db.js
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'saas_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres123',
  // Optional: max connections for dev
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Simple connection test on load (helps debug)
pool.on('connect', () => {
  console.log('New client connected to PostgreSQL');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Test connection immediately when file is required
(async () => {
  try {
    await pool.connect();
    console.log('PostgreSQL pool initialized successfully');
  } catch (err) {
    console.error('Failed to initialize PostgreSQL pool:', err.message);
  }
})();

module.exports = pool;