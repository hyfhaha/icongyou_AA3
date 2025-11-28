const router = require('express').Router();
const ctrl = require('../controllers/userController');

// 获取所有用户
router.get('/', ctrl.getAllUsers);

// 当前用户信息
router.get('/me', ctrl.me);
router.put('/me', ctrl.updateMe);

// 账号安全 / 设置
router.put('/password', ctrl.changePassword);
router.get('/settings', ctrl.getSettings);
router.put('/settings', ctrl.updateSettings);

// 按 ID 获取指定用户
router.get('/:id', ctrl.getUser);

module.exports = router;
