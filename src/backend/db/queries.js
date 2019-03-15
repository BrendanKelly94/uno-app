const knex = require('./knex.js');

//Users

const addUser = async ({name, pwd}) => {
  return knex('Users')
         .insert({name: name, pwd: pwd})
         .returning('name')
}

const getUsers = () => {
    return knex('Users').select();
}

const findUser = ({name}) => {
    return knex('Users').where({name: name}).select();
}


//Games

const getGames = () => {
  return knex('Games')
        .where('has_started', false)
        .select();
}

const findGame = ({gameId}) => {
  return knex('Games')
         .where('id', gameId)
         .select();
}

const createGame = async ({botFill}) => {
    return knex('Games')
    .insert({bot_fill: botFill})
    .returning('id')
}

const removeGame = async ({gameId}) => {
  return knex('Games')
         .where('id', gameId)
         .delete()
         .returning('id');
}

const setHasStarted = async ({gameId}) => {
  return knex('Games')
         .where('id', gameId)
         .update('has_started', true);
}

const fillBots = async ({gameId}) => {
  const players = [
    {game_id: gameId, user_name: 'bot', is_bot: 'true', is_host: 'false'},
    {game_id: gameId, user_name: 'bot', is_bot: 'true', is_host: 'false'},
    {game_id: gameId, user_name: 'bot', is_bot: 'true', is_host: 'false'},
    {game_id: gameId, user_name: 'bot', is_bot: 'true', is_host: 'false'},
    {game_id: gameId, user_name: 'bot', is_bot: 'true', is_host: 'false'},
    {game_id: gameId, user_name: 'bot', is_bot: 'true', is_host: 'false'}
  ];
  try{
    const x = await updatePlayerCount({gameId: gameId, num: 6});
  }catch(e){
    console.log(e);
  }
  return knex('Players')
         .where('game_id', gameId)
         .insert(players)
         .returning('id');
}

const setHost = async ({name}) => {
  return knex('Players')
         .where('user_name', name)
         .update('is_host', true)
         .returning('id')
}

const setTurn = async ({gameId, playerId}) => {
  return knex('Games')
         .where('id', gameId)
         .update({turn_id: playerId})
         .returning('turn_id')
}



//Players

const addPlayer = async ({gameId, name}) => {
  let game;
  try{
    game = await findGame({gameId: gameId});
    const x = await updatePlayerCount({gameId: gameId, num: 1})
  }catch(e){
    throw new Error(e);
  }

  return knex('Players')
         .insert({
           game_id: gameId,
           user_name: name,
           is_bot: 'false',
           is_host: (game[0].player_count === 0)? true: false
         })
         .returning('id')
}

const updatePlayerCount = async ({gameId, num}) => {
    return knex('Games')
           .where('id', gameId)
           .update({
             player_count: num
           })
           .returning('player_count')
}

const removePlayer = async ({playerId}) => {
    return knex('Players')
           .where('id', playerId)
           .delete()
           .returning('id');
}

const replacePlayer = async ({playerId, name}) => {
  return knex('Players')
         .where('id', playerId)
         .update({
           user_name: name,
           is_bot: (name === 'bot')? true: false,
         })
         .returning('id')
}

const getPlayers = ({gameId}) => {
  return knex('Players')
         .where('game_id', gameId)
         .orderBy('id', 'asc')
         .select();

}

const getPlayer = ({playerId}) => {
  return knex('Players')
         .where('id', playerId)
         .select();
}

const findPlayer = ({name}) => {
  return knex('Players')
         .where({user_name: name})
         .select()
}

const getPlayerHandCount = ({playerId}) => {
  return knex('GameCards')
         .count('id')
         .where({player_id: playerId})
}


//GameCards
const getCard = ({cardId}) => {
  return knex('GameCards')
         .where('id', cardId)
         .select();
}

const getDeck = ({gameId}) => {
  return knex('GameCards')
         .where({game_id: gameId})
         .select();
}

const getHand = ({playerId}) => {
  return knex('GameCards')
         .where({player_id: playerId})
         .select();
}

const setFirstCardInPlay = async ({gameId}) => {
  try{
    const deck = await getDeck({gameId: gameId});
    let found = false;
    let random;
    while(!found){
      random = deck[Math.floor(Math.random() * deck.length)];
      if(random.is_available === true) found = true;
    }
    if(random.color === 'black'){
      const colors = ['red', 'yellow', 'green', 'blue'];
      const randomC = colors[Math.floor(Math.random() * 4)];
      const cChange = await changeColor({cId: randomC.id, color: randomC});
    }
    return knex('GameCards')
           .where('id', random.id)
           .update({
             is_available: false,
             is_in_play: true
           })
           .returning('id');

  }catch(e){
    console.log(e);
  }
}

const setCardInPlay = async ({gameId, playerId, cId}) => {
  const colors = ['red', 'blue', 'green', 'yellow'];
  try{
    const cIP = await getCard({cardId: cId});
    if(cIP[0].color === 'black'){
      const randomC = colors[Math.floor(Math.random() * colors.length)];
      const changeC = await changeColor({cId: cId, color: randomC});
    }
    const x = await removeCardInPlay({gameId: gameId});
    return knex('GameCards')
           .where({
             id: cId
            })
            .update({
              player_id: null,
              is_in_play: true,
              is_available: false
            })
  }catch(e){
    console.log(e)
    throw new Error(e);
  }
}

const removeCardInPlay = async ({gameId}) => {
  try{
    const cIP = await getCardInPlay({gameId: gameId});
    if(cIP[0].value === 13 || cIP[0].value === 14){
      await changeColor({cId: cIP[0].id, color: 'black'});
    }
    return knex('GameCards')
           .where({
             game_id: gameId,
             is_in_play: true
           })
           .update({
             is_in_play: false,
             is_available: true
           })
           .returning('id');
  }catch(e){
    console.log(e);
    throw new Error(e);
  }

}

const getCardInPlay = async ({gameId}) => {
  return knex('GameCards')
         .where({
           is_in_play: true,
           game_id: gameId
         })
         .select();
}

const generateDeck = async ({gameId}) => {
  const cards = [];
  const colors = ['red', 'blue', 'yellow', 'green'];
  let colorI = 0;
  let val;
  for(let i = 0; i < 4; i++){
    cards.push({
      game_id: gameId,
      color: colors[i],
      value: 0,
      is_in_play: false,
      is_available: true
    })
  }
  for(let i = 0; i < 104; i++){
    if(i % 13 === 0 && i !== 0 ){
      colorI = (colorI + 1) % 4;
    }
    val = (i % 13) + 1;
    cards.push({
      game_id: gameId,
      color: (val === 13 || val === 14)?'black':colors[colorI],
      value: (val === 13 && i > 52)? 14: val,
      is_in_play: false,
      is_available: true
    })
  }
  return knex('GameCards')
         .insert(cards)
         .returning('id');
}

const generateHand = async ({gameId, playerId}) => {
  try{
    const deck = await getDeck({gameId: gameId});
    const hand = [];
    let randomItem;
    while(hand.length !== 7){
      randomItem = deck[Math.floor(Math.random() * deck.length)];
      if(randomItem.is_available === true){
        hand.push(randomItem.id);
        randomItem.is_available = false; //to ensure no repeats; safe b/c not used later
      }
    }
    return knex('GameCards')
           .whereIn('id', hand)
           .update({
             player_id: playerId,
             is_available: false
           })
           .returning('id');

  }catch(e){
    console.log(e);
  }
}


//submit turn queries


const getNextTurn = async({gameId, currentTurn, isSkip}) => {
  try{
    const game = await findGame({gameId: gameId});
    const players = await getPlayers({gameId: gameId});
    const currIndex = players.findIndex(player => player.id === currentTurn);

    let nextTurn;
    if(isSkip){
      if(game[0].direction){
        nextTurn = players[(currIndex + 2) % players.length];
      }else{
        nextTurn = players[(currIndex - 2 + players.length) % players.length]
      }

    }else{
      if(game[0].direction){
        nextTurn = players[(currIndex + 1) % players.length];
      }else{
        nextTurn = players[(currIndex - 1 + players.length) % players.length]
      }
    }
    return nextTurn;
  }catch(e){
    throw new Error(e);
  }
}

const nextTurn = async ({gameId, isSkip}) => {
  try{
    const game = await findGame({gameId: gameId})
    const nTurn = await getNextTurn({gameId:gameId, currentTurn: game[0].turn_id, isSkip: isSkip});
    await setTurn({gameId: gameId, playerId: nTurn.id});
    return nTurn.id;
  }catch(e){
    throw new Error(e);
  }
}


const flipDirection = async ({gameId}) => {
  try{
    const game = await findGame({gameId: gameId});
    lastDirection = game[0].direction;

    return knex('Games')
          .where('id', gameId)
          .update({
            direction: !lastDirection
          })
          .returning('direction')

   }catch(e){
      throw new Error(e);
   }
}

const giveCards = async ({gameId, num}) => {
  try{
    const deck = await getDeck({gameId: gameId});
    const game = await findGame({gameId: gameId});

    //find who the target is
    // let target = game[0].turn_id
    // let travel = 0
    // do{
    //   const nextTurn = await getNextTurn(gameId, target, false);
    //   const nextHand = await getHand(nextTurn.id);
    //   let filterHand = nextHand.filter(item => cardFilter(item));
    //   if(filterHand.length > 0){
    //      target = nextTurn.id
    //      travel++;
    //   }
    // }while(filterHand.length > 0);
    //
    // const effectiveNum = num + (travel * num)

    const nextTurn = await getNextTurn({gameId: gameId, currentTurn: game[0].turn_id, isSkip: false});
    let random;
    let cards = [];
    //generate cards to give target
    while(cards.length !== num){
      random = deck[Math.floor(Math.random() * 108)];
      if(random.is_available){
        cards.push(random.id);
        random.is_available = false;
      }
    }
    return knex('GameCards')
           .whereIn('id', cards)
           .update({
             player_id: nextTurn.id
           })
           .returning('player_id')

  }catch(e){
    throw new Error(e);
  }
}

const cardFilter = (item) => {
    if(num === 2){
      if(item.value === 13){
        return true;
      }else{
        return false;
      }
    }else{
      if(item.value === 13){
        return true;
      }else{
        return false;
      }
    }
}

const drawCard = async ({gameId, playerId}) => {
  try{
    const deck = await getDeck({gameId: gameId});
    let random;
    while(true){
      random = deck[Math.floor(Math.random() * 108)];
      if(random.is_available){
        break;
      }
    }
    return knex('GameCards')
           .where('id', random.id)
           .update({
             player_id: playerId,
             is_available: false
           })
           .returning('id')

  }catch(e){
    throw new Error(e);
  }
}

const changeColor = async ({cId, color}) => {
  return knex("GameCards")
    .where('id', cId)
    .update({color: color})
    .returning('id')
}

//testing

const customHand = async ({gameId, playerId}) => {
  const custom = [];
  const deck = await getDeck({gameId: gameId});
  const cards = deck.filter(card => {
    if(card.value > 9 || card.value === 1){
      return true;
    }else{
      return false;
    }
  });
  for(let i = 10; i < 15; i++){
    for(let j = 0; j < cards.length; j++){
      if(cards[j].value === i && cards[j].is_available){
        custom.push(cards[j].id);
        break;
      }
    }
  }

  for(let i = 0; i < deck.length; i++){
    if(cards[i].value === 1){
      custom.push(cards[i].id);
      break;
    }
  }

  return knex('GameCards')
         .whereIn('id', custom)
         .update({
           player_id: playerId,
           is_available: false
         })
         .returning('id')
}

module.exports = {
  addUser: addUser,
  getUsers: getUsers,
  findUser: findUser,
  getGames: getGames,
  findGame: findGame,
  createGame: createGame,
  removeGame: removeGame,
  setHasStarted: setHasStarted,
  fillBots: fillBots,
  setHost: setHost,
  setTurn: setTurn,
  addPlayer: addPlayer,
  updatePlayerCount: updatePlayerCount,
  getPlayerHandCount: getPlayerHandCount,
  removePlayer: removePlayer,
  replacePlayer: replacePlayer,
  getPlayers: getPlayers,
  getPlayer: getPlayer,
  findPlayer: findPlayer,
  getCard: getCard,
  getDeck: getDeck,
  getHand: getHand,
  setFirstCardInPlay: setFirstCardInPlay,
  setCardInPlay: setCardInPlay,
  removeCardInPlay: removeCardInPlay,
  getCardInPlay: getCardInPlay,
  generateDeck: generateDeck,
  generateHand: generateHand,
  getNextTurn: getNextTurn,
  nextTurn: nextTurn,
  flipDirection: flipDirection,
  giveCards: giveCards,
  drawCard: drawCard,
  changeColor: changeColor,
  customHand: customHand
}
