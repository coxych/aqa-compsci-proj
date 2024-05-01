const { getUserId } = require('../middleware/authMiddleware');
const User = require('../models/user');
const { goalsAlgorithm, addGoals, deleteGoal, withdrawGoal, addAmountToGoal } = require('../middleware/goalsMiddleware');

module.exports.goals_get = (req, res) => {
    res.render('goals');
}
module.exports.advices_get = (req, res) => {
    res.render('advices');
};

module.exports.addgoals_post = ('/addgoals', async (req, res) => {
    const {  amount, date } = req.body;
    try { //
        const id = getUserId(req);
        const newGoal = { amount, date };
        id.then(async (id) => {
            await addGoals(id, newGoal)
            res.status(200).json({ message: 'Goal added successfully' });
        }); 
    } catch (err) {
        console.log(err);
    }
});

module.exports.deletegoal = ('user/:userId/goal/:goalId/delete', deleteGoal);

module.exports.calculategoal = ('user/:userId/goal/:goalId/calculate', async (req, res) => {
    const { userId, goalId } = req.params;
    const user = await User.findById(userId);
    const goal = user.goals.find(goal => goal.id === goalId); //finds the goal with the id
    await goalsAlgorithm(userId, goal); 
    res.status(200).json({ message: 'Goal calculated successfully' });
});

module.exports.hideshowgoal =( 'user/:userId/hideshowgoal', async (req, res) => {
    const { userId } = req.params;
    const user = await User.findById(userId);
    user.ShowGoal = !user.ShowGoal; //updates ShowGoal bool parameter of user
    user.markModified('ShowGoal');
    await user.save();
    res.status(200).json({ message: 'Show goals updated successfully' });
});

module.exports.withdrawgoal = ('user/:userId/goal/:goalId/withdraw', async (req, res) => {
    const { userId, goalId } = req.params;
    try{
        withdrawGoal(userId, goalId)
        res.status(200).redirect('/goals');
    }catch(err){
        console.log(err);
    }
});



module.exports.addAmountToGoal = ('/addamount', async (req, res) => {
    const { userId, goalId } = req.params;
    const { amount } = req.body;
    try{
        await addAmountToGoal(userId, goalId, amount)
        res.status(200).json({ message: 'Goal updated successfully' });
    }catch(err){
        console.log(err);
    }
})