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
  const token = req.cookies.jwt;
  if (token){
    return new Promise((resolve, reject) => {
      jwt.verify(token, 'secrethashing', (err, decodedToken) =>{
          if (err){
              console.log(err.message);
              reject(err);
          }
          else{
              resolve(decodedToken.id);
          }
      })
    });
  }
  else{
      return null;
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
    const token = req.cookies.jwt;
    if (token) {
      jwt.verify(token, 'secrethashing', async (err, decodedToken) => {
        if (err) {
          res.locals.user = null;
          next();
        } else {
          let user = await User.findById(decodedToken.id);
          res.locals.user = user;
          await regularCheck(decodedToken.id);
          next();
        }
      });
    } else {
      res.locals.user = null;
      next();
    }
};

module.exports = { requireAuth, checkUser, getUserId, changeUpdated };