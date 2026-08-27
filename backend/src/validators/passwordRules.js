// src/validators/passwordRules.js
// ----------------------------------------------------------------------------
// Shared password-complexity rule so change-password, create-user, and
// reset-password can't drift out of sync with each other.
// ----------------------------------------------------------------------------

const { body } = require('express-validator');

function passwordComplexity(field) {
  return body(field)
    .isLength({ min: 8 }).withMessage(`${field} must be at least 8 characters`)
    .matches(/[A-Z]/).withMessage(`${field} must contain an uppercase letter`)
    .matches(/[a-z]/).withMessage(`${field} must contain a lowercase letter`)
    .matches(/[0-9]/).withMessage(`${field} must contain a number`);
}

module.exports = { passwordComplexity };
