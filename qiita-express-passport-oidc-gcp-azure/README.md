# qiita-express-passport-oidc-gcp-azure

Subject: ExpressとPassportによる実装クライアントで、複数のOpenID Connect認証を試してみる（Google/Azure/Yahoo）


# 概要

複数（Google/Azure/Yahoo）のサービスが提供する、OpenID Connect（以下、「OIDC」と略記）のIdentity Provider（以下、「IdP」と略記）に対して、実際にIdP側に設定・登録する内容とRelying Party(以下「RP」と略記）側への反映について説明する。

OIDCのIdP提供元によってIdP側の設定手順や呼称が異なるため、OIDCのクライアントID、シークレットキーと「実際のIdp側の操作画面の紐づけ」を目的とする。

本記事ではRP側の実装は同一とし、認証要求先のIdPの設定に応じてそれぞれのOIDC認証が動作することを検証する。PR側は、Node.jsのExpressを使ったWebページ上にPassportを使って簡単に実装したサンプルを用いる。

本記事で用いるPR側のサンプル実装コードは、以下を参照。

https://github.com/hoshimado/qiita-notes/tree/main/qiita-express-passport-oidc-gcp-azure

なお、上記の「PRのサンプルコード」は以下の記事で作成したモノをベースに、複数IdPの情報を設定するために少し修正したものであり、設計はほぼ同一なので説明は省略する。

https://qiita.com/hoshimado/items/fbdd66bed304f442d2d5

※自身でPRを作成済みであり、読み替えが出来るのであれば、本サンプルを利用する必要はない。


本記事は以下を前提とする。

* 認証フローは「認可コードフロー（RFC 6749, 4.1. Authorization Code Grant）」を使う
* IDトークンの取得には「POST形式（RFC6749, 9. Client Authentication にある client_secret_post）」を使う
* OIDCのIDプロバイダーとして、以下について試行する
  * Google Cloud Platform（以下、「GCP」と略記）
    * https://cloud.google.com/
  * Microsoft Azure（以下、「Azure」と略記）
    * https://portal.azure.com/
  * Yahoo! ID連携 v2（以下、「Yahoo」と略記）
    * https://e.developer.yahoo.co.jp/dashboard/


PRのサンプルコードで使うライブラリは以下。

* Express
  * https://expressjs.com/ja/
* Passport
  * http://www.passportjs.org/
* Passport-OpenID Connect
  * https://github.com/jaredhanson/passport-openidconnect



# サンプルコードの動作環境

以下の通り。

```
  "dependencies": {
    "cookie-parser": "~1.4.4",
    "debug": "~2.6.9",
    "express": "~4.16.1",
    "express-session": "^1.17.2",
    "morgan": "~1.9.1",
    "passport": "^0.5.0",
    "passport-openidconnect": "0.0.2"
  },
  "devDependencies": {
    "cross-env": "^7.0.3",
    "node-dev": "^7.1.0"
  }
```

# 各種OIDCのIdPへの登録方法について

PRとしてOIDC認証を行うには、IdP提供元のいわゆる「openid-configuration」情報（EndPointとサポートする形式）と、PR個別に以下の登録が必要となる。

* クライアントID
* クライアントシークレットの
* コールバックURI

以下の節で、それぞれのIdP提供元（GCP/Azure/Yahoo）ごとの情報と登録方法について説明する。

なお、いずれのIdP側の操作画面は2021-11-27時点のものとする。

## GCPが提供するOIDC IdPを利用する方法

GCP（Google）が提供するOIDC認証を行うIdPの情報は、以下に記載されている。

* Google Identity Platform ＞OpenID Connect
  * https://developers.google.com/identity/protocols/oauth2/openid-connect

具体的には、上記にて示されている下記を参照する。

  * https://accounts.google.com/.well-known/openid-configuration

上記を参照して、本サンプルコードでは、passport-openidconnectの提供するStrategyインスタンスのConfigureへ、次ぎように設定する（ClientIDやclientSecret等は環境変数経由で設定するものとして、後述する）。

```
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
    }, function(){ /* 省略 */ } );
```

続いて、クライアントIDとクライアントシークレットの設定方法を説明する。

GCPにアクセスしてログインする。

https://cloud.google.com/



## Azureが提供するOIDC IdPを利用する方法

## Yahooが提供するOIDC IdPを利用する方法


# 参考サイト／参考書籍

* タイトル
    * URL
    


