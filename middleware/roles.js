// middleware/roles.js

const ROLES = {
    SUPER_ADMIN: 'super_admin',
    TENANT_OWNER: 'tenant_owner',
    TENANT_ADMIN: 'tenant_admin',
    SUPPORT_STAFF: 'support_staff',
    CUSTOMER: 'customer'
  };
  
  const checkRole = (allowedRoles) => {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
  
      if (req.user.role === ROLES.SUPER_ADMIN) {
        return next(); // Super admin can access everything
      }
  
      if (allowedRoles.includes(req.user.role)) {
        return next();
      }
  
      res.status(403).json({ message: 'Unauthorized' });
    };
  };
  
  const checkTenantAccess = (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
  
    if (req.user.role === ROLES.SUPER_ADMIN) {
      return next(); // Super admin can access all tenants
    }
  
    const requestedTenantId = req.params.tenantId || req.body.tenantId || req.query.tenantId;
  
    if (req.user.tenant_id.toString() !== requestedTenantId) {
      return res.status(403).json({ message: 'Access denied' });
    }
  
    next();
  };
  
  module.exports = { ROLES, checkRole, checkTenantAccess };