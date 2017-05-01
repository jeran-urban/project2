
// Dependencies
// =============================================================
var express = require("express");
var bodyParser = require("body-parser");
var exphbs = require("express-handlebars");
var methodOverride = require("method-override");

var db = require("./models");
// Sets up the Express App
// =============================================================
var app = express();

app.use(methodOverride("_method"));
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Sets up the Express app to handle data parsing
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.text());
app.use(bodyParser.json({ type: "application/vnd.api+json" }));

// Static directory
app.use(express.static(process.cwd() + "/public"));
// Routes
// =============================================================
var routes = require("./controllers/movies_controller.js");

app.use("/", routes);

// Starts the server to begin listening
// =============================================================
app.listen(process.env.PORT || 8080,function(){
  process.env.PORT == undefined? console.log("App listening on Port 8080"):console.log("App listening on PORT" + process.env.PORT);
});
