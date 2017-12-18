var express = require('express');
var passport = require('passport');
var flash = require('connect-flash');
var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var mongoose = require('mongoose');
var path = require('path');

var blob = require('./models/blobs');

var config = require('./config/database.js');
require('./config/passport')(passport);

var users = require('./routes/users');
var blobs = require('./routes/blobs');

mongoose.connect(config.mongodb.url);

// On Connection
mongoose.connection.on('connected', () => {
    console.log('Connected to database '+ config.mongodb.url);
});
  
// On Error
mongoose.connection.on('error', (err) => {
    console.log('Database error: '+err);
});

var app = express();

app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser()); // get information from html forms

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// required for passport
app.use(session({ secret: 'iamrohitkskkkip128001iejf' })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

app.get('/', (req, res) => {
    res.render('index',{title: 'welcome to event management'}); // load the index.ejs file
});

app.use('/', users);
app.use('/events', blobs);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

var port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log("server started on "+ port)
});