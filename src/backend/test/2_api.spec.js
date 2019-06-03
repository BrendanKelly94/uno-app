process.env.NODE_ENV = "test";

const chai = require("chai");
const should = chai.should();
const chaiHttp = require("chai-http");
const server = require("../app");
const knex = require("../db/knex.js");
const queries = require("../db/queries.js");
const io = require("socket.io-client");
const socketUrl = "http://localhost:3000/game";
const options = {
  // resource: 'game',
  newConnection: true,
  transports: ["websocket"]
};

chai.use(chaiHttp);

const asyncHOF = fn => {
  return done => {
    fn.call().then(done, err => {
      done(err);
    });
  };
};

describe("API Routes", _ => {
  describe("/api/games", _ => {
    before(async () => {
      try {
        const x = await knex.migrate.rollback();
        const y = await knex.migrate.latest();
        const z = await knex.seed.run();
      } catch (e) {
        console.log(e);
      }
    });

    it(
      "should return a list of games for matchmaking",
      asyncHOF(async () => {
        const res = await chai.request(server).get("/api/games");
        res.should.have.status(200);
        res.body.should.have.property("games");
      })
    );
  });

  describe("/api/newGame", _ => {
    /*
      This test creates 2 games with id 3 & 4 and generates a deck
      These games will be used in later tests
    */

    it(
      "should enter game into database",
      asyncHOF(async () => {
        const res = await chai
          .request(server)
          .post("/api/newGame")
          .send({ botFill: false });
        res.should.have.status(200);
        res.body.should.have.property("id");
      })
    );

    it(
      "should generate a game deck",
      asyncHOF(async () => {
        const res = await chai
          .request(server)
          .post("/api/newGame")
          .send({ botFill: true });

        const deck = await queries.getDeck({ gameId: res.body.id });
        deck.should.be.a("array");
        deck.should.have.length(108);
      })
    );

    it(
      "should fill with bots if botfill is set to true",
      asyncHOF(async () => {
        const gameId = 2;
        const players = await queries.getPlayers({ gameId: gameId });
        players.should.have.length(6);
      })
    );
  });

  describe("/api/game/:id", _ => {
    beforeEach(async () => {
      try {
        await knex.migrate.rollback();
        await knex.migrate.latest();
        await knex.seed.run();
      } catch (e) {
        console.log(e);
      }
    });

    it(
      "sends a socket join event upon joining",
      asyncHOF(async () => {
        const name = "test";
        const gameId = 1;
        const socket = io.connect(
          socketUrl,
          options
        );
        let id;

        socket.on("joined", data => {
          data.gameId.should.equal(gameId);
          socket.disconnect();
        });

        const res = await chai
          .request(server)
          .post(`/api/game/${gameId}`)
          .send({ name: name });
        socket.emit("join", { gameId: gameId });
        res.should.have.status(200);
      })
    );

    it(
      "should let a user join game without bots",
      asyncHOF(async () => {
        const name = "test";
        const gameId = 1;
        const res = await chai
          .request(server)
          .post(`/api/game/${gameId}`)
          .send({ name: name });

        const player = await queries.findPlayer({ name: name });
        res.should.have.status(200);
        player[0].user_name.should.equal(name);
        player[0].game_id.should.equal(gameId);
      })
    );

    it(
      "should let a user join game with bots",
      asyncHOF(async () => {
        const name = "test";
        const gameId = 2;
        const res = await chai
          .request(server)
          .post(`/api/game/${gameId}`)
          .send({ name: name });

        const player = await queries.findPlayer({ name: name });
        const game = await queries.findGame({ gameId: gameId });
        player[0].user_name.should.equal(name);
        player[0].game_id.should.equal(gameId);
        game[0].player_count.should.equal(6);
        res.should.have.status(200);
      })
    );

    it(
      "should generate player hand",
      asyncHOF(async () => {
        const name = "test";
        const gameId = 1;
        const res = await chai
          .request(server)
          .post(`/api/game/${gameId}`)
          .send({ name: name });

        const player = await queries.findPlayer({ name: name });
        const hand = await queries.getHand({ playerId: player[0].id });
        res.should.have.status(200);
        hand.should.be.a("array");
        hand.should.have.length(7);
      })
    );
  });

  describe("/api/game/:gameId/start", _ => {
    beforeEach(async () => {
      try {
        await knex.migrate.rollback();
        await knex.migrate.latest();
        await knex.seed.run();
      } catch (e) {
        console.log(e);
      }
    });

    it(
      "should send a newTurn event with first turn id",
      asyncHOF(async () => {
        const name = "brendan";
        const gameId = 1;
        const socket = io.connect(
          socketUrl,
          options
        );
        socket.emit("join", { gameId: 1 });
        socket.on("newTurn", data => {
          data.should.have.property("id");
          socket.disconnect();
        });
        const res = await chai
          .request(server)
          .post(`/api/game/${gameId}/start`)
          .send({ name: name });

        res.body.id.should.be.a("number");
        res.should.have.status(200);
      })
    );

    it(
      "should set card in play",
      asyncHOF(async () => {
        const gameId = 1;
        const name = "brendan";
        const res = await chai
          .request(server)
          .post(`/api/game/${gameId}/start`)
          .send({ name: name });

        const card = await queries.getCardInPlay({ gameId: gameId });
        card[0].is_in_play.should.equal(true);
      })
    );
  });

  describe("/api/game/:gameId/getHandOptions/:playerId", () => {
    const gameId = 1;
    const name = "brendan";

    it(
      "will generate a list of possible cards to play for player",
      asyncHOF(async () => {
        const player = await queries.findPlayer({ name: name });
        const res = await chai
          .request(server)
          .get(`/api/game/${gameId}/getHandOptions/${player[0].id}`);

        res.should.have.status(200);
        res.body.should.have.property("options");
      })
    );
  });

  describe("/api/game/:gameId/leave/:playerId", _ => {
    it(
      "should remove player from game and replace with bot",
      asyncHOF(async () => {
        const socket = io.connect(
          socketUrl,
          options
        );
        socket.emit("join", { gameId: 1 });
        socket.on("playerLeft", data => {
          data.should.have.property("playerId");
          socket.disconnect();
        });
        const oldGame = await queries.findGame({ gameId: 1 });

        const res = await chai.request(server).post("/api/game/1/leave/1");

        const player = await queries.getPlayer({ playerId: 1 });
        player[0].user_name.should.equal("bot");
        res.body.should.have.property("playerId");
        res.should.have.status(200);
      })
    );
  });

  describe("/api/game/:gameId/end", _ => {
    it(
      "will delete game off of database",
      asyncHOF(async () => {
        const oldGames = await queries.getGames();

        const res = await chai.request(server).post("/api/game/1/end");

        const newGames = await queries.getGames();
        newGames.should.have.length(oldGames.length - 1);
        res.should.have.status(200);
        res.body.should.have.property("gameId");
      })
    );
  });

  describe("/api/game/:gameId/submitCard/:playerId", _ => {
    const gameId = 1;

    describe("if normal card", _ => {
      beforeEach(async () => {
        try {
          await knex.migrate.rollback();
          await knex.migrate.latest();
          await knex.seed.run();
        } catch (e) {
          console.log(e);
        }
      });

      it(
        "will set card in play",
        asyncHOF(async () => {
          const hand = await queries.getHand({ playerId: 1 });
          const reg = hand.filter(card => {
            if (card.value === 1) {
              return true;
            } else {
              return false;
            }
          });
          const res = await chai
            .request(server)
            .post(`/api/game/${1}/submitCard/${1}`)
            .send({ card: reg[0] });

          const cardInPlay = await queries.getCardInPlay({ gameId: gameId });
          cardInPlay[0].id.should.equal(reg[0].id);
        })
      );

      it(
        "will set next turn if clockwise",
        asyncHOF(async () => {
          const hand = await queries.getHand({ playerId: 1 });
          const reg = hand.filter(card => {
            if (card.value === 1) {
              return true;
            } else {
              return false;
            }
          });
          const res = await chai
            .request(server)
            .post(`/api/game/${1}/submitCard/${1}`)
            .send({ card: reg[0] });

          const nextTurn = await queries.getNextTurn({
            gameId: 1,
            currentTurn: 1,
            isSkip: false
          });
          nextTurn.id.should.equal(2);
        })
      );

      it(
        "will set next turn if counter clockwise",
        asyncHOF(async () => {
          await queries.flipDirection({ gameId: 1 });
          const hand = await queries.getHand({ playerId: 1 });
          const reg = hand.filter(card => {
            if (card.value === 1) {
              return true;
            } else {
              return false;
            }
          });
          const res = await chai
            .request(server)
            .post(`/api/game/${1}/submitCard/${1}`)
            .send({ card: reg[0] });

          const nextTurn = await queries.getNextTurn({
            gameId: 1,
            currentTurn: 1,
            isSkip: false
          });
          nextTurn.id.should.equal(3);
        })
      );
    });

    describe("if special card", _ => {
      beforeEach(async () => {
        try {
          await knex.migrate.rollback();
          await knex.migrate.latest();
          await knex.seed.run();
        } catch (e) {
          console.log(e);
        }
      });
      it(
        "will reverse direction",
        asyncHOF(async () => {
          let game = await queries.findGame({ gameId: gameId });
          const turnId = game[0].turn_id;
          const lastDirection = game[0].direction;

          const res = await chai
            .request(server)
            .post(`/api/game/${gameId}/submitCard/${turnId}`)
            .send({ card: { value: 10, color: "red" } });

          game = await queries.findGame({ gameId: gameId });
          game[0].direction.should.equal(!lastDirection);
          res.should.have.status(200);
        })
      );

      it(
        "will skip turn",
        asyncHOF(async () => {
          let game = await queries.findGame({ gameId: gameId });
          const hand = await queries.getHand({ playerId: 1 });
          const skip = hand.filter(card => {
            if (card.value === 11) {
              return true;
            } else {
              return false;
            }
          });
          const nextTurn = await queries.getNextTurn({
            gameId: gameId,
            currentTurn: 1,
            isSkip: true
          });

          const res = await chai
            .request(server)
            .post(`/api/game/${gameId}/submitCard/${1}`)
            .send({ card: skip[0] });

          game = await queries.findGame({ gameId: gameId });
          const currentTurn = game[0].turn_id;
          res.should.have.status(200);
          currentTurn.should.equal(nextTurn.id);
        })
      );

      it(
        "will give 2 cards and skip next turn",
        asyncHOF(async () => {
          let game = await queries.findGame({ gameId: gameId });
          const turnId = game[0].turn_id; //current turn
          const playerHand = await queries.getHand({ playerId: turnId });
          const give2Card = playerHand.filter(card => {
            if (card.value === 12) {
              return true;
            } else {
              return false;
            }
          });
          const nextTurn = await queries.getNextTurn({
            gameId: gameId,
            currentTurn: turnId,
            isSkip: false
          });
          let hand = await queries.getHand({ playerId: nextTurn.id });
          const numOfCards = hand.length;

          const res = await chai
            .request(server)
            .post(`/api/game/${gameId}/submitCard/${turnId}`)
            .send({ card: give2Card[0] });

          const nextNextTurn = await queries.getNextTurn({
            gameId: gameId,
            currentTurn: nextTurn.id,
            isSkip: false
          });

          game = await queries.findGame({ gameId: gameId });
          hand = await queries.getHand({ playerId: nextTurn.id });
          const newNumOfCards = hand.length;
          newNumOfCards.should.equal(numOfCards + 2);
          game[0].turn_id.should.equal(nextNextTurn.id);
          res.should.have.status(200);
        })
      );

      it(
        "will change color",
        asyncHOF(async () => {
          const game = await queries.findGame({ gameId: gameId });
          const turnId = game[0].turn_id;
          const hand = await queries.getHand({ playerId: turnId });
          const colorCard = hand.filter(card => {
            if (card.value === 13) {
              return true;
            } else {
              return false;
            }
          });
          const res = await chai
            .request(server)
            .post(`/api/game/${gameId}/submitCard/${turnId}`)
            .send({ card: colorCard[0] });

          const cardInPlay = await queries.getCardInPlay({ gameId: gameId });
          res.should.have.status(200);
          cardInPlay[0].value.should.equal(13);
        })
      );

      it(
        "will give 4 cards and skip next turn",
        asyncHOF(async () => {
          let game = await queries.findGame({ gameId: gameId });
          const turnId = game[0].turn_id; //current turn
          const playerHand = await queries.getHand({ playerId: turnId });
          const give4Card = playerHand.filter(card => {
            if (card.value === 14) {
              return true;
            } else {
              return false;
            }
          });
          const nextTurn = await queries.getNextTurn({
            gameId: gameId,
            currentTurn: turnId,
            isSkip: false
          });
          let hand = await queries.getHand({ playerId: nextTurn.id });
          const numOfCards = hand.length;

          const res = await chai
            .request(server)
            .post(`/api/game/${gameId}/submitCard/${turnId}`)
            .send({ card: give4Card[0] });

          const nextNextTurn = await queries.getNextTurn({
            gameId: gameId,
            currentTurn: nextTurn.id,
            isSkip: false
          });

          game = await queries.findGame({ gameId: gameId });
          hand = await queries.getHand({ playerId: nextTurn.id });
          const newNumOfCards = hand.length;
          game[0].turn_id.should.equal(nextNextTurn.id);
          newNumOfCards.should.equal(numOfCards + 4);
          res.should.have.status(200);
        })
      );
    });

    describe("if next turn is bot", _ => {
      beforeEach(async () => {
        try {
          await knex.migrate.rollback();
          await knex.migrate.latest();
          await knex.seed.run();
        } catch (e) {
          console.log(e);
        }
      });
      it(
        "bot will submitTurn automatically",
        asyncHOF(async () => {
          const hand = await queries.getHand({ playerId: 4 });
          const reg = hand.filter(card => {
            if (card.value === 1) {
              return true;
            } else {
              return false;
            }
          });

          const res = await chai
            .request(server)
            .post(`/api/game/${2}/submitCard/${4}`)
            .send({ card: reg[0] });

          res.body.id.should.be.a("number");
          res.body.id.should.equal(4);
          res.should.have.status(200);
        })
      );
    });
  });

  describe("/api/game/:id/drawCard/:playerId", _ => {
    before(async () => {
      try {
        await knex.migrate.rollback();
        await knex.migrate.latest();
        await knex.seed.run();
      } catch (e) {
        console.log(e);
      }
    });
    it(
      "will draw a card for player",
      asyncHOF(async () => {
        const gameId = 1;
        const game = await queries.findGame({ gameId: gameId });
        const turnId = game[0].turn_id; //current turn
        let hand = await queries.getHand({ playerId: turnId });
        const oldCardCount = hand.length;

        const res = await chai
          .request(server)
          .get(`/api/game/${gameId}/drawCard/${turnId}`);

        hand = await queries.getHand({ playerId: turnId });
        const cardCount = hand.length;
        cardCount.should.equal(oldCardCount + 1);
        res.body.should.have.property("card");
        res.should.have.status(200);
      })
    );
  });
});
