const jwt = require('jsonwebtoken');

const verifyUserToken = (req, res, next) => {
    const authorization = req.headers.authorization;
    let token;
    console.log(authorization)
    // if (authorization && authorization.startsWith('Bearer')) {
    if (authorization != "") {
        try {
            console.log("Inside try")
            token = authorization;
            const verify = jwt.verify(token,process.env.JWT_SECRET_KEY)
            console.log("VERIFY ",verify)
            const id = verify.userID;
            req.id = id;
            next();
        } catch (error) {
            res.status(400).send({ status: "failed", message: " unauthorize user" })
        }
    }

    if(!token){
        res.status(400).send({ status: "failed", message: " unauthorize user, no token" })
    }
}


module.exports = verifyUserToken;