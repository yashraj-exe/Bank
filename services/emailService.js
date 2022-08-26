let dotenv = require('dotenv').config()
const nodemailer = require('nodemailer');

async function sendMail({from,to,subject,text,html}){
    const transpoter = nodemailer.createTransport({
        host : process.env.MAIL_HOST,
        port : process.env.MAIL_PORT,
        secure : false,
        auth : {
            user : process.env.MAIL_USER,
            pass : process.env.MAIL_PASSWORD
        }
    })
    console.log(process.env.MAIL_PASSWORD)
    try {
        let info = await transpoter.sendMail({
            from,
            to,
            subject,
            text,
            html
        })
        console.log(info)
        
    } catch (error) {
        console.log(error)
    }
}

module.exports = sendMail;