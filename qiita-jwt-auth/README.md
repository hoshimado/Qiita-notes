Subject: JWTを用いた認証方法（JWT発行と検証方法）

# 概要

Webアプリにおいて、クライアント側のSPAからのAPIの認証にJWTを利用する場合を考える。
サーバー側でのJWT発行と、APIに含められてきたJWTを検証する流れを説明する。

言語はNode.jsとする。

クライアント側でJWTの有効性を検証することを想定し、
つまりクライアント側で復号用の公開鍵を保持することを想定し、
JWTはRSAで署名するものとする。

（クライアント側での検証をしない場合は共通鍵で署名してもよいが、割愛する）

JWT発行の際に必要となる秘密鍵の準備方法が本記事の説明のメインとなる。
なぜなら、JWTの発行と検証は、OSSライブラリ「jsonwebtoken」を用いて簡単にできるから。

なお、Windows10上で実施するものとする。一部WSLを利用する。

公開鍵暗号のアルゴリズムにはRSAを用いる（他にElGamal等がある）。
RSAの鍵長は4096かそれ以上が一般に推奨されるが、
ここでの用途は暗号化ではなく署名であり、また期限付き認証キーである点を踏まえ、
デフォルトの2048を用いる（あまり長い文字列になると、AWSのElasticBeastallkの環境変数に入らないし）。

本記事で用いるサンプルコードは、以下へ全体が格納してある。

https://github.com/hoshimado/qiita-notes/tree/main/qiita-jwt-auth



# JWTの発行（署名）に必要な秘密鍵を準備する

最初に、生成に使うツールについて説明し、続いて具体的な手順を説明する。

## windows10上でのRSA鍵ペアの作成に用いるツールなど

Node.jsのライブラリ「jsonwebtoken」において署名に秘密鍵（とペアとなる公開鍵）を用いる場合は、
「PEMフォーマットを用いること」
と記載されているので、これを準備する。

> secretOrPrivateKey is a string, buffer, or object containing either 
> the secret for HMAC algorithms or the PEM encoded private key for RSA and ECDSA. 

ref. https://github.com/auth0/node-jsonwebtoken


秘密鍵の生成にはssh-keygen コマンドを利用する。
これは、SSHログイン向けPRM形式のRSA鍵ペアを生成するコマンド。
ちょうどよいので流用する。

Windows10マシンの場合は、WSLを利用する。
WSLにはOpenSSHコマンドが入っている（バージョンはWSL環境に依存）。
```
$ ssh -H
OpenSSH_7.2p2 Ubuntu-4ubuntu2.4, OpenSSL 1.0.2g  1 Mar 2016
```

なお、ssh-keygenは、OpenSSHに内包されるツールであり、
OpenSSHの7.8以上では、デフォルトフォーマットが（OpenSS**L**の）PEM形式ではなく、
OpenSSH形式に変更されている。
その場合は、`-m PEM` を指定する必要がある。

ref. https://dev.classmethod.jp/articles/openssh78_potentially_incompatible_changes/

バージョンの確認は `ssh -v` で行える。


ssh-keygenコマンドで作成した鍵ペアのうち、
秘密鍵の「`id_rsa`」はPEM形式なのでそのまま利用できるが、
公開鍵の「`id_rsa.pub`」はOpenSSHの独自形式のファイルとなる。
この独自形式は「`ssh-keygen -f id_rsa.pub -e -m pem`」とすることでPEM形式に変換可能。

なお、鍵のフォーマットにはDER形式とPEM形式があり、これらは相互に変換は可能。

ref. https://qiita.com/kunichiko/items/12cbccaadcbf41c72735


JWT生成時には、これらの作成済みの秘密鍵と公開鍵を読み込む必要があるが、
ファイルのままだとGit管理との整合が面倒なので、環境変数から文字列として読み込むのが望ましい。
この場合、ファイルをBase64変換した「1行のテキスト」として扱うことで、実現できる。

> As mentioned in this comment, there are other libraries that 
> expect base64 encoded secrets (random bytes encoded using base64), 
> if that is your case you can pass Buffer.from(secret, 'base64'), 
> by doing this the secret will be decoded using base64 
> and the token verification will use the original random bytes.

ref. https://github.com/auth0/node-jsonwebtoken#jwtverifytoken-secretorpublickey-options-callback

Windows10の場合は、WSL環境にあるBase64コマンドを利用して変換可能（具体的な方法は後述）。


## WSLを用いたRSA秘密鍵と公開鍵の鍵ペアの作成手順

### ssh-keygenで鍵ペアを生成

秘密鍵を格納するフォルダとして「`.ssh`」を作成しておく。

※Gitの`.gitignore`ファイルに、忘れずに「`.ssh/`」を追加して管理対象外としておくこと。

WSLに入り、フォルダ「`.ssh`」配下へ移動する。

秘密鍵作成コマンド「`ssh-keygen -t rsa -b 2048`」を入力してEnterキーを押し、次のように入力する。
パスフレーズは（これはSSHでのログイン向けのコマンドのため署名目的なら）省略も可能だが、
ここでは「`qiitajwt`」と入力する。
なお、`passphrase`のところは、実際には入力文字は画面に表示されない。

```sh
$ ssh-keygen -t rsa -b 2048
Generating public/private rsa key pair.
Enter file in which to save the key (/home/hoshimado/.ssh/id_rsa): ./id_rsa
Enter passphrase (empty for no passphrase): qiitajwt
Enter same passphrase again: qiitajwt
Your identification has been saved in ./id_rsa.
Your public key has been saved in ./id_rsa.pub.
The key fingerprint is:
SHA256:uqs6k7iUOu0GE0flMYqpy4REVPdG6RcSYL84IthYc44 hoshimado@DESKTOP-598V4QK
The key's randomart image is:
+---[RSA 2048]----+
|.o.o++.oo        |
|.o.ooo+o .       |
|oo+ o .+. .      |
|*+.=  o...       |
|==E..o .S        |
|=.o . ..         |
|.O .  .          |
|= *    .         |
|o=o+..o.         |
+----[SHA256]-----+
```

`id_rsa`と`id_rsa.pub`という2つのファイルが生成されば成功。
共にテキストファイルなので、中身をテキストエディタで開いて参照することは可能。
なお、内容はBase64エンコードされている。

ref. http://rnakato.hatenablog.jp/entry/2019/05/18/134336

### 生成した公開鍵（OpenSSH独自形式）をPEM形式へ変換

id_rsa.pubはOpenSSHの独自形式なので、次のようにしてPEM形式に変換しておく。

```
$ ssh-keygen -f id_rsa.pub -e -m pem > id_rsa.pub.pem
```

### 生成した鍵ペアをBase64変換して文字列へ変換

次のコマンドで秘密鍵のファイルをBase64変換する。出力ファイルはMIMEの基準に従って76文字ごとに改行コードが入るため、続いて以下のコマンドで改行を削除しておく。

```
$ base64 id_rsa > id_rsa.base64.txt
$ cat id_rsa.base64.txt | tr -d '\n' > id_rsa.base64.oneline.txt
```

公開鍵のファイルも同様。

```
$ base64 id_rsa.pub.pem > id_rsa.pub.pem.base64.txt
$ cat id_rsa.pub.pem.base64.txt | tr -d '\n' > id_rsa.pub.pem.base64.oneline.txt
```

これで、秘密鍵、公開鍵ともに1行の文字列として準備ができた。

```
id_rsa.base64.oneline.txt
id_rsa.pub.pem.base64.oneline.txt
```


# 実際にJWTを生成してみる

JWTを生成するには、OSSモジュール「`jsonwebtoken`」をもちいて、例えば次のようにできる。

```
var jwt = require('jsonwebtoken');

var envFactory = {
    publicBase64     : process.env.JWT_PUBLIC_KEY,
    secretBase64     : process.env.JWT_PRIVATE_KEY,
    passphraseSecret : process.env.JWT_PASSPHRASE,
    issuerUri        : process.env.JWT_ISSUER,
    expireMin        : process.env.JWT_EXPIRE_MINS
};

/**
 * Jwt形式でアクセストークンを発行する。
 * 
 * @param {*} params - JWTのsub（ユーザー識別子）とaud（クライアント識別子）を持つこと
 */
var publishApiKeyAsJwt = function (params) {
    var env = envFactory;
    var claim = {
        iss : env.issuerUri,
        aud : params.aud,
        sub : params.sub,
        iat : Math.floor(Date.now() / 1000),
        exp : Math.floor(Date.now() / 1000) + (60 * env.expireMin)
    };
    var token = jwt.sign(
        claim, 
        { 
            key: Buffer.from(env.secretBase64, 'base64'),
            passphrase: env.passphraseSecret},
        {
            algorithm : 'RS256'
        }
    );
    return Promise.resolve(token);
};


publishApiKeyAsJwt({
    sub: 'idIsHere',
    aud: `clientName`
}).then((token)=>{
    console.log(token);
});
```

これを実行するには、環境変数に先ほど作成した秘密鍵を設定して次のようにする。

```
set JWT_PRIVATE_KEY=LS0tLS1CRUdJTiBSU0EgUFJJVkFURSBLRVktLS0tLQpQcm9jLVR5cGU6IDQsRU5DUllQVEVECkRFSy1JbmZvOiBBRVMtMTI4LUNCQywxNzRFM0I3NUNCOTQ0RTRBRjVGRUMxRUIxQ0RDRTdDMwoKUFkyakpYeVJTRTZrRHhiQzRjelhPZHZVbVh4OG8rTDcyZENBSzdSVkZvQ3J5Q25sSUNwVVM2aUZScHBsQXdRYgpEN1BMN2pXR3VhZDYvb3Z4VkhjSk8wYUUrTlNKSFRxRllhcDUraGxqUnZadjJOTWVrVjBTTGt1UTRDYlRNNWVnCmRDN0hGSUFaUmpWeDZsVTArVURiamxXVS9mRzdyTk5LNVkvaDM3SVEzelBHV1RXeVV1MTdCMExxanRQZ0w3OWQKakRpOHQwOHJoNEp1M1pKT2kzZWVmaTFYQ1gyalNwVWZ0MkxXNDdnT0FPR2ttOWFhaUlWZDNYWkV5VllVa3hEbwoxMTRUUUxTeTk2b3ZxeTVPQ1N4OGFkRHBpN0t6ZzlHaCtiTmg1MGNKSnRaSnZCcWZDTzRyVjd3Vk81d3NNdkpSCkVXUWErZVl5V05EUjhWemZieUtuMWxSeXA5VUt6M083Y3Rva1FTS0xkckxOT0krWEk4bzdacW83a2xHZmM2ZkoKaTgzdjVhOUtjM1p2OWUwWDN2RnVoaEJjeDNCaVRnRU9zeXBDQXlNZndYVzNCRFVjdGptcGhiRVJQMVRnYjIvaQpnSDc2UnM1bEEzLzdRMmI1di96TEV1T0xXQ2Q0d0owVlZpdW5QS3JCQ0pONWsvZytMK3BXRHFONnR5b0x6VHlOCnEwd0d6eXI4TUNJUWhoYWZuM0hMMHlUaURnMlFZZ1RSRHQxbFhjOVk0aVBLU3FrUWFSaHJZcmZuNllJWUpLTTEKVGpkVTdKdE8wSHFXYWtaZXk0NUpLeUZvbHNaditiVVZtRktVU0k5OTlTdVBpVGlnM2R0NVMvcG01NHJQdkcvQgoyRlJuSW1lRmo2bnBJMG1Ya280V2tvUWZJaGVKM0hLMUtDNmhrRWFHdzc5S1dFMU1iV2lSOWVpODVyYnQ5L1JjCm9MN2VDS0hHeGtHNm51SG42SXF2bkNJT3JqS1FJbjZGdjdEWEl4RDRWTjZPYlhHb3NNUnVyemtlWlNqc1R2ZmIKZGEvYmZRRCtLbk5sUnZrSmNlZDJFc3JLYWxWREQrazlhV0dTWncrQlI0S0trRGliUkpRcTZmTllRSHh6RjYzcgp5TnhTOTY1ZkdjNXQ0c0VZd3A3UXp1MmNEVnBjOHA5YmVCQnAxU2pDdWVoWENsV3dFTEZMNndFb0w2K0h6d3M2CisrTCtoUVYrOXJsWjljekt3NnlHNEF4V3VjV3lTVCtjMHBFbHU0MUV2bGUxQUg1KzZCRll2RWRxbUJkSVJPWUYKQ2k4RnE0YkVVNGhCakxyUVR4NzUvRlkzVFZnU2NZL1BJNHFhaWs5eE1YOVBTRnIvZXR6NVZEZDhMdmEvRHB1OQprUDdPd3R0bXZJRlFsVDdHekxHUVE5UWxXWi9UdDdtWm9iVDQrSUx1b29SWmVpYUZYYTBXL0V5RlY2cVNSZmFvCmxQSk52c3FiSTFaYWJHQ1ZaSEFCa0RVZzFzRjRvUnVmcUNYSXlWU25DMGxjT2w2R250UHo0aXVvRENZLzd4K2MKV3U2cFRXdEJHOUJ6M3lza1BMVXNNaTcvQUE3UktKeCtYYlEwMExxd0FzSzFuaUh1cUtFTTFRR284VldZQTVDQgpvejd5V1ErMUFxVWR4alp6SmtRcURCUW4zYUVuczFRUldGVUx6SkVxellpOEk2QVgydjZtM284S2JDOFl0cW00Cnhja2tGWmZtZ0pWK0dzMUN1alJ0eVgrWEl3OXg4UHhOWWdDUzFWZ0M4eTFnMjdrTVVHcVNLQXIvSTQ2THYzNXQKcHhvY1NQRFAxTk5Kd3hMYWpjU1c0TXJVZlpRclJZVU5Ib0NmcU04dHk4bE5zOTh2d0diU2tvbWd0bmlTTTNzLwpZdW4zcExWS2RKZlRQNG1FRCtaUzdwOE9icU1LRFNpRGN5bmhpNlpGZlFIeWVNWmlFN0l6a2VqUDNxbDNuRTBGCmZ1ZDNYaUJGYmFIVVNJSVk5YUFhS2UwZi9SR1ZjQVlHQ3BsbFAvU1ZKMDlITkd2Zk8yOXlpWGhSRlFjVzBuL2wKcmx2Qm16QlVLVkFGOC9hdzlxVGxVdnBZa2h3NFVjcEEyaitxRUVKa01EdTkrUy9RR1Uyb0RDM0R5SkNOWElLVgotLS0tLUVORCBSU0EgUFJJVkFURSBLRVktLS0tLQo=
set JWT_PASSPHRASE=qiitajwt

set JWT_ISSUER=sample.qiitajwt
set JWT_EXPIRE_MINS=1

node publishJwt.js
```

これを検証するには、同じようにOSSモジュール「`jsonwebtoken`」をもちいて、例えば次のようにできる。

```
var verifyApiKeyAsJwt = function (accessTokenAwJwt, audience) {
    var env = envFactory.getInstance();
    var publicKey = Buffer.from(env.publicBase64, 'base64');
    var token = accessTokenAwJwt;
    var options = {algorithms: ['RS256']};

    var promise;
    if(token && publicKey){
        if(audience){
            options['audience'] = audience;
        }
        return promise = new Promise((resolve,reject)=>{
            // https://github.com/auth0/node-jsonwebtoken#jwtverifytoken-secretorpublickey-options-callback
            jwt.verify(
                token, 
                publicKey, 
                options, 
                (err, decoded)=>{
                    if(err){
                        reject(err);
                    }else{
                        resolve(decoded)
                    }
                }
            );
        });
    }else{
        promise = Promise.reject();
    }
    return promise;
};

verifyApiKeyAsJwt(
    process.argv[2],
    `clientName`
).then((token)=>{
    console.log(token);
}).catch((err)=>{
    console.log(err);
});
```

これを実行するには、環境変数に先ほど作成した公開鍵を設定して次のようにする。

```
set JWT_PUBLIC_KEY=LS0tLS1CRUdJTiBSU0EgUFVCTElDIEtFWS0tLS0tCk1JSUJDZ0tDQVFFQXVLM1pwSUNDc0VnSVlPczJhbHdJN08zeFhWUnJ2MXRZODlqNEczbWZYNkxPMk9iYm9RTFoKK0EwUlY5V3pJTTdSUDcvcWxOUnpjYmN0YW9jKzF5aGhSbGZJZjFhY0NpdzgrdUdEbEE0S0VWM0hQa1dKL0IxYwpiNmI3cGJDNzVHT0YvVEtXc0RRZlViTURFWEFkNmFReURTbHlHZGdJTExiUkVvaW1XQlhZNzZDUnNlZVFZd1oyCnRKUlpHMEhnTmJzMll3MDBjN0J3Q3YvVUozTGZWaHN5TS9qQ2pxQ2x2WkRHT081a09HTko0WmVDdVphMGRYaDYKWXZWSkd3cjdDME1Tb29mNmhBZEtMZVEwTEViY0pDR1FVMmZpZFRIQVdYYUpjSjI4eEhMTUQ0S1UzOHdTMllWYgpDcDFRQUVPODRhOUJsMkh0cEY3TzRYaW5rSU5idzMwaFZRSURBUUFCCi0tLS0tRU5EIFJTQSBQVUJMSUMgS0VZLS0tLS0K

node verifyJwt.js   eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzYW1wbGUucWlpdGFqd3QiLCJhdWQiOiJjbGllbnROYW1lIiwic3ViIjoiaWRJc0hlcmUiLCJpYXQiOjE2MDg0NzAwMzYsImV4cCI6MTYwODQ3MDA5Nn0.htfTjPxWtrJdfG84cyeWtPDJxMjOcq-yxYycOVQV6UMSDqwzSPAMWhI1Wg_5YoahRDaahyTUF7oJsxrPvDw8dJCVlLwwbAdfMw1xYM8wf9OOyA7PDkpHc234corPxoOlH05GvIopw2MgEVXKSHdgf7G16xrrvtWpYoROMicanIfa9pi41BkuiaATFPtlcnFBUX1Yq3EA_cQZhHCTJW7HGzRgzebEtO9Djc41vBpNAfJE07QeuLr6kpMImrlb6PTguZxLrYnlxYZb7VRd4uaUf3VudUzCHp_ymzIrb5HmSqFu8JlYwnAEZf98FwSxDRI7YIza2yGswc_S-71rdt1WYQ
```

なお、上記の実行結果は、「`TokenExpiredError: jwt expired`」となる。
当方がこの記事を書く際に生成したJWTの検証であり、有効期限は1分なので、この記事を書いているうちに切れている。
なので、検証に成功するためには、「`node publishJwt.js`」で生成したJWTを、1分以内に「`node verifyJwt.js   [生成したJWT(文字列)]`」として実行する必要がある。

検証に成功すると、例えば次のように結果が表示される。

```
{
  iss: 'sample.qiitajwt',
  aud: 'clientName',
  sub: 'idIsHere',
  iat: 1608470825,
  exp: 1608470885
}
```

なお、上記に記載した秘密鍵と公開鍵のペアは、本記事ように作成したものなので、これを流用しても何か悪さができるわけでは無いのであしからず（WSL環境が使えない、等の理由で鍵ペア生成ができない環境で試したい場合は、本鍵ペアを流用してもらっても構わない）。

また、本記事では簡単のためにWSL環境のssh-keygenコマンドを利用したが、SSH for Windows等と一緒に提供されるssh-keygenコマンドを使っても、もちろん構わない。

# エラーについて

jsonwebtokenが「`PEM_do_header:bad password read`」のような
エラーを吐く場合がある。
これは、公開鍵（か秘密鍵）のフォーマット不適切、もしくは、
パスフレーズを設定した鍵なのに、パスフレーズのインプットが無い、
場合に起きるので、PEM形式になっているか？パスフレーズを設定したか？を確認のこと。

# 記事中に記載以外の参考URL

* JSON Web Tokenを完全に理解する
    * https://qiita.com/k_k_hogetaro/items/0c97f42ecb8207767db2




