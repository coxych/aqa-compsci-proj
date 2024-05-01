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
        const id = getUserId(req); //get id from req
        id.then(async (id) => {
            const user = await User.findById(id);
            const fund = user.funds.find(fund => fund.id === fundId); //finds the fund by the unique id created previously
            if (fund.raisedAmount < parseFloat(amount) && type === 'withdraw') {
                res.redirect('/funds');
                return;
            }
            if (fund) {
                if (type === 'add') {
                    //addition from budget
                    fund.raisedAmount += parseFloat(amount);
                    user.budget -= parseFloat(amount);
                }else{
                    //putting money from fund on budget
                    fund.raisedAmount -= parseFloat(amount);
                    user.budget += parseFloat(amount);
                }
                user.markModified('funds');
                await user.save(); //save changes
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
    const { userId, fundId } = req.params; //extracting data from the req parameters
    try{
        await withdrawFund(userId, fundId)
        res.status(200).redirect('/funds');
    }catch(err){
        console.log(err);
    }
});

module.exports.deletefund_delete = ('/user/:userId/fund/:fundId', deleteFund);