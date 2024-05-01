const overviewController = require('../controllers/overviewController');
const { Router } = require('express');
const router = Router();

router.get('/overview', overviewController.overview_get);

module.exports = router;