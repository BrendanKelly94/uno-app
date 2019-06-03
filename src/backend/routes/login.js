const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const queries = require("../db/queries");
const AsyncHandler = require("../AsyncHandler.js");
const CustomError = require("../errors/CustomError.js");

/* GET home page. */
router.post("/", AsyncHandler(async (req, res, next) => {
  const name = req.body.name;
  const inputPwd = req.body.pwd;

  if (name !== "bot") {
    let databasePwd;
    try{
      databasePwd = await queries.Users.findUser({ name: name });
    }catch(e){
      throw new CustomError({status: 200, message: "An account was not found for this user"})
    }

    bcrypt.compare(inputPwd, databasePwd.pwd).then((result) => {
      if (result) {
        res.json({ name: name });
      }else{
        throw new CustomError({status: 200, message: "username or password incorrect"})
      }
    }).catch((e) => {
      next(e);
    });

  }else {
    throw new CustomError({status: 200, message: "cannot log in as bot"})

  }
}));

module.exports = router;
