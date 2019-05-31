const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const bodyParser = require("body-parser");

const indexRouter = require("./routes/index");
const loginRouter = require("./routes/login");
const registerRouter = require("./routes/register");
const apiRouter = require("./routes/api");

const app = express();
app.io = require("socket.io")({ upgradeTimeout: 30000 });

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static("public"));
app.use(logger('tiny'));

app.use("/", indexRouter);
app.use("/login", loginRouter);
app.use("/register", registerRouter);
app.use("/api", apiRouter(app.io));

app.use(function(req, res, next) {
  return res.send({message:'Route'+req.url+' Not found.', status: 404});
});


// error handler
app.use(function(err, req, res, next) {
  if(!err.status) err.status = 500; 
  console.log(err);
  res.json({message: err.message, status: err.status})
});


module.exports = app;
