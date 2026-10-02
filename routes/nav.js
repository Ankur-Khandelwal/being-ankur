const express = require("express");
const router = express.Router();
const Post = require("../models/post");
const content = require("../web-content/content");

router.get("/", async (req, res) => {
  const blogPosts = await Post.find({});
  res.render("home", { hContent: content.homeStartingContent, bPosts: blogPosts });
});
router.get("/about", (req, res) => res.render("about", { aContent: content.aboutContent }));
router.get("/contact", (req, res) => res.render("contact", { cContent: content.contactContent }));

module.exports = router;
