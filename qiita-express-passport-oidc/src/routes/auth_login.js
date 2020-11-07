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
  REDIRECT_URI_DIRECTORY : 'callback' // �uTHIS_ROUTE_PATH + ���̒l�v���AOIDC�v���o�C�_�[�֓o�^�����u�R�[���o�b�N���URL�v�ɂȂ�̂Œ��ӁB
};
// https://console.developers.google.com/



// �p�X�|�[�g�̏��������B�Z�b�V�����̐ݒ�Ȃǂ�����B-------------------------------------------------
var session = require("express-session");
router.use(
  session({
    //�N�b�L�[�����񌟏ؗpID
    secret: process.env.COOKIE_PASSWORD,
    //���������̃Z�b�V������ۑ����邩
    saveUninitialized: false,
    //���ɂ�session�̎����Ƃ��Ahttps�Ȃ�secure���ݒ�ł���
  })
);
router.use(passport.initialize());
router.use(passport.session());

// �~�h���E�F�A�ł��� passport.authenticate() �����폈�������Ƃ��� done(errorObject, userObject)��
// �ʒm���ꂽ�����A�Z�b�V�����ɕۑ����āA�C�ӂ�callback���ŃZ�b�V����������o����悤�ɂ���B
// �u�����Z�b�V�����ɕۑ����ׂ����H�v��I��I�ɍs�����߂̃t�b�Ncallback�֐��B
// https://qastack.jp/programming/27637609/understanding-passport-serialize-deserialize
// 
passport.serializeUser(function (user, done) {
  console.log("serializeUser:" + user.profile.id);
  done(null, user);
});
// ��L�Ƒ΂ƂȂ�A���o�������B
passport.deserializeUser(function (obj, done) {
  done(null, obj);
});





// OIDC�̔F�葱�����s�����߂̃~�h���E�F�A�Ƃ��Ă�passport���Z�b�g�A�b�v�B-------------------------------------------------
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
      // �F�ؐ��������炱�̊֐������s�����
      // ������ID token�̌��؂��s��
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




// ���O�C���v�����󂯂āAOIDC�̔F�v���o�C�_�[�փ��_�C���N�g�B-------------------------------------------------
router.get('/login', passport.authenticate("openidconnect"));



// OIDC�̔F�v���o�C�_�[����̃��_�C���N�g���󂯂�B---------------------------------------------------------
// �����̎��Apassport.authenticate() �́A�n����Ă���N�G���[�ɂ���ē����ύX����d�l�B
router.get(
  '/' + oidcConfig.REDIRECT_URI_DIRECTORY,
  passport.authenticate("openidconnect", {
    failureRedirect: "loginfail",
  }),
  function (req, res) {
    // Successful authentication, redirect home.
    console.log("�F�R�[�h:" + req.query.code);
    req.session.user = req.session.passport.user.displayName;
    console.log(req.session);
    res.redirect("loginsuccess");
  }
);





// THIS_ROUTE_PATH (='/auth/') �z���̃t�@�C���ւ̃A�N�Z�X�v���́A��L�ilogin/callback�j�ȊO�̏������L�ڂ���B---------------

// ���O�C���Ɏ��s�����Ƃ��ɕ\�������y�[�W
router.get('loginfail', function (req, res, next) {
  var htmlStr = '<html lang="ja">';
  htmlStr += '<head>';
  htmlStr += '<meta charset="UTF-8">';
  htmlStr += '<title>login success.</title>';
  htmlStr += '</head>'
  htmlStr += '<body>';
  htmlStr += '���O�C���Ɏ��s���܂����B';
  htmlStr += '</body>';
  htmlStr += '</html>';

  res.header({"Content-Type" : "text/html; charset=utf-8"})
  res.status(200).send(htmlStr);
  res.end();
});


// ���O�C���ɐ��������Ƃ��ɕ\�������y�[�W
router.get('/loginsuccess', function(req, res, next) {
  console.log("----"+THIS_ROUTE_PATH+"login----");
  console.log(req.session.passport);
  var htmlStr = '<html lang="ja">';
  htmlStr += '<head>';
  htmlStr += '<meta charset="UTF-8">';
  htmlStr += '<title>login success.</title>';
  htmlStr += '</head>'
  htmlStr += '<body>';
  htmlStr += '���O�C���ɐ������܂����Bas ' + req.session.passport.user.profile.displayName;
  htmlStr += '</body>';
  htmlStr += '</html>';

  res.header({"Content-Type" : "text/html; charset=utf-8"})
  res.status(200).send(htmlStr);
  res.end();
});

/*
{ user:
   { profile:
      { id: 'ID�g�[�N���Ɋ܂܂��ID�Ɠ���',
        displayName: 'ID�g�[�N���ɕR�Â��Ă��郆�[�U�[��',
        name: [Object],
        _raw: [Object],
     accessToken:
      { OIDC�̃g�[�N���G���h�|�C���g���略���o���ꂽ�AOAuth2.0�̃A�N�Z�X�g�[�N�� },
     idToken:
      { ID�g�[�N���iJWT�j }
      }
   }
}
*/


// ��L�ȊO�̃A�N�Z�X�ɑ΂��鉞��
// �uget()�v�ł͂Ȃ��uuse()�v�ł��邱�Ƃɒ��ӁB
// ref. https://stackoverflow.com/questions/15601703/difference-between-app-use-and-app-get-in-express-js
router.use('/', function(req, res, next) {
  console.log('�C�ӂ�'+THIS_ROUTE_PATH+'�z���ւ̃A�N�Z�X');
  if(req.session && req.session.passport && req.session.passport.user && req.session.passport.user.profile){
    console.log('OIDC�Ń��O�C�������Z�b�V�������擾�ł���')
    console.log(path.join(__dirname, '../auth'));
    next();
  }else{
    console.log('���O�C�����ĂȂ����Z�b�V�������Ȃ�')
    next(createError(401, 'Please login to view this page.'));
  }
}, express.static(path.join(__dirname, '../auth')) );




// catch 404 and forward to error handler +++add
router.use(function (req, res, next) {
  next(createError(404));
});







