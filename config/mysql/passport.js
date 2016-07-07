module.exports = function(app) {
  var conn = require('./db')();
  var pbkfd2Password = require("pbkdf2-password");
  var passport = require('passport');
  var LocalStrategy = require('passport-local').Strategy;
  var FacebookStrategy = require('passport-facebook').Strategy;
  var GoogleStrategy = require('passport-google-oauth').OAuthStrategy;
  var KakaoStrategy = require('passport-kakao').Strategy;
  var hasher = pbkfd2Password();

  app.use(passport.initialize()); //passport를 초기화하고 사용
  app.use(passport.session()); // passport의 세션을 이용하겠다.

  passport.serializeUser(function(user, done) {
    console.log('serializeUser', user);
     done(null, user.authId); // done 함수로 인해 세션이 등록됨.
  });

  passport.deserializeUser(function(id, done) { // id : user.authId
    console.log('deserializeUser', id);
    var sql = 'SELECT * FROM users WHERE authId=?';
    conn.query(sql, [id], function(err, results) {
      if(err) {
        console.log(err);
        done('There is no user');
      } else {
        done(null, results[0]) // results[0] <<
      }
    });
  });

  passport.use(new LocalStrategy( //스트렛티지
    function(username, password, done) {
      var uname = username;
      var pwd = password;
      var sql = "SELECT * FROM users WHERE authId = ?";
      conn.query(sql, ['local:'+uname], function(err, results) {
        if(err){
          console.log(err);
          res.status(500);
        }
        var user = results[0];
        return hasher({password:pwd, salt:user.salt}, function(err, pass, salt, hash) {
          if(hash === user.password) {
            console.log('LocalStrategy', user);
            done(null, user); // 성공
          } else {
            done(null, false); // 실패
          }
        });
      });
    }
  ));
  passport.use(new FacebookStrategy({
      clientID: '184229931975831',
      clientSecret: 'a7bd585609e6f42f289a45ad9e8671da',
      callbackURL: "/auth/facebook/callback",
      profileFields:['id', 'email', 'gender', 'link', 'locale',
      'name', 'timezone', 'updated_time', 'verified', 'displayName']
    },
    function(accessToken, refreshToken, profile, done) {
      console.log(profile);
      var authId = 'facebook:'+profile.id;
      var sql = "SELECT * FROM users WHERE authId = ?"
      conn.query(sql, [authId], function(err, results) {
        if(results.length > 0) {
          done(null, results[0]);
        } else {
          var newuser ={
            'authId':authId, // 페북 고유 아이디
            'displayName':profile.displayName, // 페북 프로파일에서 가져온 이름
            'email':profile.emails[0].value
          }
          var sql ="INSERT INTO users SET ?"
          conn.query(sql, newuser, function(err, results) {
            if(err) {
              console.log(err);
              res.status(500);
            } else {
               done(null, results[0]);
            }
          });
        }
      });
    }
  ));
  return passport
}
