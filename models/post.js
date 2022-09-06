const mongoose = require('mongoose');
const {commentSchema} = require('./postComment');

const postSchema = new mongoose.Schema({
  postDate: Date,
  updateDate: Date,
  postTitle: String,
  postContent: String,
  postLoveCount: {
    type: Number,
    default: 0
  },
  postComments: [commentSchema]
});

const Post = mongoose.model("Post",postSchema);

module.exports = Post;