const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { v4: uuidv4 } = require('uuid');

async function addGoals(userId, goal) {
    try{
      const user = await User.findById(userId);
      const goalWithId = {
        ...goal,
        id: uuidv4(), //unique id creation
        savedAmount: 0,
        calcValue: 0,
        updated: false,
      };
      const update = {
        updated: true,
        $push: {
          goals: goalWithId,
        },
      };
      await user.updateOne(update);
    }catch (err) {
      console.log(err.message);
    }
}

async function goalsAlgorithm(userId, goal) {
    try {
        const user = await User.findById(userId); // Fetch the user from the database
        const goalDate = new Date(goal.date);
        const currentDate = new Date();
        //calculates difference in days from now to the end date of goal
        const diffTime = Math.abs(goalDate - currentDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        //gets amount to gain and spend becuase of subs and salaries during this
        let subExpense = 0;
        for (let sub of user.subs) {
            switch (sub.howoften) {
                case 'daily':
                    subExpense += sub.amount * diffDays;
                    break;
                case 'weekly':
                    subExpense += sub.amount * Math.floor(diffDays / 7);
                    break;
                case 'monthly':
                    subExpense += sub.amount * Math.floor(diffDays / 30);
                    break;
            }
        }
        let salaryIncome = 0;
        for (let salary of user.salaries) {
            switch (salary.howoften) {
                case 'daily':
                    salaryIncome += salary.amount * diffDays;
                    break;
                case 'weekly':
                    salaryIncome += salary.amount * Math.floor(diffDays / 7);
                    break;
                case 'monthly':
                    salaryIncome += salary.amount * Math.floor(diffDays / 30);
                    break;
            }
        }
        //netincome during the period
        const netIncome = salaryIncome - subExpense;
        var calcValue = netIncome - goal.amount;
        calcValue /= diffDays;
        //calcValue is amount to gain every day to meet the goal

        goal.calcValue = parseInt(calcValue); 
        goal.updated = true;
        
        user.goals.forEach(g => {
            if (g.id === goal.id) {
                g.calcValue = goal.calcValue;//save the amount to the goal objs
                g.updated = true;
            }
        });

        user.markModified('goals');
        await user.save(); //save changes

    } catch (err) {
        console.log(err.message);
    }
}

const deleteGoal = async (req, res) => {
    const { userId, goalId } = req.params;
    try {
      const user = await User.findById(userId);
      user.goals = user.goals.filter(goal => goal.id !== goalId);
      user.markModified('goals');
      await user.save();
      res.status(200).json({ message: 'goal deleted successfully' });
    } catch (err) {
      console.log(err);
    }
}

const withdrawGoal = async (userId, goalId) => {
    try {
        const user = await User.findById(userId);
        const goal = user.goals.find(goal => goal.id === goalId);
        user.budget += goal.savedAmount;
        user.budget = parseFloat(user.budget.toFixed(2)); // Parse to float and fix to 2 decimal places
        user.goals = user.goals.filter(goal => goal.id !== goalId);
        
        user.markModified('goals');
        await user.save();
      } catch (err) {
        console.log(err.message);
      }
}

const addAmountToGoal = async (userId, goalId, amount) => {
    try {
        const user = await User.findById(userId);
        const goal = user.goals.find(goal => goal.id === goalId);
        goal.savedAmount += parseFloat(amount);
        user.budget -= parseFloat(amount);
        user.budget = parseFloat(user.budget.toFixed(2)); // Parse to float and fix to 2 decimal places
        user.markModified('goals');
        await user.save();
      } catch (err) {
        console.log(err.message);
      }
}
module.exports = { goalsAlgorithm, addGoals, deleteGoal, withdrawGoal, addAmountToGoal }; 