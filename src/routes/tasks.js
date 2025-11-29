const router = require('express').Router();
const ctrl = require('../controllers/taskController');

router.get('/', ctrl.listTasks);
router.post('/:storyId/view', ctrl.recordTaskView);
router.get('/:storyId/discussions', ctrl.getTaskDiscussions);
router.post('/:storyId/discussions', ctrl.createTaskDiscussion);
router.get('/:storyId/homework/list', ctrl.listTaskHomeworks);
router.get('/:storyId/submissions/my', ctrl.getMySubmissions);
router.get('/:storyId/board', ctrl.getTaskBoard);
router.get('/:storyId', ctrl.getTaskDetail);
router.post('/:storyId/submit', ctrl.submitTask);

module.exports = router;
