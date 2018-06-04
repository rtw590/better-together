const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const passport = require("passport");

//Bring in User Model
let User = require("../models/user");
let WallPost = require("../models/post");

// Register Form
router.get("/register", function(req, res) {
  res.render("register");
});

// Register Process
router.post("/register", function(req, res) {
  const firstname = req.body.firstname;
  const lastname = req.body.lastname;
  const username = req.body.username;
  const email = req.body.email;
  const password = req.body.password;
  const password2 = req.body.password2;

  req.checkBody("firstname", "First Name is Required").notEmpty();
  req.checkBody("lastname", "Last Name is Required").notEmpty();
  req.checkBody("username", "Username is Required").notEmpty();
  req.checkBody("email", "Email is Required").isEmail();
  req.checkBody("password", "Password is Required").notEmpty();
  req
    .checkBody("password2", "Passwords do not match")
    .equals(req.body.password);

  let errors = req.validationErrors();

  if (errors) {
    res.render("register", {
      errors: errors
    });
  } else {
    let newUser = new User({
      firstname: firstname,
      lastname: lastname,
      username: username,
      email: email,
      password: password
    });

    bcrypt.genSalt(10, function(err, salt) {
      bcrypt.hash(newUser.password, salt, function(err, hash) {
        if (err) {
          console.log(err);
        }
        newUser.password = hash;
        newUser.save(function(err) {
          if (err) {
            console.log(err);
            return;
          } else {
            req.flash("success", "You are now registered");
            res.redirect("/users/login");
          }
        });
      });
    });
  }
});

// Login Form
router.get("/login", function(req, res) {
  res.render("login");
});

// Login Process
router.post("/login", function(req, res, next) {
  passport.authenticate("local", {
    successRedirect: "/feed",
    failureRedirect: "/users/login",
    failureFlash: true
  })(req, res, next);
});

// Logout
router.get("/logout", function(req, res) {
  req.logout();
  req.flash("success", "You are logged out");
  res.redirect("/users/login");
});

// View User Profile
router.get("/profile/:id", function(req, res) {
  User.findOne({ username: req.params.id }, function(err, userProfile) {
    if (err) {
      console.log(err);
    } else {
      WallPost.find(
        { profilePostedOn: req.params.id },
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
            let isUser = false;
            if (req.user != undefined) {
              if (req.user._id.toString() == userProfile._id.toString()) {
                isUser = true;
              }
            }
            let following = false;
            if (req.user != undefined) {
              following = userProfile.followedBy.includes(
                req.user._id.toString()
              );
            }
            res.render("profile", {
              userProfile,
              posts,
              following,
              isUser
            });
          }
        }
      ).lean();
    }
  });
});

// Follow/unfollow user
router.get("/follow/:id", ensureAuthenticated, function(req, res) {
  User.findById(req.params.id, function(err, userProfile) {
    if (err) {
      console.log(err);
    } else {
      // If the logged in user is in the followedBy array of the currently viewed profile,
      // remove it from the followedBy array of the profile and remove the profile from the
      // following array of the logged in user
      if (userProfile.followedBy.includes(req.user._id.toString())) {
        // console.log("The user is in the array of followed by users");
        filteredArray = userProfile.followedBy.filter(
          item => item !== req.user._id.toString()
        );
        userProfile.followedBy = filteredArray;
        userProfile.save();
        User.findById(req.user._id, function(err, userLoggedIn) {
          filteredFollowing = userLoggedIn.following.filter(
            item => item !== userProfile._id.toString()
          );
          userLoggedIn.following = filteredFollowing;
          userLoggedIn.save();
          res.redirect(`/users/profile/${userProfile.username}`);
        });
      } else {
        // If the logged in user is not in the followed by array,
        // add user to profile's followedBy and add profile to user's following
        userProfile.followedBy.push(req.user._id.toString());
        userProfile.save();
        User.findById(req.user._id, function(err, userLoggedIn) {
          userLoggedIn.following.push(userProfile._id.toString());
          userLoggedIn.save();
          res.redirect(`/users/profile/${userProfile.username}`);
        });
      }
    }
  });
});

// View followers of a user
router.get("/profile/followers/:id", function(req, res) {
  User.findOne({ username: req.params.id }, function(err, userProfile) {
    if (err) {
      console.log(err);
    } else {
      User.find(
        {
          _id: { $in: userProfile.followedBy }
        },
        null,
        { sort: "-date" },
        function(err, following) {
          if (err) {
            console.log(err);
          } else {
            if (req.user != undefined) {
              following = following.map(function(object) {
                if (req.user._id.toString() == object._id.toString()) {
                  return Object.assign({ isUser: true }, object);
                } else {
                  if (object.followedBy.includes(req.user._id.toString())) {
                    return Object.assign({ followingUser: true }, object);
                  } else {
                    return Object.assign({ followingUser: false }, object);
                  }
                }
              });
            }
            let username = req.params.id;
            res.render("followers", {
              username,
              following
            });
          }
        }
      ).lean();
    }
  });
});

// Follow/unfollow user from the followers view
router.get("/follow/followers/:id/:pageOn", ensureAuthenticated, function(
  req,
  res
) {
  User.findById(req.params.id, function(err, userProfile) {
    if (err) {
      console.log(err);
    } else {
      // If the logged in user is in the followedBy array of the currently viewed profile,
      // remove it from the followedBy array of the profile and remove the profile from the
      // following array of the logged in user
      if (userProfile.followedBy.includes(req.user._id.toString())) {
        // console.log("The user is in the array of followed by users");
        filteredArray = userProfile.followedBy.filter(
          item => item !== req.user._id.toString()
        );
        userProfile.followedBy = filteredArray;
        userProfile.save();
        User.findById(req.user._id, function(err, userLoggedIn) {
          filteredFollowing = userLoggedIn.following.filter(
            item => item !== userProfile._id.toString()
          );
          userLoggedIn.following = filteredFollowing;
          userLoggedIn.save();
          res.redirect(`/users/profile/followers/${req.params.pageOn}`);
        });
      } else {
        // If the logged in user is not in the followed by array,
        // add user to profile's followedBy and add profile to user's following
        userProfile.followedBy.push(req.user._id.toString());
        userProfile.save();
        User.findById(req.user._id, function(err, userLoggedIn) {
          userLoggedIn.following.push(userProfile._id.toString());
          userLoggedIn.save();
          res.redirect(`/users/profile/followers/${req.params.pageOn}`);
        });
      }
    }
  });
});

// followers list - keep safe while adding to it
// router.get("/profile/followers/:id", function(req, res) {
//   let username = req.params.id;
//   User.findOne({ username: req.params.id }, function(err, userProfile) {
//     if (err) {
//       console.log(err);
//     } else {
//       console.log(userProfile);
//       res.render("followers", {
//         username
//       });
//     }
//   });
// });

// View User Profile - Failed attempt to edit/delete author's comments. May revisit with traditional loop
// router.get("/profile/:id", function(req, res) {
//   User.findOne({ username: req.params.id }, function(err, userProfile) {
//     if (err) {
//       console.log(err);
//     } else {
//       WallPost.find(
//         { profilePostedOn: req.params.id },
//         null,
//         { sort: "-date" },
//         function(err, posts) {
//           if (err) {
//             console.log(err);
//           } else {
//             if (req.user != undefined) {
//               posts = posts.map(function(object) {
//                 if (object.author == req.user._id.toString()) {
//                   return Object.assign({ edit: true }, object);
//                 } else {
//                   return Object.assign({ edit: false }, object);
//                 }
//               });
//             }
//             if (req.user != undefined) {
//               posts = posts.map(function(object) {
//                 // console.log(object.comments);
//                 commentsArray = object.comments.map(function(element) {
//                   if (element.author == req.user._id.toString()) {
//                     console.log("True " + JSON.stringify(element));
//                     return Object.assign({ edit: true }, element);
//                     // return 5;
//                   } else {
//                     console.log("False " + JSON.stringify(element));
//                     return Object.assign({ edit: false }, element);
//                     // return 5;
//                   }
//                   return commentsArray;
//                 });
//                 return posts;
//               });
//             }
//             if (req.user != undefined) {
//               posts = posts[0];
//             }
//             // console.log(posts);
//             // console.log("Verses the for each");
//             // posts.forEach(function(element) {
//             //   console.log(element.comments);
//             // });
//             res.render("profile", {
//               userProfile,
//               posts
//             });
//           }
//         }
//       ).lean();
//     }
//   });
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
