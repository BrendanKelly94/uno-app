const knex = require("../knex.js");
const CustomError = require("../../errors/CustomError.js");
const NotAuthorized = require("../../errors/NotAuthorized.js");
const NotFound = require("../../errors/NotFound.js");
const NotKnown = require("../../errors/NotKnown.js");
const Users = require ("./Users.js");
const Games = require ("./Games.js");
const GameCards = require("./GameCards.js");

//Players

const addPlayer = async ({ gameId, name }) => {
  try {
    const game = await Games.findGame({ gameId: gameId });
    const count = await Games.updatePlayerCount({ gameId: gameId, num: 1 });
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

const findAndReplacePlayer = async ({gameId, name}) => {
  try{
    const players = await getPlayers({ gameId: gameId });
    let found = -1;
    let allbots = true;
    let randomPlayer;
    for (let i = 0; i < 6; i++) {
      // randomPlayer = players[Math.floor(Math.random() * players.length)];
      if (players[i].is_bot) {
        found = i;
      } else {
        allbots = false;
      }
    }
    if(found === -1) throw new CustomError({status: 200, message: "Game is Full"});
    const pId = await replacePlayer({
      playerId: players[found].id,
      name: name
    });
    if (allbots) {
      await setHost({ name: name });
    }
    return pId;
  }catch(e){
    throw e
  }
}

const hasWon = async ({ gameId: gameId, playerId: playerId }) => {
  try {
    const handCount = await getPlayerHandCount({
      playerId: playerId
    });
    const player = await getPlayer({ playerId: playerId });
    if (handCount === 0) {
      return true;
    } else {
      return false;
    }
  } catch (e) {
    throw e;
  }
}

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

module.exports = {
  addPlayer: addPlayer,
  removePlayer: removePlayer,
  replacePlayer: replacePlayer,
  getPlayers: getPlayers,
  getPlayer: getPlayer,
  findPlayer: findPlayer,
  findAndReplacePlayer: findAndReplacePlayer,
  hasWon: hasWon,
  getPlayerHandCount: getPlayerHandCount,
  setHost: setHost
}
