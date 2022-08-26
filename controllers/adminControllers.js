const dotenv = require('dotenv').config();
const userModel = require('../models/userModel')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const randomize = require('randomatic');
const Excel = require('exceljs')
const path = require('path');
const moment = require('moment');
const mail = require("../services/emailService");
const adminModel = require('../models/adminModel')


class adminControllers{
    static adminLogin = async (req,res)=>{
        let {email,password} = req.body;
        let user = await adminModel.findOne({email});
        console.log(user)
        if(user){
            if(email && password){
                if(email === user.email && password === user.password){
                    let salt = await bcrypt.genSalt(10);
                    let encryptString = await bcrypt.hash(`${moment(new Date()).format("DD-MM-YYYY").toString()}`,salt);
                    let token = jwt.sign({admin:encryptString},process.env.JWT_SECRET_KEY,{expiresIn : "1d"});
                    let dataa = {
                        data  : {"token": token },
                        status: "SUCCESS", message: "Login Success"
                    }
                    res.send(dataa)
                }else{
                    res.send({message:"Invalid Credentials",status:"FAILED"})
                }
            }else{
                res.send({message:"All fields are Required",status:"FAILED"})
            }
        }else{
            res.send({message:"Unable you find Admin"})
        }
        
    } 

    static registerClient = async (req, res) => {
        const { user, email, phone, address} = req.body;
        const userData = await userModel.findOne({ email : email  });
        console.log(req.valid)
        if (userData) {
            res.send({ status: "Failed", message: "Email already Registered" })
        } else {
            if (user && email && phone && address) {
                let userEmail = await userModel.findOne({email : email});
                if (!userEmail) {
                    try {
                        let password = randomize('0A',5);
                        console.log(password)
                        const salt = await bcrypt.genSalt(10);
                        const hashPassword = await bcrypt.hash(password, salt)
                        const newUser = new userModel({
                            username: user,
                            email: email,
                            password: hashPassword,
                            accountNumber : randomize('0',10),
                            address,
                            phone,
                            tempPass : password,
                            join : moment(new Date).format('MMMM Do YYYY, h:mm:ss a')
                        })
                        const saveResponse = await newUser.save();
                        mail({
                            from : "aasthajadhav22@gmail.com",
                            to : email,
                            subject : "Login Credentials",
                            txt : "",
                            html : `<h3>Hello,${user} this is your login credentials email : ${email} password : ${password}`
                        })
                        res.send({ status: "Success", message: "Client Register Successfully",password})

                    } catch (err) {
                        res.send({ status: "Failed", message: "Unable to register client ", error: err.message })
                    }
                } else {
                    res.send({ status: "Failed", message: "Phone number allready exist" })
                }
            } else {
                res.send({ status: "Failed", message: "All fields are required" })
            }
        }
    }
    static deleteClient = async(req,res)=>{
        try {
            let accountNumber = req.params.accountNumber;
            const user = await userModel.findOne({accountNumber : accountNumber});
            if(user){
                let x = await userModel.deleteOne({accountNumber : accountNumber });
                console.log(x)
                res.send("Delete success")
            }else{
                res.send({message : "Account number is not valid",status : '404'});
            }
        } catch (error) {
            res.send("Error in deleting account, something went wrong")
        }
        
    }
    static freezAccount = async(req,res)=>{
        let {value,accountNumber} = req.body;
        try {
            let user = await userModel.findOne({accountNumber : accountNumber});
            if(user){
                await userModel.updateOne({accountNumber : accountNumber},{$set : {isFreez : value}});
                res.send("Account Freeze successfully")
            }else{
                res.send({message : "Account number is not valid",status : '404'});
            }
        } catch (error) {
            res.send("Error in Freezeing account, something went wrong")
        }
        
    }
    static unfreezAccount = async(req,res)=>{
       let {value,accountNumber} = req.body;
        try {
            let user = await userModel.findOne({accountNumber : accountNumber});
            if(user){
                await userModel.updateOne({accountNumber : accountNumber},{$set : {isFreez : value}});
                res.send("Account UnFreeze successfully")
            }else{
                res.send({message : "Account number is not valid",status : '404'});
            }
        } catch (error) {
            res.send("Error in UnFreezeing account, something went wrong")
        }
        
    }
    static getAllClients = async (req,res)=>{
        if(req.valid){
            try {
                let allUser = await userModel.find().select('-password -lastTransaction -_id -__v -filePath -tempPass -checkBookDetails');
                res.send({message:"Succssfully Fetch data",status:"SUCCESS",data : allUser})
            } catch (error) {
                console.log(error)
                res.status(500).send("Error in fetching clients details, something went wrong")
            }
        }else{
            res.send({message:"Our server is on Maintening period plz try again after some time",status:"FAILED"})
        }
       

    }
    static getClientExcel = async (req,res)=>{
        if(req.valid){
            try {
                let users = await userModel.find().sort("date");
                let workbook1 = new Excel.Workbook();
                try {
                        let sheet = workbook1.addWorksheet('sheet1');
        
                        sheet.getRow(1).getCell(1).value = "Sr.No"
                        sheet.getRow(1).getCell(2).value = "JOINING DATE"
                        sheet.getRow(1).getCell(3).value = "USER NAME"
                        sheet.getRow(1).getCell(4).value = "EMAIL"
                        sheet.getRow(1).getCell(5).value = "PHONE"
                        sheet.getRow(1).getCell(6).value = "ADDRESS"
                        sheet.getRow(1).getCell(7).value = "TOTAL TRANSACTION"
                        sheet.getRow(1).getCell(8).value = "is FREEZE"
                        sheet.getRow(1).getCell(9).value = "BALANCE"
        
                        let a = sheet.getColumn(2)
                        let b = sheet.getColumn(3)
                        let c = sheet.getColumn(4)
                        let d = sheet.getColumn(5)
                        let e = sheet.getColumn(6)
                        let f = sheet.getColumn(7)
                        let g = sheet.getColumn(8)
                        let h = sheet.getColumn(9)
                        let count = 0;
        
                        a.width = 15
                        b.width = 25
                        c.width = 40
                        d.width = 20
                        e.width = 25
                        f.width = 19
                        g.width = 20
                        h.width = 15
                        for(let j = 0 ; j < users.length; j ++){
                            count += 1;
                            let join = moment(users[j].join).format("DD-MM-YYYY");
                            let isFreez = JSON.stringify(users[j].isFreez)
                            sheet.getRow(count + 1).getCell(1).value = count;
                            sheet.getRow(count + 1).getCell(2).value = join || "";
                            sheet.getRow(count + 1).getCell(3).value = users[j].username || "";
                            sheet.getRow(count + 1).getCell(4).value = users[j].email || "";
                            sheet.getRow(count + 1).getCell(5).value = Number(users[j].phone) || "";
                            sheet.getRow(count + 1).getCell(6).value = users[j].address || "";
                            sheet.getRow(count + 1).getCell(7).value = Number(users[j].lastTransaction.length) || 0;
                            sheet.getRow(count + 1).getCell(8).value = isFreez || "";
                            sheet.getRow(count + 1).getCell(9).value = Number(users[j].balance) || 0;
                        }
                    let fileName = `Clients_data_${moment(new Date).format("DD-MM-YYYY")}.xls`;
                    let pathToSave = path.join(process.cwd(),'Excel','Admin','All_Clients',fileName);
                    try {
                        await workbook1.xlsx.writeFile(pathToSave);
                        let downloadFilePath = `/Excel/Admin/All_Clients/${fileName}`; 
                        console.log(downloadFilePath)
                        await adminModel.updateOne({"_id":"63065451ae2b69cb0e3893e9"},{$set:{allClientFilePath : downloadFilePath}});
                        res.send({message:"Successfully Download Excel",status:"SUCCESS",link:`admin/client/download/63065451ae2b69cb0e3893e9`});
                    } catch (error) {
                        res.send("Error in saving excel file")
                    }
                } catch (error) {
                    console.log(error)
                    res.send("Error in making excel")
                }  
            } catch (error) {
                res.send("Error initia server error")
            }
        }else{
            res.send({message:"Our server in maintenance plz try again after some time",status:"FAILED"})
        }
       
    }
    static getSpecificClientTransactionExcel = async (req,res)=>{
        try {
            let date = new Date()
            let user = await userModel.findOne({'accountNumber':req.body.account});

            if(!user){
                res.send("Error User not found");
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
                    let fileName = `${user.username}_${moment(date).format("DD-MM-YYYY")}.xls`;
                    let pathToSave = path.join(process.cwd(),'Excel','Admin','Specific_Client_Transaction',fileName);
                    try {
                        await workbook1.xlsx.writeFile(pathToSave)
                        let downloadFilePath = `${process.cwd()}/Excel/Admin/Specific_Client_Transaction/${fileName}`
                        await adminModel.updateOne({'_id':"63065451ae2b69cb0e3893e9"},{$set:{specificClientFilePath : `/Excel/Admin/Specific_Client_Transaction/${fileName}`}})
                        res.send({message:"Successfully Generate Excel",status:"SUCCESS",link:`admin/client/specificClient/63065451ae2b69cb0e3893e9`})
                    } catch (error) {
                        console.log(error)
                        res.send("Error in saving XLSX")
                    }

                } catch (error) {
                    console.log(error)
                    res.send("Error in writing Excel")
                }
            }
        } catch (error) {
            res.send("Error cannot Create excel")
        }
    }
    static downloadSpecific = async (req,res)=>{
        try {
            let user = await adminModel.findOne({"_id" : req.params.id});
            console.log("USER DOWNLOAD :- ",user)
            if(user){
                let downloadPath = `${process.cwd()}${user.specificClientFilePath}`
                res.download(downloadPath,(err)=>{
                    if(err) throw res.send({message:"Unable to download file",status:"FAILED"})
                })
            }else{
                res.send({message:"Admin records not found",status:"FAILED"})
            }
        } catch (error) {
            res.send({message:"Something went wrong",status : "FAILED"})
        }
    }
    static download = async (req,res)=>{
        try {
            let user = await adminModel.findOne({"_id" : req.params.id});
            if(user){
                console.log("USER DOWNLOAD :- ",user)
                let downloadPath = `${process.cwd()}${user.allClientFilePath}`
                res.download(downloadPath,(err)=>{
                    if(err) throw res.send({message:"Unable to download file",status:"FAILED"})
                })
            }else{
                res.send({message:"Admin records not found",status:"FAILED"})
            }
        } catch (error) {
            res.send({message:"Something went wrong",status : "FAILED"})
        }
    }
}

module.exports = adminControllers;