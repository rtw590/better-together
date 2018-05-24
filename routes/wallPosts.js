const express = require("express");
const router = express.Router();

//Bring in Post Model
let WallPost = require("../models/post");
// Bring in User Model
let User = require("../models/user");

// Add POST route for posts
router.post("/add", function(req, res) {
  req.checkBody("body", "Body is required").notEmpty();

  // get errors

  let errors = req.validationErrors();
  let body = req.body.body;

  // TODO: Fix what happens when there are errors
  if (errors) {
    res.render("add_post", {
      errors: errors,
      body: body,
      title: title
    });
  } else {
    let post = new WallPost();
    post.author = req.user._id;
    post.profilePostedOn = req.body.profilePostedOn;
    post.body = req.body.body;
    post.username = req.body.username;
    post.likes = 0;

    post.save(function(err) {
      if (err) {
        console.log(err);
        return;
      } else {
        req.flash("success", "Post Added");
        res.redirect("/");
      }
    });
  }
});

// Access control
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    req.flash("danger", "Please Login");
    res.redirect("/users/login");
  }
}

module.exports = router;
