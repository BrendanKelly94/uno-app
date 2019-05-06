process.env.NODE_ENV = "test";

const chai = require("chai");
const should = chai.should();
const knex = require("../db/knex.js");
const queries = require("../db/queries.js");

const asyncHOF = fn => {
  return done => {
    fn.call().then(done, err => {
      done(err);
    });
  };
};

// addUser: addUser,
// getUsers: getUsers,
// findUser: findUser,
// getGames: getGames,
// findGame: findGame,
// createGame: createGame,
// fillBots: fillBots,
// setHost: setHost,
// setTurn: setTurn,
// addPlayer: addPlayer,
// updatePlayerCount: updatePlayerCount,
// replacePlayer: replacePlayer,
// getPlayers: getPlayers,
// getPlayer: getPlayer,
// findPlayer: findPlayer,
// getCard: getCard,
// getDeck: getDeck,
// getHand: getHand,
// setFirstCardInPlay: setFirstCardInPlay,
// setCardInPlay: setCardInPlay,
// getCardInPlay: getCardInPlay,
// generateDeck: generateDeck,
// generateHand: generateHand,
// getNextTurn: getNextTurn,
// nextTurn: nextTurn,
// flipDirection: flipDirection,
// giveCards: giveCards,
// drawCard: drawCard,
// customHand: customHand

describe("Queries unit testing", _ => {
  beforeEach(async () => {
    try {
      const x = await knex.migrate.rollback();
      const y = await knex.migrate.latest();
      const z = await knex.seed.run();
    } catch (e) {
      console.log(e);
    }
  });

  describe("Database seed queries", _ => {
    describe("generateDeck()", _ => {
      it(
        "generates a deck for a game given gameId",
        asyncHOF(async () => {
          const cards = await queries.generateDeck({ gameId: 1 });
          cards.should.have.length(108);
        })
      );
    });

    describe("generateHand()", _ => {
      it(
        "generates a hand for player given gameId and playerId",
        asyncHOF(async () => {
          const cards = await queries.generateHand({ gameId: 1, playerId: 1 });
          cards.should.have.length(7);
        })
      );
    });

    describe("customHand()", _ => {
      it(
        "gives a player a hand with special cards used for testing",
        asyncHOF(async () => {
          const hand = await queries.customHand({ gameId: 1, playerId: 1 });
          hand.should.have.length(6);
        })
      );
    });

    describe("setFirstCardInPlay()", _ => {
      it(
        "sets a random card in play for a game given gameId",
        asyncHOF(async () => {
          const cardId = await queries.setFirstCardInPlay({ gameId: 1 });
          cardId[0].should.be.a("number");
        })
      );
    });
  });

  describe("addUser()", _ => {
    it(
      "adds a user with hashed password to database given name and password",
      asyncHOF(async () => {
        const result = await queries.addUser({ name: "test1", pwd: "test" });
        result[0].should.equal("test1");
      })
    );
  });

  describe("getUsers()", _ => {
    it(
      "gets a list of users",
      asyncHOF(async () => {
        const result = await queries.getUsers();
        result.should.be.a("array");
      })
    );
  });

  describe("findUser()", _ => {
    it(
      "finds a user based on name",
      asyncHOF(async () => {
        const user = await queries.findUser({ name: "test" });
        user[0].name.should.equal("test");
      })
    );
  });

  describe("getGames()", _ => {
    it(
      "gets a list of games",
      asyncHOF(async () => {
        const games = await queries.getGames();
        games.should.be.a("array");
      })
    );
  });

  describe("findGame()", _ => {
    it(
      "finds a game based on id",
      asyncHOF(async () => {
        const game = await queries.findGame({ gameId: 1 });
        game[0].should.have.property("id");
      })
    );
  });

  describe("createGame()", _ => {
    it(
      "adds a game to the database specifying botfill",
      asyncHOF(async () => {
        const result = await queries.createGame({ botFill: false });
        result[0].should.be.a("number");
      })
    );
  });

  describe("removeGame()", _ => {
    it(
      "should delete a game",
      asyncHOF(async () => {
        const result = await queries.removeGame({ gameId: 1 });
        result[0].should.equal(1);
      })
    );
  });
  describe("fillBots()", _ => {
    it(
      "fills a game with bots given gameId",
      asyncHOF(async () => {
        const gameId = await queries.createGame({ botFill: true });
        const result = await queries.fillBots({ gameId: gameId[0] });
        result.should.be.a("array");
      })
    );
  });

  describe("setHost()", _ => {
    it(
      "Sets a host given a name",
      asyncHOF(async () => {
        const host = await queries.setHost({ name: "bren" });
        host[0].should.be.a("number");
      })
    );
  });

  describe("setTurn()", _ => {
    it(
      "Sets turn_id of game given a gameId and playerId",
      asyncHOF(async () => {
        const turnId = await queries.setTurn({ gameId: 1, playerId: 3 });
        turnId[0].should.equal(3);
      })
    );
  });

  describe("addPlayer()", _ => {
    it(
      "Adds a player to the database given gameId and name",
      asyncHOF(async () => {
        const playerId = await queries.addPlayer({ gameId: 1, name: "test" });
        playerId[0].should.be.a("number");
      })
    );
  });

  describe("updatePlayerCount()", _ => {
    it(
      "will update games player count given gameId and num",
      asyncHOF(async () => {
        const result = await queries.updatePlayerCount({ gameId: 1, num: 4 });
        result[0].should.equal(4);
      })
    );
  });

  describe("removePlayer()", _ => {
    it(
      "should remove player from game",
      asyncHOF(async () => {
        const result = await queries.removePlayer({ gameId: 1, playerId: 1 });
        result[0].should.equal(1);
      })
    );
  });

  describe("replacePlayer()", _ => {
    it(
      "will replace user_name of player given a playerId and name",
      asyncHOF(async () => {
        const name = await queries.replacePlayer({ playerId: 5, name: "test" });
        name[0].should.equal("test");
      })
    );
  });

  describe("getPlayers()", _ => {
    it(
      "gets a list of players given gameId",
      asyncHOF(async () => {
        const players = await queries.getPlayers({ gameId: 1 });
        players.should.be.a("array");
      })
    );
  });

  describe("getPlayer()", _ => {
    it(
      "returns a player given playerId",
      asyncHOF(async () => {
        const player = await queries.getPlayer({ playerId: 1 });
        player[0].should.have.property("id");
      })
    );
  });

  describe("findPlayer()", _ => {
    it(
      "finds a player based on name",
      asyncHOF(async () => {
        const player = await queries.findPlayer({ name: "brendan" });
        player[0].user_name.should.equal("brendan");
      })
    );
  });

  describe("getPlayerHandCount()", _ => {
    it(
      "returns the number of cards a specific player has",
      asyncHOF(async () => {
        const pHC = await queries.getPlayerHandCount({ playerId: 1 });
        pHC.should.be.a("number");
      })
    );
  });

  describe("getCard()", _ => {
    it(
      "gets a card based on cardId",
      asyncHOF(async () => {
        const card = await queries.getCard({ cardId: 1 });
        card[0].id.should.equal(1);
      })
    );
  });

  describe("getDeck()", _ => {
    it(
      "returns a deck of cards given gameId",
      asyncHOF(async () => {
        const deck = await queries.getDeck({ gameId: 1 });
        deck.length.should.equal(108);
      })
    );
  });

  describe("getHand()", _ => {
    it(
      "returns a hand of cards given playerId",
      asyncHOF(async () => {
        const hand = await queries.getHand({ playerId: 6 });
        hand.should.have.length(7);
      })
    );
  });

  describe("removeCardInPlay()", _ => {
    it(
      "removes card from play given gameId",
      asyncHOF(async () => {
        const cardId = await queries.removeCardInPlay({ gameId: 1 });
        cardId[0].should.be.a("number");
      })
    );
  });

  describe("getCardInPlay()", _ => {
    it(
      "returns card in play for a game given gameId",
      asyncHOF(async () => {
        const card = await queries.getCardInPlay({ gameId: 1 });
        card[0].game_id.should.equal(1);
      })
    );
  });

  describe("getNextTurn()", _ => {
    it(
      "returns next turn based given gameId, currentTurnId, and isSkip boolean",
      asyncHOF(async () => {
        const game = await queries.findGame({ gameId: 1 });
        const nextTurn = await queries.getNextTurn({
          gameId: 1,
          currentTurnId: game.turn_id,
          isSkip: false
        });
        nextTurn.id.should.be.a("number");
      })
    );
  });

  describe("nextTurn()", _ => {
    it(
      "sets the nextTurn given gameId and isSkip boolean",
      asyncHOF(async () => {
        const nextTurn = await queries.nextTurn({ gameId: 1, isSkip: false });
        nextTurn.should.be.a("number");
      })
    );
  });

  describe("flipDirection()", _ => {
    it(
      "flips the direction of game given gameId",
      asyncHOF(async () => {
        const game = await queries.findGame({ gameId: 1 });
        const direction = game[0].direction;
        const result = await queries.flipDirection({ gameId: 1 });
        result[0].should.equal(!direction);
      })
    );
  });

  describe("giveCards()", _ => {
    it(
      "gives next player amount of cards given gameId and number of cards",
      asyncHOF(async () => {
        const cards = await queries.giveCards({ gameId: 1, num: 2 });
        cards.length.should.equal(2);
      })
    );
  });

  describe("drawCard()", _ => {
    it(
      "adds a card to players hand given gameId and playerId",
      asyncHOF(async () => {
        const cardId = await queries.drawCard({ gameId: 1, playerId: 1 });
        cardId[0].should.be.a("number");
      })
    );
  });
});
