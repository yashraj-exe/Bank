const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt')
const moment = require('moment')

const verifyAdminToken = async (req, res, next) => {
    const authorization = req.headers.authorization;
    let token;
    if (authorization != "") {
        try {
            token = authorization;
            const verify = jwt.verify(token,process.env.JWT_SECRET_KEY)
            let compareString = verify.admin;
            let date = moment(new Date()).format("DD-MM-YYYY")
            let isMatch = await bcrypt.compare(date,compareString)
            if(isMatch){
                req.valid = true;
            }else{
                req.valid = false;
            }
            next();
        } catch (error) {
            res.status(400).send({ status: "FAILED", message: " unauthorize Admin" })
        }
    }

    if(!token){
        res.status(400).send({ status: "FAILED", message: " unauthorize Admin, no token" })
    }
}


module.exports = verifyAdminToken;