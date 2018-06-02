const express = require("express");
const path = require("path");
const exphbs = require("express-handlebars");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const expressValidator = require("express-validator");
const flash = require("connect-flash");
const session = require("express-session");
const passport = require("passport");

// DB Config
const db = require("./config/keys").mongoURI;

// Connect to MongoDB
mongoose
  .connect(db)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// Init the app
const app = express();

app.set("views", path.join(__dirname, "views"));
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Set Static Folder
app.use(express.static("public"));

// Express Session Middleware
app.use(
  session({
    secret: "keyboard cat",
    resave: true,
    saveUninitialized: true
  })
);

// Express Messages Middleware
app.use(require("connect-flash")());
app.use(function(req, res, next) {
  res.locals.messages = require("express-messages")(req, res)();
  next();
});

// Express Validator Middleware
app.use(
  expressValidator({
    errorFormatter: function(param, msg, value) {
      var namespace = param.split("."),
        root = namespace.shift(),
        formParam = root;

      while (namespace.length) {
        formParam += "[" + namespace.shift() + "]";
      }
      return {
        param: formParam,
        msg: msg,
        value: value
      };
    }
  })
);

// Passport config
require("./config/passport")(passport);
// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

app.get("*", function(req, res, next) {
  res.locals.user = req.user || null;
  next();
});

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

// Home Route
// Set home route
app.get("/", function(req, res) {
  res.render("home");
});

// Route Files
let users = require("./routes/users");
app.use("/users", users);

let wallPosts = require("./routes/wallPosts");
app.use("/wallPosts", wallPosts);

let feed = require("./routes/feed");
app.use("/feed", feed);

let feedPosts = require("./routes/feedPosts");
app.use("/feedPosts", feedPosts);

app.set("port", process.env.PORT || 8000);

app.listen(app.get("port"), function() {
  console.log("Server started");
});
