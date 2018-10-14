const express = require("express");
const mongoose = require("mongoose");
const exphbs = require("express-handlebars");


const PORT = process.env.PORT || 8080;

// Initialize Express
var app = express();

// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

// Handlebars
app.engine(
  "handlebars",
  exphbs({
    defaultLayout: "main"
  })
);
app.set("view engine", "handlebars");

// Connect to the Mongo DB
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/gamescraper";

mongoose.connect(MONGODB_URI, { useNewUrlParser: true });

// Routes
require("./routes/html-routes")(app)


// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
