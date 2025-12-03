const jwt = require('jsonwebtoken');
const { User } = require('../models');

module.exports = async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || '';
  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const token = authHeader.slice('Bearer '.length).trim();
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'changeme');
    const user = await User.findByPk(payload.id);
    if (!user) return res.status(401).json({ message: 'Unauthorized' });

    req.user = {
      id: user.id,
      user_role: user.user_role,
      nickname: user.nickname,
      username: user.username,
      tenant_id: user.tenant_id
    };
    return next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};
