const knex = require("../knex.js");
const CustomError = require("../../errors/CustomError.js");
const NotAuthorized = require("../../errors/NotAuthorized.js");
const NotFound = require("../../errors/NotFound.js");
const NotKnown = require("../../errors/NotKnown.js");
const Users = require ("./Users.js");
const Games = require ("./Games.js");
const Players = require("./Players.js");

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

//flag
const submitCard = async ({ gameId, playerId, card }) => {
  let nextTurn;
  const cId = card.id;
  try {
    if (cId === -1) {
      nextTurn = await Games.nextTurn({ gameId: gameId, isSkip: false });
      return {id: nextTurn, newCards: {status: false, id: null}};
    } else if (card.value > 9) {
      switch (card.value) {
        case 10: //switch direction
          await Games.flipDirection({ gameId: gameId });
          await setCardInPlay({
            gameId: gameId,
            playerId: playerId,
            cId: cId
          });
          nextTurn = await Games.nextTurn({
            gameId: gameId,
            isSkip: false
          });
          break;
        case 11: //skip
          await setCardInPlay({
            gameId: gameId,
            playerId: playerId,
            cId: cId
          });
          nextTurn = await Games.nextTurn({ gameId: gameId, isSkip: true });
          break;
        case 12: //give 2 & skip
          const give2Id = await giveCards({ gameId: gameId, num: 2 });
          await setCardInPlay({
            gameId: gameId,
            playerId: playerId,
            cId: cId
          });
          nextTurn = await Games.nextTurn({ gameId: gameId, isSkip: true });
          break;
        case 13: // wild card
          //color selection will happen on front end
          await setCardInPlay({
            gameId: gameId,
            playerId: playerId,
            cId: cId
          });
          nextTurn = await Games.nextTurn({
            gameId: gameId,
            isSkip: false
          });
          break;
        case 14: // wild card give 4
          const give4Id = await giveCards({ gameId: gameId, num: 4 });
          await setCardInPlay({
            gameId: gameId,
            playerId: playerId,
            cId: cId
          });
          nextTurn = await Games.nextTurn({ gameId: gameId, isSkip: true });
          break;
      }
      const newCards = await hasNewCards({
        card: card,
        gameId: gameId,
        playerId: playerId
      });
      return {id: nextTurn, newCards: newCards};
    } else {
      await setCardInPlay({
        gameId: gameId,
        playerId: playerId,
        cId: cId
      });
      nextTurn = await Games.nextTurn({ gameId: gameId, isSkip: false });
      return {id: nextTurn, newCards: {status: false, id: null}};
    }
  } catch (e) {
    throw e;
  }
}


//flag
const hasNewCards = async ({ card, gameId, playerId }) => {
  let player = { id: null };
  const newCards = card.value === 12 || card.value === 14 ? true : false;
  if (newCards) {
    player = await Games.getNextTurn({
      gameId: gameId,
      currentTurn: playerId,
      isSkip: false
    });
  }
  return { status: newCards, id: player.id };
}

const getCardOptions = async ({ gameId, playerId }) => {
  try {
    const cardInPlay = await getCardInPlay({ gameId: gameId });
    const hand = await getHand({ playerId: playerId });
    const options = hand.filter((card, id) => {
      if (card.value > 12) {
        return true;
      } else if (card.color === cardInPlay.color) {
        return true;
      } else if (card.value === cardInPlay.value) {
        return true;
      } else {
        return false;
      }
    });
    return options;
  } catch (e) {
    throw e;
  }
}
//flag
const giveCards = async ({ gameId, num }) => {
  try {
    const deck = await getDeck({ gameId: gameId });
    const game = await Games.findGame({ gameId: gameId });

    let nextTurn = await Games.getNextTurn({
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
  getCard: getCard,
  getDeck: getDeck,
  getHand: getHand,
  setFirstCardInPlay: setFirstCardInPlay,
  setCardInPlay: setCardInPlay,
  removeCardInPlay: removeCardInPlay,
  getCardInPlay: getCardInPlay,
  generateDeck: generateDeck,
  generateHand: generateHand,
  submitCard: submitCard,
  hasNewCards: hasNewCards,
  getCardOptions: getCardOptions,
  giveCards: giveCards,
  drawCard: drawCard,
  changeColor: changeColor
}
