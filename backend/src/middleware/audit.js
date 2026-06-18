import prisma from '../config/db.js';

export const createAuditLog = async ({
  userId,
  action,
  entity,
  entityId,
  details,
  ipAddress,
}) => {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        entity,
        entityId,
        details: details ? JSON.stringify(details) : null,
        ipAddress,
      },
    });
  } catch (err) {
    console.error('Audit log error:', err.message);
  }
};

export const auditMiddleware = (action, entity) => (req, res, next) => {
  const originalJson = res.json.bind(res);

  res.json = (body) => {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      createAuditLog({
        userId: req.user?.id,
        action,
        entity,
        entityId: body?.data?.id || req.params?.id,
        details: { method: req.method, path: req.path },
        ipAddress: req.ip,
      });
    }
    return originalJson(body);
  };

  next();
};
