const express = require("express");
const mongoose = require('mongoose');
const env = require("dotenv");
const session = require("express-session");
const passport = require("passport");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
// const Comment = require("./models/postComment");
const {User} = require("./models/user");
const postRoute = require("./routes/post");
const composeRoute = require("./routes/compose");
const authRoute = require("./routes/auth");
const navRoute = require("./routes/nav");

const app = express();

env.config();
const db_user = process.env.DB_USER;
const db_pwd = process.env.DB_PWD;
// const port = process.env.port;

app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false,
}))
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect(`mongodb+srv://${db_user}:${db_pwd}@cluster0.ooavl.mongodb.net/blogDB?retryWrites=true&w=majority`,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // useCreateIndex: true,
  }
).then(() => { console.log("Database Connected."); });

app.use("/",postRoute);
app.use("/",composeRoute);
app.use("/", authRoute);
app.use("/", navRoute);


passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

passport.use(new GoogleStrategy({
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  // callbackURL: "http://localhost:3000/auth/google/ankurblog",
  callbackURL: "https://being-ankur.onrender.com/auth/google/ankurblog",
  userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
},
function(accessToken, refreshToken, profile, cb) {
  User.findOrCreate({ googleId: profile.id, name: profile.displayName }, function (err, user) {
    return cb(err, user);
  });
}
));

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function () {
  console.log(`Server started on port ${port}`);
});



app.get('/logout', (req, res)=>{
  req.logout();
  res.redirect('/');
})