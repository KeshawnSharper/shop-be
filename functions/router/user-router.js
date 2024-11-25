let {
    scanDB,putDB
}
= require('./basicConfig')

const express = require('express');
const router = express.Router();
router.get('/', async(req, res) =>{
  console.log("users")
    let items = await scanDB("Heir-feet-users")
    res.status(200).json(items.total_items)
  })
router.get('/:id', async (req, res) => {
    if (isNaN(req.params.id)) {
      res.status(500).json({"message":"Invalid User"})
    return
    }
    let user = await scanDB("Heir-feet-users",req.params.id,"id")
   user = user.selected_items[0]
  res.status(200).json(user)
  })
 router.put('/:id', async (req, res) => {
  console.log("id",req.params.id)
  req.body.id = req.params.id
   await putDB("Heir-feet-users",req.body)
   let user = await scanDB("Heir-feet-users",req.params.id,"id")
   user  = user.selected_items[0]
   console.log("user",user)
  //  delete user.password
  res.status(200).json({"user":user})
  })

  module.exports = router;
