const express = require("express");
const bodyParser = require("body-parser");
const { sequelize } = require("./model");
const app = express();
const router = new Router();
const util = require("util");

app.use(bodyParser.json());
app.set("sequelize", sequelize);
app.set("models", sequelize.models);
app.use(router);

app.use((error, req, res, next) => {
  if (error instanceof HttpError) {
    return res.status(error.code).json({
      error: error.message,
    });
  }

  console.error("unexpected behavior:", util.inspect(error));

  res.status(500).json({
    error: "Internal server error",
  });
});

module.exports = app;
