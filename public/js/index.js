$(document).on( "mouseenter", ".poster", function(event) {
  $(this).find("iframe").show();
  $(this).find("img").hide();
  $("#overlay").animate({backgroundColor: "black"}, 150);
});

$(document).on( "mouseleave", ".poster", function(event){
  $(this).find("iframe").hide();
  $(this).find("img").show();
  $("#overlay").animate({backgroundColor: ""}, 150);
});