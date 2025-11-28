const { Op } = require('sequelize');
const { Message, User } = require('../models');
const getPagination = require('../utils/pagination');

module.exports = {
  // POST /api/messages
  async sendMessage(req, res) {
    try {
      const senderId = req.user.id;
      const { receiverId, content } = req.body || {};

      if (!receiverId || !content || typeof content !== 'string' || !content.trim()) {
        return res.status(400).json({ message: 'receiverId 和 content 为必填，且 content 不能为空' });
      }

      if (Number(receiverId) === Number(senderId)) {
        return res.status(400).json({ message: '不能给自己发送消息' });
      }

      const receiver = await User.findByPk(receiverId);
      if (!receiver) {
        return res.status(404).json({ message: '接收方用户不存在' });
      }

      const msg = await Message.create({
        sender_id: senderId,
        receiver_id: receiverId,
        content: content.trim(),
        is_read: false,
        creator: req.user.username || req.user.nickname || '',
        deleted: false,
        tenant_id: receiver.tenant_id || 0
      });

      return res.json({
        id: msg.id,
        senderId: msg.sender_id,
        receiverId: msg.receiver_id,
        content: msg.content,
        isRead: msg.is_read,
        createTime: msg.create_time
      });
    } catch (err) {
      return res.status(500).json({ message: '发送消息失败', error: err.message });
    }
  },

  // GET /api/messages/conversations
  async getConversations(req, res) {
    try {
      const userId = req.user.id;

      const messages = await Message.findAll({
        where: {
          deleted: false,
          [Op.or]: [{ sender_id: userId }, { receiver_id: userId }]
        },
        order: [['create_time', 'DESC']]
      });

      const map = new Map();

      messages.forEach((msg) => {
        const partnerId = Number(msg.sender_id) === Number(userId) ? msg.receiver_id : msg.sender_id;
        if (!map.has(partnerId)) {
          map.set(partnerId, {
            partnerId,
            lastMessage: msg.content,
            lastTime: msg.create_time,
            lastIsFromMe: Number(msg.sender_id) === Number(userId),
            unreadCount: 0
          });
        }
        if (Number(msg.receiver_id) === Number(userId) && !msg.is_read) {
          const item = map.get(partnerId);
          item.unreadCount += 1;
        }
      });

      const partnerIds = Array.from(map.keys());
      let users = [];
      if (partnerIds.length > 0) {
        users = await User.findAll({ where: { id: partnerIds } });
      }
      const userMap = new Map(users.map((u) => [u.id, u]));

      const list = partnerIds.map((pid) => {
        const base = map.get(pid);
        const u = userMap.get(pid);
        return {
          conversationId: String(pid), // 使用对方用户 ID 作为会话标识
          partnerId: pid,
          partnerName: (u && (u.nickname || u.username)) || '未知用户',
          partnerRole: u ? u.user_role : undefined,
          lastMessage: base.lastMessage,
          lastTime: base.lastTime,
          lastIsFromMe: base.lastIsFromMe,
          unreadCount: base.unreadCount
        };
      });

      return res.json({ list });
    } catch (err) {
      return res.status(500).json({ message: '获取会话列表失败', error: err.message });
    }
  },

  // GET /api/messages/with/:userId
  async getMessagesWithUser(req, res) {
    try {
      const userId = req.user.id;
      const otherId = Number(req.params.userId);

      if (!otherId) {
        return res.status(400).json({ message: 'userId 无效' });
      }

      const otherUser = await User.findByPk(otherId);
      if (!otherUser) {
        return res.status(404).json({ message: '对方用户不存在' });
      }

      const { limit, offset } = getPagination(req);
      const page = parseInt(req.query.page, 10) || 1;
      const pageSize = parseInt(req.query.pageSize, 10) || limit;

      const { rows, count } = await Message.findAndCountAll({
        where: {
          deleted: false,
          [Op.or]: [
            { sender_id: userId, receiver_id: otherId },
            { sender_id: otherId, receiver_id: userId }
          ]
        },
        order: [['create_time', 'ASC']],
        limit,
        offset
      });

      // 将对方发给当前用户且未读的消息标记为已读
      await Message.update(
        { is_read: true },
        {
          where: {
            deleted: false,
            sender_id: otherId,
            receiver_id: userId,
            is_read: false
          }
        }
      );

      const list = rows.map((msg) => ({
        id: msg.id,
        senderId: msg.sender_id,
        receiverId: msg.receiver_id,
        fromMe: Number(msg.sender_id) === Number(userId),
        content: msg.content,
        isRead: msg.is_read,
        createTime: msg.create_time
      }));

      return res.json({
        list,
        page,
        pageSize,
        total: count
      });
    } catch (err) {
      return res.status(500).json({ message: '获取消息列表失败', error: err.message });
    }
  }
};


