const express = require('express');
const app = express();
const cors = require('cors');
const connectDB = require('./config/connection');
app.use(express.json())
app.use(cors({origin : "*"}));
app.use(express.urlencoded({extended:true}))
const PORT = process.env.PORT || 3000;
connectDB();


app.use('/client',require('./routes/clientRoutes'))
app.use('/admin',require('./routes/adminRoutes'))

app.listen(PORT,()=>{
    console.log(`app is listing on ${process.env.APP_BASE_URL}`)
});