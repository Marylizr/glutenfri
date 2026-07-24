const AdminAction = require('../models/AdminAction');

async function recordAdminAction({
  actorId,
  action,
  targetType,
  targetId,
  targetLabel,
  reason,
  metadata,
}) {
  return AdminAction.create({
    actor: actorId,
    action,
    targetType,
    targetId,
    targetLabel,
    reason,
    metadata,
  });
}

module.exports = { recordAdminAction };
