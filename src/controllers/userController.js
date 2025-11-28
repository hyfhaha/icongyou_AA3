const { User } = require('../models');
const bcrypt = require('bcrypt');
const { toPublicUser } = require('../utils/userSerializer');

// 将用户个性化设置简单存储在 user.remark 字段（JSON 字符串）
function parseSettings(remark) {
  if (!remark) return {};
  try {
    const obj = JSON.parse(remark);
    return typeof obj === 'object' && obj !== null ? obj : {};
  } catch (e) {
    return {};
  }
}

module.exports = {
  async getAllUsers(req, res) {
    try {
      const users = await User.findAll();
      return res.json(users.map(toPublicUser));
    } catch (err) {
      return res.status(500).json({ message: '获取所有用户失败', error: err.message });
    }
  },

  async me(req, res) {
    try {
      const user = await User.findByPk(req.user.id);
      if (!user) return res.status(404).json({ message: '用户不存在' });
      return res.json(toPublicUser(user));
    } catch (err) {
      return res.status(500).json({ message: '获取用户信息失败', error: err.message });
    }
  },

  async updateMe(req, res) {
    try {
      const user = await User.findByPk(req.user.id);
      if (!user) return res.status(404).json({ message: '用户不存在' });

      const payload = req.body && typeof req.body === 'object' ? req.body : {};
      const fields = ['nickname', 'avatar_url', 'phone_number'];
      fields.forEach((field) => {
        if (Object.prototype.hasOwnProperty.call(payload, field)) {
          user[field] = payload[field];
        }
      });
      await user.save();
      return res.json(toPublicUser(user));
    } catch (err) {
      return res.status(500).json({ message: '更新用户信息失败', error: err.message });
    }
  },

  async getUser(req, res) {
    try {
      const user = await User.findByPk(req.params.id);
      if (!user) return res.status(404).json({ message: '用户不存在' });
      return res.json(toPublicUser(user));
    } catch (err) {
      return res.status(500).json({ message: '获取用户失败', error: err.message });
    }
  },

  // PUT /api/user/password
  async changePassword(req, res) {
    try {
      const { old_password, new_password } = req.body || {};
      if (!old_password || !new_password) {
        return res.status(400).json({ message: 'old_password 和 new_password 均为必填' });
      }
      if (new_password.length < 6) {
        return res.status(400).json({ message: '新密码长度至少 6 位' });
      }

      const user = await User.findByPk(req.user.id);
      if (!user) return res.status(401).json({ message: '未登录或用户不存在' });

      const ok = await bcrypt.compare(old_password, user.password_hash || '');
      if (!ok) return res.status(400).json({ message: '原密码不正确' });

      const hash = await bcrypt.hash(new_password, 10);
      user.password_hash = hash;
      await user.save();
      return res.json({ message: '密码修改成功' });
    } catch (err) {
      return res.status(500).json({ message: '密码修改失败', error: err.message });
    }
  },

  // GET /api/user/settings
  async getSettings(req, res) {
    try {
      const user = await User.findByPk(req.user.id);
      if (!user) return res.status(401).json({ message: '未登录或用户不存在' });
      const settings = parseSettings(user.remark);
      return res.json(settings);
    } catch (err) {
      return res.status(500).json({ message: '获取设置失败', error: err.message });
    }
  },

  // PUT /api/user/settings
  async updateSettings(req, res) {
    try {
      const user = await User.findByPk(req.user.id);
      if (!user) return res.status(401).json({ message: '未登录或用户不存在' });

      const current = parseSettings(user.remark);
      const incoming = req.body && typeof req.body === 'object' ? req.body : {};
      const merged = { ...current, ...incoming };
      user.remark = JSON.stringify(merged);
      await user.save();
      return res.json(merged);
    } catch (err) {
      return res.status(500).json({ message: '更新设置失败', error: err.message });
    }
  }
};