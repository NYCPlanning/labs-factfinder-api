const expect = require('expect');
const request = require('supertest');
const http = require('http');
const app = require('../app');

const server = http.createServer(app);

const port = (process.env.NODE_ENV === 'production') ? process.env.PORT : 4000;

server.listen(port);
