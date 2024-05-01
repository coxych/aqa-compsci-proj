const {mergeSort} = require('../middleware/overviewMiddleware');
const {getUserId} = require('../middleware/authMiddleware');
const User = require('../models/user');


module.exports.overview_get = async (req, res) => {
    const userId = await getUserId(req);
    const user = await User.findById(userId);
    const expenses = user.expenses;
    const incomes = user.incomes;
    res.locals.expenses = await mergeSort(expenses);
    res.locals.incomes = await mergeSort(incomes);
    res.render('overview');
}       
