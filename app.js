require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const { Passport } = require("passport");
const { configurePassport } = require("./config/passport");

const postRoute = require("./routes/post");
const composeRoute = require("./routes/compose");
const createAuthRouter = require("./routes/auth");
const navRoute = require("./routes/nav");

// Creating the app separately lets tests use an isolated database and HTTP server.
function createApp({
  sessionSecret = process.env.SECRET,
  clientID = process.env.CLIENT_ID,
  clientSecret = process.env.CLIENT_SECRET,
  callbackURL = process.env.GOOGLE_CALLBACK_URL ||
    "https://being-ankur.onrender.com/auth/google/ankurblog",
  passport = new Passport(),
} = {}) {
  if (!sessionSecret || !clientID || !clientSecret) {
    throw new Error("SECRET, CLIENT_ID and CLIENT_SECRET must be configured.");
  }

  configurePassport(passport, { clientID, clientSecret, callbackURL });

  const app = express();
  app.set("view engine", "ejs");
  app.use(express.urlencoded({ extended: true }));
  app.use(express.static("public"));
  app.use(session({ secret: sessionSecret, resave: false, saveUninitialized: false }));
  app.use(passport.initialize());
  app.use(passport.session());

  app.use(postRoute);
  app.use(composeRoute);
  app.use(createAuthRouter(passport));
  app.use(navRoute);

  app.use((req, res) => res.status(404).render("pg404"));

  // Express 5 forwards rejected async route promises here automatically.
  app.use((error, req, res, next) => {
    if (res.headersSent) return next(error);
    const status = error.name === "CastError" || error.name === "ValidationError"
      ? 400 : 500;
    res.status(status).render("errorPage", { errorMessage: error.message });
  });
  return app;
}

async function startServer() {
  const app = createApp();
  let uri = process.env.MONGODB_URI;
  if (!uri) {
    const { DB_USER, DB_PWD } = process.env;
    if (!DB_USER || !DB_PWD) throw new Error("Configure MONGODB_URI or DB_USER and DB_PWD.");
    // Keep existing Render credentials working while allowing a local database.
    uri = `mongodb+srv://${encodeURIComponent(DB_USER)}:${encodeURIComponent(DB_PWD)}@cluster0.ooavl.mongodb.net/blogDB?retryWrites=true&w=majority`;
  }
  await mongoose.connect(uri);
  const port = process.env.PORT || 3000;
  return app.listen(port, () => console.log(`Server started on port ${port}`));
}

if (require.main === module) {
  startServer().catch(async (error) => {
    console.error(`Unable to start server: ${error.message}`);
    await mongoose.disconnect();
    process.exitCode = 1;
  });
}

module.exports = { createApp, startServer };
