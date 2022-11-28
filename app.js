// simple express app to serve up custom APIs
const express = require('express');
const logger = require('morgan');
const bodyParser = require('body-parser');
const compression = require('compression');

const app = express();

// require pg-promise
const pgp = require('pg-promise')({
  query(e) {
     (process.env.DEBUG === 'true') ? console.log(e.query) : null; // eslint-disable-line
  },
});

// initialize postgresql connection
app.db = pgp(process.env.DATABASE_URL);

// allows CORS
app.use(cors({
  origin: ['https://staging--labs-factfinder.netlify.app','https://develop--labs-factfinder.netlify.app','https://popfactfinder.planning.nyc.gov/'],
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: 'X-Requested-With,Content-Type,Authorization',
}))

// middleware
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(compression());

// routes
app.use('/search', require('./routes/search'));
app.use('/selection', require('./routes/selection'));
app.use('/geo-options', require('./routes/geo-options'));
app.use('/survey', require('./routes/survey'));
app.use('/summary', require('./routes/summary'));

app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'not found',
  });
});

module.exports = app;
