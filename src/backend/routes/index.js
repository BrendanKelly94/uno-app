var express = require("express");
var router = express.Router();

/* GET home page. */
router.get("/", (req, res, next) => {
  res.sendfile("public/index.html");
});

router.get("/game*", (req, res, next) => {
  res.sendfile("public/index.html");
});

router.get("/lobby", (req, res, next) => {
  res.sendfile("public/index.html");
});

module.exports = router;
