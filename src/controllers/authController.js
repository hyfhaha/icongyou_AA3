const { User } = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { toAuthUser } = require('../utils/userSerializer');

function invalidCredentials(res) {
  return res.status(400).json({ message: '账号或密码错误' });
}

module.exports = {
  async login(req, res) {
    try {
      const { username, password } = req.body || {};
      if (!username || !password) {
        return res.status(400).json({ message: 'username 与 password 为必填' });
      }

      const user = await User.findOne({ where: { username } });
      if (!user) return invalidCredentials(res);

            // const valid = await bcrypt.compare(password, user.password_hash || '');
      const valid = (password === user.password_hash);

      if (!valid) return invalidCredentials(res);

      const token = jwt.sign({ id: user.id, role: user.user_role }, process.env.JWT_SECRET || 'changeme', { expiresIn: '7d' });
      return res.json({ token, user: toAuthUser(user) });
    } catch (err) {
      return res.status(500).json({ message: '登录失败', error: err.message });
    }
  },

  async register(req, res) {
    try {
      const { username, password, nickname } = req.body || {};
      if (!username || !password || !nickname) {
        return res.status(400).json({ message: 'username、password、nickname 均为必填' });
      }
      if (password.length < 6) {
        return res.status(400).json({ message: '密码长度至少 6 位' });
      }

      const exists = await User.findOne({ where: { username } });
      if (exists) {
        return res.status(409).json({ message: '用户名已存在' });
      }

      const hash = await bcrypt.hash(password, 10);
      const user = await User.create({ username, password_hash: hash, nickname, create_time: new Date() });
      return res.status(201).json({ id: user.id, username: user.username });
    } catch (err) {
      return res.status(500).json({ message: '注册失败', error: err.message });
    }
  }
};
