const { merge } = require('lodash');
const { getUserId } = require('../middleware/authMiddleware');
const { addExpense, addIncome, addSalary, addSubs } = require('../middleware/expincMiddleware');
const User = require('../models/user');

module.exports.addsalary_post = ('/addsalary', async (req, res) => {
    const { date, category, howoften, amount, description } = req.body;
    try {
        const id = getUserId(req);
        const newSalary = { date, category, amount, description, howoften };
        id.then(async (id) => {
            await addSalary(id, newSalary)
            res.status(200).redirect('/income');
        }); 
    } catch (err) {
        console.log(err);
    }
});
module.exports.addsubs_post = ('/addsubs', async (req, res) => {
    //get data from the req
    const { date, category, howoften, amount, description } = req.body;
    try {
        const id = getUserId(req); //get user id (same function as previously)
        const newSub = { date, category, amount, description, howoften }; // crete newsub object
        id.then(async (id) => {
            await addSubs(id, newSub) //add sub to subs array
            res.status(200).redirect('/expenses');

        }); 
    } catch (err) {
        console.log(err);
    }
});
module.exports.expenses_post = ('/expenses', async (req, res) => {
    // get data from request
    const { date, category, amount, description } = req.body; 
    try {
        const id = getUserId(req); //this function gets id of user who sends the request
        const newExpense = { date, category, amount, description };
        // as here id is a promise .then() is used to wait for it to resolve
        id.then(async (id) => {
            await addExpense(id, newExpense); //function which pushes expense to array for user with this id
            res.status(200).json({message: 'Expense added'}); //res sending
        });
    } catch (err) {
        console.log(err);
    }
});
module.exports.addbudget_post = ('/addbudget', async (req, res) => {
    const { budget } = req.body;
    try {
        const id = getUserId(req);
        id.then(async (id) => {
            await User.findByIdAndUpdate(id, { budget: budget }).then(() => {
                res.status(200).json({ message: 'Budget added' })
            });
        });
    } catch (err) {
        console.log(err);
    }
});
module.exports.income_post = ('/income', async (req, res) => {
    const { date, amount, description, category, percentage } = req.body; 
    const newIncome = { date, amount, description, category, percentage};
    try {
        const id = getUserId(req);
        id.then(async (id) => {
            await addIncome(id, newIncome);
            res.status(200).json({ message: 'Income added' });
        });
    } catch (err) {
        console.log(err);
    }
});



module.exports.income_get = (req, res) => {
    res.render('income');

}
module.exports.addbudget_get = (req, res) => {
    res.render('addbudget');
}
module.exports.profile_get = (req, res) => {
    res.render('profile'); // Render the 'profile' view as HTML
}
module.exports.expenses_get = (req, res) => {
    res.render('expenses'); // Render the 'expenses' view from the 'expense' folder as HTML
}

module.exports.deletesalary_delete = async (req, res) => {
    const { userId, salaryId } = req.params;
    try {
        // Find the user by their ID
        const user = await User.findById(userId);

        // Remove the salary from the user's salaries array
        user.salaries = user.salaries.filter(salary => salary.id !== salaryId);
        // Save the user document after modification
        await user.save();

        // Send a success response back to the client
        res.status(200).json({ message: 'Salary deleted successfully' });
    } catch (error) {
        // Handle any errors that occur during the process
        res.status(500).json({ message: 'Error deleting salary', error: error.message });
    }
}
module.exports.deletesub_delete = async (req, res) => {
    const { userId, subId } = req.params;
    try {
        // Find the user by their ID
        const user = await User.findById(userId);
        //remove the sub from the user's subs array
        user.subs = user.subs.filter(sub => sub.id !== subId);
        // Save the user document after modification
        await user.save();

        // Send a success response back to the client
        res.status(200).json({ message: 'Sub deleted successfully' });
    } catch (error) {
        // Handle any errors that occur during the process
        res.status(500).json({ message: 'Error deleting Sub', error: error.message });
    }
}