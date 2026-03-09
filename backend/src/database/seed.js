import dotenv from 'dotenv';
dotenv.config();

// Dynamic imports so dotenv loads first
const { sql } = await import('./connection.js');
const { databaseSeeder } = await import('./migrate.js');

const run = async () => {
  try {
    console.log('🌱 Starting database seeding...\n');

    // Check database connection first
    const result = await sql`SELECT NOW() as current_time`;
    console.log(`✅ Database connected at ${result[0].current_time}\n`);

    // Run all seed files from database/seeds/
    await databaseSeeder.seedAll();

    console.log('\n🎉 Seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Seeding failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
};

run();
