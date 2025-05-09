import knex, { Knex } from 'knex';
import knexConfig from './knexfile';
import { beforeAll, afterAll, describe, it, expect } from 'vitest';

let db : Knex;

beforeAll(async () => {
  db = knex(knexConfig); // use a test config, e.g., SQLite memory
  await db.migrate.rollback(undefined, true); // reset all
  await db.migrate.latest(); // apply migrations
});

afterAll(async () => {
  await db.destroy();
});

describe('Migrations', () => {
  it('creates the way_qualities table', async () => {
    const exists = await db.schema.hasTable('way_qualities');
    expect(exists).toBe(true);
  });

  it('way_qualities table has expected columns', async () => {
    const columns = await db('way_qualities').columnInfo();
    expect(columns).toHaveProperty('id');
    expect(columns).toHaveProperty('latitude');
    expect(columns).toHaveProperty('longitude');
  });

  it('can rollback the migration', async () => {
    await db.migrate.rollback();
    const exists = await db.schema.hasTable('way_qualities');
    expect(exists).toBe(false);
  });

  it('preserves data during migration', async () => {
    await db.migrate.rollback(undefined, true);
    await db.migrate.up({ name: '20250502153508_create_way_qualities_table.cjs' });
    await db('way_qualities').insert({ way_id: 111, quality: 0, timestamp: Date.now()});
    await db.migrate.latest();

    const wq = await db('way_qualities').first();
    expect(wq.way_id).toBe(111);
    expect(wq.quality).toBe(0);

    await db.migrate.down();

    const wq2 = await db('way_qualities').first();
    expect(wq2.way_id).toBe(111);
    expect(wq2.quality).toBe(0);
  });
});
