// src/utils/auditEntityLink.js
// ----------------------------------------------------------------------------
// Maps an audit log's entity type to the route of its detail page.
// ----------------------------------------------------------------------------

const ENTITY_ROUTES = {
  user: 'users',
  product: 'products',
  transaction: 'transactions',
};

export function entityDetailPath(entity, entityId) {
  const prefix = ENTITY_ROUTES[entity];
  if (!prefix || !entityId) return null;
  return `/${prefix}/${entityId}`;
}
