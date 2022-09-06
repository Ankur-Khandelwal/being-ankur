const express = require("express");
const router = express.Router();
const {User} = require("../models/user");
const passport = require("passport");

let postId = "";
let loginActionId = "";

//GOOGLE SIGNIN 
router.get('/auth/google', passport.authenticate("google", {scope: ['profile']}));

router.get('/auth/google/ankurblog', 
 passport.authenticate("google", {failureRedirect: "/login"}),
 function(req, res){
  //  document.getElementById('log-btn').innerText = "LOGOUT";
  if(loginActionId==="compose") res.redirect("/compose");
  else if(loginActionId==="comment") res.redirect(`/posts/${postId}`);
  else{
    if(postId==="") res.redirect("/");
    else res.redirect(`/edit/${postId}`);
  }
 }
)

//SIGNUP
router.get('/signup', (req, res)=>{
  res.render("signup", {serverMessage: ""});
})

router.post('/signup', (req, res)=>{
  User.register({name: req.body.name, email: req.body.email}, req.body.password, function(err, user){
    if(err) {
     res.render("errorPage",{errorMessage: err});
    }
    else{
      const message = "You have successfully registered. Now you can log in."
      res.redirect("/login?msg="+message);
    }
  })
})



//LOGIN
router.get('/login', (req, res)=>{
  const message = req.query.msg || "";
  loginActionId = req.query.action || "";
  postId = req.query.pId || ""; //if pId is not passed, then postId becomes undefined. || operator is used to check whether pId is passed or not. 
  res.render("login", {serverMessage: message});
})

router.post('/login', (req, res)=>{
  const user = new User({
    email: req.body.email,
    password: req.body.password
  })
  req.login(user, (error)=>{
    if(error) res.render("errorPage", {errorMessage: error});
    else{
      passport.authenticate("local")(req, res, function(){
        if(loginActionId==="compose") res.redirect("/compose");
        if(loginActionId==="comment") res.redirect(`/posts/${postId}`);
        if(postId==="") res.redirect("/");
        else res.redirect(`/edit/${postId}`);
      })
    }
  })
})

//LOGGEDIN CHECK
router.get('/loggedin', (req, res)=>{
  if(req.isAuthenticated()) {
    res.json({loggedin: true});
  }
  else res.json({loggedin: false});
});


module.exports = router;