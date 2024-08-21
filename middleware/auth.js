// middleware/auth.js

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const supabase = require('../config/supabaseClient');

passport.use(new LocalStrategy(
  { usernameField: 'email' },
  async (email, password, done) => {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('*, tenants(*)')
        .eq('email', email)
        .single();

      if (error || !user) {
        return done(null, false, { message: 'Incorrect email.' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return done(null, false, { message: 'Incorrect password.' });
      }

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*, tenants(*)')
      .eq('id', id)
      .single();

    if (error || !user) {
      return done(new Error('User not found'));
    }

    done(null, user);
  } catch (error) {
    done(error);
  }
});

const authenticateUser = passport.authenticate('local', {
  successRedirect: '/dashboard',
  failureRedirect: '/auth/login',
  failureFlash: true
});

const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/auth/login');
};

module.exports = { authenticateUser, isAuthenticated };