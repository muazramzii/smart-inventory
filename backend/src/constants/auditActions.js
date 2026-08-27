// src/constants/auditActions.js
// ----------------------------------------------------------------------------
// Canonical audit action/entity names. Centralized so every writer and the
// route's query validation agree on exactly the same set of values.
// ----------------------------------------------------------------------------

const AUDIT_ACTIONS = Object.freeze({
  LOGIN: 'LOGIN',
  CHANGE_PASSWORD: 'CHANGE_PASSWORD',
  PRODUCT_CREATE: 'PRODUCT_CREATE',
  PRODUCT_UPDATE: 'PRODUCT_UPDATE',
  PRODUCT_DELETE: 'PRODUCT_DELETE',
  STOCK_IN: 'STOCK_IN',
  STOCK_OUT: 'STOCK_OUT',
  TRANSACTION_REVERSE: 'TRANSACTION_REVERSE',
});

const AUDIT_ENTITIES = Object.freeze({
  USER: 'user',
  PRODUCT: 'product',
  TRANSACTION: 'transaction',
});

module.exports = { AUDIT_ACTIONS, AUDIT_ENTITIES };
