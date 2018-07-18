// simple express app to serve up custom APIs
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const autoIncrement = require('mongoose-auto-increment');
const compression = require('compression');

const app = express();

// initialize mongodb connection
const connection = mongoose.connect(process.env.MONGO_URI, {
  useMongoClient: true,
});

autoIncrement.initialize(connection);

// require pg-promise
const pgp = require('pg-promise')({
  query(e) {
     (process.env.DEBUG === 'true') ? console.log(e.query) : null; // eslint-disable-line
  },
});

// initialize postgresql connection
app.db = pgp(process.env.DATABASE_CONNECTION_STRING);

// allows CORS
app.all('*', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type,Authorization');
  next();
});

// middleware
app.use(bodyParser.json());
app.use(compression());

// routes
app.use('/search', require('./routes/search'));
app.use('/selection', require('./routes/selection'));
app.use('/profile', require('./routes/profile'));

app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'not found',
  });
});

module.exports = app;
