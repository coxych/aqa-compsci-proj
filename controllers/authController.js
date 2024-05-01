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
// This token will be used in cookies to authenticate users
const maxAge = 3 * 24 * 60 * 60; // 3 days in seconds
// secrethashing is the secret key used to hash the user ID
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
    const user = await User.create(req.body); // Create a new user using the User model
    const token = createToken(user._id); // Create a JWT token and hash the user ID
    res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 }); // Set the JWT token in a cookie
    res.status(201).json({ user: user._id }); // Respond with the user ID in JSON format (the res.user)
  } catch (err) { 
    res.status(400).json({ errors: handleErrors(err) }); // Handle any errors using the utility function
  }
};

// Handle user login
const login_post = async (req, res) => {
  try {
    const user = await User.login(req.body.email, req.body.password); // Log the user in using the User model
    const token = createToken(user._id); // Create a JWT token and hash the user ID
    res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 }); // Set the JWT token in a cookie
    res.status(200).json({ user: user._id }); // Respond with the user ID in JSON format (the res.user)
  } catch (err) {
    res.status(400).json({ errors: handleErrors(err) }); // Handle any errors using the utility function
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
