const passport = require("passport");
const { Strategy } = require("passport-google-oauth2");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
const gravatar = require("gravatar");
const { User } = require("../models/user");

require("dotenv").config();

const { BASE_URL, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET_ID } = process.env;

const googleParams = {
  clientID: GOOGLE_CLIENT_ID,
  clientSecret: GOOGLE_CLIENT_SECRET_ID,
  callbackURL: `${BASE_URL}/api/auth/google-redirect`,
  passReqToCallback: true,
};

const googleCallback = async (
  req,
  accessToken,
  refreshToken,
  profile,
  done
) => {
  try {
    const { email, displayName } = profile;

    const user = await User.findOne({ email });

    if (user) {
      return done(null, user); // req.user = user
    }

    const password = await bcrypt.hash(uuidv4(), 10);

    const defAvatar = gravatar.url(email);

    const newUser = await User.create({
      email,
      password,
      name: displayName,
      avatarURL: defAvatar,
    });

    return done(null, newUser);
  } catch (error) {
    done(error, false);
  }
};

const googleStrategy = new Strategy(googleParams, googleCallback);

passport.use("google", googleStrategy);

module.exports = passport;
