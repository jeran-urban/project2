
// Empty variables for recommendation posters
var rec1;
var rec2;
var rec3;
var guideID = "";

/* global moment */
// When user clicks add-btn
var guideboxID = "";
$(".movie-submit").on("click", function(event) {
  event.preventDefault();
  if ($(".movie").val().trim() !== "") {
    var newMovie = {
      movie: $(".movie").val().trim(),
      created_at: moment().format("YYYY-MM-DD HH:mm:ss")
    };
  }
  else {
    var newMovie = {
      movie: this.id,
      created_at: moment().format("YYYY-MM-DD HH:mm:ss")
    };
  }

  if (newMovie.movie !== "") {
  $.post("/api/new", newMovie, function(data) {
    // console.log(data);
    if (typeof data === "string") {
      $("#movie-area").show();
      $(".details").hide();
      $(".rec1").hide();
      $(".rec2").hide();
      $(".rec3").hide();
      $(".view-trailer").hide();
      $(".view-sources").hide();
      $(".also-liked").hide();
      $(".movie-title-hr").hide();
      // console.log(data);
      var row = $("<div>");
          row.addClass("movie");
          row.append("<p>" + data + "</p>");
          row.append("</div>")
          $("#movie-area").html(row);
    }
    else if (data.length !== undefined) {
      $("#movie-area").hide();
      guideID = data[0].guideBoxId;
      $(".details").show();
      $('.backdrop').css('background-image', 'url(' + data[0].backdrop + ')');
      $(".moviePoster").show().attr("src", data[0].poster);
      $(".movieTitle").html(data[0].title);
      $(".movieYear").html(data[0].year + " / " + data[0].rating);
      $(".movieGenre").html(data[0].genre);
      $(".moviePlot").html(data[0].plot);
      $(".movieDirector").html("Director(s): " +data[0].director);
      $(".movieCast").html("Cast: " + data[0].actors);
      $(".view-trailer").show();
      $(".view-sources").show();
      $(".also-liked").html("<h3>People who liked this also liked... </h3>");
      // Recommendation Poster 1
      rec1 = data[0].rec1.split(",");
      $(".rec1").attr("src", rec1[2]);
      $(".rec1").attr("id", rec1[0]);
      // Recommendation Poster 2
      rec2 = data[0].rec2.split(",");
      $(".rec2").attr("src", rec2[2]);
      $(".rec2").attr("id", rec2[0]);
      // Recommendation Poster 3
      rec3 = data[0].rec3.split(",");
      $(".rec3").attr("src", rec3[2]);
      $(".rec3").attr("id", rec3[0]);

      $("#movieTrailer").attr("src", data[0].trailer);
      
      $(".rec1").show();
      $(".rec2").show();
      $(".rec3").show();
      $(".also-liked").show();
      $(".movie-title-hr").show();
    }
    else if (data.length === undefined) {
      $("#movie-area").hide();
      guideID = data.guideBoxId;
      $(".details").show();
      $('.backdrop').css('background-image', 'url(' + data.backdrop + ')');
      $(".moviePoster").show().attr("src", data.poster);
      $(".movieTitle").html(data.title);
      $(".movieYear").html(data.year + " / " + data.rating);
      $(".movieGenre").html(data.genre);
      $(".moviePlot").html(data.plot);
      $(".movieDirector").html(data.director);
      $(".movieCast").html(data.actors);
      $(".view-trailer").show();
      $(".view-sources").show();
      $(".also-liked").html("<h3>People who liked this also liked... </h3>");
      // Recommendation Poster 1
      rec1 = data.rec1.split(",");
      $(".rec1").attr("src", rec1[2]);
      $(".rec1").attr("id", rec1[0]);
      // Recommendation Poster 2
      rec2 = data.rec2.split(",");
      $(".rec2").attr("src", rec2[2]);
      $(".rec2").attr("id", rec2[0]);
      // Recommendation Poster 3
      rec3 = data.rec3.split(",");
      $(".rec3").attr("src", rec3[2]);
      $(".rec3").attr("id", rec3[0]);
      $("#movieTrailer").attr("src", data.trailer);

      
      $("#rec1").show();
      $("#rec2").show();
      $("#rec3").show();
      $(".also-liked").show();
      $(".movie-title-hr").show();
    }
  });
}
  $(".movie").val("");
});

$(".view-sources").on("click", function(event) {

  event.preventDefault();
  var guideBID = {guideboxID: guideID}
  $.post("/api/findmovie", guideBID, function(data) {
    $("#purchaseTableBody").empty();
    $("#streamingTableBody").empty();

    if (data.purchase.length === 0) {
      $("#purchaseTable").hide();
      $("#noPurchaseTable").show();
    }
    else {
      $("#purchaseTable").show();
      $("#noPurchaseTable").hide();
    }

    for (var i = 0; i < data.purchase.length; i++) {
      var newPurchaseArray = data.purchase[i].split(", ");
            $("#purchaseTableBody").append('<tr><td><a href="'+ newPurchaseArray[1] +'" target="_blank"><img class="ico" src="../images/' + newPurchaseArray[0] + '.ico"></a></td><td>' + newPurchaseArray[2] + '</td><td>' + newPurchaseArray[3] + '</td></tr>');
          }

      if (data.subscribe.length === 0) {
        $("#streamingTable").hide();
        $("#noStreamingTable").show();
      }
      else {
        $("#streamingTable").show();
        $("#noStreamingTable").hide();
      }

        for (var i = 0; i < data.subscribe.length; i++) {
          if (data.subscribe[i] !== undefined) {
            var newSubscribeArray = data.subscribe[i].split(", ");
            $("#streamingTableBody").append('<tr><td><a href="'+ newSubscribeArray[1] +'" target="_blank"><img class="ico" src="../images/' + newSubscribeArray[0] + '.ico"></a></td></tr>');
            console.log("hit");
        }
      }
    });
  });