const queries = require('../db/queries.js');

exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  return knex('GameCards').del()
    .then(async () => {
      try{
        await queries.generateDeck({gameId: 1});
        await queries.generateDeck({gameId: 2});
        for(let id = 2; id< 4; id++){
            await queries.generateHand({gameId: 1, playerId: id});
        }
        for(let id = 5; id < 10; id++){
            await queries.generateHand({gameId: 2, playerId: id});
        }

        await queries.setFirstCardInPlay({gameId: 1});
        await queries.setFirstCardInPlay({gameId: 2});

        //set up specific deck for testing
        const customHand = [];
        await queries.customHand({gameId: 1,playerId: 1})
        await queries.customHand({gameId: 2,playerId: 4});

      }catch(e){
        console.log(e);
      }

    });
};
