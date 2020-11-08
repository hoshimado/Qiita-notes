var express = require('express');
var router = express.Router();
var path = require('path');
var createError = require("http-errors");


var passport = require("passport");

var THIS_ROUTE_PATH = 'auth/';
var oidcConfig = {
  AUTH_URL : process.env.AUTH_URL,
  TOKEN_URL : process.env.TOKEN_URL,
  CLIENT_ID : process.env.CLIENT_ID,
  CLIENT_SECRET : process.env.CLIENT_SECRET,
  RESPONSE_TYPE : 'code',
  SCOPE : 'openid profile',
  REDIRECT_URI_DIRECTORY : 'callback' // 「THIS_ROUTE_PATH + この値」が、OIDCプロバイダーへ登録した「コールバック先のURL」になるので注意。
};
// https://console.developers.google.com/



// パスポートの初期処理。セッションの設定などをする。-------------------------------------------------
var session = require("express-session");
const { resolveCname } = require('dns');
router.use(
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
router.use(passport.initialize());
router.use(passport.session());

// ミドルウェアである passport.authenticate() が正常処理したときに done(errorObject, userObject)で
// 通知された情報を、セッションに保存して、任意のcallback中でセッションから取り出せるようにする。
// 「何をセッションに保存すべきか？」を選択的に行うためのフックcallback関数。
// https://qastack.jp/programming/27637609/understanding-passport-serialize-deserialize
// 
passport.serializeUser(function (user, done) {
  console.log("serializeUser:" + user.profile.id);
  done(null, user);
});
// 上記と対となる、取り出し処理。
passport.deserializeUser(function (obj, done) {
  done(null, obj);
});





// OIDCの認可手続きを行うためのミドルウェアとしてのpassportをセットアップ。-------------------------------------------------
var OpenidConnectStrategy = require("passport-openidconnect").Strategy;
passport.use(
  new OpenidConnectStrategy(
    {
      issuer: "https://accounts.google.com", // https://developers.google.com/identity/protocols/oauth2/openid-connect#obtainuserinfo
      authorizationURL: oidcConfig.AUTH_URL,
      tokenURL:         oidcConfig.TOKEN_URL,
      userInfoURL:  "https://openidconnect.googleapis.com/v1/userinfo", // https://developers.google.com/identity/protocols/oauth2/openid-connect#discovery
      clientID:     oidcConfig.CLIENT_ID,
      clientSecret: oidcConfig.CLIENT_SECRET,
      callbackURL:  THIS_ROUTE_PATH + oidcConfig.REDIRECT_URI_DIRECTORY,
      scope: ["openid", "profile"],
    },
    function (
      issuer,
      sub,
      profile,
      jwtClaims,
      accessToken,
      refreshToken,
      tokenResponse,
      done
    ) {
      // [For Debug]
      // 認証成功したらこの関数が実行される
      // ここでID tokenの検証を行う
      console.log("issuer: ", issuer);
      console.log("sub: ", sub);
      console.log("profile: ", profile);
      console.log("jwtClaims: ", jwtClaims);
      console.log("accessToken: ", accessToken);
      console.log("refreshToken: ", refreshToken);
      console.log("tokenResponse: ", tokenResponse);

      return done(null, {
        profile: profile,
        accessToken: {
          token: accessToken,
          scope: tokenResponse.scope,
          token_type: tokenResponse.token_type,
          expires_in: tokenResponse.expires_in,
        },
        idToken: {
          token: tokenResponse.id_token,
          claims: jwtClaims,
        },
      });
    }
  )
);




// ログイン要求を受けて、OIDCの認可プロバイダーへリダイレクト。-------------------------------------------------
router.get('/login', passport.authenticate("openidconnect"));



// OIDCの認可プロバイダーからのリダイレクトを受ける。---------------------------------------------------------
// ※この時、passport.authenticate() は、渡されてくるクエリーによって動作を変更する仕様。
router.get(
  '/' + oidcConfig.REDIRECT_URI_DIRECTORY,
  passport.authenticate("openidconnect", {
    failureRedirect: "loginfail",
  }),
  function (req, res) {
    // Successful authentication, redirect home.
    console.log("認可コード:" + req.query.code);
    req.session.user = req.session.passport.user.displayName;
    console.log(req.session);
    res.redirect("loginsuccess");
  }
);





// THIS_ROUTE_PATH (='/auth/') 配下のファイルへのアクセス要求の、上記（login/callback）以外の処理を記載する。---------------

// ログインに失敗したときに表示されるページ
router.get('loginfail', function (req, res, next) {
  var htmlStr = '<html lang="ja">';
  htmlStr += '<head>';
  htmlStr += '<meta charset="UTF-8">';
  htmlStr += '<title>login success.</title>';
  htmlStr += '</head>'
  htmlStr += '<body>';
  htmlStr += 'ログインに失敗しました。';
  htmlStr += '</body>';
  htmlStr += '</html>';

  res.header({"Content-Type" : "text/html; charset=utf-8"})
  res.status(200).send(htmlStr);
  res.end();
});


// ログインに成功したときに表示されるページ
router.get('/loginsuccess', function(req, res, next) {
  console.log("----"+THIS_ROUTE_PATH+"login----");
  console.log(req.session.passport);
  var htmlStr = '<html lang="ja">';
  htmlStr += '<head>';
  htmlStr += '<meta charset="UTF-8">';
  htmlStr += '<title>login success.</title>';
  htmlStr += '</head>'
  htmlStr += '<body>';
  htmlStr += 'ログインに成功しました。as ' + req.session.passport.user.profile.displayName;
  htmlStr += '</body>';
  htmlStr += '</html>';

  res.header({"Content-Type" : "text/html; charset=utf-8"})
  res.status(200).send(htmlStr);
  res.end();
});

/*
{ user:
   { profile:
      { id: 'IDトークンに含まれるIDと同一',
        displayName: 'IDトークンに紐づいているユーザー名',
        name: [Object],
        _raw: [Object],
     accessToken:
      { OIDCのトークンエンドポイントから払い出された、OAuth2.0のアクセストークン },
     idToken:
      { IDトークン（JWT） }
      }
   }
}
*/


// 上記以外のアクセスに対する応答
// 「get()」ではなく「use()」であることに注意。
// ref. https://stackoverflow.com/questions/15601703/difference-between-app-use-and-app-get-in-express-js
router.use('/', function(req, res, next) {
  console.log('任意の'+THIS_ROUTE_PATH+'配下へのアクセス');
  if(req.session && req.session.passport && req.session.passport.user && req.session.passport.user.profile){
    console.log('OIDCでログインしたセッションを取得できた')
    console.log(path.join(__dirname, '../auth'));
    next();
  }else{
    console.log('ログインしてない＝セッション取れない')
    next(createError(401, 'Please login to view this page.'));
  }
}, express.static(path.join(__dirname, '../auth')) );




// catch 404 and forward to error handler +++add
router.use(function (req, res, next) {
  next(createError(404));
});



module.exports = router;




