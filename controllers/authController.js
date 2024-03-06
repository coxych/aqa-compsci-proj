const User = require('../models/user');
const jwt = require('jsonwebtoken');

// Utility for handling errors
const handleErrors = (err) => {
  let errors = { email: '', password: '' };

  // Specific error messages based on the error encountered
  if (err.message.includes('incorrect email')) errors.email = 'Email not registered';
  if (err.message.includes('incorrect password')) errors.password = 'Incorrect password';
  if (err.code === 11000) errors.email = 'Email already registered';
  if (err.message.includes('user validation failed')) {
    // Parse and assign validation errors
    Object.values(err.errors).forEach(({ properties }) => {
      errors[properties.path] = properties.message;
    });
  }

  return errors;
};

// Utility for creating JWT tokens
const maxAge = 3 * 24 * 60 * 60; // 3 days in seconds
const createToken = (id) => jwt.sign({ id }, 'secrethashing', { expiresIn: maxAge });

// Controller actions
// Render the signup page
const signup_get = (req, res) => res.render('signup');

// Render the login page
const login_get = (req, res) => res.render('login');

// Log the user out
const logout_get = (req, res) => {
  res.cookie('jwt', '', { maxAge: 1 });
  res.redirect('/');
};

// Handle user signup
const signup_post = async (req, res) => {
  try {
    const user = await User.create(req.body);
    const token = createToken(user._id);
    res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
    res.status(201).json({ user: user._id });
  } catch (err) {
    res.status(400).json({ errors: handleErrors(err) });
  }
};

// Handle user login
const login_post = async (req, res) => {
  try {
    const user = await User.login(req.body.email, req.body.password);
    const token = createToken(user._id);
    res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
    res.status(200).json({ user: user._id });
  } catch (err) {
    res.status(400).json({ errors: handleErrors(err) });
  }
};

// Export controller actions
module.exports = {
  signup_get,
  login_get,
  logout_get,
  signup_post,
  login_post,
};
