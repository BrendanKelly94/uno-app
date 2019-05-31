const knex = require("./knex.js");
const CustomError = require("../errors/CustomError.js");
const NotAuthorized = require("../errors/NotAuthorized.js");
const NotFound = require("../errors/NotFound.js");
const NotKnown = require("../errors/NotKnown.js");

//Users

const addUser = async ({ name, pwd }) => {
  let user;
  try{
   user = await findUser({name: name});
  }catch(e){
    //error will be thrown if user not found; don't do anythings
  }
  if(user) throw new CustomError({status: 200, message: "User already exists"})
  const userName = await knex("Users")
    .insert({ name: name, pwd: pwd })
    .returning("name");
  if (!userName[0]) throw new NotKnown();
  return userName[0];
};

const getUsers = async () => {
  const users = await knex("Users").select();
  if (users.length === 0) {
    throw new CustomError({ status: 200, message: "No Users Found" });
  } else {
    return users;
  }
};

const findUser = async ({ name }) => {
  const user = await knex("Users")
    .where("name", name)
    .first();
  if (!user) throw new NotFound();
  return user;
};

//Games

const getGames = async () => {
  const games = await knex("Games")
    .where("has_started", false)
    .select();
  if (games.length === 0)
    throw new CustomError({ status: 200, message: "No Games" });
  return games;
};

const findGame = async ({ gameId }) => {
  const game = await knex("Games")
    .where("id", gameId)
    .first();
  if (!game) throw new NotFound();
  return game;
};

const createGame = async ({ botFill }) => {
  const newGame = await knex("Games")
    .insert({ bot_fill: botFill })
    .returning("id");
  if (!newGame[0]) throw new NotKnown();
  return newGame[0];
};

const removeGame = async ({ gameId }) => {
  const remGame = await knex("Games")
    .where("id", gameId)
    .delete()
    .returning("id");
  if (!remGame[0]) throw new NotKnown();
  return remGame[0];
};

const setHasStarted = async ({ gameId }) => {
  const id = await knex("Games")
    .where("id", gameId)
    .update("has_started", true)
    .returning("id");
  if (!id[0]) throw new NotKnown();
  return id[0];
};

const fillBots = async ({ gameId }) => {
  try {
    const players = [
      { game_id: gameId, user_name: "bot", is_bot: "true", is_host: "false" },
      { game_id: gameId, user_name: "bot", is_bot: "true", is_host: "false" },
      { game_id: gameId, user_name: "bot", is_bot: "true", is_host: "false" },
      { game_id: gameId, user_name: "bot", is_bot: "true", is_host: "false" },
      { game_id: gameId, user_name: "bot", is_bot: "true", is_host: "false" },
      { game_id: gameId, user_name: "bot", is_bot: "true", is_host: "false" }
    ];
    await updatePlayerCount({ gameId: gameId, num: 6 });
    const bots = await knex("Players")
      .where("game_id", gameId)
      .insert(players)
      .returning("id");
    if (bots.length !== 6) throw new NotKnown();
    return bots;
  } catch (e) {
    throw e;
  }
};

const setHost = async ({ name }) => {
  try {
    const host = await knex("Players")
      .where("user_name", name)
      .update("is_host", true)
      .returning("id");
    if (!host[0]) throw new NotKnown();
    return host[0];
  } catch (e) {
    throw e;
  }
};

const setTurn = async ({ gameId, playerId }) => {
  try {
    const turn = await knex("Games")
      .where("id", gameId)
      .update({ turn_id: playerId })
      .returning("turn_id");
    if (!turn[0]) throw new NotKnown();
    return turn[0];
  } catch (e) {
    throw e;
  }
};

//Players

const addPlayer = async ({ gameId, name }) => {
  try {
    const game = await findGame({ gameId: gameId });
    const count = await updatePlayerCount({ gameId: gameId, num: 1 });
    const newPlayer = await knex("Players")
      .insert({
        game_id: gameId,
        user_name: name,
        is_bot: "false",
        is_host: game.player_count === 0 ? true : false
      })
      .returning("id");
    if (!newPlayer[0]) throw new NotKnown();
    return newPlayer[0];
  } catch (e) {
    throw e;
  }
};

const updatePlayerCount = async ({ gameId, num }) => {
  try {
    const count = await knex("Games")
      .where("id", gameId)
      .update({
        player_count: num
      })
      .returning("player_count");
    if (!count[0]) throw new NotKnown();
    return count[0];
  } catch (e) {
    console.log(e);
  }
};

const removePlayer = async ({ playerId }) => {
  try {
    const player = await knex("Players")
      .where("id", playerId)
      .delete()
      .returning("id");
    if (!player[0]) throw new NotFound();
    return player[0];
  } catch (e) {
    throw e;
  }
};

const replacePlayer = async ({ playerId, name }) => {
  try {
    const player = await knex("Players")
      .where("id", playerId)
      .update({
        user_name: name,
        is_bot: name === "bot" ? true : false
      })
      .returning("id");
    if (!player[0]) throw new NotFound();
    return player[0];
  } catch (e) {
    throw e;
  }
};

const getPlayers = async ({ gameId }) => {
  try {
    const players = await knex("Players")
      .where("game_id", gameId)
      .orderBy("id", "asc")
      .select();
    if (players.length === 0) throw new NotKnown();
    return players;
  } catch (e) {
    throw e;
  }
};

const getPlayer = async ({ playerId }) => {
  try {
    const player = await knex("Players")
      .where("id", playerId)
      .first();
    if (!player) throw new NotFound();
    return player;
  } catch (e) {
    throw e;
  }
};

const findPlayer = async ({ name }) => {
  try {
    const player = await knex("Players")
      .where({ user_name: name })
      .first();
    if (!player) throw new NotFound();
    return player;
  } catch (e) {
    throw e;
  }
};

const getPlayerHandCount = async ({ playerId }) => {
  try {
    const count = await knex("GameCards")
      .count("id")
      .where({ player_id: playerId });
    const pCount = parseInt(count[0].count);
    if (Number.isNaN(pCount)) throw new NotKnown();
    return pCount;
  } catch (e) {
    throw e;
  }
};

//GameCards
const getCard = async ({ cardId }) => {
  try {
    const card = await knex("GameCards")
      .where("id", cardId)
      .first();
    if (!card) throw new NotFound();
    return card;
  } catch (e) {
    throw e;
  }
};

const getDeck = async ({ gameId }) => {
  try {
    const deck = await knex("GameCards")
      .where({ game_id: gameId })
      .select();
    if (deck.length !== 108) throw new NotKnown();
    return deck;
  } catch (e) {
    throw e;
  }
};

const getHand = async ({ playerId }) => {
  try {
    const hand = await knex("GameCards")
      .where({ player_id: playerId })
      .select();
    return hand;
  } catch (e) {
    throw e;
  }
};

const setFirstCardInPlay = async ({ gameId }) => {
  try {
    const deck = await getDeck({ gameId: gameId });
    let found = false;
    let random;
    while (!found) {
      random = deck[Math.floor(Math.random() * deck.length)];
      if (random.is_available === true) found = true;
    }
    if (random.color === "black") {
      const colors = ["red", "yellow", "green", "blue"];
      const randomC = colors[Math.floor(Math.random() * 4)];
      const cChange = await changeColor({ cId: random.id, color: randomC });
    }
    const cIP = await knex("GameCards")
      .where("id", random.id)
      .update({
        is_available: false,
        is_in_play: true
      })
      .returning("id");
    if (!cIP[0]) throw new NotKnown();
    return cIP[0];
  } catch (e) {
    throw e;
  }
};

const setCardInPlay = async ({ gameId, playerId, cId }) => {
  try {
    const colors = ["red", "blue", "green", "yellow"];
    const cIP = await getCard({ cardId: cId });
    if (cIP.color === "black") {
      const randomC = colors[Math.floor(Math.random() * colors.length)];
      await changeColor({ cId: cId, color: randomC });
    }
    const card = await removeCardInPlay({ gameId: gameId });
    const cIPId = await knex("GameCards")
      .where({
        id: cId
      })
      .update({
        player_id: null,
        is_in_play: true,
        is_available: false
      })
      .returning("id");
    if (!cIPId[0]) throw new NotKnown();
    return cIPId[0];
  } catch (e) {
    throw e;
  }
};

const removeCardInPlay = async ({ gameId }) => {
  try {
    const cIP = await getCardInPlay({ gameId: gameId });
    if (cIP.value === 13 || cIP.value === 14) {
      await changeColor({ cId: cIP.id, color: "black" });
    }
    const cIPId = await knex("GameCards")
      .where({
        game_id: gameId,
        is_in_play: true
      })
      .update({
        is_in_play: false,
        is_available: true
      })
      .returning("id");
    if (!cIPId[0]) throw new NotKnown();
    return cIPId[0];
  } catch (e) {
    throw e;
  }
};

const getCardInPlay = async ({ gameId }) => {
  try {
    const cIP = await knex("GameCards")
      .where({
        is_in_play: true,
        game_id: gameId
      })
      .select();
    if (!cIP[0]) throw new NotFound();
    return cIP[0];
  } catch (e) {
    throw e;
  }
};

const generateDeck = async ({ gameId }) => {
  try {
    const cards = [];
    const colors = ["red", "blue", "yellow", "green"];
    let colorI = 0;
    let val;
    for (let i = 0; i < 4; i++) {
      cards.push({
        game_id: gameId,
        color: colors[i],
        value: 0,
        is_in_play: false,
        is_available: true
      });
    }
    for (let i = 0; i < 104; i++) {
      if (i % 13 === 0 && i !== 0) {
        colorI = (colorI + 1) % 4;
      }
      val = (i % 13) + 1;
      cards.push({
        game_id: gameId,
        color: val === 13 || val === 14 ? "black" : colors[colorI],
        value: val === 13 && i > 52 ? 14 : val,
        is_in_play: false,
        is_available: true
      });
    }

    const c = await knex("GameCards")
      .insert(cards)
      .returning("id");
    if (c.length !== 108) throw new NotKnown();
    return c;
  } catch (e) {
    throw e;
  }
};

const generateHand = async ({ gameId, playerId }) => {
  try {
    const deck = await getDeck({ gameId: gameId });
    let hand = [];
    let randomItem;
    while (hand.length !== 7) {
      randomItem = deck[Math.floor(Math.random() * deck.length)];
      if (randomItem.is_available === true) {
        hand.push(randomItem.id);
        randomItem.is_available = false; //to ensure no repeats; safe b/c not used later
      }
    }
    const handIds = await knex("GameCards")
      .whereIn("id", hand)
      .update({
        player_id: playerId,
        is_available: false
      })
      .returning("id");
    if (handIds.length !== 7) throw new NotKnown();
    return handIds;
  } catch (e) {
    throw e;
  }
};

//submit turn queries

const getNextTurn = async ({ gameId, currentTurn, isSkip }) => {
  try {
    const game = await findGame({ gameId: gameId });
    const players = await getPlayers({ gameId: gameId });

    const currIndex = players.findIndex(player => player.id === currentTurn);

    let nextTurn;
    if (isSkip) {
      if (game.direction) {
        nextTurn = players[(currIndex + 2) % players.length];
      } else {
        nextTurn = players[(currIndex - 2 + players.length) % players.length];
      }
    } else {
      if (game.direction) {
        nextTurn = players[(currIndex + 1) % players.length];
      } else {
        nextTurn = players[(currIndex - 1 + players.length) % players.length];
      }
    }
    return nextTurn;
  } catch (e) {
    throw e;
  }
};

const nextTurn = async ({ gameId, isSkip }) => {
  try {
    const game = await findGame({ gameId: gameId });
    const nTurn = await getNextTurn({
      gameId: gameId,
      currentTurn: game.turn_id,
      isSkip: isSkip
    });
    const id = await setTurn({ gameId: gameId, playerId: nTurn.id });
    return nTurn.id;
  } catch (e) {
    throw e;
  }
};

const flipDirection = async ({ gameId }) => {
  try {
    const game = await findGame({ gameId: gameId });
    const lastDirection = game.direction;
    const direction = await knex("Games")
      .where("id", gameId)
      .update({
        direction: !lastDirection
      })
      .returning("direction");
    return direction[0];
  } catch (e) {
    throw e;
  }
};

const giveCards = async ({ gameId, num }) => {
  try {
    const deck = await getDeck({ gameId: gameId });
    const game = await findGame({ gameId: gameId });

    let nextTurn = await getNextTurn({
      gameId: gameId,
      currentTurn: game.turn_id,
      isSkip: false
    });
    let random;
    let cards = [];
    //generate cards to give target
    while (cards.length !== num) {
      random = deck[Math.floor(Math.random() * 108)];
      if (random.is_available) {
        cards.push(random.id);
        random.is_available = false;
      }
    }
    const pId = await knex("GameCards")
      .whereIn("id", cards)
      .update({
        player_id: nextTurn.id
      })
      .returning("player_id");
    if (!pId[0]) throw new NotKnown();
    return pId[0];
  } catch (e) {
    throw e;
  }
};

const cardFilter = item => {
  if (num === 2) {
    if (item.value === 13) {
      return true;
    } else {
      return false;
    }
  } else {
    if (item.value === 13) {
      return true;
    } else {
      return false;
    }
  }
};

const drawCard = async ({ gameId, playerId }) => {
  try {
    const deck = await getDeck({ gameId: gameId });
    let random;
    while (true) {
      random = deck[Math.floor(Math.random() * 108)];
      if (random.is_available) {
        break;
      }
    }
    const card = await knex("GameCards")
      .where("id", random.id)
      .update({
        player_id: playerId,
        is_available: false
      })
      .returning("id");
    if (!card[0]) throw new NotKnown();
    return card[0];
  } catch (e) {
    throw e;
  }
};

const changeColor = async ({ cId, color }) => {
  try {
    const cardId = await knex("GameCards")
      .where("id", cId)
      .update({ color: color })
      .returning("id");
    if (!cardId[0]) throw new NotKnown();
    return cardId[0];
  } catch (e) {
    throw e;
  }
};

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
  changeColor: changeColor
};
