/* global moment */
// When user clicks add-btn
$("#movie-submit").on("click", function(event) {
  event.preventDefault();
  var movieTitle
  

  // Make a newChirp object
  var newMovie = {
    movie: $("#movie").val().trim(),

    created_at: moment().format("YYYY-MM-DD HH:mm:ss")
  };

  console.log(newMovie);

  // Send an AJAX POST-request with jQuery
  $.post("/api/new", newMovie, function(data) {
    var row = $("<div>");
      row.addClass("movie");

      row.append("<p>" + newMovie.movie + " movied: </p>");
      row.append("<p>At " + moment(newMovie.created_at).format("h:mma on dddd") + "</p>");

      $("#movie-area").prepend(row);
      console.log(data);
      console.log(JSON.parse(data).Title);

      var url = "https://api.nytimes.com/svc/movies/v2/reviews/search.json";
        url += '?' + $.param({
          'api-key': "b4d652b1cd22416d93554a013e92dca8",
          'query': newMovie.author
        });
        $.ajax({
          url: url,
          method: 'GET',
        }).done(function(result) {

          console.log(result.results);
        }).fail(function(err) {
          throw err;
        });
      
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

// When the page loads, grab all of our chirps
$.get("/api/all", function(data) {

  if (data.length !== 0) {

    for (var i = 0; i < data.length; i++) {

      var row = $("<div>");
      row.addClass("movie");

      row.append("<p>" + data[i].movie + " movied.. </p>");
      row.append("<p>At " + moment(data[i].created_at).format("h:mma on dddd") + "</p>");

      $("#movie-area").prepend(row);
      console.log(data);

    }

  }

});
