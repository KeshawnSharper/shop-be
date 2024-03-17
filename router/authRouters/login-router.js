let {
    bcrypt,
    jwt,
    scanDB,
    storage,checkGlobalUser,getPrimitiveType
} 
= require('../basicConfig.js/basicConfig')
const express = require('express');
const router = express.Router();


router.post(`/`, async(req, res) => {
  console.log("login")

  res.set('Access-Control-Allow-Origin', '*');
    try{
    let user = req.body
    if (getPrimitiveType(user.email) === 'string') {
      user.email = user.email.toString().toLowerCase()
    }
    let checkedGlobalUser = checkGlobalUser(user,{"email":"string","password":"string"})
    if (checkedGlobalUser.status === false) {
      res.status(500).json({"message":checkedGlobalUser.message})
      return
    } 
      
  let userFound
  
  if (storage.getItem(user.email) !== undefined){
    userFound = JSON.parse(storage.getItem(user.email))
  }
  else{
    userFound = await scanDB("Heir-feet-users",user.email,"email")
    userFound = userFound.selected_items
   if (userFound.length === 0) {
    res.status(500).json({"message":"User doesnt exist"})
    return
   }
   userFound = userFound[0]
  }
  if (userFound && bcrypt.compareSync(user.password,userFound.password)){
      let loggedIn = userFound
     console.log("userFound",userFound)
     storage.setItem(userFound.email, JSON.stringify(userFound))
          const payload = {userid:loggedIn.id,username:loggedIn.user_name}
          const options = {expiresIn:"1d"}
          const token = jwt.sign(payload,"secret",options)
     res.status(201).json({"user":loggedIn,"token":token})
     return
  }
   else{
    console.log("userfound",userFound)
    res.status(500).json({message:`Invalid Credentials`})
    return
   }
  }
  catch(err){
  }
  });

  module.exports = router;
