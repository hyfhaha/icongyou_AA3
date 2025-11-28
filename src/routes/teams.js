const router = require('express').Router();
const ctrl = require('../controllers/teamController');
const roleAuth = require('../middleware/roleAuth');

// 团队管理接口（基于 API_DOC 第六部分）
// 查看自己加入的所有团队
router.get('/user', ctrl.getMyTeams);

// 查看某课程下所有团队
router.get('/course/:courseId', ctrl.getCourseTeams);

// 在某课程下创建团队（仅教师/助教/管理员）
router.post('/course/:courseId', roleAuth([1, 2, 3]), ctrl.createTeam);

// 加入团队（学生）
router.post('/:teamId/join', roleAuth([0]), ctrl.joinTeam);

// 退出团队（学生）
router.post('/:teamId/quit', roleAuth([0]), ctrl.quitTeam);

// 查看团队成员列表
router.get('/:teamId/members', ctrl.getTeamMembers);

// 任务维度的团队得分与详情（已实现）
router.get('/:storyId', ctrl.getTeams);
router.get('/detail/:teamId', ctrl.getTeamDetail);

module.exports = router;
