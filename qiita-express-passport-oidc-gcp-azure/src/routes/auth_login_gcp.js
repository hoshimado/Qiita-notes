var express = require('express');
var router = express.Router();
var path = require('path');
var createError = require("http-errors");


var passport = require("passport");


/**
 * 下記のOIDC連携ログインの情報は、GCPは以下のコンソールから設定と取得を行う。
 * https://cloud.google.com/
 * 
 * ※「ほしまど」のGoogleアカウントで管理していることに留意。
 */
var THIS_ROUTE_PATH = 'auth-gcp';
var oidcConfig = {
  CLIENT_ID : process.env.GCP_CLIENT_ID,
  CLIENT_SECRET : process.env.GCP_CLIENT_SECRET,
  RESPONSE_TYPE : 'code', // Authentication Flow、を指定
  SCOPE : 'openid profile',
  REDIRECT_URI_DIRECTORY : 'callback' // 「THIS_ROUTE_PATH + この値」が、OIDCプロバイダーへ登録した「コールバック先のURL」になるので注意。
};
// https://console.developers.google.com/



// パスポートの初期処理。セッションの設定などをする。-------------------------------------------------
var session = require("express-session");
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
// ※APIオンリーの場合はセッションを無効にするという手も提示されているが、、、login画面へのリダイレクトでは
//   少なくとも認証された情報の取得が必要なので、ここは要るはず。
//   認可エンドポイントからcallbackされるときのcodeなどをそのまま使うなら、不要かもしれないが。。。
//   http://www.passportjs.org/docs/oauth2-api/ ＞ Protect Endpoints
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
var Instance4GoogleOIDC = new OpenidConnectStrategy(
    {
      issuer: "https://accounts.google.com",
      authorizationURL: "https://accounts.google.com/o/oauth2/v2/auth",
      tokenURL:         "https://oauth2.googleapis.com/token",
      userInfoURL:  "https://openidconnect.googleapis.com/v1/userinfo",
      clientID:     oidcConfig.CLIENT_ID,
      clientSecret: oidcConfig.CLIENT_SECRET,
      callbackURL:  THIS_ROUTE_PATH + '/' + oidcConfig.REDIRECT_URI_DIRECTORY,
      scope: ["openid", "profile"]
      /**
       * 公開情報（EndPointとか）は以下を参照
       * https://developers.google.com/identity/protocols/oauth2/openid-connect
       * https://accounts.google.com/.well-known/openid-configuration
       */
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
      console.log("===[Success Authenticate by GCP OIDC]===");
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
);

/**
 * Strategies used for authorization are the same as those used for authentication. 
 * However, an application may want to offer both authentication and 
 * authorization with the same third-party service. 
 * In this case, a named strategy can be used, 
 * by overriding the strategy's default name in the call to use().
 * 
 * https://www.passportjs.org/docs/configure/
 * の、大分下の方に↑の記載がある。
*/
passport.use('openidconnect-gcp', Instance4GoogleOIDC)



// ログイン要求を受けて、OIDCの認可プロバイダーへリダイレクト。-------------------------------------------------
router.get(
  '/login', 
/*
  function (req, res, next) {
    // 利用する「認証ストラテジー」を指定したうえで、「OIDC」のストラテジーへ進む。
    // FixMe: 複数のリクエストが同時に来ることは想定していないので注意。（※サンプルアプリなので）
    passport.use( Instance4GoogleOIDC );
    next();
  }, 
*/
  passport.authenticate("openidconnect-gcp")
);



// OIDCの認可プロバイダーからのリダイレクトを受ける。---------------------------------------------------------
// ※この時、passport.authenticate() は、渡されてくるクエリーによって動作を変更する仕様。
router.get(
  '/' + oidcConfig.REDIRECT_URI_DIRECTORY,
  passport.authenticate("openidconnect-gcp", {
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





// THIS_ROUTE_PATH (='../auth') 配下のファイルへのアクセス要求の、上記（login/callback）以外の処理を記載する。---------------

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


// 「get()」ではなく「use()」であることに注意。
// ref. https://stackoverflow.com/questions/15601703/difference-between-app-use-and-app-get-in-express-js
router.use('/', function(req, res, next) {
    console.log('任意の'+THIS_ROUTE_PATH+'配下へのアクセス');
    console.log("+++ req.session.passport +++");
    console.log(req.session.passport);
    console.log("----------------------------");

    if(req.session && req.session.passport && req.session.passport.user && req.session.passport.user.profile){
      console.log('OIDCでログインしたセッションを取得できた')
      console.log(path.join(__dirname, '../' + THIS_ROUTE_PATH));
      next();
    }else{
      console.log('ログインしてない＝セッション取れない')
      next(createError(401, 'Please login to view this page.'));
    }
  }, express.static(path.join(__dirname, '../' + THIS_ROUTE_PATH)) );
  




// catch 404 and forward to error handler +++add
router.use(function (req, res, next) {
  next(createError(404));
});



module.exports = router;




