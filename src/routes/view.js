const router = require('express').Router();
const ctrl = require('../controllers/viewController');

// 课程学生视图：基于 vw_course_user_score
router.get('/course-students', ctrl.getCourseStudentsView);

// 任务提交统计视图：基于 vw_task_submission_stats
router.get('/task-submission', ctrl.getTaskSubmissionView);

module.exports = router;


