// routes/auth.js

const express = require('express');
const router = express.Router();
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const supabase = require('../config/supabaseClient');
const { resetPasswordEmail } = require('../config/sendgrid');
const { ROLES } = require('../middleware/roles'); 

// Login form route
router.get('/login', (req, res) => {
    const messages = {
      error: req.flash('error'),
      success: req.flash('success')
    };
    res.render('auth/login', { messages });
  });
  
// Login POST route
router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) { 
      return next(err); 
    }
    if (!user) {
      req.flash('error', info.message);
      return res.redirect('/auth/login');
    }
    req.logIn(user, (err) => {
      if (err) { 
        return next(err); 
      }
      // Redirect based on user role
      switch(user.role) {
        case ROLES.SUPER_ADMIN:
          return res.redirect('/admin/dashboard');
        case ROLES.TENANT_OWNER:
        case ROLES.TENANT_ADMIN:
          return res.redirect(`/business/${user.tenant_id}/dashboard`);
        case ROLES.SUPPORT_STAFF:
          return res.redirect('/support/dashboard');
        case ROLES.CUSTOMER:
          return res.redirect('/customer/dashboard');
        default:
          return res.redirect('/');
      }
    });
  })(req, res, next);
});


// Request password reset
router.get('/forgot-password', (req, res) => {
    res.render('auth/forgot-password', { messages: req.flash() });
  });
  
  router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    
    try {
      // Check if user exists
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();
  
      if (error || !user) {
        req.flash('error', 'No account with that email address exists.');
        return res.redirect('/auth/forgot-password');
      }
  
      // Generate reset token
      const token = crypto.randomBytes(20).toString('hex');
      const expires = new Date(Date.now() + 3600000); // 1 hour from now
  
      // Save token to database
      const { error: updateError } = await supabase
        .from('users')
        .update({
          reset_password_token: token,
          reset_password_expires: expires
        })
        .eq('id', user.id);
  
      if (updateError) throw updateError;
  
      // Send email
      const resetURL = `http://${req.headers.host}/auth/reset-password/${token}`;
      await resetPasswordEmail(user.email, resetURL);
  
      req.flash('success', 'An e-mail has been sent with further instructions.');
      res.redirect('/auth/login');
    } catch (error) {
      console.error('Password reset error:', error);
      req.flash('error', 'An error occurred. Please try again later.');
      res.redirect('/auth/forgot-password');
    }
  });
  
  // Reset password form
  router.get('/reset-password/:token', async (req, res) => {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('reset_password_token', req.params.token)
        .single();
  
      if (error || !user || user.reset_password_expires < new Date()) {
        req.flash('error', 'Password reset token is invalid or has expired.');
        return res.redirect('/auth/forgot-password');
      }
  
      res.render('auth/reset-password', { 
        token: req.params.token,
        messages: req.flash()
      });
    } catch (error) {
      console.error('Error in reset password route:', error);
      req.flash('error', 'An error occurred. Please try again later.');
      res.redirect('/auth/forgot-password');
    }
  });
  
  // Process password reset
  router.post('/reset-password/:token', async (req, res) => {
    const { password, confirmPassword } = req.body;
  
    if (password !== confirmPassword) {
      req.flash('error', 'Passwords do not match.');
      return res.redirect(`/auth/reset-password/${req.params.token}`);
    }
  
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('reset_password_token', req.params.token)
        .single();
  
      if (error || !user || user.reset_password_expires < new Date()) {
        req.flash('error', 'Password reset token is invalid or has expired.');
        return res.redirect('/auth/forgot-password');
      }
  
      const hashedPassword = await bcrypt.hash(password, 10);
  
      const { error: updateError } = await supabase
        .from('users')
        .update({
          password: hashedPassword,
          reset_password_token: null,
          reset_password_expires: null
        })
        .eq('id', user.id);
  
      if (updateError) throw updateError;
  
      req.flash('success', 'Your password has been changed successfully. You can now log in with your new password.');
      res.redirect('/auth/login');
    } catch (error) {
      console.error('Error in password reset:', error);
      req.flash('error', 'An error occurred while resetting your password. Please try again.');
      res.redirect('/auth/forgot-password');
    }
  });
  
module.exports = router;