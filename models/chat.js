const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  
    name:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    address:{
        type:String,
        required:true
    },
    
    
  });

 const chat= mongoose.model('chat', chatSchema);

 module.exports =chat;
