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



// passport.js に対するsession設定 +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// OIDCのStrategyではstate管理（OIDCのハッキング対策の仕様）その他のため、
// セッションの利用が必要。これをしないと、
// 「OpenID Connect authentication requires session support when using state. 
//   Did you forget to use express-session middleware?'」
// のエラーが出る。
// ※passport-openidconnect\lib\state\session.js
// 　の以下でチェックされている。
//  > SessionStore.prototype.store = function(req, meta, callback) {
//  > if (!req.session) { return callback(new Error('OpenID Connect authentication requires session support when using state. Did you forget to use express-session middleware?')); }
// 
// なお、「passport = require("passport");」はシングルトンとして同一の
// インスタンスが返却される。
// ※「passport\lib\index.js】の以下で
//   > exports = module.exports = new Passport();
//   > 
//   と1回のみインスタンスを生成して、それが返却されてくる。
//   従って、他ファイルで「passport = require("passport");」としたときに、
//   取得されるインスタンスは同一。
// 
var session = require("express-session");
app.use(
  session({
    // クッキー改ざん検証用ID
    secret: process.env.COOKIE_ID,
    // クライアント側でクッキー値を見れない、書きかえれないようにするか否か
    httpOnly: true,
    // セッションの有効期限
    maxAge: 30*1000,
    // その他のオプションは以下を参照
    // https://github.com/expressjs/session#sessionoptions
    resave: false,
    saveUninitialized: false
  })
);
var passport = require("passport");
app.use(passport.initialize());
app.use(passport.session());

// ミドルウェアである passport.authenticate() が正常処理したときに done(errorObject, userObject)で
// 通知された情報を、セッションに保存して、任意のcallback中でセッションから取り出せるようにする。
// 「何をセッションに保存すべきか？」を選択的に行うためのフックcallback関数。
// https://stackoverflow.com/questions/27637609/understanding-passport-serialize-deserialize
// 
// ※APIオンリーの場合はセッションを無効にするという手も提示されているが、、、login画面へのリダイレクトでは
//   少なくとも認証された情報の取得が必要なので、ここは要るはず。
//   認可エンドポイントからcallbackされるときのcodeなどをそのまま使うなら、不要かもしれないが。。。
//   http://www.passportjs.org/docs/oauth2-api/ ＞ Protect Endpoints
//
// [ToDo]利用したODICのIdPごとに区別して格納すべき。
//       ※ここで、userは「OpenidConnectStrategy()」の第二引数で渡されるdone()
//         に指定した値が入ってくる。
passport.serializeUser(function (user, done) {
  console.log("[serializeUser for All]");
  console.log("serializeUser:id=" + user.profile.id);
  console.log("serializeUser:\n" + JSON.stringify(user));
  done(null, user);
});
// 上記と対となる、取り出し処理。
passport.deserializeUser(function (obj, done) {
  done(null, obj);
});
//*/
// --- ここまで ----------------------------------------------------------


app.use('/auth-gcp',   require('./routes/auth_login_gcp'));   // 追記 for Google
app.use('/auth-azure', require('./routes/auth_login_azure')); // 追記 for Azure
app.use('/auth-yahoo', require('./routes/auth_login_yahoo')); // 追記 for Yahoo


app.use('/', indexRouter);
app.use('/users', usersRouter);

module.exports = app;
