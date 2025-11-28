const router = require('express').Router();
const ctrl = require('../controllers/messageController');

// 发送消息
router.post('/', ctrl.sendMessage);

// 当前用户的对话列表（按对方用户维度）
router.get('/conversations', ctrl.getConversations);

// 与某个用户之间的消息列表
router.get('/with/:userId', ctrl.getMessagesWithUser);

module.exports = router;


