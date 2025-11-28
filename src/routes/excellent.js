const router = require('express').Router();
const ctrl = require('../controllers/excellentController');
router.get('/:storyId', ctrl.listExcellent);
router.post('/:storyId/:workId/like', ctrl.like);
router.post('/:storyId/:workId/bookmark', ctrl.bookmark);
router.post('/:workId/set', ctrl.setRecommend);
router.post('/:workId/unset', ctrl.unsetRecommend);
module.exports = router;
