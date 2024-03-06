const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { v4: uuidv4 } = require('uuid');

async function checkAndAddIncomes(userId) {
  const now = new Date();
  let user = await User.findById(userId); // Fetch the user and their salaries
  for (let salary of user.salaries) {
    let salaryDate = new Date(salary.date);
    if (salaryDate <= now) {
      await addIncome(userId, { 
        date: salary.date, 
        amount: salary.amount, 
        description: salary.description, 
        category: salary.category,
        percentage: 0,
      });
      // Correctly update salaryDate based on frequency
      switch (salary.howoften) { // Ensure this is correctly referencing 'howOften' if that's the intended property
        case 'daily':
          salaryDate.setDate(now.getDate() + 1);
          break;
        case 'weekly':
          salaryDate.setDate(now.getDate() + 7);
          break;
        case 'monthly':
          salaryDate.setMonth(now.getMonth() + 1);
          break;
      }
      user.updatedAt = new Date();
      // Format the date as a string in "YYYY-MM-DD" format before reassigning
      const formattedDate = salaryDate.toISOString().split('T')[0];
      salary.date = formattedDate;      
      // If using Mongoose, mark the salaries array as modified
    }
  }
  user.markModified('salaries')
  await user.save();
}

async function checkAndAddExpenses(userId) {
  const now = new Date();
  let user = await User.findById(userId); // Fetch the user and their salaries
  for (let sub of user.subs) {
    let subDate = new Date(sub.date);
    if (subDate <= now) {
      await addExpense(userId, { 
        date: sub.date, 
        amount: sub.amount, 
        description: sub.description, 
        category: sub.category 
      });
      // Correctly update subDate based on frequency
      switch (sub.howoften) { // Ensure this is correctly referencing 'howOften' if that's the intended property
        case 'daily':
          subDate.setDate(now.getDate() + 1);
          break;
        case 'weekly':
          subDate.setDate(now.getDate() + 7);
          break;
        case 'monthly':
          subDate.setMonth(now.getMonth() + 1);
          break;
      }
      // Format the date as a string in "YYYY-MM-DD" format before reassigning
      const formattedDate = subDate.toISOString().split('T')[0];
      sub.date = formattedDate;      
      // If using Mongoose, mark the subs array as modified
      user.markModified('subs')
    }
  }
  await user.save();
}

async function regularCheck(userId) {
  try {
    const user = await User.findById(userId);
    if (user.updated === true) {
      await checkAndAddIncomes(userId);
      await checkAndAddExpenses(userId);
      user.updated = false;

      await user.save(); // Save the updated user
    }
  } catch (err) {
    console.log(err.message);
  }
}

async function addSubs(userId, sub) {
  try{
    const user = await User.findById(userId);
    const subsWithId = {
      ...sub,
      id: uuidv4(), // Add a unique ID to the salary object
    };
    const update = {
      updated: true,
      $push: {
        subs: subsWithId,
      },
    };
    await user.updateOne(update);
  }catch (err) {
    console.log(err.message);
  }
}

async function addSalary(userId, salary) {
  try{
    const user = await User.findById(userId);
    const salaryWithId = {
      ...salary,
      id: uuidv4(), // Add a unique ID to the salary object
    };
    const update = {
      updated: true,
      $push: {
        salaries: salaryWithId,
      },
    };
    await user.updateOne(update);
  }catch (err) {
    console.log(err.message);
  }
}

async function addExpense(userId, expense) {
    try {
      const user = await User.findById(userId);
      const update = {
        budget: user.budget - parseFloat(expense.amount), 
        $push: {
          expenses: expense, // Push the expense object to the expenses array
        },
      };
      await user.updateOne(update);
    } catch (err) {
      console.log(err.message);
    }
}

async function addIncome(userId, income) {
  try {
    var newIncome = income;
    const inAmount = income.amount;
    var update;
    const user = await User.findById(userId);
    if (!user.goals) {
      user.goals = []; // Initialize the goals property if it's undefined
    }
    if (income.percentage == 0) {
      update = {
        budget: (user.budget + parseFloat(income.amount)).toFixed(2),
        $push: {
          incomes: income, // Push the income object to the incomes array
        },
      };
    } else {
      const percentage = income.percentage / 100;
      const newAmount = parseFloat(income.amount - (income.amount * percentage)).toFixed(2);
      newIncome.amount = newAmount; // Use toFixed() to format the number with 2 decimal places
      const forGoal = parseFloat(inAmount * percentage).toFixed(2);
      user.goals[0].savedAmount = (user.goals[0].savedAmount || 0) + parseFloat(forGoal);
      update = {
        budget: (user.budget + parseFloat(newIncome.amount)).toFixed(2),
        $push: {
          incomes: newIncome, // Push the modified income object to the incomes array
        },
      };
      user.markModified('goals');
    }
    await user.updateOne(update);
    await user.save();
  } catch (err) {
    console.log(err.message);
  }
}

module.exports = {
   addExpense, 
   addIncome, 
   addSalary, 
   checkAndAddIncomes,
   checkAndAddExpenses, 
   regularCheck,
   addSubs,
};
