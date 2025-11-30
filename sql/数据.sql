-- 使用你的业务数据库
-- USE your_db_name;

SET FOREIGN_KEY_CHECKS = 0;

-----------------------
INSERT INTO `user` (
  id,
  username, password_hash, nickname,
  user_role, status,
  deleted, tenant_id
) VALUES
  (17, 'student01', '123456', '学生01',
   0, 1,
   0, 0)
ON DUPLICATE KEY UPDATE
  username = VALUES(username),
  password_hash = VALUES(password_hash),
  nickname = VALUES(nickname),
  user_role = VALUES(user_role);

---------------------------
-- 0. 补一位老师用户（id = 3），用于消息 / 排行等
--------------------------------------------------
INSERT INTO `user` (
  id, username, password_hash, nickname,
  user_role, status, deleted, tenant_id
) VALUES
  (3, 'teacher01', '123456', '老师01', 1, 1, 0, 0)
ON DUPLICATE KEY UPDATE
  username = VALUES(username),
  nickname = VALUES(nickname),
  user_role = VALUES(user_role);

--------------------------------------------------
-- 1. 课程（course_id = 1）
--------------------------------------------------
INSERT INTO course (
  course_id, course_name, course_desc, semester,
  start_time, end_time, lesson_status, show_score,
  deleted, tenant_id
) VALUES
  (1, '软件工程实践（测试课）', '用于接口联调的示例课程', '2024秋',
   '2024-09-01 00:00:00', '2024-12-31 23:59:59',
   1, 1, b'0', 0)
ON DUPLICATE KEY UPDATE
  course_name = VALUES(course_name),
  course_desc = VALUES(course_desc);

--------------------------------------------------
-- 2. 课程地图：毕业要求 / 史诗 / 阶段（Goals / Epics / Releases）
--------------------------------------------------
INSERT IGNORE INTO course_map_goal (
  id, course_id, goal_name, goal_desc, goal_level, goal_reference,
  sort, deleted, tenant_id
) VALUES
  (1, 1, '工程设计能力', '完成中等复杂系统的需求与设计。', 'H', '1.1.1', 1, b'0', 0);

INSERT IGNORE INTO course_map_epic (
  id, course_id, goal_id, epic_name, sort, deleted, tenant_id
) VALUES
  (1, 1, 1, '需求与原型设计', 1, b'0', 0);

INSERT IGNORE INTO course_map_release (
  id, course_id, release_name, release_desc, deleted, tenant_id
) VALUES
  (1, 1, '阶段1：需求分析', '完成项目选题与需求规格说明书。', b'0', 0);

--------------------------------------------------
-- 3. 课程地图：任务（stories），包含你要测的 story_id = 1002
--------------------------------------------------
-- 注意：course_map_story 主键是 (id, examine_type)，这里统一用 examine_type = 1

INSERT IGNORE INTO course_map_story (
  id, course_id, goal_id, epic_id, release_id,
  story_name, story_desc,
  story_type, submit_type, total_score,
  start_time, end_time,
  examine_type, position_x, position_y,
  deleted, tenant_id
) VALUES
  (1001, 1, 1, 1, 1,
   '选题报告', '完成课程项目选题并提交简要说明。',
   1, 2, 10,
   '2024-09-05 00:00:00', '2024-09-12 23:59:59',
   1, 1, 1,
   b'0', 0),
  (1002, 1, 1, 1, 1,
   '需求规格说明书', '根据给定业务场景完成 SRS 文档。',
   2, 2, 40,
   '2024-09-10 00:00:00', '2024-09-25 23:59:59',
   1, 2, 1,
   b'0', 0);

--------------------------------------------------
-- 4. 任务资料（materials），供 /api/tasks/1002 返回 materials 数组
--------------------------------------------------
INSERT IGNORE INTO course_map_story_material (
  id, course_id, story_id,
  material_name, material_type, file_name, content,
  remark, deleted, tenant_id
) VALUES
  (1, 1, 1002,
   'SRS 模板（DOCX）', 5, 'srs_template.docx',
   'https://example.com/files/srs_template.docx',
   '示例需求规格说明书模板', b'0', 0);

--------------------------------------------------
-- 5. 小组 & 选课学生（Teams 模块 + 任务统计）
-- 假设 student01 的 id = 17，如不一致请改下面的 17
--------------------------------------------------
-- 课堂小组：id = 11
INSERT IGNORE INTO course_group (
  id, course_id, group_name, max_size, current_size,
  group_code, deleted, tenant_id
) VALUES
  (11, 1, '第 1 小组', 6, 1, 'SE-G1', b'0', 0);

-- 学生选课并加入第 1 小组
INSERT IGNORE INTO course_student (
  id, course_id, student_id, group_id, leader,
  deleted, tenant_id
) VALUES
  (10001, 1, 17, 11, 1, b'0', 0);

--------------------------------------------------
-- 6. 学生作业（course_student_work），用于：
--   - /api/tasks?course_id=1 中的 done/latest_xxx
--   - /api/tasks/1002 里的 myWork
--   - /api/tasks/1002/board & /api/view 统计
--------------------------------------------------
INSERT INTO course_student_work (
  course_id, story_id, student_id, submit_id, submit_name,
  group_id, teamwork,
  file_name, file_url,
  score, team_score,
  recommend, recommend_rank,
  like_count, favorite_count,
  creator, deleted, tenant_id
) VALUES
  (1, 1002, 17, 17, 'student01',
   11, 1,
   '需求规格说明书_第1组.docx', 'https://example.com/files/srs_group1.docx',
   38.0, 38.0,
   b'1', 5,
   3, 1,
   'teacher01', b'0', 0);

--------------------------------------------------
-- 7. 任务讨论（discussions），供 /api/tasks/1002/discussions 和热度统计使用
--------------------------------------------------
INSERT INTO discussions (
  story_id, course_id, user_id, user_name, content,
  likes, reply_to, deleted, tenant_id
) VALUES
  (1002, 1, 17, 'student01', '老师，这个用例图需要画到什么粒度？', 1, NULL, b'0', 0),
  (1002, 1, 3, 'teacher01', '覆盖主要业务场景即可，重点关注主干流程。', 0, 1, b'0', 0);

--------------------------------------------------
-- 8. 消息（messages），供 /api/messages/* 接口测试
--------------------------------------------------
INSERT INTO messages (
  sender_id, receiver_id, content,
  is_read, creator, deleted, tenant_id
) VALUES
  (17, 3, '老师好，我有一个问题想请教……', 0, 'student01', 0, 0),
  (3, 17, '好的，你可以把作业链接发给我。', 0, 'teacher01', 0, 0);

SET FOREIGN_KEY_CHECKS = 1;