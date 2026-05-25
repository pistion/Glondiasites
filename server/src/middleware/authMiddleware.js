export function authMiddleware(req, res, next) {
  req.user = {
    id: req.headers['x-user-id'] || req.headers['x-glondia-user-id'] || 'local-user',
    role: req.headers['x-user-role'] || 'owner',
  };
  next();
}

export default authMiddleware;

