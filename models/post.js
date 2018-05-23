let mongoose = require("mongoose");

// post Schema
let commentSchema = mongoose.Schema({
  author: {
    type: String
  },
  body: {
    type: String,
    required: true
  },
  username: {
    type: String
  }
});

let wallPostSchema = mongoose.Schema({
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
  comments: [commentSchema]
});

let Post = (module.exports = mongoose.model("Post", wallPostSchema));

module.exports = wallPostSchema;
