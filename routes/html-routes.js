const axios = require("axios");
const cheerio = require("cheerio");
const db = require("../models");

module.exports = function (app) {

    app.get("/", function (req, res) {
        db.News.find({}).sort({ _id: -1 }).then(function (dbNews) {
            res.render("index", {
                title: "Home",
                news: dbNews
            });
        });
    });

    // Get route for scraping theverge.com/games
    app.get("/scrape", function (req, res) {

        // Function that initially grabs the info from the page
        axios.get("http://www.theverge.com/games").then(function (response) {

            var $ = cheerio.load(response.data);

            $(".c-entry-box--compact--article").each(function (i, element) {

                // Save an empty result object
                var result = {};

                // Make variables for what I need to grab 
                result.title = $(this).children("div").children("h2").children("a").text();

                result.link = $(this).children("div").children("h2").children("a").attr("href");

                // Regex function to get only the src from the noscript tag on the page
                var myRegex = new RegExp('src="(.+)">', 'g');
                var noscript_string = $(this).children("a").children("div").children("noscript").text();

                result.image = myRegex.exec(noscript_string);

                // Function to grab the result.image that I want from the regex string
                if (result.image != null && result.image.length > 0) { result.image = result.image[1] }
                else result.image = ""

                // Second axios call that goes into each article to grab the meta tag holding the article description
                axios.get(result.link).then(function (response) {

                    var $ = cheerio.load(response.data);

                    $("meta[name='description']").each(function (i, element) {

                        result.description = $(this).attr("content")

                        // Inserts all results into the database. InsertMany() is used to avoid duplicate entries
                        db.News.insertMany(result)
                            .then(function (dbNews) {

                                // View the added result in the console
                                console.log(dbNews);

                            })
                            .catch(function (err) {
                                // return res.json(err);
                            });

                    })

                })

            })

            // Timeout to force the redirect to wait for the scrape to finish
            setTimeout(function () { res.redirect("/") }, 5000);


            // move the database call around here
            // somehow push the results from both calls above to be called by the database call
            // bingo bango bongo it works
        })

    })


    // Route for getting all articles from the db and return it as json
    app.get("/news", function (req, res) {
        // Grab every document in the news collection
        db.News.find({}).sort({ _id: -1 })
            .then(function (dbNews) {
                res.json(dbNews);
            })
            .catch(function (err) {
                // If an error occurred, send it to the client
                res.json(err);
            });
    });

    // Route for grabbing a specific news article
    app.get("/read/:id", function (req, res) {
        // Function to find the specific news article
        db.News.findOne({ _id: req.params.id }).populate("notes").then(function (dbNews) {
            res.render("read", {
                title: "Notes",
                news: dbNews
            });
        });
    });

    // Route for adding a note to a specific news article
    app.post("/read/:id", function (req, res) {

        // Creating the note and adding it to the collection
        db.Notes.create(req.body, function (err, res) {
            if (err) {
                console.log(err)
            } else {
                // Finding the news article that the note shoudl be added to
                db.News.findOneAndUpdate({ "_id": req.params.id }, { $push: { "notes": res._id } }, { safe: true, upsert: true, new: true })
                    .exec(function (err, doc) {
                        if (err) {
                            doc.send(err);
                        }
                    })
            }
        })
        // Redirecting to the article the user was commenting on
        res.redirect("/read/" + req.params.id)
    });

    // Route that shows all articles that the user saved
    app.get("/saved", function (req, res) {
        db.News.find({ saved :true }).then(function (dbNews) {
            res.render("saved", {
                title: "Saved Articles",
                news: dbNews,
                // Conditional (ternary) Operator Jose helped me with
                saved: dbNews.length > 0 ? true : false
            })
        });
    });

    // Route that updates an article and setting its saved value to true
    app.get("/saveIt/:id", function (req, res) {
        db.News.updateOne({ _id: req.params.id }, { $set: { saved: true } }, function (err) {
        })
        res.redirect("/")
    })

    // Route to empty out the whole news collection
    // Might want to add a function to delete all notes. Should still work since the new article ID's will not match up 
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

    // Route to delete an article by its id
    app.get("/delete/:id", function (req, res) {
        db.News.deleteOne({ _id: req.params.id }, function (err) {
            if (err) return handleError(err);
        });
        res.redirect("/saved")
    });

    // Route to delete a specific comment from a news article
    app.delete("/read/:id/:noteid", function (req, res) {
 
        db.Notes.findByIdAndRemove(req.params.noteid, function (err, doc) {
            if (err) { console.log(err)
            } else {
                db.News.findOneAndUpdate({
                    "_id": req.params.id
                }, {
                    $pull: {
                        "notes": doc._id
                    }
                }
            ).exec(function (err, doc){
                    if(err) {
                        console.log(err)
                    }
                })
            }
        });

    })

};