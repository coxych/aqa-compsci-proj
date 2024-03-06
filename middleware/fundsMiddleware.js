const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { v4: uuidv4 } = require('uuid');

async function addFunds(userId, fund) {
    try{
      const user = await User.findById(userId);
      const fundWithId = {
        ...fund,
        id: uuidv4(), // Add a unique ID to the salary object
        raisedAmount: 0,
      };
      const update = {
        updated: true,
        $push: {
          funds: fundWithId,
        },
      };
      await user.updateOne(update);
    }catch (err) {
      console.log(err.message);
    }
}

const deleteFund = async (req, res) => {
  const { userId, fundId } = req.params;
  try {
    const user = await User.findById(userId);
    user.funds = user.funds.filter(fund => fund.id !== fundId);
    user.markModified('funds');
    await user.save();
    res.status(200).json({ message: 'Fund deleted successfully' });
  } catch (err) {
    console.log(err);
  }
}

async function withdrawFund(userId, fundId) {
    try {
      const user = await User.findById(userId);
      const fund = user.funds.find(fund => fund.id === fundId);
      user.budget += fund.raisedAmount;
      user.funds = user.funds.filter(fund => fund.id !== fundId);
      user.markModified('funds');
      await user.save();
    } catch (err) {
      console.log(err.message);
    }
}

module.exports = { addFunds, deleteFund, withdrawFund}