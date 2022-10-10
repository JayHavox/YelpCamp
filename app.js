if(process.env.Node_ENV !== 'production'){ //an enviornment variable that states while we are in develeopment require the dotenv
    require('dotenv').config()
}


const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate'); //one of the engines that help understand ejs 
const session =require('express-session') // requiring session
const flash =require('connect-flash');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override'); // remeber this is to get the a post to become a put a patch or a delete and we install it with npm i method-override
const passport = require('passport'); //pluggin multiple strategies for login
const LocalStrategy = require('passport-local'); // lets us do the local strategy for login 
const User = require('./models/user') // need this to for the passport it is the user model we created
// const helmet = require('helmet'); //so for another time we will add helmet but currently it doesnt work the way we saw in the video 
 const mongoSanitize = require('express-mongo-sanitize');
const userRoutes = require('./routes/users')
const campgroundRoutes = require('./routes/campgrounds'); // here requiring the contents of the routes files
const reviewRoutes = require('./routes/reviews'); // here requiring the contents of the routes files


const MongoDBStore = require('connect-mongo')(session)//for production


const dbUrl = 'mongodb://localhost:27017/yelp-camp'
mongoose.connect(dbUrl, {
});

const db = mongoose.connection;
db.on("error",console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected")
});

const app = express(); 

app.engine('ejs',ejsMate)
app.set('view engine','ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({extended:true})); //parses the body of the post 
app.use(methodOverride('_method')); //needed for method override
app.use(express.static(path.join(__dirname,'public')))//uses the the public folder we created to serve static assests 
app.use(mongoSanitize())

const store = new MongoDBStore({ //for production
    url: dbUrl,
    secret: 'thisshouldbeabettersecret!',
    touchAfter: 24 * 60 * 60 
});

store.on('error', function (e) { //for production
    console.log('Session store error',e)
})

const sessionConfig = {  // needed for session
    store,
    name:'session',
    secret: 'thisshouldbeabettersecret!',
    resave:false,
    saveUninitialized: true,
    cookie: {//fancier options that we send back
        httpOnly: true, //only accessible through http
        // secure:true, //only through https
        // expires:Date.now() + 1000 * 60 * 60 * 24 *7, //setting it to expire after a week with or do the max age 
        maxAge: 1000 * 60 * 60 * 24 *7
    }
}
app.use(session(sessionConfig)) //using session
app.use(flash());
// app.use(helmet({contentSecurityPolicy:false})) // samething we wont add helmet at this time 

app.use(passport.initialize()); // for passport
app.use(passport.session());// for passport perssitent login sessions has to be after our session 
passport.use(new LocalStrategy(User.authenticate())); // use the local strategy we have required and its located in user and called authenticate but authenticate is a static method from passport

passport.serializeUser(User.serializeUser()); //telling passport how to store it and unstore it in the session this one and belwo 
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next) => { // middleware on every single requrest before out routes we're going to take whatevers in the flash under success and have access to it in our under the key success
    res.locals.currentUser = req.user;//  in all templates we should have access to current user  
res.locals.success = req.flash('success');
 res.locals.error = req.flash('error')
 next();
})



app.use('/campgrounds', campgroundRoutes) //using those routes we defined in routes
app.use('/campgrounds/:id/reviews',reviewRoutes)
app.use('/', userRoutes)

app.get('/', (req,res) => {
    res.render('home')
});


app.all('*', (req,res,next) => {
    next(new ExpressError('Page Not Found',404))
});

app.use((err,req,res,next) => {
    const {statusCode = 500} = err;
    if(!err.message) err.message = 'Oh No, Something Went Wrong!'
    res.status(statusCode).render('error',{ err });
})

app.listen(3000, ()=> {
    console.log('Serving on port 3000')
});
