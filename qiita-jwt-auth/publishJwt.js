var manageJwt = require('./src/utils/manageJwtApiKey.js');

manageJwt.publishApiKeyAsJwt({
    sub: 'idIsHere',
    aud: `clientName`
}).then((token)=>{
    console.log(token);
});





