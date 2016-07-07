var express = require('express');
var session = require('express-session');
var MySQLStore = require('express-mysql-session')(session);
var bodyParser = require('body-parser')
var app = express();
var conn = mysql.createConnection({
   host     : 'localhost',
   user     : 'root',
   password : 'dongdb',
   database : 'mysql'
});
conn.connect();
app.use(bodyParser.urlencoded({ extended: false}))
app.use(session({
  secret: '123215415@@DSAGnklndklsa',
  resave: false,
  saveUninitialized: true,
  store: new MySQLStore({
    host      : 'localhost',
    port      : 3306,
    user      : 'root',
    password  : 'dongdb',
    database  : 'mysql'
  })
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
  delete req.session.displayName;
  req.session.save(function() {
    res.redirect('welcome');
  }); // 세이브가 끈난 다음에 웰컴 페이지로 감.
      // 세션이 저장안된상태에서 페이지를 전환하는 경우를 막아준다.
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
    req.session.save(function() {
      res.redirect('welcome');
    });
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
