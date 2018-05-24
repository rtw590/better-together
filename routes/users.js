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
    successRedirect: "/",
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
  User.findOne({ username: req.params.id }, function(err, user) {
    if (err) {
      console.log(err);
    } else {
      WallPost.find({ profilePostedOn: req.params.id }, function(err, posts) {
        if (err) {
          console.log(err);
        } else {
          res.render("profile", {
            user,
            posts
          });
        }
      });
    }
  });
});

module.exports = router;
