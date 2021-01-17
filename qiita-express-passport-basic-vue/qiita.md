# タイトル

Express.jsにPassport.jsで、任意のフォルダ配下のみをBasic認証する

# 概要

ExpressフレームワークにBasic認証を適用する方法について記載します。

任意のフォルダのみにBasic認証を適用するものとし、そのフォルダにVue-CLIによるSPA（＝Single Page Application）を置くことを目的とします。

# 方針

最小限のBasic認証を認証する場合はExpress.jsプロジェクトにて提供されるbasic-auth-connectライブラリでもよいのですが、他の認証への差し替えの容易性を考慮して、Passport.js を用いることとします。

* basic-auth-connect
    * https://github.com/expressjs/basic-auth-connect
* Passport.js
    * http://www.passportjs.org/

認証を要求する領域と、不要とする領域を共存させたいので、任意のフォルダ配下のみをBasic認証の対象とします。

ついでに、Vue CLIで作成したSPAを任意フォルダへ配置するものとします。

なお、ユーザー名は「user」でパスワードは「pass」とします。本サンプルコードは動作確認が目的なので、パスワード管理はガバガバです。


## （補足）Express3とExpress4の違い（basic-auth-coonect）

Express.jsでBasic認証を、で検索すると「`express.basicAuth()`」での実装例が時々ひっかかります。これは、Express3での記法とのことです。現在のExpress4では、「var basicAuth = require('basic-auth-connect');」とする仕組みに変わっています。

ref. https://qiita.com/zaru/items/51b415c80245920837ff

# 前提条件

AzureのWebアプリ（PaaS）を利用して公開する前提で、Express.jsを構築します。
具体的には、次のページの手順に従って作成します。

* Node.js Express アプリをビルドして Azure Cloud Services にデプロイする
    * https://docs.microsoft.com/ja-jp/azure/cloud-services/cloud-services-nodejs-develop-deploy-express-app

作成し終えたファイル一式は以下のようになります（※Mocha.jsでのテストを前提としてtestフォルダも作成しているが、この記事では使わない）。

ref. https://github.com/hoshimado/tdd-vuejs-book/tree/master/appendix/b-azure-express-mocha



# 先ずは、全体をBasic認証の対象とする方法

Passport.jsの必要なモジュールを次のようにインストールします。

```
npm install passport passport-http --save 
```

続いて、app.jsを次のように変更します。

```
// +++ ここから +++
var passport = require('passport');
var passportHttp = require('passport-http');
passport.use(new passportHttp.BasicStrategy(
    function (username, password, done) {
        if(username=='user' && password=='pass'){
            // ユーザー名とパスワードが有効なら true を返却する。
            return done(null,true);
        }else{
            // 無効なら、false を返却する（とUnauthorizedを画面表示）
            return done(null, false);
        }
    }
));
app.use('/', passport.authenticate('basic',{session: false}) );
// --- ここまで ---
app.use(express.static(path.join(__dirname, 'public'))); // この行の前に、↑を追加する。
```

この状態で、サーバーを「`npm run dev`」で起動すると、全体に対してBasic認証が設定されます。


# 次に、任意のフォルダ配下のみをBasic認証の対象とする方法

先の節で追加した部分を元に戻します。

本サンプルでは「/auth/byvue」へのアクセスに対してのみ、Basic認証を掛けるものとします。

任意のフォルダ配下のみにBasic認証を掛けるには「ルーティング設定で対象フォルダに対してpassport.authenticate()のミドルウェアを指定し、認証成功時にexpress.static()で静的ファイルを表示する（か、次のルーティングへ渡す）」ようにします。

具体的には、例えば次のようにします。(※本サンプルでは、対象を静的ファイルとします）。

1. app.jsで、publicフォルダ配下の静的ファイルを処理している1行をコメントアウト
2. 制御用のファイル`routes/auth.js`を作成して、対象パスへのアクセスをそちらへルーティング

```app.js
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
// app.use(express.static(path.join(__dirname, 'public'))); // ★コメントアウトする


//app.use('/', indexRouter); // ★利用していないので、ここもコメントアウトする
app.use('/auth', require('./routes/auth')); // ★追加する
app.use('/users', usersRouter);

module.exports = app;
```

3. 作成したファイル`routes/auth.js`に次を記述
4. `auth/byvue`フォルダと、`auth/simply`フォルダ配下に適当な表示用htmlファイルを置く

```auth.js
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


router.use('/byvue', passport.authenticate('basic',{session: false}), express.static(path.join(__dirname, '../auth/byvue')) ); // ★ここにだけBasic認証を掛ける
router.use('/', express.static(path.join(__dirname, '../auth')) ); // ★それ以外はそのまま表示する。

module.exports = router;
```

上記までを終えたら、「`npm run dev`」でhttpサーバーを起動します。

下記へアクセスすると、Basic認証を求められます。
（※本サンプルでは、`express.static()`でマッピングするフォルダを実際のパスに合わせてますが、異なるフォルダをマッピングしてももちろん構いません。）

http://localhost:3000/auth/byvue/

それ以外の、例えば下記へアクセスすると、Basic認証無しで表示されます。

http://localhost:3000/auth/simply/

もちろん、下記へのアクセスもBasic認証無し、となります。

http://localhost:3000/auth/

http://localhost:3000/

Basic認証については以上です。



# オマケとして、任意フォルダ配下へVue CLIでBuildしたファイルを配置する方法

オマケです（当方にとっては、こっちが目的だったので）。

上記の「auth/byvue」のフォルダに、Vue CLIで作成したファイルを配置するには、次のようにします。本サンプルではExpress用の`src`フォルダと同じ階層にVue CLIのプロジェクトを`cli-vue`という名称で作成したと仮定します。

1. `cli-vue`フォルダ直下に、`vue.config.js`ファイルを次のように配置する(ファイル名は固定)
2. 「npm run build」でビルドする

```vue.config.js
module.exports = {
    // options...
    outputDir : '../src/auth/byvue',
    publicPath : './'
}
```

ここで、それぞれのオプションは以下を意味します。

* `outputDir` : ビルドしたファイルの出力先フォルダパス。このフォルダは毎回「削除→再作成」されることに注意。
* `publicPath` : ビルドしたhtmlファイルの「基底URL」（HTMLのbaseタグ）。デフォルトでは絶対パスの「`/`」。
    * 今回のサンプルでは「サブフォルダ」に配置したかったので、「相対パス（`./`）」で扱うように設定

ref. https://cli.vuejs.org/config/#publicpath

上記までを終えたら、「`npm run dev`」でhttpサーバーを起動します。

下記へアクセスすると、Basic認証を経たのちにVue CLIで作成されたページが表示されます。

http://localhost:3000/auth/byvue/


以上ー。




