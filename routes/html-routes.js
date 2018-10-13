var axios = require("axios");
var cheerio = require("cheerio");
const db = require("../models");
// const request = require("request");
// const extract = require('meta-extractor');

module.exports = function (app) {

    app.get("/", function (req, res) {
        db.News.find({}).sort({ _id: -1 }).then(function (dbNews) {
            res.render("index", {
                title: "Home",
                news: dbNews
            });
        });
    });

    // A GET route for scraping the echoJS website
    app.get("/scrape", function (req, res) {

        // First, we grab the body of the html with axios
        axios.get("http://www.theverge.com/games").then(function (response) {

            // Then, we load that into cheerio and save it to $ for a shorthand selector
            var $ = cheerio.load(response.data);
            // Now, we grab every h2 within an article tag, and do the following:
            $(".c-entry-box--compact--article").each(function (i, element) {

                // Save an empty result object
                var result = {};

                // Add the text and href of every link, and save them as properties of the result object
                result.title = $(this).children("div").children("h2").children("a").text();

                result.link = $(this).children("div").children("h2").children("a").attr("href");

                var myRegex = new RegExp('src="(.+)">', 'g');
                var noscript_string = $(this).children("a").children("div").children("noscript").text();

                result.image = myRegex.exec(noscript_string);

                if (result.image != null && result.image.length > 0) { result.image = result.image[1] }
                else result.image = ""

                axios.get(result.link).then(function (response) {

                    // Then, we load that into cheerio and save it to $ for a shorthand selector
                    var $ = cheerio.load(response.data);
    
                    $("meta[name='description']").each(function (i, element) {
                        // If we were able to successfully scrape and save an Article, send a message to the client
    
                        result.description = $(this).attr("content")
    
                        db.News.create(result)
                            .then(function (dbNews) {
                                // View the added result in the console
                                console.log(dbNews);
                                
                            })
                            .catch(function (err) {
                                // If an error occurred, send it to the client
                                // return res.json(err);
                            });
    
                        
                    })
                    
                    
    
    
                })


            })


            setTimeout(function(){res.redirect("/")},5000);

        })


    })


    // Route for getting all Articles from the db
    app.get("/articles", function (req, res) {
        // Grab every document in the Articles collection
        db.News.find({}).sort({ _id: -1 })
            .then(function (dbNews) {
                // If we were able to successfully find Articles, send them back to the client
                res.json(dbNews);
            })
            .catch(function (err) {
                // If an error occurred, send it to the client
                res.json(err);
            });
    });

    //   // Route for grabbing a specific Article by id, populate it with it's note
    //   app.get("/articles/:id", function(req, res) {
    //     // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
    //     db.Article.findOne({ _id: req.params.id })
    //       // ..and populate all of the notes associated with it
    //       .populate("note")
    //       .then(function(dbArticle) {
    //         // If we were able to successfully find an Article with the given id, send it back to the client
    //         res.json(dbArticle);
    //       })
    //       .catch(function(err) {
    //         // If an error occurred, send it to the client
    //         res.json(err);
    //       });
    //   });

    // Route for saving/updating an Article's associated Note
    //   app.post("/articles/:id", function(req, res) {
    //     // Create a new note and pass the req.body to the entry
    //     db.Note.create(req.body)
    //       .then(function(dbNote) {
    //         // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
    //         // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
    //         // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
    //         return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
    //       })
    //       .then(function(dbArticle) {
    //         // If we were able to successfully update an Article, send it back to the client
    //         res.json(dbArticle);
    //       })
    //       .catch(function(err) {
    //         // If an error occurred, send it to the client
    //         res.json(err);
    //       });
    //   });

    app.get("/saved", function (req, res) {
        db.News.find({}).then(function (dbNews) {
            res.render("saved", {
                title: "Saved Articles",
                news: dbNews
            }).catch(function (err) {
                res.json(err);
            })
        });
    });

    app.get("/clear", function (req, res) {
        db.News.remove({}, function (err, res) {
            if (err) {
                console.log(err);
            } else {
                console.log("removed all articles")
            }
        })
        res.redirect("/");
    })
};