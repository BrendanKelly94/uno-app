process.env.NODE_ENV = 'test';

const chai = require('chai');
const should = chai.should();
const chaiHttp = require('chai-http');
const server = require('../app');
const knex = require('../db/knex.js');
const queries = require('../db/queries.js');

chai.use(chaiHttp);

const asyncHOF = (fn) => {
  return done => {
    fn.call().then(done, err => {
      done(err);
    });
  };
};

describe('Authentication Routes', _ => {

  before(async () => {
    try{
      const x = await knex.migrate.rollback();
      const y = await knex.migrate.latest();
      const z = await knex.seed.run();
    }catch(e){
      console.log(e)
    }
  })

  describe('Registration', () => {
    it('should be able to register a new account', asyncHOF(async () => {
      const res = await chai.request(server)
      .post('/register')
      .send({name: 'rTest', pwd: 'test'})

      res.should.have.status(200);
      const user = await queries.findUser({name: 'rTest'});
      user[0].name.should.equal('rTest');
      user[0].pwd.should.have.length(60);
    }));

    it('should not be able to register as bot', asyncHOF(async () => {
      const res = await chai.request(server)
      .post('/register')
      .send({name: 'bot', pwd: 'bot'})

      res.should.have.status(200)
      res.body.should.have.property('err');
  }));
  });

  describe('Login', () => {
    it('should log a user into their account', asyncHOF(async () => {
      const name = 'rTest';
      const pwd = 'test'

      const res = await chai.request(server)
      .post('/login')
      .send({name: name, pwd: pwd})

      res.should.have.status(200);
      res.body.should.equal(name);
    }))

    it('should not be able to login as bot', asyncHOF(async () => {
      const res = await chai.request(server)
      .post('/login')
      .send({name: 'bot', pwd: 'bot'})

      res.should.have.status(200)
      res.body.should.have.property('err');
    }));

  });
});
