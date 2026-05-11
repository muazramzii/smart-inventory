// src/utils/jwt.js
// ----------------------------------------------------------------------------
// Sign and verify JWTs. The payload includes the minimal info needed to
// authorize requests: user id and role.
// ----------------------------------------------------------------------------

const jwt = require('jsonwebtoken');
const config = require('../config/env');

function signToken(payload) {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
}

function verifyToken(token) {
  return jwt.verify(token, config.jwt.secret);
}

module.exports = { signToken, verifyToken };
