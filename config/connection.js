const mongoose = require('mongoose')
const dotenv = require('dotenv').config()
const OPTIONS = {
    dbName: "WIPRO_BANK"
}

const connectDB = async () => {
    try {
        const response = await mongoose.connect(process.env.MANGO_BASE_URL,OPTIONS);
        console.log('Connected Successfully');
    } catch (error) {
        console.log(error)
    }
}


module.exports = connectDB;