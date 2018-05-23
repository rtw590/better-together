const mongoose = require("mongoose");
let wallPostsSchema = require("./post");

// User Schema
const UserSchema = mongoose.Schema({
  firstname: {
    type: String,
    required: true
  },
  lastname: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  wallPosts: [wallPostsSchema]
});

const User = (module.exports = mongoose.model("User", UserSchema));
