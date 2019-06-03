const knex = require("../knex.js");
const CustomError = require("../../errors/CustomError.js");
const NotAuthorized = require("../../errors/NotAuthorized.js");
const NotFound = require("../../errors/NotFound.js");
const NotKnown = require("../../errors/NotKnown.js");
const Users = require ("./Users.js");
const Players = require ("./Players.js");
const GameCards = require("./GameCards.js");


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

//flag
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

//flag
const getNextTurn = async ({ gameId, currentTurn, isSkip }) => {
  try {
    const game = await findGame({ gameId: gameId });
    const players = await Players.getPlayers({ gameId: gameId });

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

//flag
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

//flag
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

module.exports = {
  getGames: getGames,
  findGame: findGame,
  createGame: createGame,
  removeGame: removeGame,
  setHasStarted: setHasStarted,
  fillBots: fillBots,
  setTurn: setTurn,
  flipDirection: flipDirection,
  getNextTurn: getNextTurn,
  nextTurn: nextTurn,
  updatePlayerCount: updatePlayerCount
}
