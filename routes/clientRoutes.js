const router = require('express').Router();
const clientControllers = require('../controllers/clientControllers')
const verifyUserToken = require('../middlewares/auth-middleware')

// Route level middle-ware
router.use('/changepassword',verifyUserToken);
router.use('/checkBalance',verifyUserToken)
router.use('/deposite',verifyUserToken)
router.use('/withdraw',verifyUserToken)
router.use('/transfer',verifyUserToken)
router.use('/getAccountNumber',verifyUserToken)
router.use('/getExcel',verifyUserToken)
router.use('/getTransaction',verifyUserToken)
router.use('/applyCheckBook',verifyUserToken)


// Public route
router.post('/login',clientControllers.login)


// Protected Route
router.post('/changepassword',clientControllers.changePassword);
router.get('/checkBalance',clientControllers.checkBalance);
router.post('/deposite',clientControllers.depositAmount);
router.post('/withdraw',clientControllers.withdrawAmount);
router.post('/transfer',clientControllers.transferAmount);
router.get('/getAccountNumber',clientControllers.accountNumber);
router.get('/getExcel',clientControllers.getExcel);
router.get('/getTransaction',clientControllers.getTransaction);
router.post("/applyCheckBook",clientControllers.applyCheckBook)

module.exports = router;