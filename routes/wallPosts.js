const express = require("express");
const router = express.Router();

//Bring in Post Model
let WallPost = require("../models/post");
// Bring in User Model
let User = require("../models/user");

// Add POST route for posts
router.post("/add/:id", ensureAuthenticated, function(req, res) {
  req.checkBody("body", "Body is required").notEmpty();

  // get errors
  let errors = req.validationErrors();
  let body = req.body.body;

  if (errors) {
    res.render("add_post", {
      errors: errors,
      body: body,
      title: title
    });
  } else {
    User.findById(req.user._id, function(err, user) {
      let post = new WallPost();
      post.author = req.user._id;
      post.profilePostedOn = req.params.id;
      post.body = req.body.body;
      post.username = user.username;
      post.likes = 0;

      post.save(function(err) {
        if (err) {
          console.log(err);
          return;
        } else {
          req.flash("success", "Post Added");
          res.redirect(`/users/profile/${req.params.id}`);
        }
      });
    });
  }
});

// Add POST route for commments
router.post("/comment/:id", ensureAuthenticated, function(req, res) {
  WallPost.findById(req.params.id, function(err, post) {
    User.findById(req.user._id, function(err, user) {
      post.comments.push({
        author: req.user._id,
        body: req.body.body,
        username: user.username
      });
      post.save(function(err) {
        if (err) {
          console.log(err);
          return;
        } else {
          // TODO CHange redirect
          res.redirect("/posts/" + req.params.id);
        }
      });
    });
  });
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
