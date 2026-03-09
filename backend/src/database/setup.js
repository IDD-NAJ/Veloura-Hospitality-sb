import dotenv from 'dotenv';
dotenv.config();

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import postgres from 'postgres';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use DIRECT_URL (session pooler) for DDL operations if available,
// otherwise fall back to DATABASE_URL (transaction pooler)
const connUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!connUrl) {
  console.error('❌ DATABASE_URL or DIRECT_URL is required');
  process.exit(1);
}

const sql = postgres(connUrl, {
  ssl: 'require',
  max: 1,
  connect_timeout: 15
});

// Path to schema.sql (backend/database/schema.sql)
const SCHEMA_PATH = path.join(__dirname, '..', '..', 'database', 'schema.sql');

// Apply the base schema
const applySchema = async () => {
  console.log('📐 Applying database schema...\n');

  try {
    const schemaSql = await fs.readFile(SCHEMA_PATH, 'utf8');

    // Split by semicolons but keep functions/triggers intact
    // We run the whole file as one unsafe query
    await sql.unsafe(schemaSql);

    console.log('✅ Schema applied successfully\n');
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.error(`❌ Schema file not found at: ${SCHEMA_PATH}`);
    } else {
      console.error('❌ Schema application failed:', error.message);
    }
    throw error;
  }
};

// Run migrations from database/migrations/
const MIGRATIONS_PATH = path.join(__dirname, '..', '..', 'database', 'migrations');
const runMigrations = async () => {
  console.log('🔄 Running migrations...\n');
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP DEFAULT NOW()
      )
    `;
    const files = await fs.readdir(MIGRATIONS_PATH).catch(() => []);
    const sqlFiles = files.filter(f => f.endsWith('.sql')).sort();
    const executed = (await sql`SELECT name FROM migrations ORDER BY executed_at`).map(r => r.name);
    const pending = sqlFiles.filter(f => !executed.includes(path.basename(f, '.sql')));
    if (pending.length === 0) {
      console.log('✅ All migrations are up to date\n');
      return;
    }
    for (const file of pending) {
      const name = path.basename(file, '.sql');
      const content = await fs.readFile(path.join(MIGRATIONS_PATH, file), 'utf8');
      await sql.unsafe(content);
      await sql`INSERT INTO migrations (name) VALUES (${name})`;
      console.log(`✅ Migration: ${name}`);
    }
    console.log('');
  } catch (error) {
    if (error.code === 'ENOENT') {
      await fs.mkdir(MIGRATIONS_PATH, { recursive: true });
      console.log('📁 Created migrations directory\n');
    } else {
      throw error;
    }
  }
};

// Run seed data
const SEEDS_PATH = path.join(__dirname, '..', '..', 'database', 'seeds');
const runSeed = async () => {
  console.log('🌱 Running seed data...\n');
  try {
    const files = await fs.readdir(SEEDS_PATH).catch(() => []);
    const sqlFiles = files.filter(f => f.endsWith('.sql')).sort();
    if (sqlFiles.length === 0) {
      console.log('ℹ️  No seed files found\n');
      return;
    }
    for (const file of sqlFiles) {
      const name = path.basename(file, '.sql');
      const content = await fs.readFile(path.join(SEEDS_PATH, file), 'utf8');
      console.log(`🌱 Running seed: ${name}`);
      await sql.unsafe(content);
      console.log(`✅ Seed completed: ${name}`);
    }
    console.log('');
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    throw error;
  }
};

// Full setup: schema + migrations + seed
const setupAll = async () => {
  await applySchema();
  await runMigrations();
  await runSeed();
};

// Reset: drop all tables, reapply schema, re-seed
const resetDatabase = async () => {
  console.log('⚠️  Resetting database (dropping all tables)...\n');

  // Get all tables
  const tables = await sql`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
  `;

  if (tables.length > 0) {
    const tableNames = tables.map(t => t.table_name).join(', ');
    await sql.unsafe(`DROP TABLE IF EXISTS ${tableNames} CASCADE`);
    console.log(`🗑️  Dropped tables: ${tableNames}\n`);
  }

  // Drop functions
  const functions = await sql`
    SELECT routines.routine_name
    FROM information_schema.routines
    WHERE routines.specific_schema = 'public'
    AND routines.routine_type = 'FUNCTION'
  `;

  for (const fn of functions) {
    try {
      await sql.unsafe(`DROP FUNCTION IF EXISTS ${fn.routine_name} CASCADE`);
    } catch (e) {
      // ignore
    }
  }

  // Drop views
  const views = await sql`
    SELECT table_name 
    FROM information_schema.views 
    WHERE table_schema = 'public'
  `;

  for (const view of views) {
    try {
      await sql.unsafe(`DROP VIEW IF EXISTS ${view.table_name} CASCADE`);
    } catch (e) {
      // ignore
    }
  }

  console.log('✅ Database cleared\n');

  // Re-apply everything
  await setupAll();
};

// CLI handler
const command = process.argv[2] || 'all';

const run = async () => {
  try {
    // Test connection
    const result = await sql`SELECT NOW() as current_time`;
    console.log(`\n✅ Database connected at ${result[0].current_time}\n`);

    switch (command) {
      case 'schema':
        await applySchema();
        break;
      case 'migrate':
        await applySchema();
        await runMigrations();
        break;
      case 'seed':
        await runSeed();
        break;
      case 'all':
      case 'setup':
        await setupAll();
        break;
      case 'reset':
        await resetDatabase();
        break;
      default:
        console.log('Usage: node src/database/setup.js [schema|migrate|seed|all|reset]');
        process.exit(1);
    }

    console.log('🎉 Done!\n');
    await sql.end();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Failed:', error.message);
    if (process.env.NODE_ENV === 'development') {
      console.error(error.stack);
    }
    await sql.end();
    process.exit(1);
  }
};

run();
