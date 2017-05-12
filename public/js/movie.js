<<<<<<< HEAD
// Empty variables for recommendation posters
var rec1;
var rec2;
var rec3;
var guideID = "";

// On movie search click...
$("#movie-submit").on("click", function(event) {
  event.preventDefault();

// Capture title of movie searched
=======
/* global moment */
// When user clicks add-btn
var guideboxID = "";
$("#movie-submit").on("click", function(event) {
  event.preventDefault();
  var movieTitle
>>>>>>> fbaa9615601f9b381a2e152ebfb1a38f2fc9c3a2
  var newMovie = {
    movie: $("#movie").val().trim(),
    created_at: moment().format("YYYY-MM-DD HH:mm:ss")
  };
<<<<<<< HEAD
=======

  console.log(newMovie);
>>>>>>> fbaa9615601f9b381a2e152ebfb1a38f2fc9c3a2

  $.post("/api/new", newMovie, function(data) {
    console.log(data);
    if (typeof data === "string") {
      console.log(data);
      var row = $("<div>");
          row.addClass("movie");
          row.append("<p>" + data + "</p>");
          row.append("</div>")
          $("#movie-area").html(row);
    }
    else if (data.length !== undefined) {
<<<<<<< HEAD
          guideID = data[0].guideBoxId;
          $(".moviePoster").show().attr("src", data[0].poster);
          $(".movieTitle").html(data[0].title);
          $(".movieYear").html(data[0].year);
          $(".movieGenre").html(data[0].genre);
          $(".moviePlot").html(data[0].plot);
          $(".movieDirector").html(data[0].director);
          $(".movieCast").html(data[0].actors);
          $(".view-trailer").show();
          $(".view-sources").show();
          // Recommendation Poster 1
          rec1 = data[0].rec1.split(",");
          console.log(rec1[2])
          $("#rec1").attr("src", rec1[2]);
          // Recommendation Poster 2
          rec2 = data[0].rec2.split(",");
          console.log(rec1[2])
          $("#rec2").attr("src", rec2[2]);
          // Recommendation Poster 3
          rec3 = data[0].rec3.split(",");
          console.log(rec1[2])
          $("#rec3").attr("src", rec3[2]);
          $("#movieTrailer").attr("src", data[0].trailer);
    }
    else if (data.length === undefined) {
          guideID = data.guideBoxId;
          $(".moviePoster").show().attr("src", data.poster);
          $(".movieTitle").html(data.title);
          $(".movieYear").html(data.year);
          $(".movieGenre").html(data.genre);
          $(".moviePlot").html(data.plot);
          $(".movieDirector").html(data.director);
          $(".movieCast").html(data.actors);
          $(".view-trailer").show();
          $(".view-sources").show();
          // Recommendation Poster 1
          rec1 = data.rec1.split(",");
          console.log(rec1[2])
          $("#rec1").attr("src", rec1[2]);
          // Recommendation Poster 2
          rec2 = data.rec2.split(",");
          console.log(rec1[2])
          $("#rec2").attr("src", rec2[2]);
          // Recommendation Poster 3
          rec3 = data.rec3.split(",");
          console.log(rec1[2])
          $("#rec3").attr("src", rec3[2]);
          $("#movieTrailer").attr("src", data.trailer);
        }
      });
          $("#movieSearchField").val("");
    });



$(".view-sources").on("click", function(event) {
  event.preventDefault();
  var guideBID = {guideboxID: guideID}
    $.post("/api/findmovie", guideBID, function(data) {
      console.log(data);
    });
});



// $("#guide-submit").on("click", function(event) {
//   event.preventDefault();
//   var guideID = {guideboxID: guideboxID}
//   $.post("/api/findmovie", guideID, function(data) {
//     console.log(data);
//   });
// });
=======
      guideboxID = data[0].guideBoxId;

        var row = $("<div>");
          row.addClass("movie");
          row.append("<p>Actors: " + data[0].actors +  "</p>");
          row.append("<p>At " + data[0].created_at + "</p>");
          row.append("<p>Director(s): " + data[0].director +  "</p>");
          row.append("<p>Genre(s): " + data[0].genre +  "</p>");
          row.append("<p>guidebox id: " + data[0].guideBoxId +  "</p>");
          row.append("<p>plot: " + data[0].plot +  "</p>");
          row.append("<p>poster:<img src='" + data[0].poster + "'><p>");
          row.append("<p>rec1: " + data[0].rec1 + "<p>");
          row.append("<p>rec2: " + data[0].rec2 + "<p>");
          row.append("<p>rec3: " + data[0].rec3 + "<p>");
          row.append("<p>Title: " + data[0].title +  "</p>");
          row.append("<p>tmdbid: " + data[0].tmdbId +  "</p>");
          row.append("<p>trailer link: " + data[0].trailer +  "</p>");
          row.append("<p>Year: " + data[0].year +  "</p>");
          row.append("</div>")
          $("#movie-area").html(row);
    }
    else if (data.length === undefined) {
      guideboxID = data.guideBoxId;
      var row = $("<div>");
          row.addClass("movie");
          row.append("<p>Actors: " + data.actors +  "</p>");
          row.append("<p>At " + data.created_at + "</p>");
          row.append("<p>Director(s): " + data.director +  "</p>");
          row.append("<p>Genre(s): " + data.genre +  "</p>");
          row.append("<p>guidebox id: " + data.guideBoxId +  "</p>");
          row.append("<p>plot: " + data.plot +  "</p>");
          row.append("<p>poster:<img src='" + data.poster + "'><p>");
          row.append("<p>rec1: " + data.rec1 + "<p>");
          row.append("<p>rec2: " + data.rec2 + "<p>");
          row.append("<p>rec3: " + data.rec3 + "<p>");
          row.append("<p>Title: " + data.title +  "</p>");
          row.append("<p>tmdbid: " + data.tmdbId +  "</p>");
          row.append("<p>trailer link: " + data.trailer +  "</p>");
          row.append("<p>Year: " + data.year +  "</p>");
          row.append("</div>")
          $("#movie-area").html(row);
    }
      // var url = "https://api.nytimes.com/svc/movies/v2/reviews/search.json";
      //   url += '?' + $.param({
      //     'api-key': "b4d652b1cd22416d93554a013e92dca8",
      //     'query': newMovie.movie
      //   });
      //   $.ajax({
      //     url: url,
      //     method: 'GET',
      //   }).done(function(result) {
          

      //     console.log(result.results);
      //   }).fail(function(err) {
      //     throw err;
      //   });
  });
  // Empty each input box by replacing the value with an empty string
  $("#movie").val("");
});

$("#guide-submit").on("click", function(event) {
  event.preventDefault();
  var guideID = {guideboxID: guideboxID} 

  $.post("/api/findmovie", guideID, function(data) {
    console.log(data);
  });
});

>>>>>>> fbaa9615601f9b381a2e152ebfb1a38f2fc9c3a2
