const functions = require('firebase-functions');

const userRouter = require('./router/user-router');
const loginRouter = require("./router/authRouters/login-router")
const registerRouter = require("./router/authRouters/register-router")
const sneakerRouter = require("./router/sneaker-router")
const orderRouter = require("./router/order-router")
const helmet = require('helmet');
const express = require("express")
const server = express();
const cors = require('cors');
require('dotenv').config()

server.use(helmet());
server.use(express.json())

var corsOptions = {
    origin: '*',
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
  }

server.use(cors(corsOptions))
server.get('/', (req, res) => {
    res.send('helljkfreol')
});
server.use('/user', userRouter);
server.use('/login', loginRouter);
server.use('/register', registerRouter);
server.use("/sneakers",sneakerRouter)
server.use("/orders",orderRouter)



exports.app = functions.https.onRequest(server)
