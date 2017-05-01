var express = require("express");

var router = express.Router();

// *********************************************************************************
// api-routes.js - this file offers a set of routes for displaying and saving data to the db
// *********************************************************************************

// Dependencies
// =============================================================
var Movie = require("../models/movie_dbSync.js");
var cheerio = require("cheerio");

router.get('/', function(req,res){
  res.render('index');
});

// Routes
// =============================================================
// module.exports = function(app) {

  // Get all chirps
router.get("/api/all", function(req, res) {

    // Finding all Chirps, and then returning them to the user as JSON.
    // Sequelize queries are aynchronous, which helps with percieved speed.
    // If we want something to be guaranteed to happen after the query, we'll use
    // the .then function
    // Movie.findAll({}).then(function(results) {
    //   // results are available to us inside the .then
    //   // res.json(results);
    //   res.render("index", results);
    // });
    // res.render("index");
});

  // Add a chirp
router.post("/api/new", function(req, res) {

  var request = require("request");
  var movieName = "";

  movieName = req.body.movie;

  var queryUrl = "https://www.rottentomatoes.com/m/frozen_2013/reviews/?type=top_critics"

  request(queryUrl, function(error, response, body) {

    var $ = cheerio.load(body);
    var names, reviews;
    var json = {name: "", reviews: ""};
    $(".critic_name").filter(function(){
      var data = $(this);

      name = data.children().first().text();
      console.log("name " + name);

    });

    $(".review_icon").filter(function(){
      var image = $(this).hasClass("fresh");
      if (image) {
        console.log("fresh");
      }
      else {
        console.log("rotten");
      }
      
    });    

    // If the request is successful
    if (!error && response.statusCode === 200) {

    }
    else {
      console.log("didn't work");
    }
  });



// Then run a request to the OMDB API with the movie specified

  var queryUrl = "http://www.omdbapi.com/?t=" + movieName + "&y=&plot=short&r=json";

// Then create a request to the queryUrl
  request(queryUrl, function(error, response, body) {

    // If the request is successful
    if (!error && response.statusCode === 200) {

    // Then log the Release Year for the movie
      
      // console.log("Release Year " + JSON.parse(body).Title);
      // console.log("Release Year " + JSON.parse(body).Year);
      // console.log("Release Year " + JSON.parse(body).Rated);
      // console.log("Release Year " + JSON.parse(body).Released);
      // console.log("Release Year " + JSON.parse(body).Genre);
      // console.log("Release Year " + JSON.parse(body).Runtime);
      // console.log("Release Year " + JSON.parse(body).Director);
      // console.log("Release Year " + JSON.parse(body).Writer);
      // console.log(body);
      
      // return res.json(body);
      res.json(body);
    }
    console.log("sent headers / ended omdb query");
  });

  // }
  // }).then(function(results) {
  //       // `results` here would be the newly created chirp
  //       res.end();
  //     });
  // console.log("Movie Data:");
  //     console.log(req.body);

  //     Movie.create({
  //       author: req.body.author,
  //       body: req.body.body,
  //       created_at: req.body.created_at
  //     })

});
module.exports = router;
