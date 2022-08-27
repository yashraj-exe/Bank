const dotenv = require('dotenv').config()
const userModel = require('../models/userModel')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const moment = require('moment')
const Excel = require('exceljs')
const path = require('path')
let date = new Date();

class clientControllers {
    static login = async (req, res) => {
        const { email, password } = req.body;
        console.log(req.body)
        if(email && password){
            try {
                const data = await userModel.findOne({ email: email });
                if (data != null) {
                    const isMatch = await bcrypt.compare(password, data.password);
                    console.log(isMatch)
                    if ((email === data.email) && isMatch) {
                        //JWT/
                        const token = jwt.sign({ userID: data._id }, process.env.JWT_SECRET_KEY, { expiresIn: '1d' })
                        let response = {
                            data  : {"token": token },
                            status: "SUCCESS",
                            message: "Login Success",
                            type : "CLIENT",
                            name : data.username
                        }
                        res.send(response)
                    } else {
                        res.send({ status: "FAILED", message: "email and password are invalid" })
                    }
                } else {
                    res.send({message:"Invalid login credentials",status:"FAILED"})
                }
            } catch (error) {
                console.log(error)
                res.send({ status: "FAILED", message: "unable to login user", err: error.message })
            }
        }else{
            res.send({ status: "FAILED", message: "Error all fields are required"})
        }
        
    }
    static changePassword = async (req, res) => {
        const { current_password, confirm_password, new_password} = req.body;
        if (current_password && confirm_password && new_password) {
            if (current_password !== confirm_password) {
                res.send({ status: "FAILED", message: "password dosen't Match" })
            } else {
                const user = await userModel.findOne({ _id: req.id });
                const isMatch = await bcrypt.compare(current_password, user.password);
                const salt = await  bcrypt.genSalt(10);
                const newHashPassword = await bcrypt.hash(new_password,salt);
                if (isMatch) {
                    let response = await userModel.findByIdAndUpdate(req.id,{$set:{password:newHashPassword}});
                    console.log(response)
                    res.send({ status: "SUCCESS", message: "Successfully change password",newPassword : new_password})
                } else {
                    res.send({ status: "FAILED", message: "password password is incorrect" })
                }
            } 
        } else {
            res.send({ status: "FAILED", message: "All fields are required" })
        }
    }
    static checkBalance = async (req,res)=>{
        try {
            let user = await userModel.findOne({'_id':req.id},{balance : 1,_id : 0});
            res.send({status : "SUCCESS",code : 200, balance : `Rs. ${user.balance.toFixed(2)}/-`});
        } catch (error) {
            res.send("Errror cannot check balance something went wrong");
        }
    }
    static depositAmount = async (req,res)=>{
        
        let {depositeAmount,password} = req.body;
        console.log(depositeAmount)
        try {
            let user = await userModel.findOne({'_id':req.id});
            if(user){
                if(user.isFreez != true){
                    if(depositeAmount >=1 ){
                        const isMatch = await bcrypt.compare(password, user.password);
                        if(isMatch){
                            let finalBalance = user.balance + depositeAmount;
                            await userModel.updateOne({'_id':req.id},{$set : {balance : finalBalance}})
                            let tempArray = user.lastTransaction;
                            let tranObj = {
                                type : "DEPOSITE",
                                date : moment(new Date()).format("MMMM Do YYYY, h:mm:ss a"),
                                debit : 0,
                                credit : depositeAmount,
                                balance : user.balance + depositeAmount,
                                to : "self"
                            }
                            tempArray.unshift(tranObj);
                            await userModel.updateOne({'_id':req.id},{$set:{lastTransaction : tempArray }})
                            res.send({message:`Rs. ${depositeAmount}/- Deposite Successfully`,status:"SUCCESS"})
                        }else{
                            res.send({message:"Incorrect Password",status:"FAILED"})
                        }
                    }else{
                        res.send({message:"Error enter valid Amount",status:"FAILED"})
                    }
                }else{
                    res.send({message:"Error Sorry your account is Freez kindly contact Admin",status:"FAILED"})
                }
                
            }else res.send({message:"Error Something went wrong",status:"FAILED"})
        } catch (error) {
            
        }
    }
    static withdrawAmount = async (req,res)=>{
        let {withdrawAmount,password} = req.body;
        console.log(req.body)
        try {
            let user = await userModel.findOne({'_id':req.id});
            if(user){
                if(user.isFreez != true){
                    const isMatch = await bcrypt.compare(password,user.password);
                    console.log(isMatch)
                    if(isMatch){
                        if(withdrawAmount <= user.balance){
                            if(withdrawAmount >= 0.1){
                                let finalAmount = user.balance - withdrawAmount;
                                await userModel.updateOne({'_id':req.id},{$set:{balance : finalAmount.toFixed(2)}});
                                let tempArray = user.lastTransaction;
                                let tranObj = {
                                    type : "WITHDRAW",
                                    date : moment(new Date()).format("MMMM Do YYYY, h:mm:ss a"),
                                    debit : withdrawAmount,
                                    credit : 0,
                                    balance : user.balance - withdrawAmount,
                                    to : "self"
                                }
                                tempArray.unshift(tranObj);
                                await userModel.updateOne({'_id':req.id},{$set:{lastTransaction : tempArray }})
                                res.send({message:`Rs. ${withdrawAmount}/- amount withdraw successfully`,status:"SUCCESS"});
                            }else{
                                res.send({message:"Enter valid ammount",status:"FAILED"});
                            }
                        }else{
                            res.send({message:"Insufficient funds",status:"FAILED"})
                        }
                    }else res.send({message:"Password is Incorrect",status:"FAILED"})
                }else{
                    res.send({message:"Error Sorry your account is Freez kindly contact Admin",status:"FAILED"})
                }
            }else{
                res.send({message:"Error Something went wrong",status:"FAILED"})
            }
        } catch (error) {
            res.send({message:"Error cannot not Deposite Amount",status:"FAILED"})
        }
    }
    static transferAmount = async (req,res)=>{
        let {amount,account,password} = req.body;
        console.log(req.body)
        try {
            let currentUser = await userModel.findOne({'_id':req.id});
            let receiverUser = await userModel.findOne({'accountNumber':account});
            if(currentUser){
                let isMatch = await bcrypt.compare(password,currentUser.password)
                if(password && isMatch){
                    if(currentUser.isFreez != true){
                        if(currentUser.balance >= amount){
                            if(receiverUser){
                                let finalAmount = receiverUser.balance + amount;
                                await userModel.updateOne({'accountNumber':account},{$set:{balance : finalAmount}});
                                await userModel.updateOne({'_id':req.id},{$set:{balance : currentUser.balance - amount}})
                                let tempArray = currentUser.lastTransaction;
                                    let tranObj = {
                                        type : "TRANSFER",
                                        date : moment(new Date()).format("MMMM Do YYYY, h:mm:ss a"),
                                        debit : amount,
                                        credit : 0,
                                        balance : currentUser.balance - amount,
                                        to : account
                                    }
                                    tempArray.unshift(tranObj);
                                    await userModel.updateOne({'_id':req.id},{$set:{lastTransaction : tempArray }})
                                    let tempArray2 = receiverUser.lastTransaction;
                                    let tranObj2 = {
                                        type : "WITHDRAW",
                                        date : moment(new Date()).format("MMMM Do YYYY, h:mm:ss a"),
                                        debit : 0,
                                        credit : amount,
                                        balance : receiverUser.balance + amount,
                                        to : account
                                    }
                                    tempArray2.unshift(tranObj2);
                                    await userModel.updateOne({accountNumber : account},{$set:{lastTransaction : tempArray2 }})
                                res.send({message : `Successfully ${amount}/RS Transfer To ${account} Number`,status: "SUCCESS"});
                            }else{
                                res.send({message:"Receiver account not found",status:"FAILED"});
                            }
                        }else{
                            res.send({message:"Insufficient funds",status:"FAILED"});
                        }
                    }else{
                        res.send({message:"Error Sorry your account is Freez kindly contact Admin",status:"FAILED"})
                    }
                }else{
                    res.send({status:"FAILED",message:"Incorrect password"})
                }
                
            }else{
                res.send({message:"Something went wrong",status:"FAILED"});
            }
        } catch (error) {
            res.send({message:"Error cannot transfer amount",status:"FAILED"});
        }
    }
    static accountNumber = async (req,res)=>{
        try {
            let user = await userModel.findOne({'_id':req.id});
            if(user){
                res.send({account : user.accountNumber})
            }else{
                res.send({message:"Something went wrong",status:"FAILED"});
            }
        } catch (error) {
            res.send({message:"Error cannot fetch Account Number",status:"FAILED"});
        }
    }
    static getExcel = async (req,res)=>{
        try {
            let user = await userModel.findOne({'_id':req.id});
            if(!user){
                res.send({message:"Error User not found",status:"FAILED"});
            }else{
                try {
                    let json = user.lastTransaction;
                    let workbook1 = new Excel.Workbook();
                    let sheet1 = workbook1.addWorksheet('Sheet1');

                    sheet1.getRow(1).getCell(1).value = "Sr.No"
                    sheet1.getRow(1).getCell(2).value = "Date"
                    sheet1.getRow(1).getCell(3).value = "Type"
                    sheet1.getRow(1).getCell(4).value = "Debit"
                    sheet1.getRow(1).getCell(5).value = "Credit"
                    sheet1.getRow(1).getCell(6).value = "Balance"
                    sheet1.getRow(1).getCell(7).value = "To"
                    let count = 0;
                    let Date = sheet1.getColumn(2);
                    let Type = sheet1.getColumn(3);
                    let Debit = sheet1.getColumn(4);
                    let Credit = sheet1.getColumn(5);
                    let Balance = sheet1.getColumn(6)
                    let To = sheet1.getColumn(7)
                    Date.width = 30;
                    Type.width = 20;
                    Credit.width = 15;
                    Balance.width = 15;
                    To.width = 15;
                    Debit.width = 15;
                    for(let i = 0 ; i < json.length; i++){
                        count += 1;
                        sheet1.getRow(count + 1).getCell(1).value = count;
                        sheet1.getRow(count + 1).getCell(2).value = json[i].date;
                        sheet1.getRow(count + 1).getCell(3).value = json[i].type;
                        sheet1.getRow(count + 1).getCell(4).value = Number(json[i].debit);
                        sheet1.getRow(count + 1).getCell(5).value = Number(json[i].credit);
                        sheet1.getRow(count + 1).getCell(6).value = Number(json[i].balance);
                        sheet1.getRow(count + 1).getCell(7).value = json[i].to;
                    }
                    let fileName = `${user.username.split(" ").join("-")}_${moment(date).format('DD-MM-YY')}_${user.accountNumber}.xls`;
                    let pathToSave = path.join(process.cwd(),'Excel',"Client",fileName);
                    try {
                        await workbook1.xlsx.writeFile(pathToSave)
                        let downloadFilePath = `/Excel/Client/${fileName}`
                        await userModel.updateOne({"_id":req.id},{$set:{"filePath":downloadFilePath}});

                        res.send({message:"Successfully Created Link",status:"SUCCESS",link : `client/download/${user.accountNumber}`})
                    } catch (error) {
                        res.send({message:"Error in saving XLSX",status:"FAILED"})
                    }

                } catch (error) {
                    console.log(error)
                    res.send({message:"Error in writing Excel",status:"FAILED"})
                }
            }
        } catch (error) {
            res.send({message:"Error cannot Create excel",status:"FAILED"})
        }
    }
    static getTransaction = async (req,res)=>{
        try {
            let user = await userModel.findOne({"_id":req.id}).select('lastTransaction -_id');
            let resultArray = [];
            if(user.length > 10){
                for(let i = 0 ; i < 10 ; i++){
                    resultArray.push(user.lastTransaction[i])
                }  
            }else{
                resultArray = user.lastTransaction;
            }
            res.send({status : "SUCCESS",data : resultArray})
        } catch (error) {
            res.send({message:"Error initia server error",status:"FAILED"})
        }
    }
    static applyCheckBook = async (req,res)=>{
        let {name, address,password} = req.body;
        try {
            let user = await userModel.findOne({'_id' : req.id});
            if(name && address && password){
                if(user){
                    let isMatch = await bcrypt.compare(password,user.password);
                    if(isMatch){
                        let details = {
                            name,
                            address,
                            dateOfApply : new Date()
                        }
                        let resp = await userModel.updateOne({_id:req.id},{$set : {isCheckBookApply: true,checkBookDetails : details}})
                        res.status(200).send({message:"Successfully apply for CheckBook",status:"SUCCESS"})
                    }else{
                        res.status(422).send({message:"Password is Incorrect",status:"FAILED"})
                    }
                }else{
                    res.status(500).send({message:"User Not found",status:"FAILED"})
                }
            }else{
                res.status(422).send({message:"All fields are required",status:"FAILED"});
            }
        } catch (error) {
            res.status(500).send({message:"Initial server error",status:"FAILED"});
        }
    }
    static download = async (req,res)=>{
        try {
            let user = await userModel.findOne({"accountNumber":req.params.account})
            let downloadFilePath = `${process.cwd()}/${user.filePath}`
            res.download(downloadFilePath)
        } catch (error) {
            res.status(500).send({message:"Initial server error",status:"FAILED"});
        }
    }
}


module.exports = clientControllers;   