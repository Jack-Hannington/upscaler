const express = require('express');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const fs = require('fs');
const flash = require('connect-flash');
const path = require('path');
const supabase = require('./config/supabaseClient');
const methodOverride = require('method-override');

// Initialize Express app
const app = express();

// Load environment variables
require('dotenv').config();

// Set up middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(flash());

// Set up session
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false
}));

// Set up Passport
app.use(passport.initialize());
app.use(passport.session());

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Load auth middleware
require('./middleware/auth');

// Routes
app.use('/auth', require('./routes/auth'));
app.use('/users', require('./routes/users'));
app.use('/business', require('./routes/tenant'));
app.use('/upscale', require('./routes/upscale'));
app.use('/temp-uploads', express.static(path.join(__dirname, 'temp-uploads')));


// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

module.exports = app;