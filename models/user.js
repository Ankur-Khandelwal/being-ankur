const mongoose = require('mongoose');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const findOrCreate = require('mongoose-findorcreate');

const userSchema = new mongoose.Schema({
  name: String,
  email: {
    type: String,
    lowercase: true,
  },
  password: String,
  googleId: String
})

userSchema.plugin(passportLocalMongoose, {usernameField: "email"});
userSchema.plugin(findOrCreate);

const User = mongoose.model("User", userSchema);
passport.use(User.createStrategy());

module.exports = {
  User: User,
  userSchema: userSchema
};