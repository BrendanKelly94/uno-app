const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const queries = require("../db/queries");
const knex = require("../db/knex.js");
const AsyncHandler = require("../AsyncHandler.js");

/* GET home page. */
router.post("/", AsyncHandler((req, res, next) => {
  const name = req.body.name;
  const pwd = req.body.pwd;

  if (pwd.length < 1) {
    throw new Error("Password cannot be empty")
  }

  if (name !== "bot") {
    bcrypt.hash(pwd, 1).then(async (hash) => {
      const result = await queries.addUser({ name: name, pwd: hash });
      if(result){
        res.json({ name: name });
      }else{
        throw new Error("Something went Wrong");
      }
    }).catch(e => {
      next(e);
    })

  } else {
    throw new Error("username bot is not valid")
  }
}));

module.exports = router;
