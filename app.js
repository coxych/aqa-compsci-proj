const express = require('express');
const mongoose = require('mongoose');

const authRoutes = require('./routes/authRoutes');
const expincRoutes = require('./routes/expincRoutes');
const fundsRoutes = require('./routes/fundsRoutes');
const goalsRoutes = require('./routes/goalsRoutes');

const cookieParser = require('cookie-parser');
const { checkUser, changeUpdated } = require('./middleware/authMiddleware');

const app = express();

// middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(express.json());
app.use(cookieParser());

// view engine
app.set('view engine', 'ejs');

// database connection
const dbURI = 'mongodb+srv://coxych:v10041997v@cluster0.l4vn38v.mongodb.net/node-auth';
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex:true })
  .then((result) => app.listen(3000))
  .catch((err) => console.log(err));

// routes
app.get('/',changeUpdated);
app.get('*', checkUser);
app.get('/', (req, res) => res.render('home'));
app.use(goalsRoutes);
app.use(expincRoutes);  
app.use(authRoutes);
app.use(fundsRoutes);



