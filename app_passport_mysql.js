var app = require('./config/mysql/express')()
var passport = require('./config/mysql/passport')(app);
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
var auth = require('./routes/mysql/auth')(passport);
app.use('/auth/',auth)

app.listen(3003, function() {
  console.log('Connected 3003 port!!!');
})
