// routes/users.js

const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');
const { ROLES, checkRole, checkTenantAccess } = require('../middleware/roles');
const supabase = require('../config/supabaseClient');

// Route to get users for a tenant (accessible by tenant owner and admin)


module.exports = router;