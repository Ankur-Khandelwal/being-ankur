const GoogleStrategy = require("passport-google-oauth20").Strategy;
const { User } = require("../models/user");

function configurePassport(passport, googleOptions) {
  // The plugin's strategy checks the configured email field and verifies the password hash.
  passport.use(User.createStrategy());

  // Store only the user ID in the session. done(error, result) reports the outcome to Passport.
  passport.serializeUser((user, done) => done(null, user.id));
  // Restore req.user from the session's saved ID on subsequent requests.
  passport.deserializeUser(async (id, done) => {
    try {
      done(null, await User.findById(id));
    } catch (error) {
      done(error);
    }
  });

  // GoogleStrategy fetches the Google profile; this callback supplies our local user to Passport.
  passport.use(new GoogleStrategy(googleOptions, async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ googleId: profile.id });
      if (!user) user = await User.create({ googleId: profile.id, name: profile.displayName });
      done(null, user);
    } catch (error) {
      done(error);
    }
  }));
}

module.exports = { configurePassport };
