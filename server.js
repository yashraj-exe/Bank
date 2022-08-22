const express = require('express');
const app = express();
const cors = require('cors');
const connectDB = require('./config/connection');
app.use(express.json())
app.use(cors());
app.use(express.urlencoded({extended:true}))
connectDB();


app.use('/client',require('./routes/clientRoutes'))
app.use('/admin',require('./routes/adminRoutes'))

app.listen(3000,'localhost',()=>{
    console.log('app is listing on http://localhost:3000')
});