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
      const games = await queries.Games.getGames();
      res.send({ games: games });
  }));

  //get game
  router.get("/game/:id(\\d+)", AsyncHandler(async (req, res, next) => {
    const id = Number(req.params["id"]);
    const game = await queries.Games.findGame({ gameId: id });
    res.send({ game: game });
  }));

  //retrieve players in game
  router.get("/game/:id(\\d+)/players", AsyncHandler(async (req, res, next) => {
    const id = Number(req.params["id"]);
    const players = await queries.Players.getPlayers({ gameId: id });
    res.send({ players: players });
  }));

  //retrieve card in middle
  router.get("/getCardInPlay/:gameId(\\d+)", AsyncHandler(async (req, res, next) => {
    const gameId = Number(req.params["gameId"]);
    const cIP = await queries.GameCards.getCardInPlay({ gameId: gameId });
    res.send({ card: cIP });
  }));

  //retrieve hand
  router.get("/getHand/:playerId(\\d+)", AsyncHandler(async (req, res, next) => {
    const playerId = Number(req.params["playerId"]);
    const hand = await queries.GameCards.getHand({ playerId: playerId });
    res.send({ hand: hand });
  }));

  //create game
  router.post("/newGame", AsyncHandler(async (req, res, next) => {
    const botFill = req.body.botFill;
    const userName = req.body.userName;

    //findPlayer will throw error if no player is found
    let player = false;
    try{
      player = await queries.Players.findPlayer({ name: userName });
    }catch(e){
      //if no player is found continue creating game
    }
    if(player) await queries.Games.removeGame({ gameId: player.game_id });

    const id = await queries.Games.createGame({ botFill: botFill });
    await queries.GameCards.generateDeck({ gameId: id });

    if (botFill) {
      const bots = await queries.Games.fillBots({ gameId: id });
      for (let i = 0; i < bots.length; i++) {
        await queries.GameCards.generateHand({
          gameId: id,
          playerId: bots[i]
        });
      }
    }
    res.send({ id: id });
  }));

  //join game
  router.post("/game/:id(\\d+)", AsyncHandler(async (req, res, next) => {
    const gameId = Number(req.params["id"]);
    const name = req.body.name;
    const game = await queries.Games.findGame({ gameId: gameId });

    //if game is full and there are bots replace a bot with a player
    if (game.player_count === 6 && game.bot_fill === true) {
      const pId = await queries.Players.findAndReplacePlayer({gameId: gameId, name: name});
      gameIo.to(gameId).emit("newPlayer", { id: pId });
      res.send({ id: pId });
    } else {
      const playerId = await queries.Players.addPlayer({
        gameId: gameId,
        name: name
      });
      await queries.GameCards.generateHand({
        gameId: gameId,
        playerId: playerId
      });
      gameIo.to(gameId).emit("newPlayer", { id: playerId });
      res.send({ id: playerId });
    }
  }));

  // start game
  router.post("/game/:id(\\d+)/start", AsyncHandler(async (req, res, next) => {
    const gameId = Number(req.params["id"]);
    const name = req.body.name;
    const host = await queries.Players.findPlayer({ name: name });
    if (host.is_host) {
      await queries.Games.setHasStarted({ gameId: gameId });
      await queries.GameCards.setFirstCardInPlay({ gameId: gameId });
      const turn = await queries.Games.setTurn({
        gameId: gameId,
        playerId: host.id
      });
      gameIo.to(gameId).emit("start", {});
      res.send({ id: host.id });
    } else {
      throw new NotAuthorized();
    }
  }));

  router.get("/game/:gameId(\\d+)/getHandOptions/:playerId(\\d+)",
    AsyncHandler(async (req, res, next) => {
      const gameId = Number(req.params["gameId"]);
      const playerId = Number(req.params["playerId"]);
      const options = await queries.GameCards.getCardOptions({
        gameId: gameId,
        playerId: playerId
      });
      res.send({ options: options });
    })
  );

  router.get("/getPlayerHandCount/:playerId(\\d+)",
    AsyncHandler(async (req, res, next) => {
      const playerId = Number(req.params["playerId"]);
      const handCount = await queries.Players.getPlayerHandCount({
        playerId: playerId
      });
      res.send({ count: handCount });
    })
  );

  //get players for the game route
  router.get("/getPlayersWithCount/:gameId(\\d+)",
    AsyncHandler(async (req, res, next) => {
      const gameId = Number(req.params["gameId"]);
      const players = await queries.Players.getPlayers({ gameId: gameId });
      const countArray = [];
      //write a smarter query instead of looping
      for (let i = 0; i < players.length; i++) {
        const handCount = await queries.Players.getPlayerHandCount({
          playerId: players[i].id
        });
        players[i].cardCount = Number(handCount);
      }
      res.send({ players: players });
    })
  );

  router.post("/game/:id(\\d+)/submitCard/:playerId(\\d+)",
    AsyncHandler(async (req, res, next) => {
      const gameId = Number(req.params["id"]);
      const playerId = Number(req.params["playerId"]);
      const cId = req.body.cId;
      const color = req.body.color;
      const hasDrawn = req.body.hasDrawn;
      let nextTurn, card;

      if (cId !== -1) {
        if (color !== undefined) {
          await queries.GameCards.changeColor({ cId: cId, color: color });
        }
        card = await queries.GameCards.getCard({ cardId: cId });

        nextTurn = await queries.GameCards.submitCard({
          gameId: gameId,
          playerId: playerId,
          card: card
        });
      } else {
        card = { id: -1 };
        nextTurn = await queries.GameCards.submitCard({
          gameId: gameId,
          playerId: playerId,
          card: card
        });
      }
      //send next turn event to clients
      gameIo
        .to(gameId)
        .emit("newTurn", {
          currTurn: nextTurn.id,
          lastTurn: playerId,
          card: card,
          newCards: nextTurn.newCards
        });

      const playerWon = await queries.Players.hasWon({ gameId: gameId, playerId: playerId });
      const nextPlayer = await queries.Players.getPlayer({ playerId: nextTurn.id });

      //call recursive submit bot turn if next player is bot
      if (nextPlayer.is_bot && !playerWon) {
        await submitBotTurns({
          gameId: gameId,
          playerId: nextPlayer.id,
          offset: 3000
        });
      }
      res.send({ card: card });
    })
  );

  router.get("/game/:id(\\d+)/drawCard/:playerId(\\d+)",
    AsyncHandler(async (req, res, next) => {
      const gameId = Number(req.params["id"]);
      const playerId = Number(req.params["playerId"]);
      const drawCardId = await queries.GameCards.drawCard({
        gameId: gameId,
        playerId: playerId
      });
      const drawCard = await queries.GameCards.getCard({ cardId: drawCardId });
      res.send({ card: drawCard });
    })
  );


  async function submitBotTurns({ gameId, playerId, offset }) {
    try {
      const player = await queries.Players.getPlayer({ playerId: playerId });
      if (player.is_bot) {
          setTimeout(async () => {
            let card, nextTurn;
            let hasDrawn = false;
            const colors = ["red", "blue", "green", "yellow"];
            const options = await queries.GameCards.getCardOptions({
              gameId: gameId,
              playerId: playerId
            });

            if (options.length > 0) {
              const randomCard =
                options[Math.floor(Math.random() * options.length)];
              nextTurn = await queries.GameCards.submitCard({
                gameId: gameId,
                playerId: playerId,
                card: randomCard
              });
              card = await queries.GameCards.getCard({ cardId: randomCard.id });
            } else {
              const drawCardId = await queries.GameCards.drawCard({
                gameId: gameId,
                playerId: playerId
              });
              const newOptions = await queries.GameCards.getCardOptions({
                gameId: gameId,
                playerId: playerId
              });

              if (newOptions.length > 0) {
                hasDrawn = true;
                nextTurn = await queries.GameCards.submitCard({
                  gameId: gameId,
                  playerId: playerId,
                  card: newOptions[0]
                });
                card = await queries.GameCards.getCard({ cardId: newOptions[0].id });
              } else {
                card = { id: -1 };
                nextTurn = await queries.GameCards.submitCard({
                  gameId: gameId,
                  playerId: playerId,
                  card: card
                });
              }
            }

            gameIo
              .to(gameId)
              .emit("newTurn", {
                currTurn: nextTurn.id,
                lastTurn: playerId,
                card: card,
                newCards: nextTurn.newCards,
                hasDrawn: hasDrawn
              });
            const playerWon = await queries.Players.hasWon({
              gameId: gameId,
              playerId: playerId
            });
            if (playerWon) {
              gameIo
                .to(gameId)
                .emit("playerWon", {
                  playerId: player.id,
                  user_name: player.user_name
                });
              return true;
            } else {
              return await submitBotTurns({
                gameId: gameId,
                playerId: nextTurn.id,
                offset: offset
              });
            }
          }, offset)
      }
    } catch (e) {
      throw e;
    }

    return true;
  }

  router.post("/game/:gameId(\\d+)/leave/:playerId(\\d+)",
    AsyncHandler(async (req, res, next) => {
      const gameId = Number(req.params["gameId"]);
      const playerId = Number(req.params["playerId"]);
      const game = await queries.Games.findGame({ gameId: gameId });
      await queries.Players.replacePlayer({ playerId: playerId, name: "bot" });
      gameIo.to(gameId).emit("playerLeft", { playerId: playerId });
      res.send({ playerId: playerId });
    })
  );

  router.post("/game/:gameId(\\d+)/end/:playerId(\\d+)",
    AsyncHandler(async (req, res, next) => {
      const gameId = Number(req.params["gameId"]);
      const playerId = Number(req.params["playerId"]);
      const result = await queries.Games.removeGame({ gameId: gameId });
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
