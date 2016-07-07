var express = require('express');
var session = require('express-session');
var FileStore = require('session-file-store')(session);
var bodyParser = require('body-parser');
var app = express();
app.use(bodyParser.urlencoded({ extended: false}))
app.use(session({
  secret: '123215415@@DSAGnklndklsa',
  resave: false,
  saveUninitialized: true,
  store: new FileStore() // 세션이라는 디렉토리를 만든다.
}));
app.get('/count', function(req, res) {
  if(req.session.count) {
    req.session.count++;
  } else {
    req.session.count = 1;
  }
  res.send('count : '+req.session.count);
})
app.get('/auth/logout', function(req, res) {
  delete req.session.displayName; // delete->자바스크립트 명령어
  res.redirect('/welcome');
})
app.get('/welcome', function(req, res) {
  if(req.session.displayName) {// 세션에 있다면 로그인 성공
    res.send(`
      <h1>Hello, ${req.session.displayName}</h1>
      <a href="/auth/logout">logout</a>
    `)
  } else {
    res.send(`
      <h1>welcome</h1>
      <a href="/auth/login">Login</a>
    `)
  }
})
app.post('/auth/login', function(req, res) {
  var user = {
    username:'edong',
    password:'1234',
    displayName:'Edong'// 화면에 표시하는 닉넴같은
  };
  var uname = req.body.username;
  var pwd = req.body.password;
  if(uname === user.username && pwd === user.password) {
    req.session.displayName = user.displayName;
    res.redirect('/welcome');
  } else {
    res.send('Who are you? <a href="/auth/login">login</a>');
  }
})

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

  `;
  res.send(output);
})
app.listen(3003, function() {
  console.log('Connected 3003 port!!!');
})
