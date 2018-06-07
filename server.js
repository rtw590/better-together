const express = require("express");
const multer = require("multer");
const path = require("path");
const exphbs = require("express-handlebars");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const expressValidator = require("express-validator");
const flash = require("connect-flash");
const session = require("express-session");
const passport = require("passport");

// Set storage engine
// If issues, change destination to have ./public
const storage = multer.diskStorage({
  destination: "public/uploads/",
  filename: function(req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  }
});

// Init Upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 10000000 },
  fileFilter: function(req, file, cb) {
    checkFileType(file, cb);
  }
}).single("myImage");

// Check File Type
function checkFileType(file, cb) {
  // Allowed ext
  const filetypes = /jpeg|jpg|png|gif/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb("Error: Images Only!");
  }
}

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

// Route for uploading profile pictures
app.get("/profilepicture", function(req, res) {
  res.render("profilePicture");
});

// POST route for uploading profile pictures
app.post("/upload", (req, res) => {
  upload(req, res, err => {
    if (err) {
      req.flash("success", "Please upload an image file under 10mb");
      res.redirect("/profilepicture");
    } else {
      if (req.file == undefined) {
        req.flash("success", "No file selected");
        res.redirect("/profilepicture");
      } else {
        console.log(req.file.filename);
        req.flash("success", "Profile picture updated");
        res.redirect("/profilepicture");
      }
    }
  });
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
