var express = require('express');
var router = express.Router();
var path = require('path');

// Connect string to MySQL
// var mysql = require('mysql');
var oracledb = require('oracledb');


function sendQuery(queryString, callback){
  oracledb.getConnection({
  user: 'cis550proj',
  password: 'cis550proj',
  connectString: '(DESCRIPTION = (ADDRESS = (PROTOCOL = TCP)'+
  '(HOST = cis550proj.ct3uunzu1j29.us-east-2.rds.amazonaws.com)'+
  '(PORT = 1521))(CONNECT_DATA =(SID = PENNTR)))'
    }, function(err, connection) {
    if (err) {
      console.error(err.message);
      return;
    }
    console.log("\nQuery : "+queryString);
    connection.execute(queryString, [],{ maxRows: 1000 },
    function(err, result) {
      if (err) {
        console.error(err.message);
        doRelease(connection);
        return;
      }
      callback(result);
      doRelease(connection);
    });
  });
}

sendQuery("select * from city", function(result){
  console.log(result);
});

function doRelease(connection) {
  connection.release(
    function(err) {
      if (err) {console.error(err.message);}
    }
  );
}

/* GET home page. */
router.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, '../', 'views', 'login.html'));
});

router.get('/start', function(req, res) {
  res.sendFile(path.join(__dirname, '../', 'views', 'start.html'));
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

router.post('/findflight', function(req, res) {
    console.log(req.body.depart);
  var query = "select f.airline, f.airline_id, score from flight f"
 + " join airport a1 on a1.IATA = f.depart"
 + " join airport a2 on a2.IATA = f.arrival"
 + " join airlinecode ac on ac.airline = f.airline"
 + " join airlinerating ar on upper(ar.airline_name) = upper(ac.airline_name)" 
 + " where lower(a1.city) = \'" + req.body.depart + "\' and lower(a2.city) = \'" + req.body.arrival
 + "\' order by score desc"
+ " OFFSET 0 ROWS FETCH NEXT 5 ROWS ONLY";
  console.log(query);
  sendQuery(query, function(result) {
    // console.log(result);
    res.json(result);
    // if (err) console.log(err);
    // else {
    //   res.json(rows);
    // }
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
