import knex, { Knex } from 'knex';
import knexConfig from './knexfile';
import logger from './logger';

let db: Knex;

export async function initDb(): Promise<Knex> {
  db = knex(knexConfig);

  const migrations = await db.migrate.list();
  logger.info({ migrations }, 'Running migrations ...');
  await db.migrate.latest();
  logger.info('Migrations applied successfully!');

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
