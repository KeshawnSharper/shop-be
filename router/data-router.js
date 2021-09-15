const express = require('express');

const data = require('./data-model')
const stripe = require("stripe")("sk_test_51GmhlnFRrEOe5mtdlcYDHkwrPCnMNlIwXO7hNQ3uTqtk6z9MIoMRyq1Rwcq3rI7Ksx5FSMZDISG9jh0ZtWOJuzBa00uW25XNv8");
const router = express.Router();
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const cors = require("cors")
const { v4: uuid } = require('uuid');
const nodemailer = require('nodemailer');
const axios = require("axios")
require('dotenv').config()
const AWS = require("aws-sdk")
router.use(cors());
const { AWS_ACCESS, AWS_SECRET,AWS_REGION_ID,GOOGLE_PASSWORD } =
  process.env;
  AWS.config.update({
    accessKeyId: AWS_ACCESS,
    secretAccessKey: AWS_SECRET,
    region: AWS_REGION_ID
});
const dynamoDB = new AWS.DynamoDB.DocumentClient()
router.post('/register', (req, res) => {
  console.log(req.body)
  let user = req.body
  let hash = bcrypt.hashSync(user.password,13)
  user.password = hash 
  console.log(user)
  dynamoDB.scan({TableName: "Heir-feet-users"},function(err,data){
    if (err){
      console.log(err)
    }
    else{
      console.log(data["Count"])
      user.id = `${data["Count"] + 1}`
      dynamoDB.put({TableName: "Heir-feet-users",Item:user},function(err,data){
        if (err){
          console.log(err)
        }
        else{
          res.status(201).json({"email":user.email,
          "id":user.id,
          "user_name":user.user_name,})
        }
      })
    }
  })
   })

router.post('/login', (req, res) => {
  let body = req.body
  dynamoDB.scan({TableName: "Heir-feet-users"},function(err,data){
    if (err){
      console.log(err)
    }
    else{
      let loggedIn = data["Items"].filter(user => user.email === body.email)[0]
      
      if (loggedIn && bcrypt.compareSync(body.password,loggedIn.password))
      {
        const payload = {
          userid:loggedIn.id,
          username:loggedIn.user_name
        }
        const options = {
          expiresIn:"1d"
        }
        const token = jwt.sign(payload,"secret",options)
        res.status(200).json({email:loggedIn.email,token:token,id:loggedIn.id,user_name:loggedIn.user_name})}
     else {
       res.status(404).json({message:`invalid creditinials`})
     }
    }
  })
});
router.get("/sneakers", (req,res) => {
  const dateInPast = function(firstDate, secondDate) {
    if (firstDate.setHours(0, 0, 0, 0) <= secondDate.setHours(0, 0, 0, 0)) {
      return true;
    }
  
    return false;
  }
  dynamoDB.scan({TableName: "Heir-feet-updates"}, function(err, data) {
    if (err) {
      console.log(AWS_ACCESS,AWS_REGION_ID,AWS_SECRET)
      console.log(err)
    } else {
      console.log(new Date())
      console.log(data.Items[0].last_updated)
      if (dateInPast(new Date(data.Items[0].last_updated),new Date())) {
        var date = new Date();
        date.setDate(date.getDate() + 7)
        var params = {
          TableName:"Heir-feet-updates",
          Key:{
              "id": "1",
          },
          UpdateExpression: "set last_updated = :r",
          ExpressionAttributeValues:{
              ":r":JSON.stringify(date),
          },
          ReturnValues:"UPDATED_NEW"
      };
        dynamoDB.update(params,function(err,data){
          if (err){
            console.log("err")
          }
          else{
            console.log(data)
          }
        })
        for (let page = 1;page <= 200;page++){
         const loop = async() => {
           console.log(page)
         try
         { await axios.get(`https://v1-sneakers.p.rapidapi.com/v1/sneakers?limit=100&page=${page}`,{
    headers: {
      "accept": "application/json",
      'x-rapidapi-host': 'v1-sneakers.p.rapidapi.com',
      'x-rapidapi-key': 'e5b0286ea4msh1d616284115d5efp16cadcjsn0392ca0398ac'

    }
  }
)
.then((response) => {
response.data.results.map(result => {
  dynamoDB.put({TableName: "Heir-Feet-Sneakers",Item:result},function(err,data){
    if (err){
      console.log(err)
    }
    else{

    }
  })
})

})
         }
         catch{

         }
      }
      loop()
    }
    }
    }
  })
  dynamoDB.scan({TableName: "Heir-Feet-Sneakers"}, function(err, data) {
    if (err){
      console.log(err)
    }
    else{
      res.status(200).json(data["Items"])
    }
  })

})
router.get('/users', (req, res) => {
  data.getUsers()
.then(data => {
  res.status(200).json(data);
})
.catch(err => {
  res.status(500).json({ message: 'Failed to get projects' });
})
})
router.get('/reccommended_sneakers/:sneaker_id', (req, res) => {
  dynamoDB.scan({TableName: "Heir-Feet-Sneakers"}, function(err, data) {
    if (err){
      console.log(err)
    }
    else{
      let sneaker_data = data["Items"].filter(item => item.id !== req.params.sneaker_id)
      let sneaker = data["Items"].filter(item => item.id === req.params.sneaker_id)[0]
      let reccommended = sneaker_data.filter(item => item.colorway === sneaker.colorway)
      sneaker_data.filter(item => item.brand === sneaker.brand && Math.abs(item.retailPrice - sneaker.retailPrice) <= 50).map(sneaker => reccommended.push(sneaker))
      res.status(200).json(reccommended)
    }
  })
})
router.post('/orders', (req, res) => {
  
  req.body.delivered = false
  console.log(req.body)

  dynamoDB.scan({TableName: "Heir-Feet-Orders"}, function(err, data) {
    if (err){
      console.log(err)
    }
    else{
      req.body.id = `${data["Count"] + 1}`
  dynamoDB.put({TableName: "Heir-Feet-Orders",Item:req.body},function(err,data){
    if (err){
      console.log(err)
    }
    else{
      console.log(data)
    }
  })
}})
})
router.get('/orders/:id', (req, res) => {
  dynamoDB.scan({TableName: "Heir-Feet-Orders"}, function(err, data) {
    if (err){
      console.log(err)
    }
    else{
      let items = data["Items"].filter(item => Number(req.params.id) === Number(item.user_id))
      res.status(200).json(items)
    }
  })
})
router.post("/checkout", async(req, res) => {
    const { product, token } = req.body;
    console.log("Request:", product);
    console.log("price:", product.price);
    let testAccount = await nodemailer.createTestAccount();
    const idempotencyKey = uuid();
    return stripe.customers.create({
      email: token.email,
      source: token.id
    }).then(
      customer => {
        stripe.charges.create(
          {
            amount: product.price * 100,
            currency: "usd",
            customer: customer.id,
            receipt_email: token.email,
            description: `Purchased the ${product.name}`,
            shipping: {
              name: token.card.name,
              address: {
                line1: token.card.address_line1,
                line2: token.card.address_line2,
                city: token.card.address_city,
                country: token.card.address_country,
                postal_code: token.card.address_zip
              }
            }
          },
          {
            idempotencyKey
          }
        );
      }
    )
    .then(project => {
      console.log(GOOGLE_PASSWORD)
      var transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: 'ksharper@studentmba.org',
            pass: GOOGLE_PASSWORD
        }
    });
      console.log("hello",req.body.token)
      let message = {
        from: "ksharper@studentmba.org",
        to: req.body.token.email,
        subject: "Payment Confirmation from Heir Feet",
        text: `Hello your payment of ${req.body.product.price} has been accepted`,
        html: `Hello your payment of  $${req.body.product.price} has been accepted`
      };
      transporter.sendMail(message,(err,res) => {
        if(err){
          console.log(err)
        }
        else{
          console.log(res)
        }
      })
      console.log("usd")
      res.status(200).json({status:"success"})})
    .catch(err => {
      res.status(500).json(console.log(err));
    });
 
})
router.delete('/orders/:id', (req, res) => {
  console.log(req.params.id)
  dynamoDB.delete({TableName:"Heir-Feet-Orders",Key:{"id":`${req.params.id}`}},function(err, data) {
    if (err) {
      console.log(err)
      res.status(500).json(console.log(err));
    } else { 
      res.status(200).json({status:"success"})
      console.log("success")
    }
  })
})



module.exports = router