module.exports = function() {
  var route = require('express').Router();
  var conn = require('../../config/mysql/db')();
  route.get('/add', function(req, res) {
    var sql = 'SELECT id, title FROM topic';
    conn.query(sql, function(err, topics, fields){
      res.render('topic/add', {topics:topics, user:req.user})
    });
  });

  route.get('/:id/delete', function(req, res) {
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
              res.render('topic/delete', {topics:topics, topic:topic[0], user:req.user})
          }
        });
      }
    });
  });
  route.post('/:id/delete', function(req, res) {
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
  route.get('/:id/edit', function(req, res) {
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
              res.render('topic/edit', {topics:topics, topic:topic[0], user:req.user})
          }
        });
      }
    });
  });
  route.post('/:id/edit', function(req, res) {
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
  route.get(['/', '/:id'], function(req, res) {
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
            res.render('topic/view', {topics:topics, topic:topic[0], user:req.user})
          }
        });
      }
      else {
        res.render('topic/view', {topics:topics, user:req.user})
      }
    });
  });
  route.post('/add', function(req, res) {
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

  return route
}
