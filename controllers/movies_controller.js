// ***************************************************************
// api-routes.js - this file offers a set of routes for displaying and saving data to the db
// ***************************************************************
// Dependencies
// =============================================================
var express = require("express");
var router = express.Router();
var Movie = require("../models/movie_dbSync.js");
var User = require("../models/movie_dbSync.js");
var cheerio = require("cheerio");
var db = require("../models");
var request = require("request");
var passport = require("../config/passport");
var isAuthenticated = require("../config/middleware/isAuthenticated");

// Routes
// =============================================================
//display index page
router.get('/', function(req,res){
  
  var fs = require("fs");
  db.movie.findAll({}).then(function(result) {
    fs.writeFile("./movie.json", JSON.stringify(result), function(err) {

      // If an error was experienced we say it.
      if (err) {
        console.log(err);
      }
    });
  });
  db.user.findAll({}).then(function(result) {
    fs.writeFile("./user.json", JSON.stringify(result), function(err) {

      // If an error was experienced we say it.
      if (err) {
        console.log(err);
      }
    });
  });
  res.render('index');
});


router.get("/signup", function(req, res) {
  // If the user already has an account send them to the members page
  if (req.user) {
    res.redirect("/members");
  }
  res.render('signup');
});

router.get("/login", function(req, res) {
  // If the user already has an account send them to the members page
  if (req.user) {
    res.redirect("/members");
  }
  res.render('login');
});

// Here we've add our isAuthenticated middleware to this route.
// If a user who is not logged in tries to access this route they will be redirected to the signup page
router.get("/members", isAuthenticated, function(req, res) {
  res.render('members');
});

router.post("/api/login", passport.authenticate("local"), function(req, res) {
  // Since we're doing a POST with javascript, we can't actually redirect that post into a GET request
  // So we're sending the user back the route to the members page because the redirect will happen on the front end
  // They won't get this or even be able to access this page if they aren't authed

  res.json('/members');
});

// Route for signing up a user. The user's password is automatically hashed and stored securely thanks to
// how we configured our Sequelize User Model. If the user is created successfully, proceed to log the user in,
// otherwise send back an error
router.post("/api/signup", function(req, res) {
  console.log(req.body);
  console.log(req.body.userName, req.body.password, req.body.name);
  db.user.findOrCreate({ 
    where: {userName: req.body.userName}, 
    defaults: {password: req.body.password, name: req.body.name}
  }).then(function() {
    console.log("sent to html");
    res.redirect(307, "/api/login");
  }).catch(function(err) {
    console.log("got an error");
    console.log(err);
    res.json(err);
  });
});

// Route for logging user out
router.get("/logout", function(req, res) {
  req.logout();
  res.redirect("/login");
});

// Route for getting some data about our user to be used client side
router.get("/api/user_data", function(req, res) {
  if (!req.user) {
    // The user is not logged in, send back an empty object
    res.json({});
  }
  else {
    // Otherwise send back the user's email and id
    // Sending back a password, even a hashed password, isn't a good idea
    res.json({
      userName: req.user.userName,
      id: req.user.id
    });
  }
});



// Get all chirps
router.get("/api/all", function(req, res) {
    // Movie.findAll({}).then(function(results) {
    //   // results are available to us inside the .then
    //   // res.json(results);
    //   res.render("index", results);
    // });
    // res.render("index");
});

// Search for a movie
router.post("/api/new", function(req, res) {
  //local variables
  var year = "";
  var createdAt = req.body.created_at;
  var movieNameOmdbandTmdb = req.body.movie;
  var movieNameTmdbandRottenTomatoes = "";
  var movieNameRottenTomatoes = "";
  var movieDetailsOmdb = {};
  var recommendations = [];
  var tmdbId = "";
  var poster = "";
  var userArrayOfNamesForDb = [];
  var userArrayOfLikesForDb = [];
  var userArrayOfUserNamesForDb = [];
  var criticPassword = "12lkn43lkn6343l43k4n";
  var guideboxID = "";
  var trailer = "";
  checkDb(req, res);
  // omdbCall(req, res);
  
  function returnToHtml(message) {
    console.log("sent message to html");
    res.send(message);
  }

  // check to see if movie already in database.
  function checkDb(req, res) {

    db.movie.findAll({
      where: {title: req.body.movie}
    }).then(function(results) {
      //if movie not in database

      if (results.length === 0) {

        omdbCall(req, res);
      }
      //if movie is in database
      else {
        console.log("headers set 1");
        var message = "already in db";
        return returnToHtml(message);
      }
    });
  }

  // run a request to the OMDB API with the movie specified
  function omdbCall (req, res) {
    var queryUrl = "http://www.omdbapi.com/?t=" + movieNameOmdbandTmdb + "&y=&plot=short&r=json";

  // Then create a request to the queryUrl
    request(queryUrl, function(error, response, body) {

      // If the request is successful
      if (!error && response.statusCode === 200 && JSON.parse(body).Error !== "Movie not found!") {

      // Then fill the details into array for later use
        movieDetailsOmdb = {omdb: body}
        console.log("here");
        console.log(response.statusCode);
        console.log(JSON.parse(body).Error);
        console.log("omdb details ", movieDetailsOmdb);
        
        // return res.json(body);
        // res.json(body);
        movieNameTmdbandRottenTomatoes = JSON.parse(body).Title;
        year = "_" + JSON.parse(body).Year;
        getGuideboxID(JSON.parse(body).imdbID);
        tmdbCall();
        
      }
      else {
        console.log("headers set 2");
        var message = "Sorry that movie doesn't exist";
        return returnToHtml(message);
      }
      
    });
  }
  
function getGuideboxID (imdbID) {
  var queryUrl = 'http://api-public.guidebox.com/v2/search?api_key=a4966dc9db26e3695465a5340bb66b205267cdc2&type=movie&field=id&id_type=imdb&query=' + imdbID;
  request(queryUrl, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      guideboxID = JSON.parse(body).id;
    }
      else if (err) {
        return err;
      }
  });
}

  //call rotten tomatoes for user information
  function rottenTomatoes () {
    console.log("ran rotten tomatoes");
    //format user input for rotten tomatoes api call
    for (i=0; i < movieNameTmdbandRottenTomatoes.length; i++) {

      if (movieNameTmdbandRottenTomatoes[i] === " ") {
        movieNameRottenTomatoes += "_";
      }
      else {
        movieNameRottenTomatoes += req.body.movie[i];
      }
    }

    var queryUrl = "https://www.rottentomatoes.com/m/"+ movieNameRottenTomatoes + year +"/reviews/?type=top_critics"
    rottenTomatoesQuery(queryUrl);

    function rottenTomatoesQuery (queryUrl) {
    
      request(queryUrl, function(error, response, body) {
        
        //set up for webscraper for critic names and opinions
        var $ = cheerio.load(body);
        var names, reviews;
        var json = {name: "", reviews: ""};
        $(".critic_name").filter(function(){
          var data = $(this);

          name = data.children().first().text();
          console.log("name " + name);
          userArrayOfNamesForDb.push(name);
          //format user names for db based on critic names
          var tempName ="";
          for (i=0; i < name.length; i++) {

            if (name[i] === " ") {
              tempName += "_";
            }
            else {
              tempName += name[i];
            }
          }
          userArrayOfUserNamesForDb.push("CR_"+ tempName);
          
        });

        $(".review_icon").filter(function(){
          var image = $(this).hasClass("fresh");
          if (image) {
            console.log("fresh");
            userArrayOfLikesForDb.push(1);
          }
          else {
            console.log("rotten");
            userArrayOfLikesForDb.push(0);
          }
        }); 
        // db input on movie
        
        
        // If the request query is not successful
        if (!error && response.statusCode === 404) {
          //reset query to not include the year for rotten tomatoes formatting.
          var queryUrl = "https://www.rottentomatoes.com/m/"+ movieNameRottenTomatoes +"/reviews/?type=top_critics"
          rottenTomatoesQuery(queryUrl);
        }
        else if (!error && response.statusCode === 200) {
          // add to user db
          for (var i=0; i<userArrayOfUserNamesForDb.length; i++) {
            userInformation(userArrayOfLikesForDb[i], userArrayOfUserNamesForDb[i], userArrayOfNamesForDb[i]);
          }
        }
        else {
          console.log("status 2 " + response.statusCode);
          console.log("headers set 3");
         var message = "Sorry no reviews currently exist";
          return returnToHtml(message);
        }
      }); //end request query
    } // function rottenTomatoesQuery
  } // function rottenTomatoes

  function userInformation(like, uName, na) {
    //check to see if user exists
    db.user.findOne({
      where: {userName: uName}
    }).then(function (userName) {

      //if user does not exist
      if (userName === null) {
        //user disliked the movie
        if (like === 0) {
          db.user.create({
            userName: uName,
            password: criticPassword,
            name: na,
            dislikes: tmdbId
          });
        }
        //user liked the movie
        else {
          db.user.create({
            userName: uName,
            password: criticPassword,
            name: na,
            likes: tmdbId
          });
        }
      }
      //if user does exist
      else {
        //user disliked the movie
        if (like === 0) {
          var dislikes = userName.dataValues.dislikes + ", " + tmdbId;
          //add movie to user's dislike list
          db.user.update({
            dislikes: dislikes
            }, {where: {userName: uName}
          });
        }
        //user liked the movie
        else {
          var likes = userName.dataValues.likes + ", " + tmdbId;
          //add movie to user's like list
          db.user.update({
            likes: likes
            }, {where: {userName: uName}
          });
        }
      }
    }); //.then for find user
  } // function userInformation
  
  // gets recommendations, trailers, and tmdbID
  function tmdbCall() {
    var queryUrl = "http://api.themoviedb.org/3/search/movie?api_key=c825fc2242a8f468025d866ecfc40a11&query=" + movieNameTmdbandRottenTomatoes;
    // gets the internal TMDB ID
    request(queryUrl, function(error, response, body) {

      // If the request is successful
      if (!error && response.statusCode === 200) {
        if (JSON.parse(body).results.length !== 0) {
          tmdbId = JSON.parse(body).results[0].id;
          poster = "http://image.tmdb.org/t/p/w185" + JSON.parse(body).results[0].poster_path;
          // 
          var queryUrl = "https://api.themoviedb.org/3/movie/"+ tmdbId +"?api_key=c825fc2242a8f468025d866ecfc40a11&append_to_response=videos,recommendations";
          
          //uses the TMDB ID to find trailers and recommendations
          request(queryUrl, function(error, respons, bod) {

            // If the request is successful
            if (!error && respons.statusCode === 200) {
              if (JSON.parse(bod).videos.results.length !== 0) {
              trailer = "https://www.youtube.com/watch?v=" + JSON.parse(bod).videos.results[0].key;
              console.log("trailer " + trailer);
                if(JSON.parse(bod).recommendations.results.length !== 0) {

                  for(i = 0; i <3; i++) {
                    recommendations.push(
                      JSON.parse(bod).recommendations.results[i].title + ", " + 
                      JSON.parse(bod).recommendations.results[i].id + ", " + 
                      "http://image.tmdb.org/t/p/w500" + JSON.parse(bod).recommendations.results[i].poster_path);       
                  }
                   console.log(recommendations);
                }
              }
              
             
              addMovie();
            }
            else {
              var message = "Sorry no trailers or recs";
              // return returnToHtml(message);
            }
            
          }); // second request query
        }
      }
      else {
        console.log("headers set 5");
        var message = "Sorry that movie doesn't exist";
        return returnToHtml(message);
      }
    }); // first request query
  } // function tmdbCall
  function addMovie() {
    // console.log("=================================");
    // console.log("tmdbId: " + parseInt(tmdbId));
    // console.log("guideBoxId: " + parseInt(guideboxID));
    // console.log("title: " + JSON.parse(movieDetailsOmdb.omdb).Title);
    // console.log("year: " + JSON.parse(movieDetailsOmdb.omdb).Year);
    // console.log("genre: " + JSON.parse(movieDetailsOmdb.omdb).Genre);
    // console.log("director: " + JSON.parse(movieDetailsOmdb.omdb).Director);
    // console.log("actors: " + JSON.parse(movieDetailsOmdb.omdb).Actors);
    // console.log("poster: " + poster);
    // console.log("trailer: " + trailer);
    // console.log("rec1: " + recommendations[0]);
    // console.log("rec2: " + recommendations[1]);
    // console.log("rec3: " + recommendations[2]);
    // console.log("created_at: " + createdAt);
    // console.log("=================================");
    db.movie.create({
      tmdbId: parseInt(tmdbId),
      guideBoxId: parseInt(guideboxID),
      title: JSON.parse(movieDetailsOmdb.omdb).Title,
      year: JSON.parse(movieDetailsOmdb.omdb).Year,
      genre: JSON.parse(movieDetailsOmdb.omdb).Genre,
      director: JSON.parse(movieDetailsOmdb.omdb).Director,
      actors: JSON.parse(movieDetailsOmdb.omdb).Actors,
      poster: poster,
      trailer: trailer,
      rec1: recommendations[0],
      rec2: recommendations[1],
      rec3: recommendations[2],
      created_at: createdAt
    }).then(function(result) {
      console.log("bad result ", result);
      rottenTomatoes ();
      // if (result)
    }).catch(function(err) {
      console.log("got an error");
      console.log("headers set 6");
      var message = "Sorry that movie doesn't exist";
        return returnToHtml(message);
    });
  }
}); // end of route for post

module.exports = router;
