// backend/config/db.js
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'saas_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres123',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

// Handle unexpected errors on idle clients (prevents crash)
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err.message);
  // Do not exit process — let pool recover
});

// Optional: Log connection events
pool.on('connect', () => {
  console.log('New client connected to PostgreSQL');
});

pool.on('acquire', () => {
  console.log('Client acquired from pool');
});

pool.on('remove', () => {
  console.log('Client removed from pool');
});

console.log('PostgreSQL pool initialized successfully');

module.exports = pool;