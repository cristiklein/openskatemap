import knex, { Knex } from 'knex';
import knexConfig from './knexfile';

let db: Knex;

export async function initDb(): Promise<Knex> {
  db = knex(knexConfig);

  await db.schema.hasTable('way_qualities').then(async (exists) => {
    if (!exists) {
      await db.schema.createTable('way_qualities', (table) => {
        table.increments('id').primary();
        table.integer('way_id').notNullable();
        table.integer('quality').notNullable();
        table.timestamp('timestamp').notNullable();
        table.string('ip');
      });

      await db.schema.raw(`
        CREATE INDEX IF NOT EXISTS idx_way_timestamp ON way_qualities (way_id, timestamp)
      `);
    }
  });

  return db;
}

export function getDb(): Knex {
  if (!db) throw new Error('Database not initialized');
  return db;
}

export async function deinitDb() {
  if (!db) throw new Error('Database not initialized');
  await db.destroy();
}
