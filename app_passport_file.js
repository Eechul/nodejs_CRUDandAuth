var express = require('express');
var session = require('express-session');
var FileStore = require('session-file-store')(session);
var bodyParser = require('body-parser')
var sha256 = require('sha256');
var pbkfd2Password = require("pbkdf2-password");
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuthStrategy;
var KakaoStrategy = require('passport-kakao').Strategy;
var hasher = pbkfd2Password();
var assert = require("assert");
var app = express();
app.use(bodyParser.urlencoded({ extended: false}))
app.use(session({
  secret: '123215415@@DSAGnklndklsa',
  resave: false,
  saveUninitialized: true,
  store: new FileStore() // 세션이라는 디렉토리를 만든다
}));
app.use(passport.initialize()); //passport를 초기화하고 사용
app.use(passport.session()); // passport의 세션을 이용하겠다.
// 주의점은 세션 바로 밑에 써줘야한다는것 -> 세션을 사용해줘야 됌.

var user = [
  {
    authId:'local:ddong',
    //추가한 이유는 다음과 같다.
    // 페이스북 타사인증을 할때 페이스북 측에서 고유한 긴~ id값을 준다
    // 이 id값은 facebook:(id)형식이며(FacebookStrategy에서 추가함),
    // authId 변수에 들어간다.
    // 기존 username에 추가할 수도 있는 다른방법도있지만 여기선
    // 따로 만들어주는 방법을 택한다.
    username: 'admin',
    password: 'root',
    salt: 'N',
    displayName: 'admin'
  }
];
// app.get('/count', function(req, res) {
//   if(req.session.count) {
//     req.session.count++;
//   } else {
//     req.session.count = 1;
//   }
//   res.send('count : '+req.session.count);
// })
app.get('/auth/logout', function(req, res) {
  req.logout() // logout 메소드 존재
  req.session.save(function() {
    res.redirect('/welcome');
  });
})
app.get('/welcome', function(req, res) {
  if(req.user && req.user.displayName) {// 세션에 있다면 로그인 성공
    res.send(`
      <h1>Hello, ${req.user.displayName}</h1>
      <a href="/auth/logout">logout</a>
    `)
  } else {
    res.send(`
      <h1>welcome</h1>
      <ul>
        <li><a href="/auth/login">Login</a></li>
        <li><a href="/auth/register">register</a></li>
      </ul>
    `)
  }
})

// 각 사용자가 가지게 되는 salt값 -> 같은 비밀번호라도 다르게 암호화.

app.post('/auth/register', function(req, res) {
   hasher({password:req.body.password}, function(err, pass, salt, hash) {
    var tmpUser = {
      authId     : 'local:'+req.body.username,
      username   : req.body.username,
      password   : hash,
      salt       : salt,
      displayName: req.body.displayName
    };
    user.push(tmpUser);
    req.login(user, function(err) {
      req.session.save(function() {
        res.redirect('/welcome');
      });
    });
  });
});
app.get('/auth/register', function(req, res) {
    res.send(`
      <h1>Hello, register</h1>
      <form action="/auth/register" method="post"
        <p>
          <input type="text" name ="username" placeholder="username">
        </p>
        <p>
          <input type="text" name ="password" placeholder="password">
        </p>
        <p>
          <input type="text" name ="displayName" placeholder="displayName">
        </p>
        <p>
          <input type="submit" >
        </p>
      </form>
    `)
  });
passport.serializeUser(function(user, done) {
  console.log('serializeUser', user);
   done(null, user.authId); // done 함수로 인해 세션이 등록됨.
});
//
passport.deserializeUser(function(id, done) {
  console.log('deserializeUser', id);
  for(var i=0; i<user.length; i++) {
    if(user[i].authId === id) {
      return done(null, user[i]);
    }
  }
  done('There is no user');
});

passport.use(new LocalStrategy( //스트렛티지
  function(username, password, done) {
    var uname = username;
    var pwd = password;
    for(var i=0; i<user.length; i++) {
      if(uname === user[i].username) {
        return hasher({password:pwd, salt:user[i].salt}, function(err, pass, salt, hash) {
          if(hash === user[i].password) {
            console.log('LocalStrategy', user);
            done(null, user[i]); // 성공
          } else {
            done(null, false); // 실패
          }
        });
      }
    }
    done(null, false); // null 부분에 에러처리하는 것
  }
));
passport.use(new FacebookStrategy({
    clientID: '184229931975831',
    clientSecret: 'a7bd585609e6f42f289a45ad9e8671da',
    callbackURL: "/auth/facebook/callback",
    profileFields:['id', 'email', 'gender', 'link', 'locale',
    'name', 'timezone', 'updated_time', 'verified', 'displayName']
    //profile에 다른정보도 필요하다면 이렇게 추가가 가능하다.
    //displayName은 안쓰면 기본적으로 안나오는 경우가 있어서 추가를 했음.
  },
  function(accessToken, refreshToken, profile, done) {
    console.log(profile);
    var authId = 'facebook:'+profile.id;
    for(var i=0; 1<user.length; i++){
      if(user[i].authId === authId) {
        return done(null, user[i]);
        // return 에 걸리지 않으면 유저가 생성됨
      }
    }
    var newuser ={
      'authId':authId, // 페북 고유 아이디
      'displayName':profile.displayName, // 페북 프로파일에서 가져온 이름
      'email':profile.emails[0].value
      //
    }
    user.push(newuser);
    done(null, newuser)
    // User.findOrCreate(..., function(err, user) {
    //   if (err) { return done(err); }
    //   done(null, user);
    // }); profile에 있는 유저를 찾아서 있다면 done(null,user)를 호출,
    // 만약에 profile에 유저를 찾아서 없다면 '만들어서create'  done(null,user)를 호출
    // profile 중요

  }
));
app.post('/auth/login',
  passport.authenticate( //authenticate 미들웨어
    'local',  // local방식 로그인
    {
      successRedirect: '/welcome',
      failureRedirect: '/auth/login',
      failureFlash: false  //사용자가 로그인에 실패한 이유를 알 수있는
    }
  )
);
app.get(
  '/auth/facebook',
  passport.authenticate(
    'facebook',
    {scope:'email'}
  )
);
app.get(
  '/auth/facebook/callback',
  passport.authenticate(
    'facebook',
    {
      successRedirect: '/welcome',
      failureRedirect: '/auth/login'
    }
  )
);

// app.post('/auth/login', function(req, res) {
//   var uname = req.body.username;
//   var pwd = req.body.password;
//   // 사용자 인증
//   console.log(user);
//   for(var i=0; i<user.length; i++) {
//     if(uname === user[i].username) {
//       // hasher를 return 하는 이유는 콜백함수의 hash 인자를 비교할땨
//       // 엄연히 콜백함수, 즉 언제 실행을 마칠지 모르는 함수이기 때문에
//       // for문을 넘어서 who are you를 출력할 가능성이 있다. (비동기식)
//       // 그렇기 때문에 return을 써줘서 hasher함수를 끝내는 것이다.
//       return hasher({password:pwd, salt:user[i].salt}, function(err, pass, salt, hash) {
//         if(hash === user[i].password) {
//           req.session.displayName = user[i].displayName;
//           req.session.save(function() {
//             res.redirect('/welcome')
//           });
//         } else {
//           res.send('Who are you? <a href="/auth/login">login</a>');
//         }
//       });
//     }
//   }
//   //   if(uname === user[i].username && sha256(pwd+user[i].salt) === user[i].password) {
//   //     req.session.displayName = user[i].displayName;
//   //     return req.session.save(function() {
//   //       res.redirect("/welcome");
//   //     });
//   //   }
//   // }
//   res.send('Who are you? <a href="/auth/login">login</a>');
// });

app.get('/auth/login', function(req, res) {
  var output = `
  <h1>Login</h1>
  <form action="/auth/login" method="post">
    <p>
      <input type="text" name="username" placeholder="username">
    </p>
    <p>
      <input type="text" name="password" placeholder="password">
    </p>
    <p>
      <input type="submit">
    </p>
  </form>
  <p>
    <a href="/auth/facebook">facebook</a>
  </p>
  `;
  res.send(output);
})
app.listen(3003, function() {
  console.log('Connected 3003 port!!!');
})
