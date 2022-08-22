const mongoose = require('mongoose')

const OPTIONS = {
    dbName: "WIPRO_BANK"
}

const connectDB = async () => {
    try {
        const response = await mongoose.connect('mongodb://localhost:27017',OPTIONS)
        console.log('Connected Successfully');
    } catch (error) {
        console.log(error)
    }
}


module.exports = connectDB;