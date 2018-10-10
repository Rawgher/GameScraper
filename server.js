var express = require("express");
var mongoose = require("mongoose");
var exphbs = require("express-handlebars");

// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server


// Require all models

var PORT = 8080;

// Initialize Express
var app = express();

// Configure middleware

// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

// Connect to the Mongo DB
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/gamescraper";

mongoose.connect(MONGODB_URI, { useNewUrlParser: true });

// Handlebars
app.engine(
    "handlebars",
    exphbs({
      defaultLayout: "main"
    })
  );
  app.set("view engine", "handlebars");

// Routes
require("./routes/html-routes")(app)
// require("./routes/saved-routes")(app)
require("./routes/scrape-routes")(app)


// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
