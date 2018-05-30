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
          req.flash("success", "Comment Added");
          res.redirect(`/users/profile/${post.profilePostedOn}`);
        }
      });
    });
  });
});

// Get Edit Single Post
router.get("/edit/:id", ensureAuthenticated, function(req, res) {
  WallPost.findById(req.params.id, function(err, post) {
    if (post.author != req.user._id) {
      req.flash("danger", "Not Authorized");
      return res.redirect("/");
    }
    res.render("edit", {
      post: post
    });
  });
});

//  POST to update posts
router.post("/update/:profile/:id", function(req, res) {
  req.checkBody("body", "Body is required").notEmpty();

  // get errors

  let errors = req.validationErrors();

  if (errors) {
    WallPost.findById(req.params.id, function(err, post) {
      if (post.author != req.user._id) {
        req.flash("danger", "Not Authorized");
        return res.redirect("/");
      }
      res.render("edit_post", {
        post: post,
        errors: errors
      });
    });
  } else {
    WallPost.findById(req.params.id, function(err, post) {
      post.body = req.body.body;
      post.save();
    });
    req.flash("success", "Post Updated");
    res.redirect("/users/profile/" + req.params.profile);
  }
});

// Like a Post
router.get("/like/:id", ensureAuthenticated, function(req, res) {
  WallPost.findById(req.params.id, function(err, post) {
    if (post.likedBy.includes(req.user._id.toString())) {
      req.flash("success", "Post Unliked");
      filteredArray = post.likedBy.filter(
        item => item !== req.user._id.toString()
      );
      post.likedBy = filteredArray;
      post.likes -= 1;
      post.save();
      res.redirect(`/users/profile/${post.profilePostedOn}`);
    } else {
      post.likedBy.push(req.user._id.toString());
      post.likes += 1;
      post.save();
      req.flash("success", "Post Liked");
      res.redirect(`/users/profile/${post.profilePostedOn}`);
    }
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
