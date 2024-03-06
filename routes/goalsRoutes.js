const { Router } = require('express');
const goalsController = require('../controllers/goalsController');

const router = Router();

router.get('/goals', goalsController.goals_get);
router.get('/advices', goalsController.advices_get);

router.post('/addgoals', goalsController.addgoals_post);

router.post('/user/:userId/goal/:goalId/delete', goalsController.deletegoal);
router.post('/user/:userId/goal/:goalId/calculate', goalsController.calculategoal);
router.post('/user/:userId/goal/:goalId/withdraw', goalsController.withdrawgoal);
router.post('/user/:userId/hideshowgoal', goalsController.hideshowgoal);
router.post('/user/:userId/goal/:goalId/add', goalsController.addAmountToGoal);

module.exports = router;