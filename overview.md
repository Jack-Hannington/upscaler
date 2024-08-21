<app_summary>

Application Name: Upscaler
Type: Web Application
Primary Purpose: Image upscaler

Technology Stack:
- Backend: Node.js with Express.js
- Database: PostgreSQL (via Supabase)
- Authentication: Passport.js
- Template Engine: EJS
- ORM: Supabase Client
- Additional Libraries: bcryptjs, crypto, connect-flash

Key Features:
1. Multi-tenancy support
2. User authentication and authorization
3. Password reset functionality
4. Role-based access control
5. Service management for tenants

Database Schema (partial):
- users: id, email, password, role, tenant_id, reset_password_token, reset_password_expires
- tenants: id, name (other details not provided)

Authentication Flow:
- Local strategy using Passport.js
- Email and password-based login
- Password reset functionality with token-based verification

Authorization:
- Role-based access control (RBAC)
- Roles include: super_admin, tenant_admin, customer (potentially others)
- Middleware for checking user roles and tenant access

Key Routes and Middleware:

1. Authentication Middleware:
```javascript
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const supabase = require('../config/supabaseClient');

passport.use(new LocalStrategy(
  { usernameField: 'email' },
  async (email, password, done) => {
    // User authentication logic
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  // User deserialization logic
});

const authenticateUser = passport.authenticate('local', {
  successRedirect: '/dashboard',
  failureRedirect: '/login',
  failureFlash: true
});

const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
};
```

2. Role-based Access Control Middleware:
```javascript
const ROLES = {
  SUPER_ADMIN: 'super_admin',
  TENANT_ADMIN: 'tenant_admin',
  CUSTOMER: 'customer'
};

const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    // Role checking logic
  };
};

const checkTenantAccess = (req, res, next) => {
  // Tenant access checking logic
};
```

3. Password Reset Flow:
```javascript
router.get('/forgot-password', (req, res) => {
  // Render forgot password form
});

router.post('/forgot-password', async (req, res) => {
  // Handle password reset request
});

router.get('/reset-password/:token', async (req, res) => {
  // Render password reset form
});

router.post('/reset-password/:token', async (req, res) => {
  // Process password reset
});
```

4. Service Management (partial):
```javascript
router.get('/', async (req, res) => {
  // Fetch and display services for a tenant
});

router.post('/add-service', upload.single('service_image'), async (req, res) => {
  // Add a new service
});

router.post('/edit-service/:id', async (req, res) => {
  // Edit an existing service
});
```

Project Structure:
```
project_root/
│
├── config/
│   ├── supabaseClient.js
│   └── sendgrid.js
│
├── middleware/
│   ├── auth.js
│   └── roles.js
│
├── routes/
│   ├── auth.js
│   ├── services.js
│   └── users.js
│
├── views/
│   ├── auth/
│   │   ├── login.ejs
│   │   ├── forgot-password.ejs
│   │   └── reset-password.ejs
│   └── services/
│       └── (service-related views)
│
├── public/
│   └── (static files)
│
├── app.js
├── .env
└── package.json
```

Additional Notes:
- The application uses environment variables for configuration (stored in .env file)
- Flash messages are used for user feedback
- File upload functionality is implemented for service images
- The application is designed with potential for expanding to include features like two-factor authentication

</app_summary>
