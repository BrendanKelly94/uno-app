
exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  return knex('Games').del()
    .then(function () {
      // Inserts seed entries
      return knex('Games').insert([
        {bot_fill: false, player_count: 3, turn_id: 1},
        {bot_fill: true, player_count: 6, turn_id: 4}
      ]);
    });
};
