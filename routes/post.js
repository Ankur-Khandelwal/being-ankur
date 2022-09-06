const express = require("express");
const router = express.Router();
const Post = require("../models/post");
const {Comment} = require("../models/postComment");
const env = require("dotenv");
env.config();
const ADMIN_GOOGLEID = process.env.GOOGLE_ID;

router.get("/posts/:postId", function (req, res) {
  const id = req.params.postId;
  // console.log(id);
  Post.findOne({_id: id}, (error, foundPost)=>{
    if(error) res.render("errorPage",{errorMessage: error});
    else if(!foundPost) res.render("pg404");
    else res.render("post", {post: foundPost});
  });
});

router.get("/edit/:postId", function (req, res) {
  const id = req.params.postId;
  // console.log(id);
  Post.findOne({_id: id}, (error, foundPost)=>{
    if(error) res.render("errorPage",{errorMessage: error});
    else if(!foundPost) res.render("pg404");
    else {
      if(req.isAuthenticated()) {
        const requestId = req.user.googleId || "";
        if(requestId === ADMIN_GOOGLEID) res.render("edit", {post: foundPost});
        else res.render("errorPage",{errorMessage: "YOU ARE NOT AUTHORIZED TO EDIT POSTS."});
      }
      else res.redirect(`/login?msg=Log in to edit the post&pId=${id}`);
    }
  });
});

router.post('/edit/:postId', function (req, res) {
  const id = req.params.postId;
  const date = new Date();
  // console.log('Ankur');
  Post.updateOne(
    {_id: id},
    {$set: {updateDate: date, postTitle: req.body.titleText, postContent: req.body.postText}},
    (error, data)=>{
      if(error) res.render("errorPage",{errorMessage: error});
      else res.redirect("/");
    })
});

router.post('/love/:postId', function (req, res) {
  const lovedPostId = req.params.postId;
    Post.updateOne(
    {_id: lovedPostId},
    {$inc: {postLoveCount: 1}},
    (error, data)=>{
      if(error) res.render("errorPage",{errorMessage: error});
      else {
          Post.findOne({_id: lovedPostId}, (error, foundPost)=>{
          const loveCount = foundPost.postLoveCount;
          res.status(201).json({loveCount: loveCount});
        });
        // const loveCount = updatedPost.postLoveCount;
        // res.status(201).json({loveCount: loveCount});
      };
    }
  )
})

router.post('/posts/comment/:postId', function (req, res) {
  const postId = req.params.postId;
  if(req.isAuthenticated()){
    const commentData = req.body.comment;
    const commentDate = new Date();
    const commentUserName = req.user.name;
    const commentUserId = req.user.googleId || req.user._id;
    const comment = new Comment({
      commentContent: commentData,
      commentDate: commentDate,
      commentedByName: commentUserName,
      commentedById: commentUserId
    })
  
    Post.updateOne(
      {_id: postId}, 
      {$push: {postComments: comment}}, 
      (error, data)=>{
       if(error)  res.render("errorPage",{errorMessage: error});
       else res.redirect(`/posts/${postId}#postedComments-${postId}`)
      }
    );
  }
  else res.redirect(`/login?msg=Login to add comment&action=comment&pId=${postId}`);
});

router.post('/posts/comment/delete/:postId', function(req, res){
  const postId = req.params.postId;
  const {deleteCommentId, commentAuthorId} = req.body;
  const deleteRequesteeId = req.user ? req.user.googleId : "";
 if(req.isAuthenticated() && deleteRequesteeId === commentAuthorId)  {
   Post.updateOne(
    {_id: postId},
    {$pull: {postComments: {_id: deleteCommentId}}},
     (error, data)=>{
       if(error) res.render("errorPage",{errorMessage: error});
       else res.redirect(`/posts/${postId}#postedComments-${postId}`);
     }
   )
 }
 else res.render("errorPage",{errorMessage: "You are not authorized to delete this comment."});
})

module.exports = router;