const express = require("express");
const router = express.Router();

//Bring in User Model
let User = require("../models/user");
let WallPost = require("../models/post");

// View Feed
router.get("/", ensureAuthenticated, function(req, res) {
  User.findById(req.user._id, function(err, userProfile) {
    if (err) {
      console.log(err);
    } else {
      WallPost.find(
        {
          author: { $in: userProfile.following }
        },
        null,
        { sort: "-date" },
        function(err, posts) {
          if (err) {
            console.log(err);
          } else {
            if (req.user != undefined) {
              posts = posts.map(function(object) {
                if (object.author == req.user._id.toString()) {
                  return Object.assign({ edit: true }, object);
                } else {
                  return Object.assign({ edit: false }, object);
                }
              });
            }
            let following = false;
            if (req.user != undefined) {
              following = userProfile.followedBy.includes(
                req.user._id.toString()
              );
            }
            res.render("feed", {
              userProfile,
              posts,
              following
            });
          }
        }
      ).lean();
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
