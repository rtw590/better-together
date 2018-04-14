const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');

//Bring in Post Model
let User = require('../models/user');

// Register Form
router.get('/register', function(req, res) {
    res.render('register');
});

// Register Process
router.post('/register', function(req, res) {
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    const password2 = req.body.password2;

    req.checkBody('username', 'Username is Required').notEmpty();
    req.checkBody('email', 'Email is Required').isEmail();
    req.checkBody('password', 'Password is Required').notEmpty();
    req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

    let errors = req.validationErrors();

    if(errors) {
        res.render('register', {
            errors:errors
        });
    } else {
        let newUser = new User({
            username:username,
            email:email,
            password:password
        });

        bcrypt.genSalt(10, function(err, salt) {
            bcrypt.hash(newUser.password, salt, function(err, hash) {
                if(err) {
                    console.log(err);
                }
                newUser.password = hash;
                newUser.save(function(err) {
                    if(err){
                        console.log(err);
                        return;
                    } else {
                        req.flash('success', 'You are now registered');
                        res.redirect('/users/login');
                    }
                })
            });
        });
    }
});

router.get('/login', function(req, res) {
    res.render('login');
});

module.exports = router;