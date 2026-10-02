const express = require("express");
const { User } = require("../models/user");

module.exports = function createAuthRouter(passport) {
  const router = express.Router();

  // Share the same login completion flow for Google and email/password login.
  function authenticate(strategy) {
    return (req, res, next) => {
      // Passport regenerates the session at login, so preserve the destination first.
      const destination = req.session.returnTo || "/";

      passport.authenticate(strategy, (error, user) => {
        if (error) return next(error);

        if (!user) {
          return res.status(401).render("login", {
            serverMessage: "Unable to log in."
          });
        }

        // With a custom authenticate callback, we must establish the login session ourselves.
        req.logIn(user, (loginError) => {
          if (loginError) return next(loginError);

          res.redirect(destination);
        });
        // authenticate() returns middleware; invoke it with this request and response.
      })(req, res, next);
    };
  }

  // GET /auth/google: Redirect the visitor to Google to begin sign-in.
  router.get("/auth/google", passport.authenticate("google", {
    scope: ["profile"]
  }));

  // GET /auth/google/ankurblog: Complete Google sign-in and redirect to the saved destination.
  router.get("/auth/google/ankurblog", authenticate("google"));

  // GET /signup: Display the account registration form.
  router.get("/signup", (req, res) => {
    res.render("signup", { serverMessage: "" });
  });

  // POST /signup: Create an email/password account, then redirect to the login page.
  router.post("/signup", async (req, res) => {
    // register() hashes the password and saves the user through passport-local-mongoose.
    await User.register(
      { name: req.body.name, email: req.body.email },
      req.body.password
    );

    const message = "You have successfully registered. Now you can log in.";

    res.redirect(`/login?msg=${encodeURIComponent(message)}`);
  });

  // GET /login: Display the login form and remember where to send the visitor after login.
  router.get("/login", (req, res) => {
    const { action, pId } = req.query;
    let destination = "/";

    // Build only internal destinations, accepting post IDs with MongoDB's 24-hex format.
    if (action === "compose") {
      destination = "/compose";
    } else if (typeof pId === "string" && /^[a-f0-9]{24}$/i.test(pId)) {
      destination = action === "comment" ? `/posts/${pId}` : `/edit/${pId}`;
    }

    // Keep the destination in this visitor's session, not in a variable shared by all users.
    req.session.returnTo = destination;

    res.render("login", {
      serverMessage: typeof req.query.msg === "string" ? req.query.msg : ""
    });
  });

  // POST /login: Verify email/password credentials, establish a session, and redirect.
  router.post("/login", authenticate("local"));

  // GET /loggedin: Return the current visitor's login status as JSON.
  router.get("/loggedin", (req, res) => {
    res.json({ loggedin: req.isAuthenticated() });
  });

  // GET /logout: End the visitor's authenticated session and redirect to the home page.
  router.get("/logout", (req, res, next) => {
    // The callback is mandatory in current Passport versions.
    req.logout((error) => {
      if (error) return next(error);

      res.redirect("/");
    });
  });

  return router;
};
