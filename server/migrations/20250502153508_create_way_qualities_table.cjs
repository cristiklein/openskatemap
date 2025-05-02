/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  await knex.schema.createTable('way_qualities', (table) => {
    table.increments('id').primary();
    table.integer('way_id').notNullable();
    table.integer('quality').notNullable();
    table.timestamp('timestamp').notNullable();
    table.string('ip');
  });

  // Create index
  await knex.schema.raw(`
    CREATE INDEX IF NOT EXISTS idx_way_timestamp ON way_qualities (way_id, timestamp)
  `);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  await knex.schema.dropTableIfExists('way_qualities');
};
