const router = require('express').Router();
const ctrl = require('../controllers/ossController');

// 获取 OSS 临时凭证，用于前端直传 OSS
router.get('/sts-token', ctrl.getStsToken);

module.exports = router;


