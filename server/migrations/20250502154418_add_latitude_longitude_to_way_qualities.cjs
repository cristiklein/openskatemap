/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  await knex.schema.table('way_qualities', (table) => {
    table.float('latitude').nullable();
    table.float('longitude').nullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  await knex.schema.table('way_qualities', (table) => {
    table.dropColumn('latitude');
    table.dropColumn('longitude');
  });
};
