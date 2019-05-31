module.exports = function(io) {
  const express = require("express");
  const gameIo = io.of("/game");
  const router = express.Router();
  const queries = require("../db/queries.js");
  const AsyncHandler = require("../AsyncHandler.js")
  const NotAuthorized = require('../errors/NotAuthorized.js');
  const NotFound = require('../errors/NotFound.js');
  const NotKnown = require('../errors/NotKnown.js');
  const CustomError = require('../errors/CustomError.js');


  //retrieve games
  router.get("/games", AsyncHandler(async (req, res, next) => {
      const games = await queries.getGames();
      res.send({ games: games });
  }));

  //get game
  router.get("/game/:id", AsyncHandler(async (req, res, next) => {
    const id = parseInt(req.params["id"], 10);
    const game = await queries.findGame({ gameId: id });
    res.send({ game: game });
  }));

  //retrieve players in game
  router.get("/game/:id/players", AsyncHandler(async (req, res, next) => {
    const id = parseInt(req.params["id"], 10);
    const players = await queries.getPlayers({ gameId: id });
    res.send({ players: players });
  }));

  //retrieve card in middle
  router.get("/getCardInPlay/:gameId", AsyncHandler(async (req, res, next) => {
    const gameId = parseInt(req.params["gameId"], 10);
    const cIP = await queries.getCardInPlay({ gameId: gameId });
    res.send({ card: cIP });
  }));

  //retrieve hand
  router.get("/getHand/:playerId", AsyncHandler(async (req, res, next) => {
    const playerId = parseInt(req.params["playerId"], 10);
    const hand = await queries.getHand({ playerId: playerId });
    res.send({ hand: hand });
  }));

  //create game
  router.post("/newGame", AsyncHandler(async (req, res, next) => {
    const botFill = req.body.botFill;
    const userName = req.body.userName;

    //findPlayer will throw error if no player is found
    let player = false;
    try{
      player = await queries.findPlayer({ name: userName });
    }catch(e){
      //if no player is found continue creating game
    }
    if(player) await queries.removeGame({ gameId: player.game_id });

    const id = await queries.createGame({ botFill: botFill });
    await queries.generateDeck({ gameId: id });

    if (botFill) {
      const bots = await queries.fillBots({ gameId: id });
      for (let i = 0; i < bots.length; i++) {
        await queries.generateHand({
          gameId: id,
          playerId: bots[i]
        });
      }
    }
    res.send({ id: id });
  }));

  //join game
  router.post("/game/:id", AsyncHandler(async (req, res, next) => {
    const gameId = parseInt(req.params["id"], 10);
    const name = req.body.name;
    const game = await queries.findGame({ gameId: gameId });

    //if game is full and there are bots replace a bot with a player
    if (game.player_count === 6 && game.bot_fill === true) {
      const pId = await findAndReplacePlayer(gameId, name);
      gameIo.to(gameId).emit("newPlayer", { id: pId });
      res.send({ id: pId });
    } else {
      const playerId = await queries.addPlayer({
        gameId: gameId,
        name: name
      });
      await queries.generateHand({
        gameId: gameId,
        playerId: playerId
      });
      gameIo.to(gameId).emit("newPlayer", { id: playerId });
      res.send({ id: playerId });
    }
  }));

  // start game
  router.post("/game/:id/start", AsyncHandler(async (req, res, next) => {
    const gameId = parseInt(req.params["id"], 10);
    const name = req.body.name;
    const host = await queries.findPlayer({ name: name });
    if (host.is_host) {
      await queries.setHasStarted({ gameId: gameId });
      await queries.setFirstCardInPlay({ gameId: gameId });
      const turn = await queries.setTurn({
        gameId: gameId,
        playerId: host.id
      });
      gameIo.to(gameId).emit("start", {});
      res.send({ id: host.id });
    } else {
      throw new NotAuthorized();
    }
  }));

  router.get("/game/:gameId/getHandOptions/:playerId",
    AsyncHandler(async (req, res, next) => {
      const gameId = parseInt(req.params["gameId"], 10);
      const playerId = parseInt(req.params["playerId"], 10);
      const options = await getCardOptions({
        gameId: gameId,
        playerId: playerId
      });
      res.send({ options: options });
    })
  );

  router.get("/getPlayerHandCount/:playerId",
    AsyncHandler(async (req, res, next) => {
      const playerId = parseInt(req.params["playerId"], 10);
      const handCount = await queries.getPlayerHandCount({
        playerId: playerId
      });
      res.send({ count: handCount });
    })
  );

  //get players for the game route
  router.get("/getPlayersWithCount/:gameId",
    AsyncHandler(async (req, res, next) => {
      const gameId = parseInt(req.params["gameId"], 10);
      const players = await queries.getPlayers({ gameId: gameId });
      const countArray = [];
      //write a smarter query instead of looping
      for (let i = 0; i < players.length; i++) {
        const handCount = await queries.getPlayerHandCount({
          playerId: players[i].id
        });
        players[i].cardCount = parseInt(handCount, 10);
      }
      res.send({ players: players });
    })
  );

  router.post("/game/:id/submitCard/:playerId",
    AsyncHandler(async (req, res, next) => {
      const gameId = parseInt(req.params["id"], 10);
      const playerId = parseInt(req.params["playerId"], 10);
      const cId = req.body.cId;
      const color = req.body.color;
      const hasDrawn = req.body.hasDrawn;
      let nextTurnId, card;
      let newCards = { status: false, id: null };

      if (cId !== -1) {
        if (color !== undefined) {
          await queries.changeColor({ cId: cId, color: color });
        }
        card = await queries.getCard({ cardId: cId });
        newCards = await hasNewCards({
          card: card,
          gameId: gameId,
          playerId: playerId
        });
        nextTurnId = await submitCard({
          gameId: gameId,
          playerId: playerId,
          card: card
        });
      } else {
        card = { id: -1 };
        nextTurnId = await submitCard({
          gameId: gameId,
          playerId: playerId,
          card: card
        });
      }
      //send next turn event to clients
      gameIo
        .to(gameId)
        .emit("newTurn", {
          currTurn: nextTurnId,
          lastTurn: playerId,
          card: card,
          newCards: { status: newCards.status, id: newCards.id }
        });

      const playerWon = await hasWon({ gameId: gameId, playerId: playerId });
      const nextPlayer = await queries.getPlayer({ playerId: nextTurnId });

      //call recursive submit bot turn if next player is bot
      if (nextPlayer.is_bot && !playerWon) {
        await submitBotTurn({
          gameId: gameId,
          playerId: nextPlayer.id,
          offset: 3000
        });
      }
      res.send({ card: card });
    })
  );

  router.get("/game/:id/drawCard/:playerId",
    AsyncHandler(async (req, res, next) => {
      const gameId = parseInt(req.params["id"], 10);
      const playerId = parseInt(req.params["playerId"], 10);
      const drawCardId = await queries.drawCard({
        gameId: gameId,
        playerId: playerId
      });
      const drawCard = await queries.getCard({ cardId: drawCardId });
      res.send({ card: drawCard });
    })
  );

  async function submitCard({ gameId, playerId, card }) {
    let nextTurn;
    const cId = card.id;
    try {
      if (cId === -1) {
        nextTurn = await queries.nextTurn({ gameId: gameId, isSkip: false });
        return nextTurn;
      } else if (card.value > 9) {
        switch (card.value) {
          case 10: //switch direction
            await queries.flipDirection({ gameId: gameId });
            await queries.setCardInPlay({
              gameId: gameId,
              playerId: playerId,
              cId: cId
            });
            nextTurn = await queries.nextTurn({
              gameId: gameId,
              isSkip: false
            });
            break;
          case 11: //skip
            await queries.setCardInPlay({
              gameId: gameId,
              playerId: playerId,
              cId: cId
            });
            nextTurn = await queries.nextTurn({ gameId: gameId, isSkip: true });
            break;
          case 12: //give 2 & skip
            const give2Id = await queries.giveCards({ gameId: gameId, num: 2 });
            await queries.setCardInPlay({
              gameId: gameId,
              playerId: playerId,
              cId: cId
            });
            nextTurn = await queries.nextTurn({ gameId: gameId, isSkip: true });
            break;
          case 13: // wild card
            //color selection will happen on front end
            await queries.setCardInPlay({
              gameId: gameId,
              playerId: playerId,
              cId: cId
            });
            nextTurn = await queries.nextTurn({
              gameId: gameId,
              isSkip: false
            });
            break;
          case 14: // wild card give 4
            const give4Id = await queries.giveCards({ gameId: gameId, num: 4 });
            await queries.setCardInPlay({
              gameId: gameId,
              playerId: playerId,
              cId: cId
            });
            nextTurn = await queries.nextTurn({ gameId: gameId, isSkip: true });
            break;
        }
        return nextTurn;
      } else {
        await queries.setCardInPlay({
          gameId: gameId,
          playerId: playerId,
          cId: cId
        });
        nextTurn = await queries.nextTurn({ gameId: gameId, isSkip: false });
        return nextTurn;
      }
    } catch (e) {
      throw e;
    }
  }

  async function submitBotTurn({ gameId, playerId, offset }) {
    try {
      const player = await queries.getPlayer({ playerId: playerId });
      if (player.is_bot) {
        setTimeout(async () => {
          let newCards, card, nextTurn;
          let hasDrawn = false;
          const colors = ["red", "blue", "green", "yellow"];
          const options = await getCardOptions({
            gameId: gameId,
            playerId: playerId
          });

          if (options.length > 0) {
            const randomCard =
              options[Math.floor(Math.random() * options.length)];
            newCards = await hasNewCards({
              card: randomCard,
              gameId: gameId,
              playerId: playerId
            });
            nextTurn = await submitCard({
              gameId: gameId,
              playerId: playerId,
              card: randomCard
            });
            card = await queries.getCard({ cardId: randomCard.id });
          } else {
            const drawCardId = await queries.drawCard({
              gameId: gameId,
              playerId: playerId
            });
            const newOptions = await getCardOptions({
              gameId: gameId,
              playerId: playerId
            });

            if (newOptions.length > 0) {
              hasDrawn = true;
              newCards = await hasNewCards({
                card: newOptions[0],
                gameId: gameId,
                playerId: playerId
              });
              nextTurn = await submitCard({
                gameId: gameId,
                playerId: playerId,
                card: newOptions[0]
              });
              card = await queries.getCard({ cardId: newOptions[0].id });
            } else {
              newCards = { status: false, id: null };
              card = { id: -1 };
              nextTurn = await submitCard({
                gameId: gameId,
                playerId: playerId,
                card: card
              });
            }
          }

          gameIo
            .to(gameId)
            .emit("newTurn", {
              currTurn: nextTurn,
              lastTurn: playerId,
              card: card,
              newCards: { status: newCards.status, id: newCards.id },
              hasDrawn: hasDrawn
            });
          const playerWon = await hasWon({
            gameId: gameId,
            playerId: playerId
          });
          if (playerWon) {
            return true;
          } else {
            return await submitBotTurn({
              gameId: gameId,
              playerId: nextTurn,
              offset: offset
            });
          }
        }, offset);
      }
    } catch (e) {
      throw e;
    }

    return true;
  }

  async function findAndReplacePlayer(gameId, name){
    try{
      const players = await queries.getPlayers({ gameId: gameId });
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
      const pId = await queries.replacePlayer({
        playerId: players[found].id,
        name: name
      });
      if (allbots) {
        await queries.setHost({ name: name });
      }
      return pId;
    }catch(e){
      throw e
    }
  }

  async function hasWon({ gameId: gameId, playerId: playerId }) {
    try {
      const handCount = await queries.getPlayerHandCount({
        playerId: playerId
      });
      const player = await queries.getPlayer({ playerId: playerId });
      if (handCount === "0") {
        gameIo
          .to(gameId)
          .emit("playerWon", {
            playerId: player.id,
            user_name: player.user_name
          });
        return true;
      } else {
        return false;
      }
    } catch (e) {
      throw e;
    }
  }

  async function hasNewCards({ card, gameId, playerId }) {
    let player = { id: null };
    const newCards = card.value === 12 || card.value === 14 ? true : false;
    if (newCards) {
      player = await queries.getNextTurn({
        gameId: gameId,
        currentTurn: playerId,
        isSkip: false
      });
    }
    return { status: newCards, id: player.id };
  }

  async function getCardOptions({ gameId, playerId }) {
    try {
      const cardInPlay = await queries.getCardInPlay({ gameId: gameId });
      const hand = await queries.getHand({ playerId: playerId });
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

  router.post("/game/:gameId/leave/:playerId",
    AsyncHandler(async (req, res, next) => {
      const gameId = parseInt(req.params["gameId"], 10);
      const playerId = parseInt(req.params["playerId"], 10);
      const game = await queries.findGame({ gameId: gameId });
      await queries.replacePlayer({ playerId: playerId, name: "bot" });
      gameIo.to(gameId).emit("playerLeft", { playerId: playerId });
      res.send({ playerId: playerId });
    })
  );

  router.post("/game/:gameId/end/:playerId",
    AsyncHandler(async (req, res, next) => {
      const gameId = parseInt(req.params["gameId"], 10);
      const playerId = parseInt(req.params["playerId"], 10);
      const result = await queries.removeGame({ gameId: gameId });
      gameIo.to(gameId).emit("end", { message: "game has ended by host" });
      res.send({ gameId: result });
    })
  );

  gameIo.on("connection", socket => {
    socket.on("join", data => {
      socket.join(data.gameId);
      gameIo.to(data.gameId).emit("joined", { gameId: data.gameId });
    });

    socket.on("disconnect", data => {
    });

    socket.on("newMessage", data => {
      gameIo
        .to(data.gameId)
        .emit("chatMessage", {
          message: data.message,
          user_name: data.userName
        });
    });
  });

  return router;
};
