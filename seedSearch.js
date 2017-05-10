var moviesSeed = ["Beauty and the Beast", "Blazing Saddles", "Blow", "Brute Force", "Captain America", "Cars", "Cars 2", "Cinderella", "Colossal", "Dial M for Murder", "Free Fire", "Frozen", "Get Out", "Ghost in the Shell", "Grease", "Into the Woods", "Iron Man", "It", "John Wick", "Kubo and the Two Strings", "La La Land", "Les Miserables", "Life", "Logan", "Mary Poppins", "Mildred Pierce", "Moana", "Mulan", "Rings", "Rogue One", "Sing", "Spirited Away", "Split", "Star Wars: Episode IV - A New Hope", "Suicide Squad", "Sunset Boulevard", "The Blues", "Brothers", "The Boss Baby", "The Circle", "The Fate of the Furious", "The Godfather", "The Good, the Bad and the Ugly", "The Hateful Eight", "The Lion King", "The Magnificent Seven", "The Maltese Falcon", "The Revenant", "The Secret Life of Pets", "The Silence of the Lambs", "The Smurfs", "The Third Man", "Tombstone", "Trolls", "Young Frankenstein", "Your Name.", "Zootopia", "Moulin Rouge", "Moulin Rouge!"]

$("#movie-submit").on("click", function(event) {
    event.preventDefault();
    var movieTitle
  
    for (var i = 0; i < moviesSeed.length; i++) {
        var movie = moviesSeed[i]
        console.log(movie);
        var newMovie = {
            movie: movie,
            created_at: moment().format("YYYY-MM-DD HH:mm:ss")
        };
        console.log(newMovie);

        $.post("/api/new", newMovie, function(data) {
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
        });
    }
});