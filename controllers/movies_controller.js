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
var session = require("express-session");
var isAuthenticated = require("../config/middleware/isAuthenticated");
var fs = require("fs");

// Routes
// =============================================================
//display index page

router.get('/', function(req,res){
  db.movie.findAll({limit: 5, order: [["created_at", "DESC"]]}).then(function(result) {
    sendBack = []
    for (i=0; i < result.length; i++) {

      // console.log("please ", result[i].dataValues.poster);
      sendBack.push(result[i].dataValues);
    }
    // console.log("please ", result[0].dataValues.poster);
    // console.log("trying ", result);
    var photos = {photo: sendBack}
    console.log("photos ", photos)
    res.render('index', photos);
    // res.json(result);
  }).catch(function(err) {
    console.log(err);
  });
});

router.get("/index", function(req, res) {
  res.redirect("/");
});

router.get('/search', isAuthenticated, function(req,res){
  console.log("user ", req.user);
  res.render('search');
});

router.get("/signup", function(req, res) {
  // If the user already has an account send them to the members page
  if (req.user) {
    res.redirect("/members");
  }
  res.render('signup');
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

router.get("/login", function(req, res) {
  
  console.log("++++++++++++++++++++++++++++");
  console.log("status 1: " + res.statusCode);
  console.log("++++++++++++++++++++++++++++");
  // db.movie.findAll({}).then(function(result) {
  //   fs.writeFile("./movie.json", JSON.stringify(result), function(err) {
  //     // If an error was experienced we say it.
  //     if (err) {
  //       console.log(err);
  //     }
  //   });
  //   db.user.findAll({}).then(function(result) {
  //   fs.writeFile("./user.json", JSON.stringify(result), function(err) {

  //     // If an error was experienced we say it.
  //     if (err) {
  //       console.log(err);
  //     }
  //   });
    
  // });
  // });
  res.render('login');
});

router.get("/members", isAuthenticated, function(req, res) {
  console.log("++++++++++++++++++++++++++++");
  console.log("status 4: " + res.statusCode);
  console.log("++++++++++++++++++++++++++++");
  console.log("user ", req.user);
  var user = {name: req.user.name}
  db.movie.findAll({}).then(function(result) {
    var action = [];
    var comedy = [];
    var drama = [];
    var horror = [];
    var animation = [];

    for (var i = 0; i < result.length; i++) {
      var genres = result[i].dataValues.genre.split(", ");

      if (genres.indexOf("Action") !== -1){
        action.push(result[i].dataValues);
      }
      else if (genres.indexOf("Comedy") !== -1){
        comedy.push(result[i].dataValues);
      }
      else if (genres.indexOf("Drama") !== -1){
        drama.push(result[i].dataValues);
      }
      else if (genres.indexOf("Horror") !== -1){
        horror.push(result[i].dataValues);
      }
      else if (genres.indexOf("Animation") !== -1){
        animation.push(result[i].dataValues);
      }
    }
    console.log("action: ", action.length);
    console.log("comedy: ", comedy.length);
    console.log("drama: ", drama.length);
    console.log("horror: ", horror.length);
    console.log("animation: ", animation.length);

    var genreToHtml = {
      action: action,
      comedy: comedy,
      drama: drama,
      horror: horror,
      animation: animation,
      user: user
    }
    res.render('members', genreToHtml);
  }).catch(function(err) {
    console.log(err);
  });
});

router.get("/profile", isAuthenticated, function(req, res) {
  console.log("user ", req.user);
  console.log("++++++++++++++++++++++++++++");
  console.log("status 2: " + res.statusCode);
  console.log("++++++++++++++++++++++++++++");
  var user = {userName: req.user.userName};
  var likes = [];
  var dislikes = [];
   var sendBackLike= [];
   var sendBackDislike= [];
  db.user.findOne({where: {userName: user.userName}}).then(function(result) {
    console.log("1");
    if(result.dataValues.likes !== null && result.dataValues.dislikes !== null){
    likes = result.dataValues.likes.split(", ");
    dislikes = result.dataValues.dislikes.split(", ");
    console.log(typeof likes);
    console.log(result.dataValues);
    console.log(likes);
    
    db.movie.findAll({where: {tmdbId: likes }}).then(function(result){
      console.log("2");
    for (i=0; i < result.length; i++) {
        console.log("5");
      console.log("please", result[i].dataValues);
      sendBackLike.push(result[i].dataValues)};;
      console.log(sendBackLike);
    
      db.movie.findAll({where: {tmdbId: dislikes }}).then(function(result){
      console.log("3");
    for (x=0; x < result.length; x++) {
      // console.log("please", result[x].dataValues.poster);
      sendBackDislike.push(result[x].dataValues)};
    
    // console.log("please ", result[0].dataValues.poster);
    console.log("trying ", sendBackLike);
    console.log("hard ", sendBackDislike);
    var photos = {photoLike: sendBackLike, photoDislike: sendBackDislike};
    console.log("photos ", photos);
    res.render('profile', photos);
  });
    });
    // res.json(result);
  }
  else {
    res.render('profile');
  }
  }).catch(function(err) {
    console.log(err);
  });

});

router.get("/all", isAuthenticated, function(req, res) {
  console.log("user ", req.user);
  console.log("++++++++++++++++++++++++++++");
  console.log("status 2: " + res.statusCode);
  console.log("++++++++++++++++++++++++++++");
  var user = {userName: req.user.userName};
  var likeOpinions = [];
  var dislikeOpinions=[];
  var sendBack=[];
  var opinions = "";
  db.user.findOne({where: {userName: user.userName}}).then(function(result) {
    console.log("1");
    if (result.dataValues.likes !== null){
      opinions = result.dataValues.likes;
    } 
    if (result.dataValues.dislikes !== null) {
      opinions += ", " + result.dataValues.dislikes;
    }
    if (opinions !== "") {
      likeOpinions = opinions.split(", ");
      for (x=0; x<likeOpinions.length; x++){
        likeOpinions[x] = parseInt(likeOpinions[x]);
      };
      console.log("likes", likeOpinions);
    
      db.movie.findAll(
        {where : 
          {tmdbId: 
            { $and: 
              { 
                $notIn: [likeOpinions]
              }
            }
          }
        }
      ).then(function(result){
        console.log("2");
        for (i=0; i < result.length; i++) {
          sendBack.push(result[i].dataValues);
          // console.log("sendBack", sendBack);
        }
      });
    }

    else {
      db.movie.findAll({}).then(function(result) {
        for (i=0; i < result.length; i++) {
          sendBack.push(result[i].dataValues);
          // console.log("sendBack", sendBack);
        }
      });
    }

    var photos = {photo: sendBack};
    console.log("photos ", photos);
    res.render('allopinions', photos);

  }).catch(function(err) {
    console.log(err);
  });
});

router.post("/profile", function(req, res) {
  console.log("++++++++++++++++++++++++++++");
  console.log("status 3: " + res.statusCode);
  console.log("++++++++++++++++++++++++++++");
  var userId = req.user.id;
  console.log("user ", req.user);
  var opinion = req.body.opinion
  var movieId = req.body.id;
  var likes = [];
  var dislikes = [];
  var likesToPush = "";
  var dislikesToPush = "";
  var likeExist = false;
  var dislikeExist = false;
  db.user.findOne({
    where: {id: userId}
  }).then(function(result1) {
    console.log("opinion: " + opinion);
    console.log("likes: ", result1.dataValues.likes);
    console.log(typeof result1.dataValues.likes);
    console.log("dislikes: ", result1.dataValues.dislikes);
    console.log(typeof result1.dataValues.likes);
    if (result1.dataValues.likes !== null){
      likes = result1.dataValues.likes.split(", ");
    }
    if (result1.dataValues.dislikes !== null){
      dislikes = result1.dataValues.dislikes.split(", ");
    }
    if (likes.indexOf(movieId) !== -1) {
      likeExist = true;
    }
    else if (dislikes.indexOf(movieId) !== -1) {
      dislikeExist = true;
    }
    console.log("arrayLikes ", likes);
    console.log("arrayDislikes ", dislikes);
    console.log("exists in likes: ", likeExist);
    console.log("exists in dislikes: ", dislikeExist);

    if (opinion === "like" && likeExist === true) {
      //do nothing
    }
    else if (opinion === "dislike" && dislikeExist === true) {
      //do nothing
    }
    else if (likeExist === false && dislikeExist === false) {
      //add opinion of movie id wherever
      if (opinion === "like") {
        if (result1.dataValues.likes !== null) {
            likesToPush = result1.dataValues.likes + ", " + movieId;
        }
        else {
          likesToPush = movieId;
        }
        db.user.update({
          likes: likesToPush},
          {
          where: {
            id: userId
          }
        }).then(function(results) {
          // `results` here would be the newly created chirp
          res.json(results);
        });
      }
      else {
        if (result1.dataValues.dislikes !== null) {
          dislikesToPush = result1.dataValues.dislikes + ", " + movieId;
        }
        else {
          dislikesToPush = movieId;
        }
        db.user.update({
          dislikes: dislikesToPush},
          {
          where: {
            id: userId
          }
        }).then(function(results) {
          // `results` here would be the newly created chirp
          res.json(results);
        });
      }
    }
    else if (opinion === "dislike" && likeExist === true) {
      //take out from like and add to dislike
      var ix = likes.indexOf(movieId);
      likes.splice(ix, 1);
      if (likes.length !== 0) {
        likesToPush = likes.join(", ");
      }
      else {
        likesToPush = null;
      }
      if (result1.dataValues.dislikes !== null) {
        dislikesToPush = result1.dataValues.dislikes + ", " + movieId;
      }
      else {
        dislikesToPush = movieId;
      }
      console.log(likesToPush);
      console.log(dislikesToPush);
      db.user.update({
          dislikes: dislikesToPush,
          likes: likesToPush},
          {
          where: {
            id: userId
          }
      }).then(function(results) {
        // `results` here would be the newly created chirp
        res.json(results);
      });
    }

    else if (opinion === "like" && dislikeExist === true) {
      //take out from dislike and add to like
      var ix = dislikes.indexOf(movieId);
      dislikes.splice(ix, 1);
      if (likes.length !== 0) {
        dislikesToPush = dislikes.join(", ");
      }
      else {
        dislikesToPush = null;
      }
      if (result1.dataValues.likes !== null) {
          likesToPush = result1.dataValues.likes + ", " + movieId;
      }
      else {
        likesToPush = movieId;
      }
      console.log(likesToPush);
      console.log(dislikesToPush);
      db.user.update({
          dislikes: dislikesToPush,
          likes: likesToPush},
          {
          where: {
            id: userId
          }
      }).then(function(results) {
        // `results` here would be the newly created chirp
        res.json(results);
      });
    }
  });
});

router.post("/api/login", passport.authenticate("local"), function(req, res) {
  console.log("++++++++++++++++++++++++++++");
  console.log("status 5: " + res.statusCode);
  console.log("++++++++++++++++++++++++++++");
  res.json('/members');
});

router.post("/api/signup", function(req, res) {
  // console.log(req.body);
  db.user.findOrCreate({
    where: {userName: req.body.userName},
    defaults:{password: req.body.password, name: req.body.name}

  }).then(function() {
    res.redirect(307, "/api/login");
  }).catch(function(err) {
    console.log(err);
    res.json(err);
  });
});

router.post("/api/find", function(req, res) {
  console.log("got to server");
  console.log("id to check ", req.body.id);
  db.movie.findAll({where: {tmdbId: req.body.id}}).then(function(result) {

    console.log("clicked result ", result);
    console.log("sent result to html");
    res.json(result);
    // res.json(result);
  }).catch(function(err) {
    console.log(err);
  });

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
  checkDb(req, res);
  // omdbCall(req, res);

  function returnToHtml(message) {
    console.log("sent message to html");
    res.json(message);
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
        var message = results;
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
        console.log(JSON.parse(body).Error);
        console.log("omdb details ", movieDetailsOmdb);

        // return res.json(body);
        // res.json(body);
        movieNameTmdbandRottenTomatoes = JSON.parse(body).Title;
        year = "_" + JSON.parse(body).Year;
        getGuideboxID(JSON.parse(body).imdbID);
        rottenTomatoes();

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
    if (!error && response.statusCode === 200 && JSON.parse(body).themoviedb !== undefined) {
      console.log(body !== null);
      guideboxID = JSON.parse(body).id;
      tmdbId = JSON.parse(body).themoviedb;
      console.log(body);
      console.log("tmdbid " + tmdbId);
      tmdbCall();
    }
    else if (error) {
      return error;
    }
    else {
      var message = "Sorry that movie doesn't exist";
      return returnToHtml(message);
    }
  });
}

  //call rotten tomatoes for user information
  function rottenTomatoes () {
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
          if (userName.dataValues.dislikes !== null) {
            var dislikes = userName.dataValues.dislikes + ", " + tmdbId;
          }
          else {
            var dislikes = tmdbId;
          }
          //add movie to user's dislike list
          db.user.update({
            dislikes: dislikes
            }, {where: {userName: uName}
          });
        }
        //user liked the movie
        else {
          if (userName.dataValues.likes !== null) {
            var likes = userName.dataValues.likes + ", " + tmdbId;
          }
          else {
            var likes = tmdbId;
          }
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
    console.log("tmbdCall");

        var queryUrl = "https://api.themoviedb.org/3/movie/"+ tmdbId +"?api_key=c825fc2242a8f468025d866ecfc40a11&append_to_response=videos,recommendations";

        //uses the TMDB ID to find trailers and recommendations
        request(queryUrl, function(error, respons, bod) {

          // If the request is successful
          if (!error && respons.statusCode === 200) {
            console.log("movie ", JSON.parse(movieDetailsOmdb.omdb).Title);
            console.log("error ", JSON.parse(bod).videos.results);
            console.log(tmdbId);
            console.log("bod ", bod);
            if (JSON.parse(bod).videos.results.length !== 0) {
            trailer = "http://www.youtube.com/embed/" + JSON.parse(bod).videos.results[0].key + "?rel=0&autoplay=1";
            }
            else {
              trailer = "Sorry, No trailer is currently available";
            }
            if(JSON.parse(bod).recommendations.results.length !== 0) {
              poster = "http://image.tmdb.org/t/p/w500" + JSON.parse(bod).poster_path
              for(i = 0; i <3; i++) {
                recommendations.push(
                  JSON.parse(bod).recommendations.results[i].title + ", " +
                  JSON.parse(bod).recommendations.results[i].id + ", " +
                  "http://image.tmdb.org/t/p/w500" + JSON.parse(bod).recommendations.results[i].poster_path);
              }
            }
            console.log("trailer " + trailer);
            console.log(recommendations);
            addMovie();
          }
          else {
            var message = "Sorry no trailers or recs";
            // return returnToHtml(message);
          }

        }); // second request query

  } // function tmdbCall
  function addMovie() {
    console.log("added to db");

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
      plot: JSON.parse(movieDetailsOmdb.omdb).Plot,
      rec1: recommendations[0],
      rec2: recommendations[1],
      rec3: recommendations[2],
      created_at: createdAt
    }).then(function(result) {
      console.log("=====++++++++!!!!!!!!!", result.dataValues);
      var message = result.dataValues;
      return returnToHtml(message);

    }).catch(function(err){
      if (err){
        console.log(err);
      }
    });
  }

}); // end of route for post

router.post("/api/findmovie", function(req, res) {
  console.log("got to guidebox post path");
  var guideboxID = req.body.guideboxID;
  // function getAvailableSources() {
    var purchase = [];
    var subscribe = [];
  var queryUrl = 'http://api-public.guidebox.com/v2/movies/' + guideboxID + '?api_key=a4966dc9db26e3695465a5340bb66b205267cdc2';

  request(queryUrl, function(error, response, body) {
    var info = JSON.parse(body); // store parse string to variable

  // Retreiving 'Purchase Web Sources' as strings, e.g. iTunes, Google Play, Amazon, YouTube.
  // If the price does not exist or is not returned, we ignore that vendor.
    for (var i = 0; i < info.purchase_web_sources.length; i++) {
      var purchaseWebSources = info.purchase_web_sources[i].display_name;
      var purchaseWebLink = info.purchase_web_sources[i].link;
      console.log("purchasewebsource: ", purchaseWebSources);
      purchasewebsource:
      console.log("purchaseweblink: ", purchaseWebLink);
        if (info.purchase_web_sources[i].formats.length !== 0 && purchaseWebSources === "iTunes" || purchaseWebSources === "Amazon" || purchaseWebSources === "VUDU" || purchaseWebSources === "Google Play" || purchaseWebSources === "YouTube" || purchaseWebSources === "HBO (Via Amazon Prime)") {
          var purchaseWebPrice = info.purchase_web_sources[i].formats[0].price;
          var purchaseWebType = info.purchase_web_sources[i].formats[0].type;
          purchase.push(purchaseWebSources + ", " + purchaseWebLink + ", " + purchaseWebPrice + ", " + purchaseWebType);
          }
        else if (purchaseWebSources === "itunes" || purchaseWebSources === "Amazon" || purchaseWebSources === "VUDU" || purchaseWebSources === "Google Play" || purchaseWebSources === "YouTube" || purchaseWebSources === "HBO (Via Amazon Prime)"){
          purchase.push(purchaseWebSources + ", " + purchaseWebLink);
        }
        
          console.log("purchasewebprice: ", purchaseWebPrice);
          console.log("purchasewebtype: ", purchaseWebType);
        }


  // Retreiving 'Subscription Web Sources' - e.g Netflix, HBO Go, Hulu etc.
    for (var i = 0; i < info.subscription_web_sources.length; i++) {
      if (info.subscription_web_sources[i].length !== 0) {
      var subWebSource = info.subscription_web_sources[i].display_name;
      var subWebLink = info.subscription_web_sources[i].link;
      subscribe.push(subWebSource + ", " + subWebLink);
        }
      console.log("web source: ", subWebSource);
      console.log("web link: ", subWebLink);
      }
      var whereToBuy = {
    purchase: purchase,
    subscribe: subscribe
  }
  res.json(whereToBuy);
    }); // End of request
  // } // End of function

});

module.exports = router;
