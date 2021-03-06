module.exports = function(passport) {
  var route = require('express').Router();
  route.post(
    '/login',
    passport.authenticate( //authenticate 미들웨어
      'local',  // local방식 로그인
      {
        successRedirect: '/welcome',
        failureRedirect: '/auth/login',
        failureFlash: false  //사용자가 로그인에 실패한 이유를 알 수있는
      }
    )
  );
  route.get(
    '/facebook',
    passport.authenticate(
      'facebook',
      {scope:'email'}
    )
  );
  route.get(
    '/facebook/callback',
    passport.authenticate(
      'facebook',
      {
        successRedirect: '/welcome',
        failureRedirect: '/auth/login'
      }
    )
  );

  route.post('/register', function(req, res) {
     hasher({password:req.body.password}, function(err, pass, salt, hash) {
      var user = {
        authId     : 'local:'+req.body.username,
        username   : req.body.username,
        password   : hash,
        salt       : salt,
        displayName: req.body.displayName
      };
      var sql="INSERT INTO users SET ?"
      conn.query(sql, user, function(err, results) {
        if(err) {
          console.log(err);
          res.status(500);
        } else {
          req.login(user, function(err) {
            req.session.save(function() {
              res.redirect('/welcome');
            });
          });
        }
      })
    });
  });
route.get('/register', function(req, res) {
  res.render('auth/register')
});
route.get('/login', function(req, res) {
  res.render('auth/login');
})
route.get('/logout', function(req, res) {
  req.logout() // logout 메소드 존재
  req.session.save(function() {
  res.redirect('/welcome');
  });
});
  return route
}
