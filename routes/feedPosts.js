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

  // TODO change what happens when there are errors
  if (errors) {
    req.flash("success", "Post Empty");
    res.redirect("/feed");
  } else {
    User.findById(req.user._id, function(err, user) {
      let post = new WallPost();
      post.author = req.user._id;
      post.profilePostedOn = user.username;
      post.body = req.body.body;
      post.username = user.username;
      post.likes = 0;

      post.save(function(err) {
        if (err) {
          console.log(err);
          return;
        } else {
          req.flash("success", "Post Added");
          res.redirect("/feed");
        }
      });
    });
  }
});

// Add POST route for commments
router.post("/comment/:id", ensureAuthenticated, function(req, res) {
  WallPost.findById(req.params.id, function(err, post) {
    User.findById(req.user._id, function(err, user) {
      if (req.body.body.length > 0) {
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
            res.redirect("/feed");
          }
        });
      } else {
        req.flash("success", "Comment Empty");
        res.redirect("/feed");
      }
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

// Delete Post
router.delete("/:id", function(req, res) {
  if (!req.user._id) {
    res.status(500).send();
  }

  let query = { _id: req.params.id };

  WallPost.findById(req.params.id, function(err, post) {
    if (post.author != req.user._id) {
      res.status(500).send();
    } else {
      WallPost.remove(query, function(err) {
        if (err) {
          console.log(err);
        }
        res.send("Success");
      });
    }
  });
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
      res.redirect("/feed");
    } else {
      post.likedBy.push(req.user._id.toString());
      post.likes += 1;
      post.save();
      req.flash("success", "Post Liked");
      res.redirect("/feed");
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
