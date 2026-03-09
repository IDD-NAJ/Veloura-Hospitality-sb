import postgres from 'postgres';

// Database connection configuration
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required. Make sure dotenv is loaded before importing this module.');
}

// Initialize PostgreSQL client (works with Supabase, Neon, or any PostgreSQL)
export const sql = postgres(DATABASE_URL, {
  ssl: 'require',
  max: 10,
  idle_timeout: 20,
  connect_timeout: 30,
  max_lifetime: 60 * 10,
});

// Database connection test
export const testConnection = async () => {
  try {
    const result = await sql`SELECT NOW() as current_time, version() as version`;
    console.log('✅ Database connected successfully');
    console.log(`📅 Server time: ${result[0].current_time}`);
    console.log(`🗄️  PostgreSQL version: ${result[0].version}`);
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
};

// Database health check
export const healthCheck = async () => {
  try {
    const result = await sql`
      SELECT 
        'healthy' as status,
        NOW() as timestamp,
        version() as version,
        current_database() as database
    `;
    return {
      status: 'healthy',
      timestamp: result[0].timestamp,
      version: result[0].version,
      database: result[0].database
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
};

// Transaction helper
export const transaction = async (callback) => {
  return await sql.begin(async (tx) => {
    return await callback(tx);
  });
};

// Query helper with error handling
export const query = async (queryFn, ...args) => {
  try {
    const result = await queryFn(...args);
    return result;
  } catch (error) {
    console.error('Database query error:', {
      query: queryFn.toString?.() || 'Unknown query',
      args,
      error: error.message
    });
    throw new DatabaseError(error.message, error.code);
  }
};

// Custom error class for database errors
export class DatabaseError extends Error {
  constructor(message, code = 'DB_ERROR') {
    super(message);
    this.name = 'DatabaseError';
    this.code = code;
  }
}

// Connection pool monitoring
export const getConnectionStats = async () => {
  try {
    const result = await sql`
      SELECT 
        count(*) as active_connections,
        count(*) FILTER (WHERE state = 'active') as active_queries,
        count(*) FILTER (WHERE state = 'idle') as idle_connections
      FROM pg_stat_activity 
      WHERE datname = current_database()
    `;
    return result[0];
  } catch (error) {
    console.error('Failed to get connection stats:', error.message);
    return null;
  }
};

// Table existence checker
export const tableExists = async (tableName) => {
  try {
    const result = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = ${tableName}
      );
    `;
    return result[0].exists;
  } catch (error) {
    console.error(`Failed to check table existence for ${tableName}:`, error.message);
    return false;
  }
};

// Row count helper
export const getRowCount = async (tableName, whereClause = '') => {
  try {
    const query = `SELECT COUNT(*) as count FROM ${tableName} ${whereClause}`;
    const result = await sql.unsafe(query);
    return parseInt(result[0].count);
  } catch (error) {
    console.error(`Failed to get row count for ${tableName}:`, error.message);
    return 0;
  }
};

// Pagination helper
export const paginate = async (queryFn, page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  try {
    const [data, countResult] = await Promise.all([
      queryFn(),
      sql`SELECT COUNT(*) as total FROM (${queryFn}) as count_subquery`
    ]);
    
    const total = parseInt(countResult[0].total);
    const totalPages = Math.ceil(total / limit);
    
    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    };
  } catch (error) {
    console.error('Pagination error:', error.message);
    throw error;
  }
};

// Database migration helper
export const runMigration = async (migrationName, migrationSQL) => {
  try {
    // Create migrations table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP DEFAULT NOW()
      );
    `;

    // Check if migration has already been run
    const existing = await sql`
      SELECT name FROM migrations WHERE name = ${migrationName}
    `;

    if (existing.length > 0) {
      console.log(`⏭️  Migration ${migrationName} already executed`);
      return { status: 'skipped', migration: migrationName };
    }

    // Execute migration
    await sql.unsafe(migrationSQL);
    
    // Record migration
    await sql`
      INSERT INTO migrations (name) VALUES (${migrationName})
    `;

    console.log(`✅ Migration ${migrationName} executed successfully`);
    return { status: 'success', migration: migrationName };
  } catch (error) {
    console.error(`❌ Migration ${migrationName} failed:`, error.message);
    throw error;
  }
};

// Backup helper (for development/testing)
export const createBackup = async (tableName) => {
  try {
    const data = await sql`SELECT * FROM ${sql(tableName)}`;
    const backup = {
      table: tableName,
      timestamp: new Date().toISOString(),
      data: data
    };
    
    // In production, this would save to a file or cloud storage
    console.log(`📦 Backup created for table ${tableName}: ${data.length} rows`);
    return backup;
  } catch (error) {
    console.error(`Failed to create backup for ${tableName}:`, error.message);
    throw error;
  }
};

// Performance monitoring
export const getSlowQueries = async (thresholdMs = 1000) => {
  try {
    const result = await sql`
      SELECT 
        query,
        calls,
        total_exec_time,
        mean_exec_time,
        rows
      FROM pg_stat_statements 
      WHERE mean_exec_time > ${thresholdMs / 1000}
      ORDER BY mean_exec_time DESC
      LIMIT 10
    `;
    return result;
  } catch (error) {
    console.error('Failed to get slow queries:', error.message);
    return [];
  }
};

// Database size information
export const getDatabaseSize = async () => {
  try {
    const result = await sql`
      SELECT 
        pg_size_pretty(pg_database_size(current_database())) as database_size,
        pg_size_pretty(pg_total_relation_size('public.users')) as users_size,
        pg_size_pretty(pg_total_relation_size('public.bookings')) as bookings_size,
        pg_size_pretty(pg_total_relation_size('public.rooms')) as rooms_size,
        pg_size_pretty(pg_total_relation_size('public.hotels')) as hotels_size
    `;
    return result[0];
  } catch (error) {
    console.error('Failed to get database size:', error.message);
    return null;
  }
};

// Export default client for backward compatibility
export default sql;
