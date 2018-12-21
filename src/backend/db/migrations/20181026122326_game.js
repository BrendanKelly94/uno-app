
exports.up = function(knex, Promise) {
  return knex.schema.createTable('Games', function(table){
    table.increments('id').primary();
    table.boolean('has_started').notNullable().defaultTo(false);
    table.boolean('direction').notNullable().defaultTo(true);
    table.integer('turn_id');
    table.integer('player_count').notNullable().defaultTo(0);
    table.boolean('bot_fill').notNullable().defaultTo(false);

  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('Games');
};
