let dotenv=require("dotenv").config();const nodemailer=require("nodemailer");async function sendMail({from:a,to:b,subject:c,text:d,html:e}){let f=nodemailer.createTransport({host:process.env.MAIL_HOST,port:process.env.MAIL_PORT,secure:!1,auth:{user:process.env.MAIL_USER,pass:process.env.MAIL_PASSWORD}});console.log(process.env.MAIL_PASSWORD);try{let g=await f.sendMail({from:a,to:b,subject:c,text:d,html:e});console.log(g)}catch(h){console.log(h)}}module.exports=sendMail