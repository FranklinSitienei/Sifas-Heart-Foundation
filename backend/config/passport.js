const GoogleStrategy = require("passport-google-oauth20").Strategy;
const passport = require("passport");
const User = require("../models/User");
const Admin = require("../models/Admin");

module.exports = (passport) => {
  // Google Strategy for Users
  passport.use(
    'google-user',
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "https://sifas-heart-foundation-2.onrender.com/api/auth/google/callback",
        scope: ["profile", "email"],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const { id, email, given_name, family_name, picture } = profile._json;
    
          if (!email || !given_name || !family_name) {
            return done(new Error("Missing required Google profile fields"), null);
          }
    
          let user = await User.findOne({ email });
    
          if (!user) {
            user = new User({
              googleId: id,
              email: email,
              firstName: given_name,
              lastName: family_name,
              profilePicture: picture,
            });
            await user.save();
          } else if (!user.googleId) {
            user.googleId = id;
            user.profilePicture = picture;
            await user.save();
          }
    
          return done(null, user);
        } catch (error) {
          return done(error, null);
        }
      }
    )    
  );

  // Google Strategy for Admins
  passport.use(
    'google-admin',
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "http://localhost:10000/api/admin/google/callback",
        scope: ["profile", "email"],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const { id, email, given_name, family_name, picture } = profile._json;

          if (!email || !given_name || !family_name) {
            return done(new Error("Missing required Google profile fields"), null);
          }

          // Check if admin already exists
          let admin = await Admin.findOne({ email });

          if (!admin) {
            // If admin doesn't exist, create a new admin
            admin = new Admin({
              googleId: id,
              email: email,
              firstName: given_name,
              lastName: family_name,
              profilePicture: picture, // Add profile picture
            });
            await admin.save();
          } else if (!admin.googleId) {
            // Update admin with new Google ID and profile picture
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

  // Serialize User or Admin
  passport.serializeUser((entity, done) => {
    done(null, { id: entity.id, type: entity instanceof User ? "User" : "Admin" });
  });

  // Deserialize User or Admin
  passport.deserializeUser((obj, done) => {
    const Model = obj.type === "User" ? User : Admin;
    Model.findById(obj.id, (err, entity) => {
      done(err, entity);
    });
  });
};
