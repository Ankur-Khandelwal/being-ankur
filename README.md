# Being Ankur

A personal blog built with Express, EJS, MongoDB and Passport.

## Runtime and installation

Use Node **24.21.0** (also recorded in `.nvmrc`). With nvm installed:

```sh
nvm install
nvm use
npm ci
```

`npm ci` installs the exact dependency tree in `package-lock.json`. It replaces
`node_modules`; it does not change application data. The initial test-tool install
may download a MongoDB binary, so it requires network access.

npm uses your configured registry. On Oracle's network, keep using your approved
npm proxy. Registry or proxy DNS errors are connectivity failures, not application
test failures; check network access before changing registry configuration.

## Local development

Copy `.env.example` to a new `.env`, fill in the credentials, and run a local MongoDB
instance. `MONGODB_URI` takes precedence over the legacy `DB_USER` / `DB_PWD` Atlas
configuration. `SECRET` is the session signing secret. `GOOGLE_ID` identifies the
existing Google admin account for the protected compose/edit pages.

```sh
npm run dev
```

This uses Node's built-in file watcher to restart the local server after changes.
`npm start` runs the same application without watching. Startup waits for MongoDB
and exits with an error if required configuration or the connection fails.

For Google sign-in, register the exact `GOOGLE_CALLBACK_URL` on an active Google
web OAuth client. The default when omitted is the existing Render callback. A
deleted client must be restored or replaced in Google Cloud; a package upgrade
cannot repair that external configuration.

## Tests

The `test/` directory is intentionally ignored by Git. The following command runs
the local compatibility suite only when those files are present; a fresh clone
does not include them. A run with zero tests is not compatibility verification.

```sh
npm test
```

Tests start a disposable MongoDB 8.2.6 process and HTTP servers locally. They do not
use `MONGODB_URI`, existing accounts, or production data. MongoDB is downloaded on
first use and cached; a compatible local binary can be supplied through
`MONGOMS_SYSTEM_BINARY`. Temporary database contents are discarded on shutdown.

The suite checks public/admin template rendering, registration, legacy password
hashes, login/logout and session redirects, post creation/editing, concurrent love
increments, comments, and missing/invalid IDs. Only Google's external token/profile
responses are simulated; the real Passport strategy and database/session flow run.
Real Google login and the deployed MongoDB server still require staging verification.

`test/fixtures/legacy-user.json` contains disposable test credentials generated
using Mongoose 5.13.2 and passport-local-mongoose 6.1.0. Its test-only password is
`legacy-test-password-only`. It ensures upgrades preserve the stored hash format.

## Upgrade notes

- Mongoose queries use promises; Express 5 forwards rejected route promises to a
  shared error handler. Missing resources return 404 and invalid IDs return 400.
- passport-local-mongoose 9 uses a CommonJS `.default` export and promise-based
  registration. Existing salt/hash settings are retained.
- Passport 0.7 requires a logout callback and regenerates sessions at login. Return
  destinations are captured before regeneration and stored per visitor.
- Google users are looked up by provider ID, so display-name changes do not create
  another account. The unused find-or-create plugin has been removed.
- Unused Axios, Lodash and body-parser dependencies were removed. Express parses
  the forms, and Node's watcher replaces Nodemon. passport-local is supplied by
  passport-local-mongoose rather than declared redundantly.
- The unused Bootstrap JavaScript was removed because it expected absent jQuery.
  Bootstrap and Font Awesome CDN stylesheets remain for the planned UI redesign.

This dependency migration is not the planned authorization/security release.
The previously identified write-route and comment-ownership authorization gaps,
CSRF/session-store hardening, and UI redesign are still separate work. Do not treat
passing compatibility tests as evidence that those security gaps are fixed.
