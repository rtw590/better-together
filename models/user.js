const mongoose = require("mongoose");

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
  followedBy: [],
  following: [],
  profilePicture: {
    type: String,
    default: "/images/placeholder.jpg"
  }
});

const User = (module.exports = mongoose.model("User", UserSchema));
