$(document).ready(function() {
  // This file just does a GET request to figure out which user is logged in
  // and updates the HTML on the page
  $.get("/api/user_data").then(function(data) {
    $(".member-name").text(data.email);
  });
});



// Populate data to modal
$(".poster").on("click", function(event) {

  var movieId = {id: this.id};
  console.log(movieId);

  $.post("/api/find", movieId, function(data) {
    }).then(function(data) {
        var movieTrailer = data[0].title;
        var movieYear = data[0].year;
        var moviePlot = data[0].plot;
        var movieGenre = data[0].genre;
        var movieActors = data[0].actors;
        var movieDirector = data[0].director;
        $("#posterModalTitle").text(movieTrailer);
        $("#posterModalYear").text(movieYear);
        $("#posterModalPlot").text(moviePlot);
        $("#posterModalGenre").text(movieGenre);
        $("#posterModalDirector").text("Director: " + movieDirector);
        $("#posterModalCast").text("Cast: " + movieActors);
    });
});
