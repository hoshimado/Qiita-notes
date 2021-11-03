var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/auth-gcp',   require('./routes/auth_login_gcp'));   // 追記 for Google
app.use('/auth-azure', require('./routes/auth_login_azure')); // 追記 for Azure

app.use('/', indexRouter);
app.use('/users', usersRouter);

module.exports = app;
