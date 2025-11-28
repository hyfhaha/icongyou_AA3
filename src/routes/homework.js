const router = require('express').Router();
const ctrl = require('../controllers/taskController');

router.get('/:homeworkId', ctrl.getHomeworkDetail);
router.put('/:homeworkId', ctrl.updateHomework);
router.put('/:id/comment', ctrl.updateHomeworkComment);
router.get('/:id/comment', ctrl.getHomeworkComment);

module.exports = router;

