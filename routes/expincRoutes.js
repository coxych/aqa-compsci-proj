const { Router } = require('express');
const expincController = require('../controllers/expincController');


const router = Router();

router.get('/income', expincController.income_get);
router.get('/profile', expincController.profile_get);
router.get('/expenses', expincController.expenses_get);
router.get('/addbudget', expincController.addbudget_get);


router.post('/addsalary', expincController.addsalary_post);
router.post('/expenses', expincController.expenses_post);
router.post('/addbudget', expincController.addbudget_post);
router.post('/income', expincController.income_post);
router.post('/addsubs', expincController.addsubs_post);

router.delete('/user/:userId/salary/:salaryId', expincController.deletesalary_delete);
router.delete('/user/:userId/sub/:subId', expincController.deletesub_delete);


module.exports = router;