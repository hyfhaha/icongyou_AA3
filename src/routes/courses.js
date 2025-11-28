const router = require('express').Router();
const ctrl = require('../controllers/courseController');

// 课程列表
router.get('/', ctrl.listCourses);

// 多课程导览总览
router.get('/overview', ctrl.getCoursesOverview);

// 单课程基础信息与任务列表
router.get('/:id', ctrl.getCourse);

// 单课程个人总览
router.get('/:id/personal', ctrl.getPersonalOverview);

// 课程地图元数据：毕业要求、史诗、阶段
router.get('/:id/map-metadata', ctrl.getCourseMapMetadata);

// 课程任务完成情况统计
router.get('/:id/tasks/status', ctrl.getCourseTasksStatus);

// 课程学生列表 + 总分/排名
router.get('/:id/students', ctrl.getCourseStudents);

// 当前用户在本课程中的能力维度达成度
router.get('/:id/abilities/me', ctrl.getCourseAbilitiesMe);

module.exports = router;
