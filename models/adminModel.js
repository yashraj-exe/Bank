const mongoose = require('mongoose')

const adminSchema = mongoose.Schema({
    email : {type:String,required:true,trim:true,unique:true},
    password : {type:String,required:true,trim:true},
    allClientFilePath : {type:String,required:false},
    specificClientFilePath : {type :String,required:false}
})

const adminModel = mongoose.model('admin',adminSchema)

module.exports = adminModel;