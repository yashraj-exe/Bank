const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    username : {type:String,required:true,trim:true},
    email : {type:String,required:true,trim:true,unique:true},
    phone : {type :Number,required : false},
    password : {type:String,required:true,trim:true},
    balance : {type : Number,required:false,default : 0},
    lastTransaction : [],
    isFreez : {type:Boolean,default : false,required : false},
    join:{type:Date,default:new Date()},
    accountNumber : {type : Number,required : false},
    address : {type : String,required : false},
    isCheckBookApply : {type : Boolean ,default : false},
    checkBookDetails : {type : Object},
    filePath : {type : String,default:"",required:false},
    tempPass : {type : String}
})

const userModel = mongoose.model('client',userSchema)

module.exports = userModel;