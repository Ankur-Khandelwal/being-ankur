const express = require("express");
const router = express.Router();
const Post = require("../models/post");
const User = require("../models/user");
const content = require('../web-content/content');

//HOME
router.get('/', function (req, res) {
  Post.find({},(error, blogPosts)=>{
    if(error){
      res.render("errorPage",{errorMessage: error});
    }
    else{
      res.render("home", { hContent: content.homeStartingContent, bPosts: blogPosts });
    }
  });
  // res.render("login");
});

//ABOUT
router.get('/about', function (req, res) {
  res.render("about", { aContent: content.aboutContent });
});

//CONTACT
router.get('/contact', function (req, res) {
  res.render("contact", { cContent: content.contactContent });
});

module.exports = router;