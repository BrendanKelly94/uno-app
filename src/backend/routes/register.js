const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const queries = require('../db/queries');
const knex = require('../db/knex.js');

/* GET home page. */
router.post('/', (req, res, next) => {
  const name = req.body.name;
  const pwd = req.body.pwd;

  if(pwd.length < 1){
    res.json({err: 'Password cannot be empty'})
  }

  if(name !== 'bot'){
    bcrypt.hash(pwd, 1, async (err, hash) => {
      try{
        const result = await queries.addUser({name: name, pwd: hash});
      }catch(e){
        res.json({err: e});
      }
      res.json({name: name});
    })
  }else{
    res.json({err: 'username bot is not valid'});
  }

});

module.exports = router;
