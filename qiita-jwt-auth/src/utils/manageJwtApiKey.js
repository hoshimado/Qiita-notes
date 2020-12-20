/**
 * [manageJwtApiKey.js]
 */
var jwt = require('jsonwebtoken');

var envFactory = {
    publicBase64     : process.env.JWT_PUBLIC_KEY,
    secretBase64     : process.env.JWT_PRIVATE_KEY,
    passphraseSecret : process.env.JWT_PASSPHRASE,
    issuerUri        : process.env.JWT_ISSUER,
    expireMin        : process.env.JWT_EXPIRE_MINS
};
exports.AUDIENCE = {
    demo:    'demo.rsa.jwt'
};
// https://kamichidu.github.io/post/2017/01/24-about-json-web-token/





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
exports.publishApiKeyAsJwt = publishApiKeyAsJwt;


var verifyApiKeyAsJwt = function (accessTokenAwJwt, audience) {
    var env = envFactory;
    var publicKey = Buffer.from(env.publicBase64, 'base64');
    var token = accessTokenAwJwt;
    var options = {algorithms: ['RS256']};

    var promise;
    if(token && publicKey){
        if(audience){
            options['audience'] = audience;
        }
        promise = new Promise((resolve,reject)=>{
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
        promise = promise.then((decoded /* as Json */)=>{
            // 追加処理の可能性を考慮して、このようにしている。
            return Promise.resolve(decoded);
        }).catch((err)=>{
            // 追加処理の可能性を考慮して、このようにしている。
            // https://github.com/auth0/node-jsonwebtoken#errors--codes
            // ToDo: 期限切れ、を分けて検出可能だが、ここではまとめて「エラー」とする。
            return Promise.reject(err);
        });
    }else{
        promise = Promise.reject();
    }
    return promise;
};
exports.verifyApiKeyAsJwt = verifyApiKeyAsJwt;


