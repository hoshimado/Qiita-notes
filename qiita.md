# node.jsのExpressを導入するときの手順メモAzure前提

# 概要

自分用の( ..)φメモメモ。
node.jsのexpressを新規に導入するときの手順。
AzureのWebAppで動かす前提で、TDD想定でsrcとtestフォルダに分けるものとする。
必要最小限。test側のモジュール導入は省略。


# 手順のメモ

`express-generator` はグローバルで導入済みとする。

Expressのスケルトン作成してAzure向け且つTDD向けにファイル移動する

```
express myapp --no-view
mkdir src
mkdir test
copy myapp\bin\www .\server.js
xcopy myapp\public .\src\public\
xcopy myapp\routes .\src\routes\
copy myapp\app.js  .\src\
npm init
```


server.jsのファイル書き換える

```
var app = require('../app');
// ↓
var app = require('./src/app');
```


package.jsonに、myapp配下のそれから以下をコピペする

```
  "dependencies": {
    "cookie-parser": "~1.4.4",
    "debug": "~2.6.9",
    "express": "~4.16.1",
    "morgan": "~1.9.1"
  },
```


不要な作業フォルダを削除して、必要なモジュールを追加インストールする

```
rmdir /s /q myapp
npm install
npm i   node-dev cross-env --save-dev
```

以上ー。


# 補足

testコマンドまで含めた導入済み版はこちらを参照。

* 付録B：ExpressフレームワークのAzure向け導⼊⽅法
* https://github.com/hoshimado/tdd-vuejs-book/tree/master/appendix/b-azure-express-mocha


