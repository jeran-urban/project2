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
    // console.log(data);
    if (typeof data === "string") {
      console.log(data);
    }
    else if (JSON.parse(data).Title !== undefined) {
    var row = $("<div>");
      row.addClass("movie");
      row.append("<p>At " + moment(newMovie.created_at).format("h:mma on dddd") + "</p>");
      row.append("<p>Title: " + JSON.parse(data).Title +  "</p>");
      row.append("<p>Year: " + JSON.parse(data).Year +  "</p>");
      row.append("<p>Genre(s): " + JSON.parse(data).Genre +  "</p>");
      row.append("<p>Director(s): " + JSON.parse(data).Director +  "</p>");
      row.append("<p>Actors: " + JSON.parse(data).Actors +  "</p>");
      row.append("<p>img link: " + JSON.parse(data).Poster + "<p>");
      row.append("<p><img src='" + JSON.parse(data).Poster +  "'</img></p>");
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

