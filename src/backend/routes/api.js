module.exports = function(io){

const express = require('express');
const gameIo = io.of('/game');
const router = express.Router();
const queries = require('../db/queries.js');

//retrieve games
router.get('/games', async (req, res, next) => {
  try{
    const games = await queries.getGames();
    res.send({games: games});
  }catch(e){
    res.send({error: e});
  }
});

//get game
router.get('/game/:id', async (req, res, next) => {
  const id = parseInt(req.params['id'], 10);
  try{
    const game = await queries.findGame({gameId: id});
    res.send({game: game[0]});
  }catch(e){
    res.send({error: e});
  }
});


//retrieve players in game
router.get('/game/:id/players', async (req, res, next) => {
  const id = parseInt(req.params['id'], 10);
  try{
    const players = await queries.getPlayers({gameId: id});
    res.send({players: players})
  }catch(e){
    res.send({error: e});
  }
})

//retrieve card in middle
router.get('/getCardInPlay/:gameId', async (req, res, next) => {
  const gameId = parseInt(req.params['gameId'], 10);
  try{
    const cIP = await queries.getCardInPlay({gameId: gameId});
    console.log('card in play', cIP)
    res.send({card: cIP[0]});
  }catch(e){
    res.send({error: e});
  }
})

//retrieve hand
router.get('/getHand/:playerId', async (req, res, next) => {
  const playerId = parseInt(req.params['playerId'], 10);
  try{
    const hand = await queries.getHand({playerId: playerId});
    res.send({hand: hand});
  }catch(e){
    res.send({error: e});
  }
});

//create game
router.post('/newGame', async (req, res, next) => {
  const botFill = req.body.botFill;
  try{
    const id = await queries.createGame({botFill: botFill});
    const x = await queries.generateDeck({gameId: id[0]});

    if(botFill){
      const bots = await queries.fillBots({gameId: id[0]});
      for(let i = 0; i < bots.length; i++){
        const res = await queries.generateHand({gameId: id[0], playerId: bots[i]})
      }
    }


    res.send({id: id[0]});
  }catch(e){
    res.send({err: e})
  }
});

//join game
router.post('/game/:id', async (req, res, next) => {
  const gameId = parseInt(req.params['id'],10);
  const name = req.body.name;
  try{
    const game = await queries.findGame({gameId: gameId});
    //if game is full check if there are bots
    //if so replace a bot with a player
    if(game[0].player_count === 6 && game[0].bot_fill === true){
      const players = await queries.getPlayers({gameId: gameId});
      let found = false;
      let allbots = true;
      let randomPlayer;
      for(let i = 0; i < 6; i++){
        randomPlayer = players[Math.floor(Math.random() * players.length)];
        if(randomPlayer.is_bot){
          found = true;
        }else{
          allbots = false;
        }
      }
      if(found){
        const pId = await queries.replacePlayer({playerId: randomPlayer.id, name: name});
        gameIo.to(gameId).emit('newPlayer', {id: pId[0]});
        if(allbots){
          const x = await queries.setHost({name: name})
        }
      }else{        //if no available spot
        res.send({err: 'Game is full'})
      }
      res.send({id: randomPlayer.id})

    }else{
      const playerId = await queries.addPlayer({gameId: gameId, name: name});
      const x = await queries.generateHand({gameId: gameId, playerId: playerId[0]});
      gameIo.to(gameId).emit('newPlayer', {id: playerId});
      res.send({id: playerId[0]})
    }

  }catch(e){
    console.log(e)
    res.send({err: e})
  }
});

// start game
router.post('/game/:id/start', async (req, res, next) => {
  const gameId = parseInt(req.params['id'], 10);
  const name = req.body.name;
  try{
    const host = await queries.findPlayer({name: name});
    if(host[0].is_host){
      const x = await queries.setFirstCardInPlay({gameId: gameId});
      const setTurn = await queries.setTurn({gameId: gameId, playerId: host[0].id});
      gameIo.to(gameId).emit('start', {});
      res.send({id:host[0].id})
    }else{
      res.send({err: 'You are not the host'});
    }
  }catch(e){
    console.log(e);
    res.send({err: e});
  }
});

router.get('/game/:gameId/getHandOptions/:playerId', async (req, res, next) => {
  const gameId = parseInt(req.params['gameId'], 10);
  const playerId = parseInt(req.params['playerId'], 10);
  try{
    const options = await getCardOptions({gameId: gameId, playerId: playerId});
    res.send({options: options});
  }catch(e){
    console.log(e);
    res.send({err: e})
  }
});

router.get('/getPlayerHandCount/:playerId', async (req, res, next) => {
  const playerId = parseInt(req.params['playerId'], 10);
  try{
    const handCount = await queries.getPlayerHandCount({playerId: playerId});
    const count = parseInt(handCount[0].count, 10)
    res.send({count:count});
  }catch(e){
    res.send({err:e})
  }
});

//get players for the game route
router.get('/getPlayersWithCount/:gameId', async (req, res, next) => {
  const gameId = parseInt(req.params['gameId'], 10);
  try{
    const players = await queries.getPlayers({gameId: gameId});
    const countArray = [];
    for(let i = 0; i < players.length; i++){
      const handCount = await queries.getPlayerHandCount({playerId: players[i].id})
      players[i].cardCount = parseInt(handCount[0].count, 10)
    }
    res.send({players: players})
  }catch(e){
    console.log(e);
    res.send({err:e});
  }
})

router.post('/game/:id/submitCard/:playerId', async (req, res, next) => {
  const gameId = parseInt(req.params['id'], 10);
  const playerId = parseInt(req.params['playerId'], 10);
  const cId = req.body.cId;
  const color = req.body.color;
  try{
    let nextTurnId, card;
    let newCards = {status: false, id: null}

    if(cId !== -1){
      if(color !== undefined){
        const cChange = await queries.changeColor({cId: cId, color: color});
      }

      card = await queries.getCard({cardId: cId});
      newCards = await hasNewCards({card:card[0], gameId: gameId, playerId: playerId});
      nextTurnId = await submitCard({gameId: gameId, playerId: playerId, card: card[0]});

    }else{
      card = [{id: -1}]
      nextTurnId = await submitCard({gameId: gameId, playerId: playerId, card: card[0]});
    }
    //send next turn event to clients
    gameIo.to(gameId).emit('newTurn', {currTurn: nextTurnId, lastTurn: playerId, card: card[0], newCards: {status:newCards.status, id: newCards.id}, hasDrawn: false});

    const playerWon = await hasWon({gameId: gameId, playerId: playerId})
    const nextPlayer = await queries.getPlayer({playerId: nextTurnId});

    //call recursive submit bot turn if next player is bot
    if(nextPlayer[0].is_bot && !playerWon){
      await submitBotTurn({gameId: gameId, playerId: nextPlayer[0].id, offset: 3000})
    }

    res.send({card: card[0]});

  }catch(e){
    console.log(e);
    res.send({err: e});
  }
});

router.get('/game/:id/drawCard/:playerId', async (req, res, next) => {
  const gameId = parseInt(req.params['id'], 10);
  const playerId = parseInt(req.params['playerId'], 10);
  try{
    const drawCardId = await queries.drawCard({gameId: gameId, playerId: playerId});
    const drawCard = await queries.getCard({cardId: drawCardId[0]});
    res.send({card: drawCard[0]});
  }catch(e){
    res.send({err: e});
  }
})


async function submitCard({gameId, playerId, card}){
  let nextTurn;
  const cId = card.id;
  try{
    if(cId === -1 ){
      nextTurn = await queries.nextTurn({gameId: gameId, isSkip: false});
      return nextTurn;
    }else if(card.value > 9){

      switch(card.value){
        case 10: //switch direction
          await queries.flipDirection({gameId: gameId});
          await queries.setCardInPlay({gameId: gameId, playerId: playerId, cId: cId})
          nextTurn = await queries.nextTurn({gameId: gameId, isSkip: false});
          break;
        case 11: //skip
          await queries.setCardInPlay({gameId: gameId, playerId: playerId, cId: cId});
          nextTurn = await queries.nextTurn({gameId: gameId, isSkip: true})
          break;
        case 12: //give 2 & skip
          const give2Id = await queries.giveCards({gameId: gameId, num: 2});
          await queries.setCardInPlay({gameId: gameId, playerId: playerId, cId: cId})
          nextTurn = await queries.nextTurn({gameId: gameId, isSkip: true});
          break;
        case 13: // wild card
          //color selection will happen on front end
          await queries.setCardInPlay({gameId: gameId, playerId: playerId, cId: cId})
          nextTurn = await queries.nextTurn({gameId: gameId, isSkip: false});
          break;
        case 14: // wild card give 4
          const give4Id = await queries.giveCards({gameId: gameId, num: 4});
          await queries.setCardInPlay({gameId: gameId, playerId: playerId, cId: cId})
          nextTurn = await queries.nextTurn({gameId: gameId, isSkip: true});
          break;
      }
      return nextTurn;

    }else{
      await queries.setCardInPlay({gameId: gameId, playerId: playerId, cId: cId})
      nextTurn = await queries.nextTurn({gameId: gameId, isSkip: false});
      return nextTurn;
    }
  }catch(e){
    throw new Error(e);
  }

}

async function submitBotTurn({gameId, playerId, offset}){
  try{
    const player = await queries.getPlayer({playerId: playerId});
    if(player[0].is_bot){
      setTimeout(async () => {

        let newCards, card, nextTurn;
        let hasDrawn = false;
        const colors = ['red', 'blue', 'green', 'yellow'];
        const options = await getCardOptions({gameId: gameId, playerId: playerId});

        if(options.length > 0){
          const randomCard = options[Math.floor(Math.random() * options.length)];
          newCards = await hasNewCards({card: randomCard, gameId: gameId, playerId: playerId});
          nextTurn = await submitCard({gameId: gameId, playerId: playerId, card: randomCard});
          card = await queries.getCard({cardId: randomCard.id})

        }else{
            const drawCardId = await queries.drawCard({gameId: gameId, playerId: playerId});
            const newOptions = await getCardOptions({gameId: gameId, playerId: playerId})

            if(newOptions.length > 0){
              hasDrawn = true;
              newCards = await hasNewCards({card: newOptions[0], gameId: gameId, playerId: playerId});
              nextTurn = await submitCard({gameId: gameId, playerId: playerId, card: newOptions[0]});
              card = await queries.getCard({cardId: newOptions[0].id})

            }else{
              newCards = {status: false, id: null};
              card = [{id: -1}]
              nextTurn = await submitCard({gameId: gameId, playerId: playerId, card: card[0]});

            }
        }

        gameIo.to(gameId).emit('newTurn', {currTurn: nextTurn, lastTurn: playerId, card: card[0], newCards: {status: newCards.status, id: newCards.id},hasDrawn: hasDrawn});
        const playerWon = await hasWon({gameId: gameId, playerId: playerId});
        if(playerWon){
          return true;
        }else{
          return await submitBotTurn({gameId: gameId, playerId: nextTurn, offset: offset});
        }

      }, offset)
    }

  }catch(e){
    throw new Error(e);
  }

  return true;
}

async function hasWon({gameId: gameId, playerId: playerId}){
  try{
    const handCount = await queries.getPlayerHandCount({playerId: playerId});
    const player = await queries.getPlayer({playerId: playerId});
    console.log('hasWon', handCount)
    if(handCount[0].count === '0'){
      gameIo.to(gameId).emit('playerWon', {user_name: player[0].user_name});
      return true;
    }else{
      return false;
    }
  }catch(e){
    console.log(e);
  }
}

async function hasNewCards({card, gameId, playerId}){
  let player = {id:null};
  const newCards = (card.value === 12 || card.value === 14)?true:false;
  if(newCards){
    player = await queries.getNextTurn({gameId: gameId, currentTurn: playerId, isSkip: false});
  }
  return {status: newCards, id: player.id}
}


async function getCardOptions({gameId, playerId}){
  try{
    const cardInPlay = await queries.getCardInPlay({gameId: gameId});
    const hand = await queries.getHand({playerId: playerId});
    const options = hand.filter((card, id) => {
      if(card.value > 12){
        return true;
      }else if(card.color === cardInPlay[0].color){
        return true;
      }else if(card.value === cardInPlay[0]. value){
        return true;
      }else{
        return false;
      }
    });
    return options
  }catch(e){
    console.log(e);
    return false;
  }
}

router.post('/game/:gameId/leave/:playerId' , async (req, res, next) => {
  const gameId = parseInt(req.params['gameId'], 10);
  const playerId = parseInt(req.params['playerId'], 10);
  try{
    const game = await queries.findGame({gameId: gameId});
    await queries.replacePlayer({playerId: playerId, name: 'bot'});
    gameIo.to(gameId).emit('playerLeft', {playerId: playerId});
    res.send({playerId: playerId});
  }catch(e){
    res.send({err: e});
  }
});
//change into function and send event to clients
router.post('/game/:gameId/end/:playerId', async (req, res, next) => {
    const gameId = parseInt(req.params['gameId'], 10);
    const playerId = parseInt(req.params['playerId'], 10);
    const hasWon = req.body.hasWon;
    try{
      const result = await queries.removeGame({gameId: gameId})
      if(hasWon){
        gameIo.to(gameId).emit('gameWon', {playerId: playerId});
      }else{
        gameIo.to(gameId).emit('end', {message: "game has ended by host"})
      }
      res.send({gameId: result[0]})
    }catch(e){
      res.send({err: e})
    }
});

gameIo.on('connection', (socket) => {
  console.log("hello")
  socket.on('join', (data) => {
    console.log(data)
    socket.join(data.gameId);
    gameIo.to(data.gameId).emit('joined', { gameId: data.gameId });
  });

  socket.on('disconnect', (data) => {
    console.log(data)
  })
});




return router;
}
