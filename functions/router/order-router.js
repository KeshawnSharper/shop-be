let {
    scanDB,putDB
}
= require('./basicConfig')
const stripe = require("stripe")("sk_test_51GmhlnFRrEOe5mtdlcYDHkwrPCnMNlIwXO7hNQ3uTqtk6z9MIoMRyq1Rwcq3rI7Ksx5FSMZDISG9jh0ZtWOJuzBa00uW25XNv8");
const { v4: uuid } = require('uuid');
const express = require('express');
const router = express.Router();
// router.get('/', async(req, res) =>{
//   console.log("users")
//     let items = await scanDB("Heir-feet-users")
//     res.status(200).json(items.total_items)
//   })
router.get('/:id', async (req, res) => {
    if (isNaN(req.params.id)) {
      res.status(500).json({"message":"Invalid User"})
    return
    }
    let userOrders = await scanDB("Heir-Feet-Orders",Number(req.params.id),"user_id")
   userOrders = userOrders.selected_items
  res.status(200).json(userOrders)
  })

  router.post("/checkout", async (req, res) => {
 

  
    const { product, token } = req.body;
    console.log("Request:", product);
    console.log("price:", product.price);
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
      console.log("usd")
      res.status(200).json({status:"success"})})
    .catch(err => {
      res.status(500).json(console.log(err));
    });
 
})

router.post('/', async(req, res) => {
  var today = new Date()
  req.body.delivered = false
  console.log('req.body',req.body)
  req.body.id = uuid()
  await putDB("Heir-Feet-Orders",req.body)
  res.status(200).json(req.body)
})
//   data.purchase(req.body)
//   .then(project => {
//     res.status(200).json(project)
//   })
//   .catch(err => {
//     res.status(500).json({ message: err });
//   });
// })
 

  module.exports = router;
