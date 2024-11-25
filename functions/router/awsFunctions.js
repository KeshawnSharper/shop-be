const AWS = require("aws-sdk");
require('dotenv').config();

const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { AWS_ACCESS, AWS_SECRET,AWS_REGION_ID} =
  process.env;
  AWS.config.update({
    accessKeyId: AWS_ACCESS,
    secretAccessKey: AWS_SECRET,
    region: "us-east-2"
})
// console.log('accessKey',process.env.AWS_ACCESS,"secretkey",process.env.AWS_SECRET,'region',AWS_REGION_ID)
const dynamoDB = new AWS.DynamoDB.DocumentClient()
const globalFunctions = require('./globalFunctions');
const { response } = require("express");
const { DeleteCommand,PutCommand, DynamoDBDocumentClient,ScanCommand } = require("@aws-sdk/lib-dynamodb");
const {getPrimitiveType} = globalFunctions


const client = new DynamoDBClient({
  credentials:{accessKeyId: process.env.AWS_ACCESS,
  secretAccessKey: process.env.AWS_SECRET},
  region: 'us-east-2'
});
const docClient = DynamoDBDocumentClient.from(client);

module.exports ={
scanDB: async (table,filterID= null,filterProp = null) => {
  console.log("scanDB is running")
  const res_obj = {total_items:[], selected_items:[], status:false, message:""}
    // if (getPrimitiveType(table) !== 'string') {
    //   console.log("17")

    //   res_obj["message"] = `ScanDB's parameter Table name must be a string recieved a(n) ${getPrimitiveType(table)}`
    //   return res_obj
    // }
    // if (typeof filterProp !== "string" && filterID !== undefined) {
    //   res_obj["message"] = `ScanDB's parameter filterProp must be a string recieved a(n) ${getPrimitiveType(filterProp)}`
    //   console.log("24")
    //   return res_obj
    // }
    
    const response = await docClient.send(
      new ScanCommand({
        TableName: table
      }))
    console.log("scanDB is ran")
    let items = await response
    // console.log(items)
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
    return res_obj
  },
    
    
    // await dynamodb.scan(params, function(err, data) {
    //   if (err) console.log(err, err.stack); // an error occurred



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
      const response = await docClient.send(new PutCommand({
        TableName: table,
        Item:item
      }))
      

      res_obj["message"] = "success"
      res_obj["status"] = true
    

      
      // await dynamodb.scan(params, function(err, data) {
      //   if (err) console.log(err, err.stack); // an error occurred
      return res_obj
  
      
    },
    deleteDB : async (table,id) => {
      const res_obj = {status:false, message:""}
      const response = await docClient.send(new DeleteCommand({TableName: table,Key:{id:`${id}`}}))
      
        let items = response
        res_obj["message"] = "success"
        res_obj["status"] = true
        console.log("wnorking")
    
    
    return res_obj
    }
}