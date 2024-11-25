let {
 
    bcrypt,
    jwt,
    scanDB,
    storage,checkGlobalUser,getPrimitiveType
} 
= require('../basicConfig.js')
const express = require('express');
const router = express.Router();


router.post(`/`, async(req, res) => {
  console.log("login")
  // res.set('Access-Control-Allow-Origin', '*');
  console.log(req.body)
    try{
    let user = req.body
    if (getPrimitiveType(user.email) === 'string') {
      user.email = user.email.toString().toLowerCase()
    }
    console.log("user email type")
    let checkedGlobalUser = checkGlobalUser(user,{"email":"string","password":"string"})
    if (checkedGlobalUser.status === false) {
      res.status(500).json({"message":checkedGlobalUser.message})
      return
    } 
    console.log("checkedGlobalUser")
  let userFound
  
  if (storage.getItem(user.email) !== undefined){
    console.log("storage")
    userFound = JSON.parse(storage.getItem(user.email))
  }
  else{
    console.log("userFound")
    userFound = await scanDB("Heir-feet-users",user.email,"email")
    console.log(userFound)
    userFound = userFound.selected_items
    console.log("userFound")
   if (userFound.length === 0) {
    res.status(500).json({"message":"User doesnt exist"})
    console.log("User doesnt exist")
    return
   }
   console.log("userFound[0]")
   userFound = userFound[0]
  }
  if (userFound && bcrypt.compareSync(user.password,userFound.password)){
      let loggedIn = userFound
     console.log("userFound",userFound)
     storage.setItem(userFound.email, JSON.stringify(userFound))
          const payload = {userid:loggedIn.id,username:loggedIn.user_name}
          const options = {expiresIn:"1d"}
          const token = jwt.sign(payload,"secret",options)
     res.status(200).json({"user":loggedIn,"token":token})
     return
  }
   else{
    console.log("userfound",userFound)
    res.status(500).json({message:`Invalid Credentials`})
    return
   }
  }
  catch(err){
    console.log("catch error")
    res.status(500).json({message:`Server Error`})
    console.log(err)
  }
  });

  module.exports = router;
