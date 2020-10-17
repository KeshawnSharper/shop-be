const jwt = require("jsonwebtoken")

module.exports = (req,res,next) => {
const token = req.headers.authorization
    if (token){
jwt.verify(token,"secret",(err,decodedToken) => {
  if(err){
    console.log(err)
    res.status(400).json({message:"you shall not pass"})
  }
  else{
    req.decodedJwt = decodedToken
    next()
  }
})
    }
    else {
      res.status(400).json({message:"token doesn't exist"})
    }

}