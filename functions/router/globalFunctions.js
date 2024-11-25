const getPrimitiveType = (value) => {
    if (typeof value === "object"){
      if (Array.isArray(value)){
        return `array`
      }
      if (value === null){
        return `null`
      }
    }
  return `${typeof value}`
}
const returnMissingFields = (obj,arr) => {
let res = []
// console.log(obj,arr)
for (let i = 0; i < arr.length; i++){
  if (arr[i] in obj === false){
    res.push(arr[i])
    return res
  }
}
return res
}
const getStringCharacterType = (value) => {
  if (!isNaN(value)){
    return "Number"
  }
  if (value.toLowerCase() == value && /[ !@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/g.test(value) === false ){
    return "Lowercase String"
    
  }
   if (value.toUpperCase() == value && /[ !@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/g.test(value) === false){
    return "Uppercase String"
  }
  if ( /[ !@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/g.test(value)){
    return "Symbol"
  }
}
const checkUser = (user) => {
  let missingFields = returnMissingFields(user,["first_name", "last_name", "email","password","re_password","picture","user_name"],)
  if (missingFields.length > 0) {
      return {status:false,message:"Missing key properties"}
    }
    let checkedPassword = checkPassword(user)
    let verifiedEmail = verifyEmail(user.email)

    if(checkedPassword.status === false) {
      return checkedPassword
    }

    if(verifiedEmail.status === false) {
      return verifiedEmail
    }
    for (const [key, value] of Object.entries(user)) {
      if (getPrimitiveType(value) !== 'string'){
        return {status:false,message:"All user properties must be a string"}
     }
    
  }
  return {status:true}
}

const checkGlobalUser = (user,obj) => {
  let missingFields = returnMissingFields(user,Object.keys(obj))
  console.log(missingFields)
  if (missingFields.length > 0) {
      return {status:false,message:"Missing key properties"}
    }
    if (user.email !== undefined) {
      let verifiedEmail = verifyEmail(user.email)
      if(verifiedEmail.status === false) {
        return verifiedEmail
      }
    }
    // console.log("line 74")
    if (user.password !== undefined) {
      let checkedPassword = checkPassword(user)

      if(checkedPassword.status === false) {
        return checkedPassword
      }
    }
    // console.log("line 74")
    for (const [key, value] of Object.entries(user)) {
      let primitiveType = getPrimitiveType(value)
      if (obj[key] === undefined){
        console.log(obj[key])
        continue
      }
      if (primitiveType !== obj[key]){
        return {status:false,message:`${key} must be a ${obj[key]}`}
     }
    
  }
  // console.log("line 74")
  return {status:true}
}

const verifyEmail = (email) => {
  if (getPrimitiveType(email) !== 'string'){
    return {status:false,message:"Email not valid"}
  }

  if (getPrimitiveType(email) === 'string' && email.includes('@') && email.includes('.com') && email.length > 7){
    return true
  }
  return {status:false,message:"Email not valid"}
}

const checkPassword = ({password,re_password}) => {
  if (getPrimitiveType(password) !== 'string'){
    return {status:false,message:"Password fields must be a string"}
  }
  if (re_password !== undefined){
    if(getPrimitiveType(re_password) !== 'string' ){
      return {status:false,message:"Password fields must be a string"}
    }
    if (password !== re_password){
      return {status:false,message:"password and re_password must be the same"}
    }
  }
 
  if (password.length < 7){
    return {status:false,message:"Password not secure enough"}
  }
  let password_req = {cap:false,low:false,char:false,num:false,}
  for (let i = 0; i < password.length; i++) {
    
    if (getStringCharacterType(password[i]) === "Lowercase String"){
      password_req["low"] = true
      
    }
     if (getStringCharacterType(password[i]) === "Uppercase String"){
      password_req["cap"] = true
    }
    if (getStringCharacterType(password[i]) === "Symbol"){
      password_req["char"] = true
    }

    if (getStringCharacterType(password[i]) === "Number"){
      password_req["num"] = true
    }
  }
  return password_req["num"] === true && password_req['cap'] === true && password_req['low'] === true && password_req['char'] === true ?  true  : {status:false,message:"Password not secure enough"}

}
checkAWSCreds = ({AWS_ACCESS, AWS_SECRET,AWS_REGION_ID}) => {
  if (AWS_ACCESS === undefined || AWS_SECRET === undefined || AWS_REGION_ID === undefined){
    return {status:false,message:"Invalid AWS credentials"}
  }
  return {status:true,message:"Valid Credentials"}

}



module.exports = {checkAWSCreds:checkAWSCreds,getPrimitiveType:getPrimitiveType,checkUser:checkUser,checkGlobalUser:checkGlobalUser}