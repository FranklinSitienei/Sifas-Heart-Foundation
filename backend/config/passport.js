const GoogleStrategy = require("passport-google-oauth20").Strategy;
const passport = require("passport");
const User = require("../models/User");
const Admin = require("../models/Admin");

module.exports = (passport) => {
  // Google Strategy for Users
  passport.use(
    "google-user",
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "https://sifas-heart-foundation.onrender.com/api/auth/google/callback",
        scope: ["profile", "email"],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const { id, email, given_name, family_name, picture } = profile._json;

          if (!email || !given_name || !family_name) {
            return done(new Error("Missing required Google profile fields"), null);
          }

          const fullName = `${given_name} ${family_name}`;
          let user = await User.findOne({ email });

          if (!user) {
            user = await User.create({
              oauthProvider: 'google',
              oauthId: id,
              name: fullName,
              email,
              profilePicture: picture,
            });
          } else {
            // Update OAuth ID and picture if missing
            if (!user.oauthId || user.oauthProvider !== 'google') {
              user.oauthProvider = 'google';
              user.oauthId = id;
              user.profilePicture = picture;
              await user.save();
            }
          }

          return done(null, user);
        } catch (error) {
          return done(error, null);
        }
      }
    )
  );

  // Google Strategy for Admins (unchanged unless admin model is refactored)
  passport.use(
    "google-admin",
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "https://sifas-heart-foundation.onrender.com/api/admin/google/callback",
        scope: ["profile", "email", "openid"],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const { id, email, given_name, family_name, picture } = profile._json;

          if (!email || !given_name || !family_name) {
            return done(new Error("Missing required Google profile fields"), null);
          }

          let admin = await Admin.findOne({ email });

          if (!admin) {
            admin = await Admin.create({
              googleId: id,
              email,
              firstName: given_name,
              lastName: family_name,
              profilePicture: picture,
            });
          } else if (!admin.googleId) {
            admin.googleId = id;
            admin.profilePicture = picture;
            await admin.save();
          }

          return done(null, admin);
        } catch (error) {
          return done(error, null);
        }
      }
    )
  );

  // Serialize User/Admin
  passport.serializeUser((entity, done) => {
    done(null, {
      id: entity._id,
      type: entity instanceof User ? "User" : "Admin",
    });
  });

  // Deserialize User/Admin
  passport.deserializeUser((obj, done) => {
    const Model = obj.type === "User" ? User : Admin;
    Model.findById(obj.id, (err, entity) => {
      done(err, entity);
    });
  });
};
