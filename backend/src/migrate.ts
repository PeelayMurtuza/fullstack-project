import { BackendApplication } from './application';

export async function migrate(args: string[]) {
  const existingSchema = args.includes('--rebuild') ? 'drop' : 'alter';
  console.log(`Migrating schemas, attempting to ${existingSchema} the existing schema`);

  const app = new BackendApplication();
  try {
    // Boot the app and apply the migrations for the specified models
    await app.boot();
    await app.migrateSchema({ existingSchema, models: ['Pizza', 'User', 'Order'] });

    // Success message
    console.log('Schema migration completed successfully.');

  } catch (err) {
    // Handle errors during migration
    console.error('Error migrating database schema:', err);
    process.exit(1);
  }

  // Exit the process explicitly once migration is done
  process.exit(0);
}

// Execute the migration with the provided arguments
migrate(process.argv).catch(err => {
  console.error('Cannot migrate database schema', err);
  process.exit(1);
});
