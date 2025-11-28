const router = require('express').Router();
const ctrl = require('../controllers/aiController');
router.post('/ask', ctrl.ask);
router.post('/generate', ctrl.generate);
router.post('/summary', ctrl.summary);
router.post('/comment', ctrl.comment);
module.exports = router;
