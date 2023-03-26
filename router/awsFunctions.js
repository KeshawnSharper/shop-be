const AWS = require("aws-sdk");
const { AWS_ACCESS, AWS_SECRET,AWS_REGION_ID} =
  process.env;
  AWS.config.update({
    accessKeyId: AWS_ACCESS,
    secretAccessKey: AWS_SECRET,
    region: AWS_REGION_ID
})
console.log("accessKey",process.env.AWS_ACCESS,process.env.AWS_SECRET)
const dynamoDB = new AWS.DynamoDB.DocumentClient()
const globalFunctions = require('./globalFunctions')
const {getPrimitiveType} = globalFunctions
module.exports ={
scanDB: async (table,filterID,filterProp) => {
  const res_obj = {total_items:[], selected_items:[], status:false, message:""}
    if (getPrimitiveType(table) !== 'string') {
      console.log("17")

      res_obj["message"] = `ScanDB's parameter Table name must be a string recieved a(n) ${getPrimitiveType(table)}`
      return res_obj
    }
    if (typeof filterProp !== "string" && filterID !== undefined) {
      res_obj["message"] = `ScanDB's parameter filterProp must be a string recieved a(n) ${getPrimitiveType(filterProp)}`
      console.log("24")
      return res_obj
    }
    
    await dynamoDB.scan({TableName: table}).promise()
    .then(res => {
    let items = res
    items = items["Items"]
    let total_items = items
    
    if (filterID !== null){
      items = items.filter(item => item[`${filterProp}`] === filterID)
    }
    else{
      items = []
    }
    res_obj["total_items"] = total_items
    res_obj["selected_items"] = items
    res_obj["message"] = "success"
    res_obj["status"] = true
  })
  .catch(err => {
    res_obj["message"] = err.code
  }
    )
    
    // await dynamodb.scan(params, function(err, data) {
    //   if (err) console.log(err, err.stack); // an error occurred
    return res_obj

    
  },
  putDB: async (table,item) => {
    
    const res_obj = {total_items:[],status:false, message:""}
      if (getPrimitiveType(table) !== 'string') {
        res_obj["message"] = `PutDB's parameter Table name must be a string recieved a(n) ${getPrimitiveType(table)}`
        return res_obj
      }
      console.log("item",item)
      if (typeof item !== "object") {
        res_obj["message"] = `PutDB's parameter item must be an object recieved a(n) ${getPrimitiveType(filterProp)}`
        return res_obj
      }
      console.log("aws",item)
      await dynamoDB.put({TableName: table,Item:item}).promise()
      .then(res => {

      res_obj["message"] = "success"
      res_obj["status"] = true
    })
    .catch(err => {
      console.log(`error:${err}`)
      res_obj["message"] = err.code
    }
      )
      
      // await dynamodb.scan(params, function(err, data) {
      //   if (err) console.log(err, err.stack); // an error occurred
      return res_obj
  
      
    },
    deleteDB : async (table,id) => {
      const res_obj = {status:false, message:""}
      await dynamoDB.delete({TableName: table,Key:{id:`${id}`}}).promise()
      .then(res => {
        let items = res
        res_obj["message"] = "success"
        res_obj["status"] = true
        console.log("working")
      })
      .catch(err => {
        res_obj["message"] = err.code
      })
    
    return res_obj
    }
}