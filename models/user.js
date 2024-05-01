const mongoose = require('mongoose');
const { isEmail } = require('validator');
const bcrypt = require('bcrypt');

// Create a schema for user
const userSchema = new mongoose.Schema({ 
  // email which should be unique and required
  email: {
    type: String,
    required: [true, 'Please enter an email'],
    unique: true,
    lowercase: true,
    // here it validates that the email enter has right format
    validate: [isEmail, 'Please enter a valid email']
  },
  // password which should  more that 6 characters and is required
  password: {
    type: String,
    required: [true, 'Please enter a password'],
    minlength: [6, 'Minimum password length is 6 characters'],
  },
  name: {
    type: String,
  },
  budget:{
    type: Number,
  },
  updated: {
    type: Boolean,
    default: false,
  },
  ShowGoal: {
    type: Boolean,
    default: false,
  },
  // arrays for storing documents about transactions goals and funds
  goals: [],
  funds: [],
  salaries: [],
  subs: [],
  expenses: [],
  incomes: [],
});

// fire a function before doc saved to db
userSchema.pre('save', async function(next) {
  if (this.isNew) { // Check if the document is new
    const salt = await bcrypt.genSalt(); //generate a salt
    this.password = await bcrypt.hash(this.password, salt); //password hashing
    this.budget = 0;
    this.budget.require = [true, 'Please enter a budget'];
  }
  next();
});

// static method to login user
userSchema.statics.login = async function(email, password) {
  const user = await this.findOne({ email }); //find the user with the email
  if (user) {
    const auth = await bcrypt.compare(password, user.password); // compares passwords
    if (auth) {
      return user; //returns if auth is successful
    }
    throw Error('incorrect password'); //if the password is incorrect
  }
  throw Error('incorrect email'); // incorret email if the email is not found
};

const User = mongoose.model('user', userSchema); //creates a model from the schema

module.exports = User; //exports file to be used in other files