// Update with your config settings.

module.exports = {
  test: {
    client: "postgresql",
    connection: {
      database: "uno_test",
      user: "brendan",
      password: "Brenan1"
    },
    migrations: {
      directory: __dirname + "/db/migrations"
    }
  },

  development: {
    client: "postgresql",
    connection: {
      host: "127.0.0.1",
      port: 5433,
      database: "uno_test",
      user: "brendan",
      password: "Brendan1"
    },
    migrations: {
      directory: __dirname + "/db/migrations"
    }
  },

  // staging: {
  //   client: 'postgresql',
  //   connection: {
  //     database: 'my_db',
  //     user:     'username',
  //     password: 'password'
  //   },
  //   pool: {
  //     min: 2,
  //     max: 10
  //   },
  //   migrations: {
  //     tableName: 'knex_migrations'
  //   }
  // },

  production: {
    client: "postgresql",
    connection: process.env.DATABASE_URL,
    migrations: {
      directory: __dirname + "/db/migrations"
    }
  }
};
