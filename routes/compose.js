const express = require("express");
const router = express.Router();
const Post = require("../models/post");

router.get('/compose', function (req, res) {
  if(req.isAuthenticated()) {
    const requestId = req.user.googleId || "";
    if(requestId === process.env.GOOGLE_ID) res.render("compose");
    else res.render("errorPage",{errorMessage: "YOU ARE NOT AUTHORIZED TO ADD POSTS."});
  }
  else res.redirect(`/login?msg=You must Login to Add Posts.&action=compose`);
});

router.post('/compose', async function (req, res) {
  const date = new Date();
  const newPost = new Post({
    postDate: date,
    updateDate: date,
    postTitle: req.body.titleText,
    postContent: req.body.postText,
  });
  await newPost.save();
  res.redirect("/");
});

module.exports = router;
