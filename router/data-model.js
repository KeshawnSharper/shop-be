const db = require('../data/dbConfig');

function getUsers() {
  return db("users")
}
function getInfo(id){
    return db("users").where({"id":id})
}

function updateInfo(data) {
  return db("users").where({id:data.id}).update(data)
   
}
function register(user){
  return db("users").insert(user)
  }
  function login(user)
 { 
     return db("users").where({"email":user.email})
 }
 function purchase(order){
  return db("orders").insert(order)
}
function getOrders(order){
  return db("orders").where({"user_id":order})
}
function deleteOrder(id){
  return db("orders").delete({"id":id})
}
module.exports = {
  
    getInfo,
    updateInfo,
    register,
    login,
    getUsers,
    purchase,
    getOrders,
    deleteOrder
}


