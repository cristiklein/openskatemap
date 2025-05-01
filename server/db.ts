import knex, { Knex } from 'knex';

let db: Knex;

export async function initDb(inMemory: boolean = false): Promise<Knex> {
  const isProd = process.env.NODE_ENV === 'production';

  db = knex({
    client: isProd ? 'pg' : 'sqlite3',
    connection: isProd
      ? {
          host: process.env.PGHOST,
          port: Number(process.env.PGPORT || 5432),
          ssl: process.env.PGSSLMODE === 'require',
          user: process.env.PGUSER,
          password: process.env.PGPASSWORD,
          database: process.env.PGDATABASE,
        }
      : {
          filename: inMemory ? ':memory:' : '/tmp/openskatemap.sqlite',
        },
    useNullAsDefault: !isProd,
  });

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
