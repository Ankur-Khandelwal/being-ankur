const express = require("express");
const router = express.Router();
const Post = require("../models/post");
const env = require("dotenv");
env.config();
const ADMIN_GOOGLEID = process.env.GOOGLE_ID;

router.get('/compose', function (req, res) {
  if(req.isAuthenticated()) {
    const requestId = req.user.googleId || "";
    if(requestId === ADMIN_GOOGLEID) res.render("compose");
    else res.render("errorPage",{errorMessage: "YOU ARE NOT AUTHORIZED TO ADD POSTS."});
  }
  else res.redirect(`/login?msg=You must Login to Add Posts.&action=compose`);
});

router.post('/compose', function (req, res) {
  const date = new Date();
  const newPost = new Post({
    postDate: date,
    updateDate: date,
    postTitle: req.body.titleText,
    postContent: req.body.postText,
  });
  newPost.save((error, data)=>{
    if(error){
      res.render("errorPage",{errorMessage: error});
    }
    else{
      console.log("Post added successfully.")
      res.redirect("/");
    }
  });
});

module.exports = router;