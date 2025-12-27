const pool = require('./config/db');
const fs = require('fs');
const path = require('path');

async function runMigrations() {
  const migrationsDir = path.join(__dirname, 'migrations');

  // Read all .sql files
  let files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort(); // very important: 000_, 001_, 002_ order

  console.log('Migrations to run:', files);

  for (const file of files) {
    const filePath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(filePath, 'utf8');

    console.log(`Running migration: ${file}...`);
    try {
      await pool.query(sql);
      console.log(`  Success: ${file}`);
    } catch (err) {
      console.error(`  Error in ${file}:`, err.message);
      throw err;   // stop on failure (important for docker)
    }
  }

  console.log('All migrations completed successfully!');
  await pool.end();
}

runMigrations().catch(err => {
  console.error('Migration runner failed:', err.message);
  process.exit(1);
});
