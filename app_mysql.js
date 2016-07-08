var express = require('express');
var bodyParser = require('body-parser');

var mysql      = require('mysql');
var conn = mysql.createConnection({
   host     : 'localhost',
   user     : 'root',
   password : 'dongdb',
   database : 'mysql'
});
conn.connect();
var app = express();
app.locals.pretty = true;
app.set('view engine', 'jade');
app.set('views', './views/mysql');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.get('/topic/add', function(req, res) {
  var sql = 'SELECT id, title FROM topic';
  conn.query(sql, function(err, topics, fields){
    res.render('topic/add', {topics:topics})
  });
});
app.get('/topic/:id/delete', function(req, res) {
  var sql = 'SELECT id, title FROM topic';
  conn.query(sql, function(err, topics, fields){
    var id = req.params.id;
    if(id) {
      var sql = 'SELECT id, title FROM topic WHERE id =?';
      conn.query(sql, [id], function(err, topic, fields){
        if(err) {
          console.log(err);
          res.status(500).send('Internal Server Error');
        }
        else {
            res.render('topic/delete', {topics:topics, topic:topic[0]})
        }
      });
    }
  });
});
app.post('/topic/:id/delete', function(req, res) {
  var sql = 'DELETE from topic where id = ?';
  var id = req.params.id;
  conn.query(sql, [id], function(err, topics, fields){
    if(err) {
      console.log(err);
      res.status(500).send('Internal Server Error');
    }
    else {
      res.redirect('/topic/');
    }
  });
});
app.get('/topic/:id/edit', function(req, res) {
  var sql = 'SELECT id, title FROM topic';
  conn.query(sql, function(err, topics, fields){
    var id = req.params.id;
    if(id) {
      var sql = 'SELECT * FROM topic WHERE id =?';
      conn.query(sql, [id], function(err, topic, fields){
        if(err) {
          console.log(err);
          res.status(500).send('Internal Server Error');
        }
        else {
            res.render('topic/edit', {topics:topics, topic:topic[0]})
        }
      });
    }
  });
});
app.post('/topic/:id/edit', function(req, res) {
  var sql = 'UPDATE topic set title = ?, description = ?, author = ? where id = ?';
  var id = req.params.id;
  var title = req.body.title;
  var description = req.body.description;
  var author = req.body.author;
  conn.query(sql, [title, description, author, id], function(err, topics, fields){
    if(err) {
      console.log(err);
      res.status(500).send('Internal Server Error');
    }
    else {
      res.redirect('/topic/');
    }
  });
});
app.get(['/topic', '/topic/:id'], function(req, res) {
  var sql = 'SELECT id, title FROM topic';
  conn.query(sql, function(err, topics, fields){
    var id = req.params.id;
    if(id) {
      var sql = 'SELECT * FROM topic WHERE id =?';
      conn.query(sql, [id], function(err, topic, fields){
        if(err) {
          console.log(err);
          res.status(500).send('Internal Server Error');
        }
        else {
          res.render('topic/view', {topics:topics, topic:topic[0]})
        }
      });
    }
    else {
      res.render('topic/view', {topics:topics})
    }
  });
});
app.post('/topic/add', function(req, res) {
  var sql = 'INSERT INTO topic(title, description, author) VALUES(?, ?, ?)';
  var title = req.body.title;
  var description = req.body.description;
  var author = req.body.author;
  conn.query(sql, [title, description, author], function(err, topics, fields){
    if(err) {
      console.log(err);
      res.status(500).send('Internal Server Error');
    }
    else {
      res.redirect('/topic/')
    }
  });
});
app.listen(3003, function(){
  console.log('Connected 3003 port!!!');
});
