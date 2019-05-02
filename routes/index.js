var express = require('express');
var router = express.Router();
var path = require('path');

// Connect string to MySQL
// var mysql = require('mysql');
var oracledb = require('oracledb');
var mongodb = require("mongodb");

var addr = "mongodb+srv://cis550proj:cis550proj@cluster0-asvi8.mongodb.net/test?retryWrites=true";

function sendMongoDBQuery(bid, callback) {
    mongodb.MongoClient.connect(addr, function(error, db){
        if (error) throw error;
        var tips = db.db("cis550proj").collection("tip");
        tips.find({"business_id" : bid}).sort({date: -1}).limit(5).toArray(function(error, result) {
          callback(result);
        });
    });
}

function insertToMongoDB(review, callback) {
    mongodb.MongoClient.connect(addr, function(error, db){
        if (error) throw error;
        var tips = db.db("cis550proj").collection("tip");
        tips.insert(review, function(err, res){
        if(err) throw err;
          console.log('data inserted');
          console.log(res);
        db.close();
      });
    });
}


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

router.get('/destination', function(req, res) {
  res.sendFile(path.join(__dirname, '../', 'views', 'destination.html'));
});

router.get('/hotels', function(req, res) {
  res.sendFile(path.join(__dirname, '../', 'views', 'hotels.html'));
});

router.get('/restaurants', function(req, res) {
  res.sendFile(path.join(__dirname, '../', 'views', 'restaurants.html'));
});

router.get('/attractions', function(req, res) {
  res.sendFile(path.join(__dirname, '../', 'views', 'attractions.html'));
});

router.get('/recommend', function(req, res) {
  res.sendFile(path.join(__dirname, '../', 'views', 'recommend.html'));
});

// To add a new page, use the templete below
/*
router.get('/routeName', function(req, res) {
  res.sendFile(path.join(__dirname, '../', 'views', 'fileName.html'));
});
*/

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
    res.json(result);
  });
});

router.post('/findCityLatLng', function(req, res) {
  console.log(req.body.city);
  var query = "select lattitude, longitude from city c where lower(c.city) = \'" 
  + req.body.city
 + "\' OFFSET 0 ROWS FETCH NEXT 1 ROWS ONLY";
 console.log(query);
  sendQuery(query, function(result) {
    res.json(result);
  });
});


router.post('/destination/hotels', function(req, res) {
  console.log(req.body.destination);
  var query = "select h.hotel_name, h.address, h.phone "
 + " from Hotels h"
 + " where (lower(h.city_name) like \'%"+ req.body.destination + "%\')"
 + " ORDER BY DBMS_RANDOM.VALUE"
 + " OFFSET 0 ROWS FETCH NEXT 5 ROWS ONLY" ;
  console.log(query);
  sendQuery(query, function(result) {
    res.json(result);
  });
});

router.post('/destination/restaurants', function(req, res) {
  console.log(req.body.destination);
  var query = "select b.name,b.categories,b.stars, b.review_count"
 + " from Business b"
 + " where (b.stars>=4 and lower(b.city) like \'%"+ req.body.destination + "%\') and (upper(b.categories) like '%RESTAURANT%' or upper(b.categories) like '%FOOD%')"
 + " order by b.review_count desc"
 + " OFFSET 0 ROWS FETCH NEXT 5 ROWS ONLY" ;
  console.log(query);
  sendQuery(query, function(result) {
    res.json(result);
  });
});

router.post('/destination/attractions', function(req, res) {
  console.log(req.body.destination);
  var query = "SELECT title,address from "
 + " (SELECT * FROM attractions"
 + " where lower(place) like \'%" + req.body.destination + "%\'"
 + " ORDER BY DBMS_RANDOM.VALUE)"
 + "WHERE rownum <= 10" ;
  console.log(query);
  sendQuery(query, function(result) {
    res.json(result);
  });
});


router.post('/restaurants', function(req, res) {
  console.log(req.body.destination);
  var query = "select b.name,b.categories,b.stars, b.review_count, b.business_id"
 + " from Business b"
 + " where (b.stars>=4 and lower(b.city) like \'%"+ req.body.destination + "%\') and (upper(b.categories) like '%RESTAURANT%' or upper(b.categories) like '%FOOD%')"
 + " order by b.review_count desc"
 + " OFFSET 0 ROWS FETCH NEXT 5 ROWS ONLY" ;
  console.log(query);
  sendQuery(query, function(result) {
    res.json(result);
  });
});

router.post('/attractions', function(req, res) {
  console.log(req.body.destination);
  var query = "SELECT title,address from "
 + " (SELECT * FROM attractions"
 + " where lower(place) like \'%" + req.body.destination + "%\'"
 + " ORDER BY DBMS_RANDOM.VALUE)"
 + "WHERE rownum <= 10" ;
  console.log(query);
  sendQuery(query, function(result) {
    res.json(result);
  });
});

router.post('/hotels', function(req, res) {
  console.log(req.body.destination);
  var query = "select h.hotel_name, h.address, h.phone "
 + " from Hotels h"
 + " where (lower(h.city_name) like \'%"+ req.body.destination + "%\')"
 + " ORDER BY DBMS_RANDOM.VALUE"
 + " OFFSET 0 ROWS FETCH NEXT 5 ROWS ONLY" ;
  console.log(query);
  sendQuery(query, function(result) {
    res.json(result);
  });
});

router.post('/recommend', function(req, res) {
  console.log(req.body.cuisine);
  console.log(req.body.place);
  console.log(req.body.country);
if ((req.body.cuisine == 'N/A' || req.body.cuisine == undefined) 
    && (req.body.place !== 'N/A' && req.body.place !== undefined) 
    && (req.body.country !== 'N/A' && req.body.country !== undefined)){
    var query = "select distinct city_count.place as place, city_count.c as num_attraction"
 + " from (select place, count(*) c from attractions a where (lower(title) like \'%"+ req.body.place.toLowerCase() + "%\') group by place) city_count, city ci"
 + " where lower(ci.city) = lower(city_count.place) "
 + " and lower(ci.country) = \'"+ req.body.country.toLowerCase() + "\'"
 + " order by num_attraction desc OFFSET 0 ROWS FETCH NEXT 5 ROWS ONLY" ;
  };


if ((req.body.cuisine !== 'N/A' && req.body.cuisine !== undefined) 
    && (req.body.place !== 'N/A' && req.body.place !== undefined) 
    && (req.body.country == 'N/A' || req.body.country == undefined)){
    var query = "select distinct city_count.place as place, city_count.c as num_attraction, city_count2.c2 num_restaurant"
 + " from (select place, count(*) c from attractions a where (lower(title) like \'%"+ req.body.place.toLowerCase() + "%\') group by place) city_count, city ci,"
 + " (select city, count(*) c2 from Business b where (lower(b.categories) like \'%"+ req.body.cuisine.toLowerCase() + "%\') group by city) city_count2  "
 + " where lower(ci.city) = lower(city_count.place) "
 + " and lower(ci.city) = lower(city_count2.city)" 
+ "order by (num_attraction + num_restaurant) desc OFFSET 0 ROWS FETCH NEXT 5 ROWS ONLY" ;
  } ;

if ((req.body.cuisine !== 'N/A' && req.body.cuisine !== undefined) 
    && (req.body.place == 'N/A' || req.body.place == undefined) 
    && (req.body.country !== 'N/A' && req.body.country !== undefined)){
    var query = "select distinct city_count.city as place, city_count.c as num_restaurant"
 + " from (select city, count(*) c from business b where (lower(categories) like \'%"+ req.body.cuisine.toLowerCase() + "%\') group by city) city_count, city ci"
 + " where lower(ci.city) = lower(city_count.city)   "
 + " and lower(ci.country) = \'"+ req.body.country.toLowerCase() + "\'"
 + " order by num_restaurant desc OFFSET 0 ROWS FETCH NEXT 5 ROWS ONLY" ;
  };

if ((req.body.cuisine !== 'N/A' && req.body.cuisine !== undefined) 
    && (req.body.place !== 'N/A' && req.body.place !== undefined) 
    && (req.body.country !== 'N/A' && req.body.country !== undefined)){
    var query = "select distinct city_count.place as place, city_count.c as num_attraction, city_count2.c2 num_restaurant"
 + " from (select place, count(*) c from attractions a where (lower(title) like \'%"+ req.body.place.toLowerCase() + "%\') group by place) city_count, city ci,"
 + " (select city, count(*) c2 from Business b where (lower(b.categories) like \'%"+ req.body.cuisine.toLowerCase() + "%\') group by city) city_count2  "
 + " where lower(ci.city) = lower(city_count.place) "
 + " and lower(ci.city) = lower(city_count2.city)" 
+ " and lower(ci.country) = \'"+ req.body.country.toLowerCase() + "\'"
+ "order by (num_attraction + num_restaurant) desc OFFSET 0 ROWS FETCH NEXT 5 ROWS ONLY" ;
  }  ;

  console.log(query);
  sendQuery(query, function(result) {
    res.json(result);
  });
});

router.post('/tip', function(req, res) {
  var id = req.body.id;
  sendMongoDBQuery(id, function(result) {
    res.json(result);
  });
});

router.post('/addtip', function(req, res) {
  var insert = {"user_id" : "jdoQ5-Tc-YRb0bmV6QR8Lw","business_id":req.body.business_id, "text":req.body.text, "date": req.body.date,
"compliment_count" : 0};
    console.log(insert);
  insertToMongoDB(insert, function(result) {
        res.json(result);
  });
});

module.exports = router;
