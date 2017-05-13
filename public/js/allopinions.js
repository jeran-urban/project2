//need to edit jquery for new intention of display//
$(".btn").on("click", function(event) {
  var movieInfo = {id: this.id, opinion: $(this).val()};
  var opinion = {opinion: $(this).val()};
  // console.log(movieId);
  // console.log(opinion);
  var holder= $(this).parents()[1];
  console.log(holder);
  $(holder).hide();
  $.post("/profile", movieInfo, function(data) {
  });
});

$("body").on("click", function(){
if($('.float').children(':visible').length == 0) {
   console.log("It works");
   //insert new call for next 10 movies//
}});
$(".options").on("mouseenter", function(){
  $(this).children().css("opacity", 0.9);
});
$(".options").on("mouseleave", function(){
  $(this).children().css("opacity", 0.2)
});