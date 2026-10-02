const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  commentContent: String,
  commentDate: Date,
  commentedByName: String,
  commentedById: String
})

const Comment = mongoose.model("Comment", commentSchema);

module.exports = {commentSchema, Comment};
