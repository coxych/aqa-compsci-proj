const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { regularCheck } = require('./expincMiddleware');


const requireAuth = (req, res, next) =>{
    const token = req.cookies.jwt;

    //check json web token exists & is verified
    if (token){
        jwt.verify(token, 'secrethashing', (err, decodedToken) =>{
            if (err){
                console.log(err.message);
                res.redirect('/login');
            }
            else{
                console.log(decodedToken);
                next();
            }
        })
    }
    else{
        res.redirect('/login');
    }
};

const getUserId = (req) =>{
  const token = req.cookies.jwt; //token is taken from the cookie attached to the request
  if (token){ // if there JWT in the cookie 
    return new Promise((resolve, reject) => { //promise as this is async
      jwt.verify(token, 'secrethashing', (err, decodedToken) =>{ //decodes token and checks if it is valid
        // valid means signed with correct secret word and not expired
          if (err){
              console.log(err.message);
              reject(err); //reject promise
          }
          else{
              resolve(decodedToken.id); //if verificatio is successful then id from JWT (user's id) is returned
          }
      })
    });
  }
  else{
      return null; // if no JWT is found in the cookies returns null
  }
}

const changeUpdated = (req, res, next) => {
  const token = req.cookies.jwt;
  if (token) {
    jwt.verify(token, 'secrethashing', async (err, decodedToken) => {
      if (err) {
        res.locals.user = null;
        next();
      } else {
        let user = await User.findById(decodedToken.id);
        res.locals.user = user;
        await User.updateOne({ _id: decodedToken.id }, { updated: true });
        user.save();
        next();
      }
    });
  } else {
    res.locals.user = null;
    next();
  }
}

const checkUser = (req, res, next) => {
    const token = req.cookies.jwt; //get the token from the cookie
    if (token) { //if the token exists
      jwt.verify(token, 'secrethashing', async (err, decodedToken) => { //verify the token 
        if (err) {
          res.locals.user = null; //if there is an error, set the user to null
          next();
        } else {
          // if the token is verified, find the user with the id in the token
          let user = await User.findById(decodedToken.id); 
          res.locals.user = user; //set the user to the user found
          //now user can be using in html via EJS
          await regularCheck(decodedToken.id); //check if the user has unupdated subs or incomes
          next();
        }
      });
    } else {
      res.locals.user = null; //if there is no token, set the user to null
      next();
    }
};

module.exports = { requireAuth, checkUser, getUserId, changeUpdated };