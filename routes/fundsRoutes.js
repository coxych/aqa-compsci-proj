const { Router } = require('express');
const fundsController = require('../controllers/fundsController');

const router = Router();


router.get('/funds', fundsController.funds_get);


router.post('/addfunds', fundsController.addfunds_post);
router.post('/updatefunds', fundsController.updatefunds_post);
router.post('/user/:userId/fund/:fundId/withdraw', fundsController.withdrawfund_withdraw);


router.delete('/user/:userId/fund/:fundId', fundsController.deletefund_delete);

module.exports = router;