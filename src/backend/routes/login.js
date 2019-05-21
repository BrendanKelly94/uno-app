const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const queries = require("../db/queries");
const AsyncHandler = require("../AsyncHandler.js");

/* GET home page. */
router.post("/", AsyncHandler(async (req, res, next) => {
  const name = req.body.name;
  const inputPwd = req.body.pwd;

  if (name !== "bot") {
    const databasePwd = await queries.findUser({ name: name });
    if(!databasePwd){
      throw new Error("An account was not found for this user");
    }
    
    bcrypt.compare(inputPwd, databasePwd.pwd).then((result) => {
      if (result) {
        res.json({ name: name });
      }else{
        throw new Error("username or password incorrect")
      }
    }).catch((e) => {
      next(e);
    });

  }else {
    throw new Error("cannot login as bot");
  }
}));

module.exports = router;
