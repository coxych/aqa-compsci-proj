const { getUserId } = require('../middleware/authMiddleware');
const User = require('../models/user');
const { addFunds, deleteFund, withdrawFund } = require('../middleware/fundsMiddleware');

module.exports.funds_get = (req, res) => {
    res.render('funds');
}

module.exports.addfunds_post = ('/addfunds', async (req, res) => {
    const {  name , amount } = req.body;
    try {
        const id = getUserId(req);
        const newFund = { name, amount };
        id.then(async (id) => {
            await addFunds(id, newFund)
            res.status(200).json({ message: 'Funds added successfully' });
        }); 
    } catch (err) {
        console.log(err);
    }
});

module.exports.updatefunds_post = ('/updatefunds', async (req, res) => {
    const { type, amount, fundId } = req.body;
    try {
        const id = getUserId(req);
        id.then(async (id) => {
            const user = await User.findById(id);
            const fund = user.funds.find(fund => fund.id === fundId);
            if (fund) {
                if (type === 'add') {
                    fund.raisedAmount += parseFloat(amount);
                    user.budget -= parseFloat(amount);
                }else{
                    fund.raisedAmount -= parseFloat(amount);
                    user.budget += parseFloat(amount);
                }
                user.markModified('funds');
                await user.save();
                res.status(200).redirect('/funds'); 
            } else {
                res.status(404).json({ message: 'Fund not found' });
            }
        });
    } catch (err) {
        console.log(err);
    }
});

module.exports.withdrawfund_withdraw = ('/user/:userId/fund/:fundId/withdraw', async (req, res) => {
    const { userId, fundId } = req.params;
    try{
        withdrawFund(userId, fundId)
        res.status(200).redirect('/funds');
    }catch(err){
        console.log(err);
    }
});

module.exports.deletefund_delete = ('/user/:userId/fund/:fundId', deleteFund);