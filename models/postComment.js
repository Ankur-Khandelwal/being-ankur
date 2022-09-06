const mongoose = require('mongoose');
const {userSchema, User} = require('./user');

const commentSchema = new mongoose.Schema({
  commentContent: String,
  commentDate: Date,
  commentedByName: String,
  commentedById: String
})

const Comment = mongoose.model("Comment", commentSchema);

module.exports = {commentSchema, Comment};
