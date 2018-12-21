
exports.up = function(knex, Promise) {
  return knex.schema.createTable('Users', function(table){
      table.string('name').notNullable().primary().unique();
      table.string('pwd').notNullable();
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('Users');
};
