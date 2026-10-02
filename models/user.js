const mongoose = require('mongoose');
// Version 9 exposes a default export even when loaded through CommonJS.
const passportLocalMongoose = require("passport-local-mongoose").default;

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

const User = mongoose.model("User", userSchema);

module.exports = {
  User: User,
  userSchema: userSchema
};
