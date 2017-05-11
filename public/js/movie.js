// Empty variables for recommendation posters
var rec1;
var rec2;
var rec3;

// On movie search click...

$("#movie-submit").on("click", function(event) {
  event.preventDefault();
  var movieTitle;

// Capture title of movie searched
  var newMovie = {
    movie: $("#movie").val().trim(),
    created_at: moment().format("YYYY-MM-DD HH:mm:ss")
  };

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

          /*
            FETCH GUIDEBOX DATA
          */
          console.log(data[0].guideBoxId);


    }
    else if (data.length === undefined) {
          $(".movieTitle").show().append("<p>Title: " + data[0].title + "</p>");
          // row.append("<p>Actors: " + data.actors +  "</p>");
          // row.append("<p>At " + data.created_at + "</p>");
          // row.append("<p>Director(s): " + data.director +  "</p>");
          // row.append("<p>Genre(s): " + data.genre +  "</p>");
          // row.append("<p>guidebox id: " + data.guideBoxId +  "</p>");
          // row.append("<p>plot: " + data.plot +  "</p>");
          // row.append("<p>poster:<img src='" + data.poster + "'><p>");
          // row.append("<p>rec1: " + data.rec1 + "<p>");
          // row.append("<p>rec2: " + data.rec2 + "<p>");
          // row.append("<p>rec3: " + data.rec3 + "<p>");
          // row.append("<p>Title: " + data.title +  "</p>");
          // row.append("<p>tmdbid: " + data.tmdbId +  "</p>");
          // row.append("<p>trailer link: " + data.trailer +  "</p>");
          // row.append("<p>Year: " + data.year +  "</p>");
          // row.append("</div>")
          // $("#movie-area").html(row);
    }

  });

  $("#movieSearchField").val("");

});
