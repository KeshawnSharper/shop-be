let {bcrypt,scanDB,checkGlobalUser,putDB} = require('../basicConfig')
const express = require('express');
const router = express.Router();
router.post('/', async(req, res) => {
  console.log("login")

    let user = req.body
    let message = "Couldn't Register User"
    console.log(user)
  
    try {
    let checkedGlobalUser = checkGlobalUser(user,{"email":"string","password":"string","re_password":"string","picture":"string", "first_name": "string","user_name":"string","last_name": "string",})
    if (checkedGlobalUser.status === false) {
      res.status(500).json({"message":checkedGlobalUser.message})
      return
    } 

    let awsUsers = await scanDB("Heir-feet-users",user.email,"email")
  
    if (awsUsers.status === false) {
      res.status(500).json({"message":awsUsers.message})
      return 
    }
  
    if (awsUsers.selected_items.length > 0){
      res.status(500).json({"message":"User already exists"})
      return
    }
    else{
      let hash = bcrypt.hashSync(user.password,13)
      user.password = hash 
      user.re_password = hash
      let users = awsUsers.total_items
      user.id = `${users.length + 1}`
      await putDB("Heir-feet-users",user)
      res.status(200).json({"message":"success"})
      return
    }
  
  }
   catch (err) {
    res.status(500).json({"message":message})
    return
   }
  })
  module.exports = router ;
