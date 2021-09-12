const express = require('express');

const dataRouter = require('./router/data-router');
const helmet = require('helmet');
const server = express();
// const cors = require('cors');
require('dotenv').config()

server.use(helmet());
server.use(express.json());
// server.use(cors());
server.use('/', dataRouter);

module.exports = server;