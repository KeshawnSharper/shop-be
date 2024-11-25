const express = require('express');
const router = express.Router();
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const multer = require("multer")
const axios = require("axios")
const nodemailer = require('nodemailer');
const {scanDB,putDB,deleteDB} = require('./awsFunctions')
const storage = require('node-sessionstorage')
// router.use(bodyParser.json());
const AWS = require("aws-sdk");
const { response } = require('express');
// const { AWS_ACCESS, AWS_SECRET,AWS_REGION_ID} =
//   process.env;
//   AWS.config.update({
//     accessKeyId: AWS_ACCESS,
//     secretAccessKey: AWS_SECRET,
//     region: AWS_REGION_ID
// })
const globalFunctions = require('./globalFunctions')
const {checkUser,checkAWSCreds,checkGlobalUser,getPrimitiveType} = globalFunctions

module.exports = {
    express,
    router,
    bcrypt,
    jwt,
    multer,
    axios,
    nodemailer,
    scanDB,
    putDB,
    deleteDB,
    storage,
    response,
    checkUser, checkAWSCreds, checkGlobalUser,getPrimitiveType
}