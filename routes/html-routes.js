var axios = require("axios");
var cheerio = require("cheerio");
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

                        db.News.insertMany(result)
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


            setTimeout(function () { res.redirect("/") }, 5000);

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

    app.get("/read/:id", function (req, res) {
        db.News.findOne({ _id: req.params.id }).populate("notes").then(function (dbNews) {
            res.render("read", {
                title: "Notes",
                news: dbNews
            });
        });
    });

    app.post("/read/:id", function (req, res) {

        db.Notes.create(req.body, function (err, res) {
            if (err) {
                console.log(err)
            } else {
                db.News.findOneAndUpdate({ "_id": req.params.id }, { $push: { "notes": res._id } }, { safe: true, upsert: true, new: true })
                    .exec(function (err, doc) {
                        if (err) {
                            doc.send(err);
                        }
                    })
            }
        })
        res.redirect("/read/" + req.params.id)
    });

    app.get("/saved", function (req, res) {
        db.News.find({}).then(function (dbNews) {
            res.render("saved", {
                title: "Saved Articles",
                news: dbNews
            }).catch(function (err) {
                // res.json(err);
            })
        });
    });

    app.get("/saveIt/:id", function (req, res) {
        db.News.updateOne({ _id: req.params.id }, { $set: { saved: true } }, function (err) {

        })
        res.redirect("/")
    })

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

    app.get("/delete/:id", function (req, res) {
        db.News.deleteOne({ _id: req.params.id }, function (err) {
            if (err) return handleError(err);
        });
        res.redirect("/saved")
    });

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