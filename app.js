const express = require('express'); //importing express
const mongoose = require('mongoose'); //importing mongoose

const authRoutes = require('./routes/authRoutes'); //importing the authRoutes
const expincRoutes = require('./routes/expincRoutes'); //importing the expincRoutes
const fundsRoutes = require('./routes/fundsRoutes'); // importing the fundsRoutes
const goalsRoutes = require('./routes/goalsRoutes'); // importing the goalsRoutes
const overviewRoutes = require('./routes/overviewRoutes'); // importing the overviewRoutes

const cookieParser = require('cookie-parser'); //importing cookie-parser
const { checkUser, changeUpdated } = require('./middleware/authMiddleware');//importing the checkUser middleware
const { over } = require('lodash');

const app = express();//creating an instance of express

// middleware
app.use(express.urlencoded({ extended: true })); //for parsing incoming request bodies under the req.body (reading data from forms)
app.use(express.static('public')); //for serving static files like css or images
app.use(express.json()); //parsing JSON data sent by the client
app.use(cookieParser()); //allows to read cookies sent back from the client


app.set('view engine', 'ejs'); //setting the view engine to ejs

// database connection

const dbURI = 'mongodb+srv://coxych:v10041997v@cluster0.l4vn38v.mongodb.net/node-auth';
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex:true })
  .then((result) => app.listen(3000))
  .catch((err) => console.log(err));

// routes
app.get('/',changeUpdated); 
app.get('*', checkUser); //every get request will run the checkUser middleware
app.get('/', (req, res) => res.render('home')); //home page
app.use(goalsRoutes); 
app.use(expincRoutes);  
app.use(authRoutes);
app.use(fundsRoutes);
app.use(overviewRoutes);