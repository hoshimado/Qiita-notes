# qiita-express-passport-oidc

Subject: ExpressとPassportでOpenID Connect認証を実装する


# 概要

OpenID Connect（以下、「OIDC」と略記）のRelying Party(以下「RP」と略記）を、Node.jsのExpressを使ったWebページ上にPassportを使って簡単に実装する方法を説明する。

本サンプルの前提は以下。

* 認証フローは「認可コードフロー（RFC 6749, 4.1. Authorization Code Grant）」を使う
* OIDCのIDプロバイダーとして、Google Cloud Platform（以下、「GCP」と略記）を使う


使うライブラリは以下。

* Express
* Passport
* Passport-OpenID Connect


なお、OIDCのRPを実装するだけであれば、`auth0/express-openid-connect` を使うのが一番簡単かもしれない。次のようにするだけで、以降の`app.use()`を認証ページとして設定できるので。

```
const { auth } = require('express-openid-connect');
app.use(
  auth({
    issuerBaseURL: 'https://YOUR_DOMAIN',
    baseURL: 'https://YOUR_APPLICATION_ROOT_URL',
    clientID: 'YOUR_CLIENT_ID',
    secret: 'LONG_RANDOM_STRING',
  })
);
```

しかし、OIDCのフローを追って実装したかった＆自前実装したものを「既存のライブラリを使うと、こう出来る」と置き換えて追いたかった、ので今回はPassportを利用して実装してみる。
（既存のライブラリへ置き換える理由？→自分で実装するよりも安心だから。最初に自前実装した理由？→単なる興味）


* Express
  * https://expressjs.com/ja/
* Passport
  * http://www.passportjs.org/
* Passport-OpenID Connect
  * https://github.com/jaredhanson/passport-openidconnect
* Express-OpenID-Connect
  * https://github.com/auth0/express-openid-connect


# サンプルコードの動作環境

以下の通り。

```
  "dependencies": {
    "cookie-parser": "~1.4.4",
    "debug": "~2.6.9",
    "express": "~4.16.1",
    "express-session": "^1.17.1",
    "morgan": "~1.9.1",
    "passport": "^0.4.1",
    "passport-openidconnect": "0.0.2"
  },
  "devDependencies": {
    "cross-env": "^7.0.2",
    "node-dev": "^6.2.0"
  }
```

# ExpressでのOIDCによる認証時のフロー

OIDCを用いた認証のフローは以下のようになる。


0. RPを、OIDCのIDプロバイダーに登録する
    * OIDC認証に必要なクライアントID、クライアントシークレットを受け取って、コールバック先URLを設定しておく
1. Expressでのloginページを設けて、そこへのページアクセスを受けて、OIDCのIDプロバイダー（認可エンドポイント）へリダイレクトする
    * クライアントIDその他をQueryとしてGETでリダイレクトし、認可を求める
2. IDプロバイダーでの認可が完了すると、Express側の指定の場所にリダイレクトされてくる
    * リダイレクトGETのQueryとして認証用のCodeが渡される
3. クライアントIDとクライアントシークレット、そして受け取ったCodeその他を用いて、トークンエンドポイントへREST APIにてIDトークンを要求する
4. レスポンスでIDトークンとアクセストークンを受け取る
    * これで、「1.」でloginページへアクセスした人が「Aさんである」と認証が成された
    * 必要なら、アクセストークンを用いて、UserエンドポイントへREST APIにて「Aさん」のプロフィール情報を追加で取得する
5. 以降、（必要なら）IDトークンに含まれるユーザー情報をセッションで保持することで認証状態を判別する。



# Express＋PassportでのOIDC認証の実装例

ExpressとPassportを用いて、Google（GCP）のOIDC IDプロバイダーを用いてGoogle IDで認証するRPを作る実装例を、以下で説明する。

説明に用いるサンプルコードは以下を参照。

https://github.com/hoshimado/qiita-notes/tree/master/qiita-express-passport-oidc

本サンプルコードでは、`/auth` 配下のファイルに対して、OIDCで認証をかける（認証後にしかアクセスできない）ようにする。
（なお、OIDC認証後に、認証で受け取ったIDトークンの有無でアクセス制御しているだけなので、「認証のみでアクセス制御しない」ことも可能なサンプルとしている）。


## PRを、OIDCのIDプロバイダーに登録する

以下のGoogleのガイドに従って実施する。

https://prev.net-newbie.com/apps/OAuth2.html

簡単に手順を書くと以下。

1. Google Developers Console へGoogleIDでログインする
    * https://console.developers.google.com/?hl=JA
2. プロジェクトを作成し、OAuth同意画面を「公開」で作成する
3. 認証情報にて「OAuth クライアントID」を「種類：ウェブアプリケーション」で作成する
4. 「承認済みのリダイレクトURI」を設定する
    * 本サンプルでは、「`http://localhost:3000/auth/callback`」を設定するものとする
5. クライアントIDとクライアントシークレットの発行を受ける

![Google Developers Console出の登録完了状態](https://gyazo.com/85a3c435eaddcb7b172f698be40c2b68.jpeg)

## Expressのスケルトンを用意する

具体的には、以下の記事に記載した手順で作成したものを、本サンプルでは前提とする。

https://qiita.com/hoshimado/items/a009a58a6986d8826f0d

※`express-generator`で生成したExpressのスケルトンであれば、何でも良い。

※自身で読み替えが出来るのであれば、`express-generator`での生成にも限定はしない。


## 前準備として、passportの初期化処理と、利用するセッションの初期化処理を行う

PassportとOIDC用のストラテジーをインストールする。

```
npm i   passport passport-openidconnect --save
```

OIDCストラテジーではセッションを利用する（OIDCのIDプロバイダーへの送信値と返却値の検証のため値の保持が必要）ので、以下で`express-session`をインストールする（`express-session`はデフォルトではメモリストア利用であって「メモリリークしやすいので本番への利用は他のストアを利用すること」とあるが、今回は開発目的なのでデフォルトのまま利用する）。

```
npm i express-session --save
```

OIDC認証で保護するフォルダとして `auth` を作成して、配下に `index.html` をお試しとして配置する。

OIDC認証の制御を行うコードをまとめたファイルとして、 `src\routes` フォルダ配下に `auth_login.js` を作成する。

以下のようなフォルダ構成になる。

```
qiita-express-passport-oidc
|   app.js
+---auth
|       index.html
+---public
|       index.html
\---routes
        auth_login.js
        index.js
        users.js
```

`auth_login.js` に次のように記述して、OIDCの設定オブジェクトの準備と、passportの初期化処理と、利用するセッションの初期化処理を行う。

```
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
```

OIDCの設定と、セッションの設定は、環境変数を利用して外から実行時に与えるものとする。

```
SET AUTH_URL=https://accounts.google.com/o/oauth2/v2/auth
SET TOKEN_URL=https://www.googleapis.com/oauth2/v4/token
SET CLIENT_ID=Your OIDC Client ID
SET CLIENT_SECRET=Your OIDC Client Secret
SET COOKIE_ID=Your cookie ID name

npm run dev
```

## OIDC認証ためのログインページを設けて、IDプロバイダーへリダイレクトさせる

PassportのOIDC向けのストラテジーである「Passport-OpenID Connect」に対してOIDC認証に必要な情報を設定して、そのストラテジーのインスタンスをPassportに設定する。
続いて、OIDC認証のためのログインページを `/login` として設けて、そのページへのアクセスを受けたらOIDCのIDプロバイダーヘリダイレクトする。
リダイレクト操作は「`passport.authenticate("openidconnect")`」（が返却するmiddleware）へ処理を任せるだけでよい。
リダイレクト時にはOIDCのプロトコルに従ってクライアントIDその他を適切に渡す必要があるが、そこは「Passport-OpenID Connect」のストラテジーが全部やってくれる。

具体的なサンプルコードは以下の通りで、先ほどのコードに続けて `auth_login.js` に記述する。

```
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
```



## IDプロバイダでの認可の完了後のリダイレクトを受け取り、続いて認証用のIDトークンを取得する

クライアントIDとクライアントシークレット、そしてリダイレクトで受け取ったCodeを用いて、トークンエンドポイントへREST APIにてIDトークンを要求する。
その要求APIの操作も「`passport.authenticate("openidconnect")`」（が返却するmiddleware）へ処理を任せるだけでよい。
セキュリティ対策として、リダイレクトで受け取ったstateの検証や、取得したIDトークンのnonceの検証などをする必要があるが、そこは「Passport-OpenID Connect」のストラテジーが全部やってくれる。また、アクセストークンを用いてUserエンドポイントへREST APIにて「Aさん」のプロフィール情報の取得も行ってくれる。

本サンプルでは、IDトークンの受け取りに成功したら `./loginsuccess` へリダイレクトし、失敗時には `./loginfail` へリダイレクトする設計とする。

具体的なサンプルコードは以下の通りで、先ほどのコードに続けて `auth_login.js` に記述する。


```
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
```


## 認証結果として受け取ったIDトークンをセッションで保持してログイン状態を判別する

OIDC認証の失敗時にリダイレクトされる `./loginfail` では、単純に「失敗しました」を表示している。

OIDC認証に成功した状態でリダイレクトされる `./loginsuccess` では、セッションからIDトークンとアクセストークン、そしてプロフィールを取得できる（ように、先の「Passport-OpenID Connect」のストラテジーに対して処理を設定してある）。本サンプルでは `req.session.passport.user.profile.displayName` を表示している。

以降、セッションから「`req.session.passport.user`」を取得できれば「ログイン状態」と言えるので、OIDC認証を掛けたい「`/auth`」配下へのアクセス時は、例えばIDトークンに含まれるユーザー情報を用いて「`req.session.passport.user.profile`が存在するならば、`src/auth/`配下の静的ファイルを表示する」などのように制御すればよい（本サンプルでは、そのような制御としている）。

（もちろん、「制御しない」という選択肢もある。）

具体的なサンプルコードは以下の通りで、先ほどのコードに続けて `auth_login.js` に記述する。

```
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


// ルーターとしてのMiddleWareをエクスポート
module.exports = router;
```

## authパスへのアクセスをapp.jsとindex.htmlに追記して動作検証する

`public\index.html`に次の1行を追加して、OIDC認証へのログインリンクと認証制御下のファイルへのリンクを貼る。

```
  <a href="./auth/login" target="_blank">OIDC認証</a>
  <br>
  <a href="./auth/" target="_blank">OIDC認証が必要なパス配下へのリンク</a>

```

`src\app.js`ファイルに次の1行を追記して、`/auth`へのアクセス時のルーティングを`auth_login.js`に任せる。

```
app.use('/auth', require('./routes/auth_login'));
```

以上の設定を行ったら、先に述べたように各種の環境変数を設定して、たとえば以下のようにしてHTTPサーバーを立ち上げる。

```
SET AUTH_URL=https://accounts.google.com/o/oauth2/v2/auth
SET TOKEN_URL=https://www.googleapis.com/oauth2/v4/token
SET CLIENT_ID=Your OIDC Client ID
SET CLIENT_SECRET=Your OIDC Client Secret
SET COOKIE_ID=Your cookie ID name

npm run dev
```

`http://localhost:3000/` へアクセスし、そのままの状態で「OIDC認証が必要なパス配下へのリンク」へジャンプしても「UnauthorizedError」応答になることを確認する。

続いて「OIDC認証」へジャンプして、OIDCログインの画面が表示されることを確認し、ログイン後にもう一度「OIDC認証が必要なパス配下へのリンク」へジャンプすると、今度はページが表示されることを確認する。

以上ー。


# 参考サイト／参考書籍

* Express+Passportで簡単にOpenID ConnectのRPを作成してみた
    * https://qiita.com/yuna-s/items/43cb42e3c667237a1870
* OAuth 2.0 Authorization Code Flow Example for a Confidential Client
    * https://github.com/ForgeRock/exampleOAuth2Clients/tree/master/node-passport-openidconnect
* OAuth、OAuth認証、OpenID Connectの違いを整理して、理解できる本
    * https://booth.pm/ja/items/1550861
