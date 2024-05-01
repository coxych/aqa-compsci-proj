const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { v4: uuidv4 } = require('uuid');

async function checkAndAddIncomes(userId) {
  const now = new Date();  // Declare the 'now' variable
  let user = await User.findById(userId);  // Fetch the user and their salaries
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
      switch (salary.howoften) { 
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
    }
  }
  user.markModified('salaries')
  await user.save();
}


async function checkAndAddExpenses(userId) {
  const now = new Date(); // declare the current date
  let user = await User.findById(userId); // Fetch the user and their subscriptions
  for (let sub of user.subs) { // for all subs
    let subDate = new Date(sub.date); //get date of sub
    if (subDate <= now) { 
      await addExpense(userId, { //adding expense which is has sub data like amount, date, category
        date: sub.date, 
        amount: sub.amount, 
        description: sub.description, 
        category: sub.category
      });
      // Correctly update subDate based on frequency
      switch (sub.howoften) { 
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
      user.updatedAt = new Date();
      // Format the date as a string in "YYYY-MM-DD" format before reassigning
      // as it will be given in this format: 2021-09-01T00:00:00.000Z
      const formattedDate = subDate.toISOString().split('T')[0]; //splitting the date and time and taking only date
      sub.date = formattedDate;      //reassigning the date
    }
  }
  user.markModified('subs') // Mark the subs property as modified
  await user.save(); // Save the user document
}

async function regularCheck(userId) {
  try {
    const now = new Date(); // Declare the 'now' variable
    const user = await User.findById(userId); //finds user by id
    for (let sub of user.subs) {
      let subDate = new Date(sub.date);
      if (subDate <= now) {
        user.updated = true;
        break;
      }
    }
    for (let salary of user.salaries) {
      let salaryDate = new Date(salary.date);
      if (salaryDate <= now) {
        user.updated = true;
        break;
      }
    } 
    if (user.updated === true) { 
      await checkAndAddIncomes(userId);
      await checkAndAddExpenses(userId);
      user.updated = false; //returns value of updated
    }
  } catch (err) {
    console.log(err.message);
  }
}

async function addSubs(userId, sub) {
  try{
    const user = await User.findById(userId);
    const subsWithId = { //create sub object with unique id in it
      ...sub, //the existing data in sub object
      //addition of unique id using uuid module using v4 method 
      id: uuidv4(), // Add a unique ID to the sub object
    };
    const update = { // generate update object
      updated: true,
      $push: {
        subs: subsWithId,
      },
    };
    await user.updateOne(update); //update user
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
      updated: true, //to show that new sub or salarie is added and its date should be checked 
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
      const user = await User.findById(userId); //finds user by id, findById is prebuilt function in MongoDB
      const update = { //update is an object that has all new data that should be updated
        budget: user.budget - parseFloat(expense.amount),  //expense subtraction from budget
        $push: {
          expenses: expense, // Push the expense object to the expenses array
        },
      };
      await user.updateOne(update); //wait till new data is added and updated to user, updateOne is prebuilt
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
    if (income.percentage == 0) { //if percentage is 0 then add income as it is
      update = {
        budget: (user.budget + parseFloat(income.amount)).toFixed(2), 
        $push: {
          incomes: income, // Push the income object to the incomes array
        },
      };
    } else {
      const percentage = income.percentage / 100; //percentage calculation
      const newAmount = parseFloat(income.amount - (income.amount * percentage)).toFixed(2);// this is added to budget
      newIncome.amount = newAmount; // Use toFixed() to format the number with 2 decimal places
      const forGoal = parseFloat(inAmount * percentage).toFixed(2); //this is added to goal
      user.goals[0].savedAmount = (user.goals[0].savedAmount || 0) + parseFloat(forGoal); //adding money to the goal
      update = {
        budget: (user.budget + parseFloat(newIncome.amount)).toFixed(2),
        $push: {
          incomes: newIncome, // Push the modified income object to the incomes array
        },
      };
      user.markModified('goals');
    }
    await user.updateOne(update);
    await user.save(); //saving changes
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
