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
      sendBack.push(result[i].dataValues);
    }
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
  // console.log("user ", req.user);
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
  res.render('login');
});

router.get("/members", isAuthenticated, function(req, res) {
  var noRecs = false;
  console.log("++++++++++++++++++++++++++++");
  console.log("status 4: " + res.statusCode);
  console.log("++++++++++++++++++++++++++++");
  console.log("user ", req.user);
  console.log("sent to recommms");
  db.user.findOne({
    where: {id: req.user.id}
  }).then(function(result1) {
    if (result1.dataValues.likes !== null && result1.dataValues.dislikes !== null){
      var recsForHtml = recommendation(req, res, req.user.id);
    }
    else {
      noRecs = true;
      genreCall(req, res)
    }
  });
  function genreCall(req, res) {
    var user = {name: req.user.name};
    db.movie.findAll({}).then(function(result) {
      var recs = [];
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
        else if (noRecs) {
            console.log("got to if");
            recsForHtml.push(result[i].dataValues);
        }
      }
      console.log("recs from controller: ", recsForHtml);
      var genreToHtml = {
        recs: recsForHtml,
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
  }

  var allUsers = {};
  var username;
  var likes = [];
  var dislikes = [];
  var top5Users = [];
  var recsForHtml = [];
  var recommendationsForCallback = [];

  var CurrentUser = function(userId, username, likes, dislikes) {
    this.id = userId,
    this.username = username,
    this.likes = likes,
    this.dislikes = dislikes,
    this.top5Users = []
  }

  var ComparisonUser = function(compUserId, username, likes, dislikes) {
    this.compUserId = compUserId,
    this.username = username,
    this.likes = likes,
    this.dislikes = dislikes,
    this.jcScore = 0
  }

  function recommendation(req, res, userId) {

    db.user.findAll({}).then(function(result) {
      allUsers = result;

      if (Object.keys(allUsers).indexOf(String(userId))) {
        var ixUser = parseInt(Object.keys(allUsers).indexOf(String(userId))) -1;
        // var userDbInfo = Object.values(allUsers)[ixUser];
        var vals = Object.keys(allUsers).map(function(key) {
            console.log("key ", allUsers[ixUser]);
            return allUsers[ixUser];
        });
        // console.log("vals ", vals[0].dataValues);
        var userDbInfo = vals[0].dataValues;
        let username = userDbInfo.userName;
        let likes = userDbInfo.likes.split(", ");
        let dislikes = userDbInfo.dislikes.split(", ");

        currentUser = new CurrentUser(userId, username, likes, dislikes);
      };
    }).then(function() {

      var allUsersSize = Object.keys(allUsers).length;

        for (var i = 0; i < allUsers.length; ++i) {
          if (allUsers[i].likes !== null && allUsers[i].dislikes !== null) {
            if (allUsers[i].id !== userId && allUsers[i].likes.length > 4 && allUsers[i].dislikes.length > 4) {
              let compUserId = allUsers[i].id;
              let username = allUsers[i].userName;

              if (allUsers[i].likes === null) {
                  var likes = [];
              }
              else {
                  var likes = allUsers[i].likes.split(", ");
              }
              if (allUsers[i].dislikes === null) {
                  var dislikes = [];
              }
              else {
                  var dislikes = allUsers[i].dislikes.split(", ");
              }

              comparisonUser = new ComparisonUser(compUserId, username, likes, dislikes);

              // console.log("comparisonUser ", comparisonUser);
              jaccardCoefficient(currentUser, comparisonUser);
              calcFromTop5();
            } // if
          } // if
        } //for
        // console.log("OLD user top 5: ", currentUser.top5Users);
        
        var newCurrentUserArray = []
        for (i =0; i < 5; i++) {
          let comparisonArr = [];
          for (iz =0; iz < currentUser.top5Users.length; iz++){
            comparisonArr.push(parseFloat(currentUser.top5Users[iz][4]));
          }
          var maxIndex = comparisonArr.indexOf(Math.max(...comparisonArr));

          newCurrentUserArray.push(currentUser.top5Users[maxIndex]);
          currentUser.top5Users.splice(maxIndex, 1);
        }
        currentUser.top5Users = newCurrentUserArray;
        // console.log("new current user top 5: ", currentUser);

        for (i = 0; i < currentUser.top5Users.length; i++) {
          if (currentUser.top5Users[i][2] !== null) {
            for (ix = 0; ix < currentUser.top5Users[i][2].length; ix++) {
              if (currentUser.likes.indexOf(currentUser.top5Users[i][2][ix]) < 0 && currentUser.dislikes.indexOf(currentUser.top5Users[i][2][ix]) < 0 && recommendationsForCallback.indexOf(currentUser.top5Users[i][2][ix]) < 0) {
                recommendationsForCallback.push(currentUser.top5Users[i][2][ix]);

                if (recommendationsForCallback.length >= 10) {
                  break;
                } // third if 
              } // second if
            } // second for
          } // first if
          if (recommendationsForCallback.length >= 10) {
            break;
          }
        } // first for
        db.movie.findAll(
          {where : 
            {tmdbId: [recommendationsForCallback]
            }
          }
        ).then(function(result){
          // console.log(result);
          for (i=0; i < result.length; i++) {
            recsForHtml.push(result[i].dataValues);
          }
          genreCall(req, res);
          // console.log("recs from .js ", recsForHtml);  
        });
        console.log("send Back recs: ",recommendationsForCallback);
    }); // end db call
  }; // end recommendation function

  function jaccardCoefficient(currentUser, comparisonUser) {
    var similarity = 0;
    var finalJaccard = 0;
    var finalJaccardScore = 0;
    var ratedInCommon = 0;

    var user1LikedSet = currentUser.likes;
    var user1DislikedSet = currentUser.dislikes;
    var user2LikedSet = comparisonUser.likes;
    var user2DislikedSet = comparisonUser.dislikes;

    // retrieving a set of the users likes incommon
    var results1 = sinter(user1LikedSet, user2LikedSet); 
    // console.log("likes incommon ", results1);
    // retrieving a set of the users dislike incommon
    var results2 = sinter(user1DislikedSet, user2DislikedSet); 
    // console.log("dislikes in common ", results2);
    // retrieving a set of the users like and dislikes that they disagree on
    var results3 = sinter(user1LikedSet, user2DislikedSet); 
    // console.log("users likes and dislikes disagreed on ", results3);
    // retrieving a set of the users like and dislikes that they disagree on
    var results4 = sinter(user1DislikedSet, user2LikedSet); 
    // console.log("user likes and dislikes they disagreed on ", results4);
    // calculating the sum of the similarities minus the sum of the disagreements
    similarity = (results1.length + results2.length - results3.length - results4.length);
    // console.log("similarity ", similarity);
    // calculating the number of movies rated incommon
    ratedInCommon = (results1.length + results2.length + results3.length + results4.length);
    // console.log("ratedInCommon ", ratedInCommon);
    // calculating the the modified jaccard score. similarity / num of comparisons made incommon
    if (similarity !== 0 && ratedInCommon !== 0) {
        finalJaccardScore = similarity / ratedInCommon;
    }
    else {
        finalJaccardScore = 0;
    }
    comparisonUser.jcScore = finalJaccardScore;
    // console.log("final js score: ", finalJaccardScore);
    // console.log("comp score: ", comparisonUser.jcScore);
  }; // end Jaccard Coefficient

  function sinter(user1array, user2array) {
    // console.log("sinter ", user1array, user2array);
    var cb = [];
    for (i = 0; i < user1array.length; i++) {
      if (user2array.indexOf(user1array[i]) !== -1) {
        cb.push(user1array[i]);
      }
    }
    // console.log("sinter cb: ", cb);
    return cb;
  }

  function calcFromTop5() {
    // comparisonUser.jcScore = Math.random() * 5;
    if (currentUser.top5Users.length < 5) {
      var arrayPush = [comparisonUser.compUserId, comparisonUser.username, comparisonUser.likes, comparisonUser.dislikes, comparisonUser.jcScore];
      currentUser.top5Users.push(arrayPush);
    }
    else {
      let comparisonArr = [];

      for (ix = 0; ix < currentUser.top5Users.length; ix++) {
        comparisonArr.push(parseFloat(currentUser.top5Users[ix][4]));
        // console.log("top5: ", currentUser.top5Users[ix]);     
      }
      var minIndex = comparisonArr.indexOf(Math.min(...comparisonArr));

      if (currentUser.top5Users[minIndex][4] < comparisonUser.jcScore) {
        var replaceIndex = [comparisonUser.compUserId, comparisonUser.username, comparisonUser.likes, comparisonUser.dislikes, comparisonUser.jcScore];
        currentUser.top5Users.splice(minIndex, 1, replaceIndex);
        // console.log("new array: ", currentUser.top5Users);                    
      }
    } //else
  }
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

    if(result.dataValues.likes !== null && result.dataValues.dislikes !== null){
      likes = result.dataValues.likes.split(", ");
      dislikes = result.dataValues.dislikes.split(", ");
      
      db.movie.findAll({where: {tmdbId: likes }}).then(function(result){

        for (i=0; i < result.length; i++) {
          sendBackLike.push(result[i].dataValues)
        };
        console.log(sendBackLike);
      
        db.movie.findAll({where: {tmdbId: dislikes }}).then(function(result){
          for (x=0; x < result.length; x++) {
            sendBackDislike.push(result[x].dataValues)
          };

          var photos = {photoLike: sendBackLike, photoDislike: sendBackDislike, user: user};
          console.log("photos ", photos);
          res.render('profile', photos);
        });
      });
      // res.json(result);
    }

    else if (result.dataValues.likes !== null && result.dataValues.dislikes === null) {
      likes = result.dataValues.likes.split(", ");
      db.movie.findAll({where: {tmdbId: likes }}).then(function(result){

        for (i=0; i < result.length; i++) {
          sendBackLike.push(result[i].dataValues)
        };
        console.log(sendBackLike);
        sendBackDislike = [];
        var photos = {photoLike: sendBackLike, photoDislike: sendBackDislike};
          console.log("photos ", photos);
          res.render('profile', photos);
        });
    }
    else if (result.dataValues.likes === null && result.dataValues.dislikes !== null) {
      likes = result.dataValues.dislikes.split(", ");
      db.movie.findAll({where: {tmdbId: dislikes }}).then(function(result){

        for (i=0; i < result.length; i++) {
          sendBackDislike.push(result[i].dataValues)
        };
        console.log(sendBackLike);
        sendBackLike = [];
        var photos = {photoLike: sendBackLike, photoDislike: sendBackDislike};
          console.log("photos ", photos);
          res.render('profile', photos);
        });
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
  var user = {id: req.user.id};
  var likeOpinions = [];
  var dislikeOpinions=[];
  var sendBack=[];
  var opinions = "";
  db.user.findOne({where: {id: user.id}}).then(function(result) {
    if (result.dataValues.likes !== null && result.dataValues.dislikes !== null) {
      opinions = result.dataValues.likes + ", " + result.dataValues.dislikes;
    }
    else if (result.dataValues.likes !== null){
      opinions = result.dataValues.likes;
    } 
    else if (result.dataValues.dislikes !== null) {
      opinions = result.dataValues.dislikes;
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
        for (i=0; i < result.length; i++) {
          sendBack.push(result[i].dataValues);
          // console.log("sendBack", sendBack);
        }
        var photos = {photo: sendBack};
    console.log("photos ", photos);
    res.render('allopinions', photos);
      });
    }

    else {
      db.movie.findAll({}).then(function(result) {
        for (i=0; i < result.length; i++) {
          sendBack.push(result[i].dataValues);
          // console.log("sendBack", sendBack);
        }
      });
      var photos = {photo: sendBack};
    console.log("photos ", photos);
    res.render('allopinions', photos);
    }

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
  if (movieId !== "") {
    db.user.findOne({
      where: {id: userId}
    }).then(function(result1) {
      if (result1.dataValues.likes !== null){
        likes = result1.dataValues.likes.split(", ");
        console.log("1 ", likes);
      }
      if (result1.dataValues.dislikes !== null){
        dislikes = result1.dataValues.dislikes.split(", ");
        console.log("2 ", dislikes);
      }
      if (likes.indexOf(movieId) !== -1) {
        likeExist = true;
      }
      else if (dislikes.indexOf(movieId) !== -1) {
        dislikeExist = true;
      }

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
              console.log("3 ", likesToPush);
          }
          else {
            likesToPush = movieId;
            console.log("4 ", likesToPush);
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
            console.log("5 ", dislikesToPush);
          }
          else {
            dislikesToPush = movieId;
            console.log("6 ", dislikesToPush);
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
          console.log("7 ", likesToPush);
        }
        else {
          likesToPush = null;
        }
        if (result1.dataValues.dislikes !== null) {
          dislikesToPush = result1.dataValues.dislikes + ", " + movieId;
          console.log("8 ", dislikesToPush);
        }
        else {
          dislikesToPush = movieId;
          console.log("9 ", dislikesToPush);
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
          console.log("10 ", dislikesToPush);
        }
        else {
          dislikesToPush = null;
        }
        if (result1.dataValues.likes !== null) {
            likesToPush = result1.dataValues.likes + ", " + movieId;
            console.log("11 ", likesToPush);
        }
        else {
          likesToPush = movieId;
          console.log("11 ", likesToPush);
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
  }
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
  db.movie.findAll({where: {tmdbId: req.body.id}}).then(function(result) {

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
  var backdrop = "";
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
            trailer = "https://www.youtube.com/embed/" + JSON.parse(bod).videos.results[0].key + "?rel=0&autoplay=1";
            }
            else {
              trailer = "Sorry, No trailer is currently available";
            }
            if(JSON.parse(bod).recommendations.results.length !== 0) {
              poster = "https://image.tmdb.org/t/p/w500" + JSON.parse(bod).poster_path;
              backdrop = "https://image.tmdb.org/t/p/original" + JSON.parse(bod).backdrop_path;

              for(i = 0; i < 3; i++) {
                if (JSON.parse(bod).recommendations.results[i] !== undefined) {
                  recommendations.push(
                    JSON.parse(bod).recommendations.results[i].title + ", " +
                    JSON.parse(bod).recommendations.results[i].id + ", " +
                    "https://image.tmdb.org/t/p/w500" + JSON.parse(bod).recommendations.results[i].poster_path);
                }
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
      rating: JSON.parse(movieDetailsOmdb.omdb).Rated,
      director: JSON.parse(movieDetailsOmdb.omdb).Director,
      actors: JSON.parse(movieDetailsOmdb.omdb).Actors,
      poster: poster,
      backdrop: backdrop,
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
  var guideboxID = req.body.guideboxID;
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
      
      purchasewebsource:
      console.log("purchaseweblink: ", purchaseWebLink);
        if (purchaseWebSources.indexOf("(Via Amazon Prime)") !== -1) {
          purchaseWebSources = "Prime";
        }
        console.log("purchasewebsource: ", purchaseWebSources);

        if (info.purchase_web_sources[i].formats.length !== 0 && purchaseWebSources === "iTunes" || purchaseWebSources === "Amazon" || purchaseWebSources === "VUDU" || purchaseWebSources === "Google Play" || purchaseWebSources === "YouTube" || purchaseWebSources === "Prime") {
            var purchaseWebPrice = info.purchase_web_sources[i].formats[0].price;
            var purchaseWebType = info.purchase_web_sources[i].formats[0].type;
            purchase.push(purchaseWebSources + ", " + purchaseWebLink + ", " + purchaseWebPrice + ", " + purchaseWebType);
        }
        
        else if (purchaseWebSources === "itunes" || purchaseWebSources === "Amazon" || purchaseWebSources === "VUDU" || purchaseWebSources === "Google Play" || purchaseWebSources === "YouTube" || purchaseWebSources === "Prime"){
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
        if (subWebSource.indexOf("(Via Amazon Prime)") !== -1) {
          subWebSource = "Prime";
        }

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
});

module.exports = router;
