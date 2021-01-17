var express = require('express');
var path = require('path');
var router = express.Router();


var passport = require('passport');
var passportHttp = require('passport-http');
passport.use(new passportHttp.BasicStrategy(
    function (username, password, done) {
        if(username=='user' && password=='pass'){
            return done(null,true);
        }else{
            return done(null, false);
        }
    }
));


router.use('/byvue', passport.authenticate('basic',{session: false}), express.static(path.join(__dirname, '../auth/byvue')) );
router.use('/', express.static(path.join(__dirname, '../auth')) );

module.exports = router;
