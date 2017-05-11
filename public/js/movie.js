/* global moment */
// When user clicks add-btn
$("#movie-submit").on("click", function(event) {
  event.preventDefault();
  var movieTitle;


  // Make a newChirp object
  var newMovie = {
    movie: $("#movie").val().trim(),
    created_at: moment().format("YYYY-MM-DD HH:mm:ss")
  };


  console.log(newMovie);

  // Send an AJAX POST-request with jQuery
  $.post("/api/new", newMovie, function(data) {
    // console.log(data);
    // if (typeof data === "string") {
    //   console.log(data);
    // }
    console.log(data);

if (data.length !== undefined) {
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
      $("#movie-area").prepend(row);
}
else {
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
      $("#movie-area").prepend(row);
}


      // console.log(data);
      // console.log(JSON.parse(data).Title);


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
    // On success, run the following code
    // .done(function() {

    //   var row = $("<div>");
    //   row.addClass("chirp");

    //   row.append("<p>" + newMovie.author + " chirped: </p>");
    //   row.append("<p>" + newMovie.body + "</p>");
    //   row.append("<p>At " + moment(newMovie.created_at).format("h:mma on dddd") + "</p>");

    //   $("#chirp-area").prepend(row);

    // });

  // Empty each input box by replacing the value with an empty string
  $("#movie").val("");

});
