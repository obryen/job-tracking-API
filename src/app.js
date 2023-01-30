const express = require('express');
const bodyParser = require('body-parser');
const {sequelize} = require('./model')
const {getProfile} = require('./middleware/getProfile')
const app = express();
const router = new Router();

app.use(bodyParser.json());
app.set('sequelize', sequelize)
app.set('models', sequelize.models)

module.exports = app;
