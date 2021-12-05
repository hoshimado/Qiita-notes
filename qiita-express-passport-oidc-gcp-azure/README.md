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
※本サンプルは試行であり、それぞれのログインボタンを推された瞬間にPassportのStrategyをGoogle/Azure/Yahooへ切り替えて、それぞれのOIDC認証が終了するまでに他のアクセスが【来ないことを前提とする】実装、であることに注意。


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

なお、いずれのIdP側の操作画面は2021-11-27時点のものである。

## GCPが提供するOIDC IdPを利用する方法

GCP（Google）が提供するOIDC認証を行うIdPの情報は、以下に記載されている。

* Google Identity Platform ＞OpenID Connect
  * https://developers.google.com/identity/protocols/oauth2/openid-connect

具体的には、上記にて示されている下記を参照する。

  * https://accounts.google.com/.well-known/openid-configuration

上記を参照して、本サンプルコードでは、passport-openidconnectの提供するStrategyインスタンスのConfigureへ、次ように設定する（ClientIDやclientSecret等は環境変数経由で設定するものとして、後述する）。

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
    }, function(){ /* 省略 */ } );
```

続いて、クライアントIDとクライアントシークレットの設定方法を説明する。

GCPにアクセスして、Googleアカウントでログインする。

https://cloud.google.com/

右上の「コンソール」ボタンを押してGCPコンソールに移動する。

「ダッシュボード」が表示されるので、左ペインの「APIとサービス」を押下する。

「OAuth2.0認可によるAPIアクセス情報の管理ページ」に移動する。

これは「プロジェクト」単位での管理となるため、初回だと「新規プロジェクトの作成」画面が表示される。任意のプロジェクト名（「変更できない～」と書かれているのは、プロジェクトのObject IDのことで、プロジェクト名称、の事ではない）を入力して「作成」する。場所は、今回は試行なので「組織なし」のままでよい。

![新規プロジェクトの作成](./screenshots/gcp_01create_project.png)

「作成」を押すとダッシュボードのページへ移動して、作成完了となる。

![新規プロジェクトの作成完了](./screenshots/gcp_02dashboard_project.png)

なお、OIDCのIdP機能を利用するだけなので「APIとサービスの有効化」は不要。

続いて、「OAuth同意画面」へ移動する。
右上のドロップダウンアイコンか、もしくは左上のハンバーガーメニューから「APIとサービス＞OAuth同意画面」へ移動する。

![OAuth同意画面への移動byドロップダウンメニュー](./screenshots/gcp_03cofirm4oauth_pointer1.png)


![OAuth同意画面への移動byハンバーガーメニュー](./screenshots/gcp_04cofirm4oauth_pointer2.png)

「OAuth同意画面」の作成に必要な情報を入力する（もちろん後でからも編集可能）。
* User Type
  * 本試行では「Googleアカウントを持っている人」を対象とするので「外部」を選択
* アプリ情報
  * OIDCで利用者に対して「こういうアプリから、認証を求められています」と表示する情報
  * アプリ名とユーザーサポートメール、ディベロッパーの連絡先情報、が入力必須
  * 承認済みドメイン、は後から「認証情報」のところで設定するので、ここでは【入力不要】
* スコープ
  * 「APIとサービス」を利用せず、認証機能のみ利用なので、デフォルトのままで「保存して次へ」進む
* テストユーザー
  * 「スクープ」と同様に、今回は使用しないのデフォルトのままで「保存して次へ」進む  

![OAuth同意画面Typeは「外部」](./screenshots/gcp_05cofirm4oauth_1type_sample_outer.png)

![OAuth同意画面App情報1](./screenshots/gcp_06cofirm4oauth_1app_info1.png)

![OAuth同意画面App情報2](./screenshots/gcp_07cofirm4oauth_1app_info2.png)

![OAuth同意画面Scope](./screenshots/gcp_08cofirm4oauth_2scope.png)

![OAuth同意画面TestUser](./screenshots/gcp_09cofirm4oauth_3testuser.png)

最後に（今まで入力した内容の確認として）「概要」が表示されたら、一番下までスクロールして「プロジェクトに戻る」ボタンを押せば「OAuth同意画面」の作成は完了。

![OAuth同意画面の概要確認](./screenshots/gcp_10cofirm4oauth_overview_under_retrune_project.png)

続いて、「認証情報」からOIDCするRP向けの「クライアントID」と「クライアントシークレット」を作成する。
なお「認証情報」を作成するには、あらかじめ「OAuth同意画面」を作成して置く必要があり、未作成の場合は「OAuth同意画面を構成してください」と求められる（ので先ほど作成した）。

![認証情報の作成にはOAuth同意画面の事前作成が必要](./screenshots/gcp_11create_authinfo_with_cofirm4oauth.png)

左ペインの「認証情報」、そのメニューが無い場合は左上のハンバーガーメニューから「APIとサービス＞認証情報」をクリックして移動する。
作成するのは「OAuth 2.0 クライアント ID」で、上部の「認証情報を作成」をクリックしてドロップダウンするメニューから「OAuth 2.0 クライアント IDの作成」を選択する。

![認証情報の作成](./screenshots/gcp_12create_authinfo4oauth2.0clientid.png)

OAuthクライアントIDを割り当てるアプリケーションの種類を聞かれるので、本サンプルの場合は「ウェブ アプリケーション」を選択する。

![認証情報の作成](./screenshots/gcp_13create_authinfo_type.png)

すると、「承認済みのリダイレクトURI」を入力できるようになるので「＋URIを追加」を押して、OIDCでのIdPからのcallback先のURLを入力する。本サンプルでは、具体的には以下を入力する。複数指定できるので、クラウド上に公開するときは、そちらのcallback先URLも追加すること（※IdPへのリダイレクト時に「ｘｘにcallbackして」とURLクエリーで指定するわけだが、それを「信用してよいか？（承認してよいか？）」をここで設定している）。

```
http://localhost:3000/auth-gcp/callback
```

![リダイレクトするコールバック先URLを設定](./screenshots/gcp_15create_authinfo_callback_sample.png)

「名前」はRPクライアントを識別するためのものなので、任意に入力する。
入力を終えたら、一番下の「作成」ボタンを押すと、「クライアントID」と「クライアントシークレット」が払い出されるので、これをメモする。
「クライアントシークレット」はここでしか参照できないので【忘れずにメモ】すること。

![クライアントIDとクライアントシークレット作成完了](./screenshots/gcp_16create_authinfo_clientid_ready.png)

なお、「クライアントID」の参照と「承認済みのリダイレクトURI」の追加は後からも出来て、「APIとサービス＞認証情報＞OAuth2.0クライアントID」の欄から編集アイコンをクリックして操作が可能。

![作成済みのクライアントIDの参照とリダイレクトURIの編集](./screenshots/gcp_17create_authinfo_finish.png)

以上で、IdPへの「クライアントID」と「クライアントシークレット」、そして「コールバックURL」の登録（作成）が終わったので、これをPRに設定する。
本サンプルでは環境変数を経由して設定するので、例えば、以下のようにしてサンプルコードを起動すればよい。

```
SET GCP_CLIENT_ID=【作成したクライアントID】
SET GCP_CLIENT_SECRET=【作成したクライアントシークレット】

npm run dev
```


## Azureが提供するOIDC IdPを利用する方法

Azure（Microsoft）が提供するOIDC認証を行うIdPの情報は、以下に記載されている。

* Microsoft ID プラットフォームのドキュメント＞クイック スタート:Microsoft ID プラットフォームにアプリケーションを登録する
  * https://login.microsoftonline.com/consumers/v2.0/.well-known/openid-configuration

具体的には、上記に記載の手順に従ってAzureポータルにログインした先から辿れる下記を参照。

* https://login.microsoftonline.com/consumers/v2.0/.well-known/openid-configuration


※なお、上述の「クイックスタート」の先にある以下の「Node.js Webアプリのチュートリアル」では、Azure提供の認証ライブラリ「`Microsoft Authentication Library for Node (msal-node)`」を利用しているが、本記事では「他のOIDCのIdPと共通の実装から利用する」ことを目的とするので、こちらではなく、冒頭に記載した「`Passport-OpenID Connect`」を用いる。

* Node.js Webアプリケーションのチュートリアル
  * https://docs.microsoft.com/ja-jp/azure/active-directory/develop/tutorial-v2-nodejs-webapp-msal
* Microsoft Authentication Library for Node (msal-node)
  * `@azure/msal-node`
  * https://www.npmjs.com/package/@azure/msal-node
  * https://github.com/AzureAD/microsoft-authentication-library-for-js


上記のIdPの情報（ openid-configuration ）参照して、本サンプルコードでは、passport-openidconnectの提供するStrategyインスタンスのConfigureへ、次ように設定する（ClientIDやclientSecret等は環境変数経由で設定するものとして、後述する）。

```
var Instance4AzureOIDC = new OpenidConnectStrategy(
    {
      issuer: "https://login.microsoftonline.com/9188040d-6c67-4c5b-b112-36a304b66dad/v2.0",
      authorizationURL: "https://login.microsoftonline.com/consumers/oauth2/v2.0/authorize",
      tokenURL:         "https://login.microsoftonline.com/consumers/oauth2/v2.0/token",
      userInfoURL:  "https://graph.microsoft.com/oidc/userinfo",
      clientID:     oidcConfig.CLIENT_ID,
      clientSecret: oidcConfig.CLIENT_SECRET,
      callbackURL:  THIS_ROUTE_PATH + '/' + oidcConfig.REDIRECT_URI_DIRECTORY,
      scope: ["openid", "profile"]
    }, function(){ /* 省略 */ } );
```

続いて、クライアントIDとクライアントシークレットの設定方法を説明する。

Azureポータルにアクセスして、Microsoftアカウントでログインする。

https://portal.azure.com/

「ホーム」画面が表示されるので、「アプリの登録」を押下する。

![ホーム画面でアプリの登録を選択](./screenshots/azure_01home.png)

「アプリの登録」が表示されていない場合は、上部バーの検索ボックスに「登録」と入力すると候補として表示されるので、それを選択する。

![選択バーからアプリの登録を選択](./screenshots/azure_02search_regist.png)

「アプリの登録」画面で、OIDCログインを行うアプリケーション向けのクライアントキーとクライアントシークレットを作成する。そのためには「新規登録」ボタンを押下する。

なお、「2020年6月30日以降～」と表示されている注意喚起は、OIDC他を利用するクライアント側でAzureが提供する「Azreu Active Directory 認証ライブラリ（ADAL）」を利用している場合向けの内容なので、今回は関係ない（利用していない）。

![アプリケーションの新規登録](./screenshots/azure_03app_regist_dashboard.png)

「アプリケーションの登録」画面で必要な情報を入力し、下部にある「登録」ボタンを押す

* 名前
  * OIDCで利用者に対して「こういうアプリから、認証を求められています」と表示する際のアプリケーション名称。任意のアプリケーション名称を入力する（後で変更可能）。
* サポートされているアカウントの種類
  * 本試行では「（個人で）Microsoftアカウントを持っている人」を対象とするので「個人用Microsoftアカウントのみ」を選択
* リダイレクトURI（省略可能）
  * 後から「プラットフォームの追加」のところで設定するので、ここでは【入力不要】

![アプリケーション登録での入力](./screenshots/azure_04app_scope.png)

認証を行うアプリケーションの登録（作成）が完了すると、「概要」表示の画面に移動する。
なおこの画面は、後から参照する際は「アプリの登録」画面で「所有しているアプリケーション」の一覧から辿ることができる。

この「概要」画面に表示されている「アプリケーション（クライアント）ID」が、OIDCの「クライアントID」となる。
値の右側のアイコンをクリックするとクリップボードにコピーできるので、メモしておく（後でも、この画面で参照は可能）。

![登録済みアプリケーションの概要](./screenshots/azure_06app_created4auth.png)

「概要」画面の右ペインの「エンドポイント」をクリックすると、OIDCのIdPの情報が表示される。
なお、このページの「OpenID Connect メタデータ ドキュメント」に記載されているURLが、
先ほど「Azureポータルにログインした先から辿れる」と書いた部分のこと。

![AzureのOIDCのエンドポイント情報](./screenshots/azure_08app_oidc_endpoing.png)

続いて、クライアントシークレットを作成する。
左ペインの「管理＞証明書とシークレット」をクリックして、作成画面に移動し、「新しいクライアント シークレット」ボタンを押下する。

![証明書とシークレットを作成する](./screenshots/azure_09app_client_secret.png)

「クライアント　シークレットの追加」タブが開くので、以下の値を入力して「追加」ボタンを押下する。

* 説明
  * 区別用の説明として任意に入力する
* 有効期限
  * 任意の値を選択する

![クライアントシークレットを追加する](./screenshots/azure_10app_client_secret_add.png)

クライアントシークレットが作成される。
「値」の列に表示の値がOIDCの「クライアントシークレット」となるので、これをメモする。
「クライアントシークレット」はここでしか参照できないので【忘れずにメモ】すること。
（他の画面へ遷移後に、再び「証明書とシークレット」に戻ってきても「***」となっていて参照できない）

![クライアントシークレットの作成完了](./screenshots/azure_11app_client_secret_created.png)


最後に、OIDCのIdPから情報を受け取るcallback先URLを設定する（※IdPへのリダイレクト時に「ｘｘにcallbackして」とURLクエリーで指定するが、以下略）。
本サンプルでは、具体的には以下を入力する。複数指定できるので、クラウド上に公開するときは、そちらのcallback先URLも追加すること

```
http://localhost:3000/auth-azure/callback
```

左ペインから「管理＞認証」を選択し、「プラットフォーム構成」に移動する。

![プラットフォームの構成](./screenshots/azure_12app_auth_platform.png)

「プラットフォームを追加」を押下し、「Web」を選択する。

![プラットフォーム種別は「Web」](./screenshots/azure_13app_auth_type.png)

リダイレクトURI入力欄が表示されるので、先の値を入力し、下部の「構成」ボタンを押下する。

![リダイレクトURLの追加](./screenshots/azure_15app_auth_web_callback_sample.png)

リダイレクトURIの設定が完了すると、以下の表示される。
この設定内容は、後から同様に左ペインの「管理＞認証」から辿ることで参照や編集が可能。

![リダイレクトURLの設定完了](./screenshots/azure_17app_auth_web_callback_finished.png)

以上で、IdPへの「クライアントID」と「クライアントシークレット」、そして「コールバックURL」の登録（作成）が終わったので、これをPRに設定する。
本サンプルでは環境変数を経由して設定するので、例えば、以下のようにしてサンプルコードを起動すればよい。

```
SET AZURE_CLIENT_ID=【作成したクライアントID】
SET AZURE_CLIENT_SECRET=【作成したクライアントシークレット】

npm run dev
```



## Yahooが提供するOIDC IdPを利用する方法

Yahooが提供するOIDC認証を行うIdPの情報は、以下に記載されている。

* Yahoo! ID連携 v2
  * https://developer.yahoo.co.jp/yconnect/v2/

具体的には、上記のページ内にリンクのある『Authorization Codeフロー』の先で案内されている以下を参照する。

* https://auth.login.yahoo.co.jp/yconnect/v2/.well-known/openid-configuration

上記のIdPの情報（ openid-configuration ）参照して、本サンプルコードでは、passport-openidconnectの提供するStrategyインスタンスのConfigureへ、次ように設定する（ClientIDやclientSecret等は環境変数経由で設定するものとして、後述する）。

```
var Instance4YahooOIDC = new OpenidConnectStrategy(
    {
      issuer: "https://auth.login.yahoo.co.jp/yconnect/v2",
      authorizationURL: "https://auth.login.yahoo.co.jp/yconnect/v2/authorization",
      tokenURL:         "https://auth.login.yahoo.co.jp/yconnect/v2/token",
      userInfoURL:  "https://userinfo.yahooapis.jp/yconnect/v2/attribute",
      clientID:     oidcConfig.CLIENT_ID,
      clientSecret: oidcConfig.CLIENT_SECRET,
      callbackURL:  THIS_ROUTE_PATH + '/' + oidcConfig.REDIRECT_URI_DIRECTORY,
      scope: [] 
      // ↑は空白とする。Yahooの場合は、「"openid", "profile"」は
      // 「常に暗に指定されている扱い」の様子。
      // 他の（GoogleやAzure、OneLogin）のように明示的に指定すると
      // 「AuthorizationError: scope value is duplicate.」
      // でエラーする。
    }, function(){ /* 省略 */ } );
```

続いて、クライアントIDとクライアントシークレットの設定方法を説明する。

「Yahooデベロッパーネットワークトップ　＞　アプリケーションの管理」へアクセスしして、
Yahooアカウントでログインする。
なお、下記のURLは、上述のページ内の「ClientIDを登録しましょう」のリンク先が該当する。

https://e.developer.yahoo.co.jp/dashboard/

「アプリケーションの管理」画面が表示されるので「新しいアプリケーションを開発」ボタンを押下する。
（既に作成済みのものは「アプリケーション一覧」に表示され、そこから編集が可能）

![Yahooアプリ登録のホーム画面](./screenshots/yahoo_01app_home.png)

【ここから続き：以下は仮作成】

「ｘｘｘ」で画面で必要な情報を入力し、下部にある「ｘｘｘ」ボタンを押す

* アプリケーションの種類
  * 「サーバーサイド（Yahoo! ID連携 v2）」を選択
* 利用するスコープ
  * （変更不要であり、そもそも変更できない）
* サイトURL
  * とりあえず何か入れる。※リダイレクトURIでは無いので注意。
  * あくまでローカル試行の今回は「http://localhost:3000」とする。【動作検証未確認】
  
アプリケーションの登録が完了すると
「登録が完了し、Client IDおよびシークレットが発行されました」
と表示されるので、このクライアントIDとクライアントシークレットをメモする。

これらの発行済みの情報を後から参照するには、先の「アプリケーションの管理画面」から
「アプリケーション一覧」を辿ればよい。

続いて、OIDCのIdPから情報を受け取るcallback先URLを設定する（※IdPへのリダイレクト時に「ｘｘにcallbackして」とURLクエリーで指定するが、以下略）。
本サンプルでは、具体的には以下を入力する。複数指定できるので、クラウド上に公開するときは、そちらのcallback先URLも追加すること

```
http://localhost:3000/auth-yahoo/callback
```

「アプリケーションの管理画面」から
「アプリケーション一覧」を辿って、作成した「アプリケーション」を選択して
「編集」を押す。
「コールバックURL」が標準だと「サイトURL」になっているので、
これを適切に修正する。
今回であれば


以上で、IdPへの「クライアントID」と「クライアントシークレット」、そして「コールバックURL」の登録（作成）が終わったので、これをPRに設定する。
本サンプルでは環境変数を経由して設定するので、例えば、以下のようにしてサンプルコードを起動すればよい。

```
SET YAHOO_CLIENT_ID=【作成したクライアントID】
SET YAHOO_CLIENT_SECRET=【作成したクライアントシークレット】

npm run dev
```

なお、Yahooの場合は、UserInfoエンドポイントか返却される情報（profile）に「displayName」は定義されていない
（ように見える。個々人の設定かもしれないが）。
（nameフィールドはオブジェクトとして存在した。私の場合は空だったが）。
※GCPやAzureでは「displayName」が定義されている。


# 参考サイト／参考書籍

* Google Cloud Platformのプロジェクトの削除方法
    * https://qiita.com/sekitaka_1214/items/e11287b78adf3f468d7f
    


