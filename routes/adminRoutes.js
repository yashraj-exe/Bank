const router = require('express').Router();
const adminControllers = require('../controllers/adminControllers');
const adminVerify = require('../middlewares/auth-admin')

// Protected Routes
router.post('/client/register',adminVerify)
router.delete('/client/delete/:accountNumber',adminVerify)
router.post('/client/freezAccount',adminVerify)
router.post('/client/unfreezAccount',adminVerify)
router.get('/client/getAllClients',adminVerify)
router.get('/client/getClientExcel',adminVerify);
router.post('/client/getSpecificClientExcel',adminVerify);
router.get('/client/crossCheck/:accountNumber',adminVerify); 

// Admin Public Routes

router.post('/admin/login',adminControllers.adminLogin);
router.get('/client/download/:id',adminControllers.download);
router.get('/client/specificClient/:id',adminControllers.downloadSpecific);




// Admin Protected routes
router.post('/client/register',adminControllers.registerClient);
router.delete('/client/delete/:accountNumber',adminControllers.deleteClient);
router.post('/client/freezAccount',adminControllers.freezAccount);
router.post('/client/unfreezAccount',adminControllers.unfreezAccount);
router.get('/client/getAllClients',adminControllers.getAllClients);
router.get('/client/getClientExcel',adminControllers.getClientExcel); 
router.post('/client/getSpecificClientExcel',adminControllers.getSpecificClientTransactionExcel); 
router.get('/client/crossCheck/:accountNumber',adminControllers.crossCheck); 
 



module.exports = router;
