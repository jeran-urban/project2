// Empty variables for recommendation posters
var rec1;
var rec2;
var rec3;
var guideID = "";
var string;
var array;

/* global moment */
// When user clicks add-btn
var guideboxID = "";
$("#movie-submit").on("click", function(event) {
  event.preventDefault();

  var newMovie = {
    movie: $("#movie").val().trim(),
    created_at: moment().format("YYYY-MM-DD HH:mm:ss")
  };

  console.log(newMovie);

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
      // console.log(data.purchase);
      // console.log(data.subscribe);
      for (var i = 0; i < data.purchase.length; i++) {
        if (data.purchase.length !== 0) {
          console.log(data.purchase[i]);
          var newPurchaseArray = data.purchase[i].split(", ");
          
          if (data.subscribe.length !== 0) {
            var newSubscribeArray = data.subscribe[i].split(", ");
            $("#modalTable").append('<tr><td><img src="../images/' + newPurchaseArray[0] + '.jpg" href="'+ newPurchaseArray[1] +'"></td><td>' + newPurchaseArray[2] + '</td><td>' + newPurchaseArray[3] + '</td><td><img src="../images/' + newSubscribeArray[0] + '.jpg" href="'+ newSubscribeArray[1] +'"></td></tr>');
          }
          else {
            $("#modalTable").append('<tr><td><img src="../images/' + newPurchaseArray[0] + '.jpg" href="'+ newPurchaseArray[1] +'"></td><td>' + newPurchaseArray[2] + '</td><td>' + newPurchaseArray[3] + '</td><tr>');
          }
        /*  newArray[0] = Source
            newArray[1] = Link
            newArray[2] = Price
            newArray[3] = Rent/Buy
        */



      }
    }
  });
});
