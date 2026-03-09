import { sql, runMigration } from './connection.js';
import fs from 'fs/promises';
import path from 'path';

// Database migration runner
class MigrationRunner {
  constructor() {
    this.migrationsPath = path.join(process.cwd(), 'database', 'migrations');
  }

  // Run all pending migrations
  async runAll() {
    try {
      console.log('🚀 Starting database migrations...');
      
      // Ensure migrations table exists
      await this.ensureMigrationsTable();
      
      // Get all migration files
      const migrationFiles = await this.getMigrationFiles();
      
      // Get already executed migrations
      const executedMigrations = await this.getExecutedMigrations();
      
      // Filter pending migrations
      const pendingMigrations = migrationFiles.filter(
        file => !executedMigrations.includes(path.basename(file, '.sql'))
      );
      
      if (pendingMigrations.length === 0) {
        console.log('✅ All migrations are up to date');
        return { success: true, message: 'All migrations are up to date' };
      }
      
      // Run pending migrations
      for (const migrationFile of pendingMigrations) {
        await this.runMigration(migrationFile);
      }
      
      console.log('✅ All migrations completed successfully');
      return { success: true, message: 'All migrations completed successfully' };
      
    } catch (error) {
      console.error('❌ Migration failed:', error.message);
      throw error;
    }
  }

  // Ensure migrations table exists
  async ensureMigrationsTable() {
    await sql`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP DEFAULT NOW()
      );
    `;
  }

  // Get migration files
  async getMigrationFiles() {
    try {
      const files = await fs.readdir(this.migrationsPath);
      return files
        .filter(file => file.endsWith('.sql'))
        .sort() // Sort to ensure correct order
        .map(file => path.join(this.migrationsPath, file));
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.log('📁 No migrations directory found, creating one...');
        await fs.mkdir(this.migrationsPath, { recursive: true });
        return [];
      }
      throw error;
    }
  }

  // Get executed migrations
  async getExecutedMigrations() {
    const result = await sql`SELECT name FROM migrations ORDER BY executed_at`;
    return result.map(row => row.name);
  }

  // Run a single migration
  async runMigration(filePath) {
    const fileName = path.basename(filePath, '.sql');
    const migrationSQL = await fs.readFile(filePath, 'utf8');
    
    console.log(`📝 Running migration: ${fileName}`);
    
    try {
      await runMigration(fileName, migrationSQL);
      console.log(`✅ Migration completed: ${fileName}`);
    } catch (error) {
      console.error(`❌ Migration failed: ${fileName}`, error.message);
      throw error;
    }
  }

  // Create a new migration file
  async createMigration(name, content) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `${timestamp}-${name}.sql`;
    const filePath = path.join(this.migrationsPath, fileName);
    
    await fs.writeFile(filePath, content);
    console.log(`📄 Migration created: ${fileName}`);
    return filePath;
  }

  // Rollback last migration (if rollback file exists)
  async rollback() {
    const executedMigrations = await this.getExecutedMigrations();
    if (executedMigrations.length === 0) {
      console.log('ℹ️ No migrations to rollback');
      return { success: true, message: 'No migrations to rollback' };
    }
    
    const lastMigration = executedMigrations[executedMigrations.length - 1];
    const rollbackFile = path.join(this.migrationsPath, `${lastMigration}-rollback.sql`);
    
    try {
      const rollbackSQL = await fs.readFile(rollbackFile, 'utf8');
      console.log(`🔄 Rolling back migration: ${lastMigration}`);
      
      await sql.unsafe(rollbackSQL);
      await sql`DELETE FROM migrations WHERE name = ${lastMigration}`;
      
      console.log(`✅ Migration rolled back: ${lastMigration}`);
      return { success: true, message: `Migration rolled back: ${lastMigration}` };
      
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.log(`⚠️ No rollback file found for migration: ${lastMigration}`);
        return { success: false, message: 'No rollback file available' };
      }
      throw error;
    }
  }

  // Get migration status
  async getStatus() {
    const migrationFiles = await this.getMigrationFiles();
    const executedMigrations = await this.getExecutedMigrations();
    
    const pending = migrationFiles.filter(
      file => !executedMigrations.includes(path.basename(file, '.sql'))
    );
    
    return {
      total: migrationFiles.length,
      executed: executedMigrations.length,
      pending: pending.length,
      executedMigrations,
      pendingMigrations: pending.map(file => path.basename(file, '.sql'))
    };
  }
}

// Database seeder
class DatabaseSeeder {
  constructor() {
    this.seedDataPath = path.join(process.cwd(), 'database', 'seeds');
  }

  // Seed all data
  async seedAll() {
    try {
      console.log('🌱 Starting database seeding...');
      
      const seedFiles = await this.getSeedFiles();
      
      for (const seedFile of seedFiles) {
        await this.runSeed(seedFile);
      }
      
      console.log('✅ Database seeding completed');
      return { success: true, message: 'Database seeding completed' };
      
    } catch (error) {
      console.error('❌ Seeding failed:', error.message);
      throw error;
    }
  }

  // Get seed files
  async getSeedFiles() {
    try {
      const files = await fs.readdir(this.seedDataPath);
      return files
        .filter(file => file.endsWith('.sql'))
        .sort()
        .map(file => path.join(this.seedDataPath, file));
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.log('📁 No seeds directory found, creating one...');
        await fs.mkdir(this.seedDataPath, { recursive: true });
        return [];
      }
      throw error;
    }
  }

  // Run a seed file
  async runSeed(filePath) {
    const fileName = path.basename(filePath, '.sql');
    const seedSQL = await fs.readFile(filePath, 'utf8');
    
    console.log(`🌱 Running seed: ${fileName}`);
    
    try {
      await sql.unsafe(seedSQL);
      console.log(`✅ Seed completed: ${fileName}`);
    } catch (error) {
      console.error(`❌ Seed failed: ${fileName}`, error.message);
      throw error;
    }
  }

  // Clear all data (for testing)
  async clearAll() {
    console.log('🧹 Clearing all data...');
    
    // Delete in order of dependencies
    const tables = [
      'audit_log',
      'message_log',
      'channel_sync_log',
      'reports',
      'amenity_inventory',
      'housekeeping',
      'room_rates',
      'payments',
      'reviews',
      'bookings',
      'staff',
      'rooms',
      'hotels',
      'users'
    ];
    
    for (const table of tables) {
      try {
        await sql`DELETE FROM ${sql(table)}`;
        console.log(`🗑️ Cleared table: ${table}`);
      } catch (error) {
        console.log(`⚠️ Could not clear table ${table}:`, error.message);
      }
    }
    
    console.log('✅ All data cleared');
    return { success: true, message: 'All data cleared' };
  }
}

// Database backup utilities
export class DatabaseBackup {
  constructor() {
    this.backupPath = path.join(process.cwd(), 'database', 'backups');
  }

  // Create backup of all tables
  async createBackup(name = null) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupName = name || `backup-${timestamp}`;
    const backupDir = path.join(this.backupPath, backupName);
    
    try {
      await fs.mkdir(backupDir, { recursive: true });
      
      const tables = await this.getAllTables();
      
      for (const table of tables) {
        await this.backupTable(table, backupDir);
      }
      
      console.log(`💾 Backup created: ${backupName}`);
      return { success: true, name: backupName, path: backupDir };
      
    } catch (error) {
      console.error('❌ Backup failed:', error.message);
      throw error;
    }
  }

  // Get all table names
  async getAllTables() {
    const result = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `;
    return result.map(row => row.table_name);
  }

  // Backup single table
  async backupTable(tableName, backupDir) {
    const data = await sql`SELECT * FROM ${sql(tableName)}`;
    const backupFile = path.join(backupDir, `${tableName}.json`);
    
    await fs.writeFile(backupFile, JSON.stringify(data, null, 2));
    console.log(`📄 Backed up table: ${tableName} (${data.length} rows)`);
  }

  // Restore from backup
  async restoreBackup(backupName) {
    const backupDir = path.join(this.backupPath, backupName);
    
    try {
      const tables = await fs.readdir(backupDir);
      
      for (const file of tables) {
        if (file.endsWith('.json')) {
          await this.restoreTable(file, backupDir);
        }
      }
      
      console.log(`🔄 Backup restored: ${backupName}`);
      return { success: true, message: `Backup restored: ${backupName}` };
      
    } catch (error) {
      console.error('❌ Restore failed:', error.message);
      throw error;
    }
  }

  // Restore single table
  async restoreTable(fileName, backupDir) {
    const tableName = path.basename(fileName, '.json');
    const backupFile = path.join(backupDir, fileName);
    const data = JSON.parse(await fs.readFile(backupFile, 'utf8'));
    
    if (data.length === 0) return;
    
    // Get column names from first row
    const columns = Object.keys(data[0]);
    const placeholders = columns.map((_, index) => `$${index + 1}`).join(', ');
    
    // Clear existing data
    await sql`DELETE FROM ${sql(tableName)}`;
    
    // Insert data
    for (const row of data) {
      const values = columns.map(col => row[col]);
      await sql.unsafe(`
        INSERT INTO ${tableName} (${columns.join(', ')})
        VALUES (${placeholders})
      `, values);
    }
    
    console.log(`📄 Restored table: ${tableName} (${data.length} rows)`);
  }

  // List available backups
  async listBackups() {
    try {
      const backups = await fs.readdir(this.backupPath);
      const backupInfo = [];
      
      for (const backup of backups) {
        const backupDir = path.join(this.backupPath, backup);
        const stat = await fs.stat(backupDir);
        
        if (stat.isDirectory()) {
          const files = await fs.readdir(backupDir);
          backupInfo.push({
            name: backup,
            created: stat.birthtime,
            tables: files.length
          });
        }
      }
      
      return backupInfo.sort((a, b) => b.created - a.created);
      
    } catch (error) {
      if (error.code === 'ENOENT') {
        return [];
      }
      throw error;
    }
  }
}

// Export instances
export const migrationRunner = new MigrationRunner();
export const databaseSeeder = new DatabaseSeeder();
export const databaseBackup = new DatabaseBackup();

// CLI functions
export const runMigrations = async () => {
  await migrationRunner.runAll();
};

export const seedDatabase = async () => {
  await databaseSeeder.seedAll();
};

export const createBackup = async (name) => {
  return await databaseBackup.createBackup(name);
};

export const restoreBackup = async (name) => {
  return await databaseBackup.restoreBackup(name);
};

export const getMigrationStatus = async () => {
  return await migrationRunner.getStatus();
};

export const rollbackMigration = async () => {
  return await migrationRunner.rollback();
};
