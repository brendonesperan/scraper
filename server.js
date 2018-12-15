// Dependencies
var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
// Require axios and cheerio. This makes the scraping possible
var axios = require("axios");
var cheerio = require("cheerio");
// Require all models
var db = require("./models");

var PORT = process.env.PORT || 3000;

// Initialize Express
var app = express();

// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: true }));
// Use express.static to serve the public folder as a static directory
app.use(express.static("public"));


// Set Handlebars.
var exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Connect to the Mongo DB
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/scrapeNews";
mongoose.connect(MONGODB_URI);



// *******************************************************************************************************


// scrape from website and put in database
app.get("/scrape", function(req, res) {
  axios.get("https://news.ycombinator.com/").then(function(response) {
      var $ = cheerio.load(response.data);
      var results = {};
      $("header.post-block__header").each(function(i, element) {
          results.title = $(element).children("h2").text().replace(/\s+/g, ' ').toUpperCase();
          results.link = $(element).children().children().attr("href");
          results.summary = $(element).siblings().text().replace(/\s+/g, ' ');
          db.Article.remove({}).then(function(data) {
              console.log(data);
          })
          .catch(function(err) {
              return res.json(err);
          })
          db.Article.create(results)
          .then(function(dbArticle) {
              // View the added result in the console
              console.log(dbArticle);
          })
          .catch(function(err) {
              // If an error occurred, send it to the client
              return res.json(err);
          });        
      })
      console.log("Scrape attempted: check localhost:" + PORT + "/scrape");
      res.send("Scrape Complete");
  })
});

// handlebars route
app.get("/", function(req, res) {
  db.Article.find({}).then(function(data) {
      var resultObject = {
          article: data,
      };
      res.render("index", resultObject);
  })
})

// articles route
app.get("/articles", function(req, res) {
  db.Article.find({})
      .then(function(data) {
          res.json(data);
      })
      .catch(function(err) {
          res.json(err);
      })
})

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function(req, res) {
  db.Article.findOne({ _id: req.params.id })
    .populate("note")
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function(req, res) {
  db.Note.create(req.body)
    .then(function(dbNote) {
      return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
    })
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});



// *******************************************************************************************************


// Listen on port 3000
app.listen(3000, function() {
  console.log("App running on port 3000!");
});
