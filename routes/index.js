var express = require('express');
var router = express.Router();
var path = require('path');

// Connect string to MySQL
var mysql = require('mysql');

var connection = mysql.createConnection({
  host: 'cis550proj.ct3uunzu1j29.us-east-2.rds.amazonaws.com',
  user: 'cis550proj',
  password: 'cis550proj',
  database: 'Oracle-RDS'
});

connection.connect(function(err) {
  if (err) {
    console.log("Error Connection to DB" + err);
    return;
  }
  console.log("Connection established...");
});

/* GET home page. */
router.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, '../', 'views', 'login.html'));
});

router.get('/dashboard', function(req, res) {
  res.sendFile(path.join(__dirname, '../', 'views', 'dashboard.html'));
});

router.get('/reference', function(req, res) {
  res.sendFile(path.join(__dirname, '../', 'views', 'reference.html'));
});

router.get('/recommendations', function(req, res) {
  res.sendFile(path.join(__dirname, '../', 'views', 'recommendations.html'));
});

router.get('/bestof', function(req, res) {
  res.sendFile(path.join(__dirname, '../', 'views', 'bestof.html'));
});

router.get('/posters', function(req, res) {
  res.sendFile(path.join(__dirname, '../', 'views', 'posters.html'));
});

// To add a new page, use the templete below
/*
router.get('/routeName', function(req, res) {
  res.sendFile(path.join(__dirname, '../', 'views', 'fileName.html'));
});
*/

// Login uses POST request
router.post('/login', function(req, res) {
  // use console.log() as print() in case you want to debug, example below:
  // console.log(req.body); will show the print result in your terminal

  // req.body contains the json data sent from the loginController
  // e.g. to get username, use req.body.username
  var query = "INSERT IGNORE INTO User (username, password) VALUES ? "; /* Write your query here and uncomment line 21 in javascripts/app.js*/
  var values = [[req.body.username, req.body.password]];
  connection.query(query, [values], function(err, rows, fields) {
    console.log("rows", rows);
    if (err) console.log('insert error: ', err);
    else {
      res.json({
        result: 'success'
      });
    }
  });
});

router.get('/user', function(req, res) {
    var query = "SELECT * FROM User"; /* Write your query here and uncomment line 21 in javascripts/app.js*/
    connection.query(query, function(err, rows, fields) {
      if (err) console.log('insert error: ', err);
      else {
        res.json(rows);
      }
    });
});

router.get('/genre', function(req, res) {
    var query = "SELECT DISTINCT genre FROM Genres"; /* Write your query here and uncomment line 21 in javascripts/app.js*/
    connection.query(query, function(err, rows, fields) {
      if (err) console.log('insert error: ', err);
      else {
        res.json(rows);
      }
    });
});

router.get('/genre/:customParameter', function(req, res) {
  var para = req.params.customParameter;    
  var query = "select title, rating, vote_count from Movies m join"
  + " Genres g on m.id = g.movie_id and g.genre = ? order by rating "
  + "desc, vote_count desc limit 10;";
  var values = [para];
  connection.query(query, para, function(err, rows, fields) {
    // console.log("rows", rows);
    if (err) console.log(err);
    else {
      res.json(rows);
    }
  });
});

router.post('/recommendation', function(req, res) {
  var query = 'select genre from Genres where movie_id = ?';
  var values = [req.body.id];
  connection.query(query, values, function(err, rows, fields) {
    // console.log("rows", rows);
    if (err) console.log(err);
    else {
      res.json(rows);
    }
  });
});

router.post('/recMovie', function(req,res) {
  var query = 'select m.title, g.genre from Movies m join Genres g on g.movie_id = m.id and movie_id != ? and g.genre = ? order by rand() limit 1';
  var values = [req.body.id, req.body.genre];
  connection.query(query, values, function(err, rows, fields) {
    // console.log("rows", rows);
    if (err) console.log(err);
    else {
      res.json(rows);
    }
  });
});

router.post('/bestofmovie', function(req, res) {
var query = "select g.genre, m.title, m.vote_count from Movies" 
  + " m join Genres g on g.movie_id = m.id and m.release_year = ? "
  +"inner join (select genre, max(m2.vote_count) as max_vote_count "
  +"from Movies m2 join Genres g2 on g2.movie_id = m2.id where m2.release_year = ? "
  +"group by g2.genre) as groupMaxVote on g.genre = groupMaxVote.genre and m.vote_count = groupMaxVote.max_vote_count;";
var values = [req.body.year, req.body.year];
  connection.query(query, values, function(err, rows, fields) {
    console.log("rows", rows);
    if (err) console.log(err);
    else {
      res.json(rows);
    }
  });
});

router.get('/imdbid', function(req, res) {
    var query = "SELECT DISTINCT imdb_id FROM Movies order by rand() limit 10"; /* Write your query here and uncomment line 21 in javascripts/app.js*/
    connection.query(query, function(err, rows, fields) {
      if (err) console.log('insert error: ', err);
      else {
        res.json(rows);
      }
    });
});

// template for GET requests
/*
router.get('/routeName/:customParameter', function(req, res) {

  var myData = req.params.customParameter;    // if you have a custom parameter
  var query = '';

  // console.log(query);

  connection.query(query, function(err, rows, fields) {
    if (err) console.log(err);
    else {
      res.json(rows);
    }
  });
});
*/

module.exports = router;