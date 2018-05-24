let mongoose = require("mongoose");

//Define a schema
var Schema = mongoose.Schema;

// post Schema
let CommentSchema = new Schema({
  author: {
    type: String
  },
  body: {
    type: String,
    required: true
  },
  username: {
    type: String
  },
  date: {
    type: Date,
    default: Date.now
  }
});

let WallPostSchema = new Schema({
  profilePostedOn: {
    type: String,
    required: true
  },
  author: {
    type: String,
    required: true
  },
  body: {
    type: String,
    required: true
  },
  username: {
    type: String
  },
  likes: {
    type: Number
  },
  likedBy: [],
  comments: [CommentSchema],
  date: {
    type: Date,
    default: Date.now
  }
});

let WallPost = (module.exports = mongoose.model("WallPost", WallPostSchema));
