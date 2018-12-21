
exports.up = function(knex, Promise) {
  return knex.schema.createTable('GameCards', function(table) {
    table.increments('id').primary();
    table.integer('player_id').references('id').inTable('Players').onDelete('cascade');
    table.integer('game_id').references('id').inTable('Games').notNull().onDelete('cascade');
    table.string('color').notNull();
    table.integer('value').notNull();
    table.boolean('is_in_play').notNull();
    table.boolean('is_available').notNull();
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('GameCards');
};
