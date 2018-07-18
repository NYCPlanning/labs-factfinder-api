// simple express app to serve up custom APIs
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const autoIncrement = require('mongoose-auto-increment');
const compression = require('compression');

const app = express();
app.use(compression());
const connection = mongoose.connect(process.env.MONGO_URI, {
  useMongoClient: true,
});

autoIncrement.initialize(connection);

const routes = require('./routes');

// allows CORS
app.all('*', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type,Authorization');
  next();
});

app.use(bodyParser.json());
app.use('/', routes);

// catch 404 and forward to error handler
app.use((err, req, res, next) => {
  if (err.name === 'UnauthorizedError') {
    res.status(401).send({
      error: 'invalid token',
    });
  }

  next(err);
});

module.exports = app;
