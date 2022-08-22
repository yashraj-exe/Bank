const router = require('express').Router();
const adminControllers = require('../controllers/adminControllers');


// Admin routes
router.post('/client/register',adminControllers.registerClient);
router.delete('/client/delete/:accountNumber',adminControllers.deleteClient);
router.post('/client/freezAccount',adminControllers.freezAccount);
router.post('/client/unfreezAccount',adminControllers.unfreezAccount);
router.get('/client/getAllClients',adminControllers.getAllClients);
router.get('/client/getAllClients',adminControllers.getAllClients);
router.get('/client/getAllClients',adminControllers.getAllClients); 
router.get('/client/getClientExcel',adminControllers.getClientExcel); 
router.post('/client/getClientExcel',adminControllers.getSpecificClientTransactionExcel); 
router.get('/client/getAllClientExcel',adminControllers.getAllClientsTransactionDeatils);  



module.exports = router;
