const { Op } = require('sequelize');
const { Message, User, Conversation, ReadReceipt, sequelize } = require('../models');
const getPagination = require('../utils/pagination');

// Helper to generate conversation ID: tenant_minId_maxId
const getConversationId = (userId1, userId2, tenantId = 0) => {
  const minId = Math.min(Number(userId1), Number(userId2));
  const maxId = Math.max(Number(userId1), Number(userId2));
  return `${tenantId}_${minId}_${maxId}`;
};

module.exports = {
  // POST /api/messages
  async sendMessage(req, res) {
    const transaction = await sequelize.transaction();
    try {
      const senderId = req.user.id;
      const { receiverId, content } = req.body || {};

      if (!receiverId || !content || typeof content !== 'string' || !content.trim()) {
        await transaction.rollback();
        return res.status(400).json({ message: 'receiverId 和 content 为必填，且 content 不能为空' });
      }

      if (Number(receiverId) === Number(senderId)) {
        await transaction.rollback();
        return res.status(400).json({ message: '不能给自己发送消息' });
      }

      const receiver = await User.findByPk(receiverId);
      if (!receiver) {
        await transaction.rollback();
        return res.status(404).json({ message: '接收方用户不存在' });
      }

      const tenantId = receiver.tenant_id || 0;
      const conversationId = getConversationId(senderId, receiverId, tenantId);

      // 1. Create message
      const msg = await Message.create({
        conversation_id: conversationId,
        sender_id: senderId,
        receiver_id: receiverId,
        content: content.trim(),
        content_type: 'text',
        status: 1, // Normal
        timestamp_ms: Date.now(),
        tenant_id: tenantId
      }, { transaction });

      // 2. Ensure Conversation exists
      let conversation = await Conversation.findOne({
        where: { conversation_id: conversationId, tenant_id: tenantId },
        transaction
      });

      if (!conversation) {
        const minId = Math.min(Number(senderId), Number(receiverId));
        const maxId = Math.max(Number(senderId), Number(receiverId));
        conversation = await Conversation.create({
          conversation_id: conversationId,
          user_a: minId,
          user_b: maxId,
          tenant_id: tenantId,
          unread_a: 0,
          unread_b: 0,
          deleted: false
        }, { transaction });
      }

      // 3. Update Conversation (last_msg, unread count)
      // Check if sender is user_a or user_b
      const isSenderA = Number(senderId) === Number(conversation.user_a);
      
      const updateData = {
        last_msg_id: msg.msg_id,
        last_msg_content: content.trim().substring(0, 1000),
        last_msg_time: msg.timestamp_ms,
        update_time: new Date()
      };

      // If sender is A, increment B's unread count
      if (isSenderA) {
        updateData.unread_b = sequelize.literal('unread_b + 1');
      } else {
        updateData.unread_a = sequelize.literal('unread_a + 1');
      }

      await Conversation.update(updateData, {
        where: { id: conversation.id },
        transaction
      });

      await transaction.commit();

      return res.json({
        id: msg.msg_id,
        senderId: msg.sender_id,
        receiverId: msg.receiver_id,
        content: msg.content,
        isRead: false, 
        createTime: msg.create_time
      });
    } catch (err) {
      if (transaction) await transaction.rollback();
      console.error(err);
      return res.status(500).json({ message: '发送消息失败', error: err.message });
    }
  },

  // GET /api/messages/conversations
  async getConversations(req, res) {
    try {
      const userId = req.user.id;
      const tenantId = req.user.tenant_id || 0; // Assuming user has tenant_id

      // Find conversations where user is involved
      const conversations = await Conversation.findAll({
        where: {
          tenant_id: tenantId,
          deleted: false,
          [Op.or]: [{ user_a: userId }, { user_b: userId }]
        },
        order: [['update_time', 'DESC']]
      });

      // Get partner IDs
      const partnerIds = conversations.map(c => 
        Number(c.user_a) === Number(userId) ? c.user_b : c.user_a
      );

      let users = [];
      if (partnerIds.length > 0) {
        users = await User.findAll({ where: { id: partnerIds } });
      }
      const userMap = new Map(users.map((u) => [u.id, u]));

      const list = conversations.map(c => {
        const partnerId = Number(c.user_a) === Number(userId) ? c.user_b : c.user_a;
        const u = userMap.get(partnerId);
        const unreadCount = Number(c.user_a) === Number(userId) ? c.unread_a : c.unread_b;

        return {
          conversationId: c.conversation_id,
          partnerId: partnerId,
          partnerName: (u && (u.nickname || u.username)) || '未知用户',
          partnerRole: u ? u.user_role : undefined,
          lastMessage: c.last_msg_content,
          lastTime: c.update_time, // or last_msg_time (ms)
          unreadCount: unreadCount
        };
      });

      return res.json({ list });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: '获取会话列表失败', error: err.message });
    }
  },

  // GET /api/messages/with/:userId
  async getMessagesWithUser(req, res) {
    const transaction = await sequelize.transaction();
    try {
      const userId = req.user.id;
      const otherId = Number(req.params.userId);
      const tenantId = req.user.tenant_id || 0;

      if (!otherId) {
        await transaction.rollback();
        return res.status(400).json({ message: 'userId 无效' });
      }

      const conversationId = getConversationId(userId, otherId, tenantId);

      const { limit, offset } = getPagination(req);
      const page = parseInt(req.query.page, 10) || 1;
      const pageSize = parseInt(req.query.pageSize, 10) || limit;

      const { rows, count } = await Message.findAndCountAll({
        where: {
          conversation_id: conversationId,
          status: 1 // 正常消息
        },
        order: [['timestamp_ms', 'DESC']], // Usually DESC for pagination, frontend reverses
        limit,
        offset,
        transaction
      });

      // Mark as read logic
      // 1. Reset unread count in Conversation for current user
      const conversation = await Conversation.findOne({
        where: { conversation_id: conversationId, tenant_id: tenantId },
        transaction
      });

      if (conversation) {
        const isUserA = Number(userId) === Number(conversation.user_a);
        const updateData = {};
        if (isUserA) {
          updateData.unread_a = 0;
        } else {
          updateData.unread_b = 0;
        }
        await Conversation.update(updateData, {
            where: { id: conversation.id },
            transaction
        });
        
        // 2. Update ReadReceipt (optional but good for "read by other" status)
        // Find the latest message ID from the other user
        if (rows.length > 0) {
           const lastMsg = rows[0]; // Since we ordered by DESC
           // upsert read receipt
            const existingReceipt = await ReadReceipt.findOne({
                where: { conversation_id: conversationId, user_id: userId, tenant_id: tenantId },
                transaction
            });
            
            if (existingReceipt) {
                 if (existingReceipt.last_read_msg_id < lastMsg.msg_id) {
                     existingReceipt.last_read_msg_id = lastMsg.msg_id;
                     await existingReceipt.save({ transaction });
                 }
            } else {
                await ReadReceipt.create({
                    conversation_id: conversationId,
                    user_id: userId,
                    last_read_msg_id: lastMsg.msg_id,
                    tenant_id: tenantId
                }, { transaction });
            }
        }
      }

      await transaction.commit();

      const list = rows.reverse().map((msg) => ({
        id: msg.msg_id,
        senderId: msg.sender_id,
        receiverId: msg.receiver_id,
        fromMe: Number(msg.sender_id) === Number(userId),
        content: msg.content,
        createTime: msg.create_time,
        timestamp: msg.timestamp_ms
      }));

      return res.json({
        list,
        page,
        pageSize,
        total: count
      });
    } catch (err) {
      if (transaction) await transaction.rollback();
      console.error(err);
      return res.status(500).json({ message: '获取消息列表失败', error: err.message });
    }
  }
};
