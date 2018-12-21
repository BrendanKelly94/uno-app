
exports.up = function(knex, Promise) {
  return knex.schema.createTable('Players', function(table){
    table.increments('id').primary();
    table.integer('game_id').references('id').inTable('Games').notNull().onDelete('cascade');
    table.string('user_name').references('name').inTable('Users').notNull();
    table.boolean('is_host').notNull().defaultTo(false);
    table.boolean('is_bot').notNullable();
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('Players');
};
