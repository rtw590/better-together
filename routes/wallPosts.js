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
      post.profilePostedOn = req.body.profilePostedOn;
      post.body = req.body.body;
      post.username = user.username;
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
    });
  }
});

// Use this info inside wall post route to add the username to the model
// User.findById(req.user._id, function(err, user){
//   let post = new Post();
//   post.title = req.body.title;
//   post.author = req.user._id;
//   post.body = req.body.body;
//   post.username = user.username;
//   post.upvotedBy = [req.user._id.toString()];
//   post.votes = 1;

//   post.save(function(err) {
//       if (err) {
//           console.log(err);
//           return;
//       } else {
//           req.flash('success', 'Post Added');
//           res.redirect('/');
//       }
//   });
// });

// Add POST route for posts - working before I messed with it
// router.post("/add", function(req, res) {
//   req.checkBody("body", "Body is required").notEmpty();

//   // get errors
//   let errors = req.validationErrors();
//   let body = req.body.body;

//   // TODO: Fix what happens when there are errors
//   if (errors) {
//     res.render("add_post", {
//       errors: errors,
//       body: body,
//       title: title
//     });
//   } else {
//     let post = new WallPost();
//     post.author = req.user._id;
//     post.profilePostedOn = req.body.profilePostedOn;
//     post.body = req.body.body;
//     post.username = req.body.username;
//     post.likes = 0;

//     post.save(function(err) {
//       if (err) {
//         console.log(err);
//         return;
//       } else {
//         req.flash("success", "Post Added");
//         res.redirect("/");
//       }
//     });
//   }
// });

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
