
exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  return knex('Players').del()
    .then(function () {
      // Inserts seed entries
      return knex('Players').insert([
        {user_name: 'brendan', game_id: 1, is_host: true, is_bot: false},
        {user_name: 'brendan1', game_id: 1, is_bot: false},
        {user_name: 'brendan2', game_id: 1, is_bot: false},
        {user_name: 'bren', game_id: 2, is_host: true, is_bot: false},
        {user_name: 'bot', game_id: 2, is_bot: true},
        {user_name: 'bot', game_id: 2, is_bot: true},
        {user_name: 'bot', game_id: 2, is_bot: true},
        {user_name: 'bot', game_id: 2, is_bot: true},
        {user_name: 'bot',game_id: 2, is_bot: true},
      ]);
      return;
   });
};
