// src/middleware/roleMiddleware.js
// ----------------------------------------------------------------------------
// Restricts a route to one or more roles.
// ----------------------------------------------------------------------------

function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: insufficient permissions',
      });
    }

    next();
  };
}

module.exports = requireRole;
