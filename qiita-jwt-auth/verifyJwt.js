var manageJwt = require('./src/utils/manageJwtApiKey.js');

manageJwt.verifyApiKeyAsJwt(
    process.argv[2],
    `clientName`
).then((token)=>{
    console.log(token);
}).catch((err)=>{
    console.log(err);
});

