const express = require("express");
const router = express.Router();
const Post = require("../models/post");
const { Comment } = require("../models/postComment");

// Mongoose 9 returns promises. Express 5 sends rejected route promises to the
// app's error handler, so each route can focus on its query and response.
router.get("/posts/:postId", async function (req, res) {
  const id = req.params.postId;
  const foundPost = await Post.findById(id);
  if (!foundPost) return res.status(404).render("pg404");
  res.render("post", { post: foundPost });
});

router.get("/edit/:postId", async function (req, res) {
  const id = req.params.postId;
  const foundPost = await Post.findById(id);
  if (!foundPost) return res.status(404).render("pg404");
  if (!req.isAuthenticated()) {
    return res.redirect(`/login?msg=Log in to edit the post&pId=${foundPost.id}`);
  }
  const requestId = req.user.googleId || "";
  if (requestId !== process.env.GOOGLE_ID) {
    return res.render("errorPage", { errorMessage: "YOU ARE NOT AUTHORIZED TO EDIT POSTS." });
  }
  res.render("edit", { post: foundPost });
});

router.post('/edit/:postId', async function (req, res) {
  const id = req.params.postId;
  const date = new Date();

  const result = await Post.updateOne(
    { _id: id },
    { $set: { updateDate: date, postTitle: req.body.titleText, postContent: req.body.postText } }
  );
  if (!result.matchedCount) return res.status(404).render("pg404");
  res.redirect("/");
});

router.post('/love/:postId', async function (req, res) {
  const lovedPostId = req.params.postId;

  // One atomic query increments and returns the counter without a second read.
  const foundPost = await Post.findByIdAndUpdate(
    lovedPostId,
    { $inc: { postLoveCount: 1 } },
    { returnDocument: "after" }
  );
  if (!foundPost) return res.status(404).json({ error: "Post not found." });

  const loveCount = foundPost.postLoveCount;
  res.status(201).json({ loveCount: loveCount });
});

router.post('/posts/comment/:postId', async function (req, res) {
  const postId = req.params.postId;
  if (!req.isAuthenticated()) {
    return res.redirect(`/login?msg=Login to add comment&action=comment&pId=${postId}`);
  }
  const commentData = req.body.comment;
  const commentDate = new Date();
  const commentUserName = req.user.name;
  const commentUserId = req.user.googleId || req.user._id;
  const comment = new Comment({
    commentContent: commentData,
    commentDate: commentDate,
    commentedByName: commentUserName,
    commentedById: commentUserId
  });
  const result = await Post.updateOne({ _id: postId }, { $push: { postComments: comment } });
  if (!result.matchedCount) return res.status(404).render("pg404");
  res.redirect(`/posts/${postId}#postedComments-${postId}`);
});

router.post('/posts/comment/delete/:postId', async function (req, res) {
  const postId = req.params.postId;
  const { deleteCommentId, commentAuthorId } = req.body;
  const deleteRequesteeId = req.user ? req.user.googleId : "";
  if (!req.isAuthenticated() || deleteRequesteeId !== commentAuthorId) {
    return res.render("errorPage", { errorMessage: "You are not authorized to delete this comment." });
  }
  await Post.updateOne({ _id: postId }, { $pull: { postComments: { _id: deleteCommentId } } });
  res.redirect(`/posts/${postId}#postedComments-${postId}`);
});

module.exports = router;
