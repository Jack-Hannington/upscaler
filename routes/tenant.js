// routes/tenant.js
const express = require('express');
const router = express.Router();
const { checkRole, checkTenantAccess, ROLES } = require('../middleware/roles');
const { isAuthenticated } = require('../middleware/auth');
const { registerTenant, getTenantData } = require('../services/tenantService');
const userService = require('../services/userService'); 

router.get('/register', (req, res) => {
  res.render('auth/register-business', { messages: req.flash() });
});

router.post('/register', async (req, res) => {
  const { name, contact_email, contact_phone, website, email, password } = req.body;
  
  try {
    console.log('registerTenant function:', registerTenant); // Add this line for debugging

    const result = await registerTenant({
      name,
      contact_email,
      contact_phone,
      website,
      email,
      password
    });

    req.flash('success', 'Business registered successfully. Please log in.');
    res.redirect('/auth/login');
  } catch (error) {
    console.error('Error during business registration:', error);
    req.flash('error', error.message);
    res.redirect('/business/register');
  }
});

router.get('/:tenantId/dashboard', 
  checkRole([ROLES.TENANT_OWNER, ROLES.TENANT_ADMIN]), 
  checkTenantAccess,
  async (req, res) => {
    try {
      const tenantId = req.params.tenantId;
      
      // Fetch tenant data
      const tenantData = await getTenantData(tenantId);
      console.log(req.user);
   
      res.render('business/dashboard', { 
        tenant: tenantData,
        // otherData: otherData,
        user: req.user
      });
    } catch (error) {
      console.error('Error fetching tenant dashboard data:', error);
      req.flash('error', 'Unable to load dashboard. Please try again.');
      res.redirect('/');
    }
  }
);


// User creation
// GET route to display the form
router.get('/:tenantId/create-staff', 
  checkRole([ROLES.TENANT_OWNER, ROLES.TENANT_ADMIN]), 
  checkTenantAccess,
  (req, res) => {
    res.render('business/create-staff', { 
      tenant: req.user.tenants,
      roles: [ROLES.TENANT_ADMIN, ROLES.SUPPORT_STAFF]
    });
  }
);

// POST route to handle form submission
router.post('/:tenantId/create-staff', 
  checkRole([ROLES.TENANT_OWNER, ROLES.TENANT_ADMIN]), 
  checkTenantAccess,
  async (req, res) => {
    try {
      const { name, email, role } = req.body;
      const tenantId = req.params.tenantId;

      // Generate a random password (you might want to use a more secure method)
      const tempPassword = Math.random().toString(36).slice(-8);

      const newUser = await userService.createUser({
        name,
        email,
        password: tempPassword,
        role,
        tenant_id: tenantId
      });

      // TODO: Send an email to the new user with their temporary password

      req.flash('success', 'Staff member created successfully. They will receive an email with login instructions.');
      res.redirect(`/business/${tenantId}/staff`);
    } catch (error) {
      console.error('Error creating staff member:', error);
      req.flash('error', 'Failed to create staff member. Please try again.');
      res.redirect(`/business/${req.params.tenantId}/create-staff`);
    }
  }
);

//Show tenant users
router.get('/:tenantId/users', 
  isAuthenticated,
  checkRole([ROLES.TENANT_OWNER, ROLES.TENANT_ADMIN]),
  checkTenantAccess,
  async (req, res) => {
    const tenantId = req.params.tenantId;
    const users = await userService.getUsers(tenantId);
    res.json(users);
  }
);

module.exports = router;