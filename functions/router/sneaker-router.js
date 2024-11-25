// const data = require('./data-model')
const nodemailer = require('nodemailer')
const axios = require("axios")
const express = require('express');
const router = express.Router();
const AWS = require("aws-sdk")
const dynamoDB = new AWS.DynamoDB.DocumentClient()

const {scanDB,putDB} = require("./awsFunctions")

router.get("/", async (req,res) => {
    console.log(new Date())
    const dateInPast = function(firstDate, secondDate) {
      if (firstDate.setHours(0, 0, 0, 0) <= secondDate.setHours(0, 0, 0, 0)) {
        return true
      }
    
      return false;
    }
    
    let updateFound = await scanDB("Heir-feet-updates","1","id")
    console.log(updateFound)
    updateFound = updateFound.selected_items
    console.log(updateFound)
    updateFound = updateFound[0]
    console.log(updateFound)
    if (!updateFound || dateInPast(new Date(JSON.parse(updateFound.last_updated)),new Date())){
        console.log("time to update")
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
     console.log(response)
    response.data.results.map(result => {
    putDB("Heir-Feet-Sneakers",result)
    })
    
    })
            }
            catch{
    
            }
         }
         loop()
       }
        let date = new Date();
        date.setDate(date.getDate() + 7)
       putDB(putDB("Heir-feet-updates",{"id":"1",last_updated:JSON.stringify(date)}))
    }
    else{
        console.log(updateFound.last_updated)
        console.log("not time",new Date(),new Date(JSON.parse(updateFound.last_updated)))
    }
   
    let updatedSneakers = await scanDB("Heir-Feet-Sneakers")
    // console.log(updatedSneakers)
    updatedSneakers = updatedSneakers
    // console.log(updatedSneakers)
    res.status(200).json(updatedSneakers.total_items)
     return



})
router.get('/reccommended/:sneaker_id', async(req, res) => {
    let sneakers = await scanDB("Heir-Feet-Sneakers")
    sneakers = sneakers.total_items
        let sneaker_data = sneakers.filter(item => item.id !== req.params.sneaker_id)
        let sneaker = sneakers.filter(item => item.id === req.params.sneaker_id)[0]
        let reccommended = sneaker_data.filter(item => item.colorway === sneaker.colorway)
        sneaker_data.filter(item => item.brand === sneaker.brand && Math.abs(item.retailPrice - sneaker.retailPrice) <= 50).map(sneaker => reccommended.push(sneaker))
        console.log(reccommended.length)
        res.status(200).json(reccommended)
  })
  


module.exports = router;
