-- USE your_db_name;

SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE messages;
TRUNCATE TABLE discussions;
TRUNCATE TABLE task_views;
TRUNCATE TABLE course_student_work_favorite;
TRUNCATE TABLE course_student_work_like;
TRUNCATE TABLE course_student_work;
TRUNCATE TABLE course_student;
TRUNCATE TABLE course_group;
TRUNCATE TABLE course_map_story_material;
TRUNCATE TABLE course_map_story;
TRUNCATE TABLE course_map_release;
TRUNCATE TABLE course_map_epic;
TRUNCATE TABLE course_map_goal;
TRUNCATE TABLE course;
TRUNCATE TABLE `user`;
TRUNCATE TABLE tenant;

-- 1. 租户（tenant）
INSERT INTO tenant (
  id, name, contact_name, contact_email, contact_phone,
  address, logo_url, description,
  status, creator, create_time, updater, update_time, deleted
) VALUES
  (1, '示例高校', '张教务', 'admin@example.edu', '010-12345678',
   '某省某市示例路 1 号', 'https://example.com/logo1.png', '示例高校租户，用于测试',
   1, 'system', '2024-09-01 08:00:00', 'system', '2024-09-01 08:00:00', 0);

-- 2. 用户（user）——学生 / 老师 / 管理员
INSERT INTO `user` (
  id, username, password_hash, nickname, remark,
  dept_id, post_ids, email, phone_number, job_number,
  user_role, gender, avatar_url,
  status, login_ip, login_date,
  balance, creator, create_time, updater, update_time,
  deleted, tenant_id
) VALUES
  (17, 'student01', '123456', '学生01', '{"dept_name":"软件工程 1 班"}',
   101, '1,2', 'student01@example.com', '13800000001', 'S20240001',
   0, 1, 'https://example.com/avatar_s01.png',
   1, '127.0.0.1', '2024-09-01 09:00:00',
   0.00, 'init', '2024-09-01 08:10:00', 'init', '2024-09-01 08:10:00',
   0, 1),
  (18, 'student02', '123456', '学生02', '{"dept_name":"软件工程 1 班"}',
   101, '1,2', 'student02@example.com', '13800000002', 'S20240002',
   0, 1, 'https://example.com/avatar_s02.png',
   1, '127.0.0.1', '2024-09-01 09:05:00',
   0.00, 'init', '2024-09-01 08:12:00', 'init', '2024-09-01 08:12:00',
   0, 1),
  (3, 'teacher01', '123456', '老师01', '{"dept_name":"软件工程教研室"}',
   201, '3', 'teacher01@example.com', '13900000001', 'T20240001',
   1, 1, 'https://example.com/avatar_t01.png',
   1, '127.0.0.1', '2024-09-01 09:10:00',
   100.00, 'init', '2024-09-01 08:20:00', 'init', '2024-09-01 08:20:00',
   0, 1),
  (4, 'admin01', '123456', '管理员', '{"dept_name":"教务处"}',
   301, '4', 'admin01@example.com', '13600000001', 'A20240001',
   3, 1, 'https://example.com/avatar_admin.png',
   1, '127.0.0.1', '2024-09-01 09:15:00',
   0.00, 'init', '2024-09-01 08:30:00', 'init', '2024-09-01 08:30:00',
   0, 1);

-- 3. 课程（course）
INSERT INTO course (
  course_id, invite_code,
  start_time, end_time, semester, prev_course,
  course_name, course_desc,
  course_type, course_pic, course_hour, course_faculties,
  standard_team_num, teacher_ids, teacher_names,
  student_allow_team, student_allow_join,
  lesson_status, show_score,
  dept_id, user_id,
  creator, create_time, updater, update_time,
  deleted, tenant_id
) VALUES
  (1, 'SE2024-01',
   '2024-09-01 00:00:00', '2024-12-31 23:59:59', '2024秋', NULL,
   '软件工程实践', '项目驱动的软件工程实训课程，用于完整功能测试。',
   1, 'https://example.com/course_se_pic.png', 64, '软件工程学院',
   6, '3', '老师01',
   b'1', b'1',
   1, b'1',
   101, 3,
   'teacher01', '2024-08-20 10:00:00', 'teacher01', '2024-08-20 10:00:00',
   b'0', 1),
  (2, 'DS2024-01',
   '2024-09-01 00:00:00', '2024-12-31 23:59:59', '2024秋', NULL,
   '数据结构与算法', '用于刷题和复杂度分析的课程。',
   1, 'https://example.com/course_ds_pic.png', 64, '计算机学院',
   6, '3', '老师01',
   b'1', b'1',
   1, b'1',
   101, 3,
   'teacher01', '2024-08-21 10:00:00', 'teacher01', '2024-08-21 10:00:00',
   b'0', 1);

-- 4. 课程地图：Goal / Epic / Release
INSERT INTO course_map_goal (
  id, super_id, course_id,
  goal_name, goal_desc, goal_level, goal_reference,
  sort, creator, create_time, updater, update_time,
  deleted, tenant_id
) VALUES
  (1, NULL, 1,
   '工程设计能力', '能够完成中等复杂系统的需求分析与设计。', 'H', '1.1.1',
   1, 'teacher01', '2024-08-22 09:00:00', 'teacher01', '2024-08-22 09:00:00',
   b'0', 1),
  (2, NULL, 1,
   '团队协作能力', '能够在团队中有效协作完成项目迭代。', 'M', '1.3.2',
   2, 'teacher01', '2024-08-22 09:10:00', 'teacher01', '2024-08-22 09:10:00',
   b'0', 1);

INSERT INTO course_map_epic (
  id, super_id, course_id, goal_id,
  epic_name, sort, creator, create_time, updater, update_time,
  deleted, tenant_id
) VALUES
  (1, NULL, 1, 1,
   '需求与原型设计', 1, 'teacher01', '2024-08-22 10:00:00', 'teacher01', '2024-08-22 10:00:00',
   b'0', 1),
  (2, NULL, 1, 2,
   '迭代计划与复盘', 2, 'teacher01', '2024-08-22 10:05:00', 'teacher01', '2024-08-22 10:05:00',
   b'0', 1);

INSERT INTO course_map_release (
  id, super_id, course_id,
  release_name, release_desc,
  creator, create_time, updater, update_time,
  deleted, tenant_id
) VALUES
  (1, NULL, 1,
   '阶段1：需求分析', '完成选题报告与需求规格说明书。',
   'teacher01', '2024-08-23 09:00:00', 'teacher01', '2024-08-23 09:00:00',
   b'0', 1),
  (2, NULL, 1,
   '阶段2：原型与迭代', '完成原型设计、迭代计划与复盘报告。',
   'teacher01', '2024-08-23 09:05:00', 'teacher01', '2024-08-23 09:05:00',
   b'0', 1);

-- 5. 课程地图：任务（course_map_story）
INSERT INTO course_map_story (
  id, super_id, course_id, goal_id, epic_id, release_id,
  story_name, story_desc,
  story_type, preset, max_contribute, min_contribute,
  required, total_score, difficulty,
  allow_file, file_size, auto_rename, file_name, max_submit,
  submit_type, unlock_type, prev_story_id, prev_release_id,
  start_time, end_time,
  examine_type, enable_rules, llm_status, prompt,
  required_count, visible_groups, pid, copy_id,
  qna, mysql_link, video_link, video_type,
  version_status, version, repo_id, repo_switch, repo_version,
  style, sort, position_x, position_y,
  creator, create_time, updater, update_time,
  deleted, tenant_id
) VALUES
  (1001, NULL, 1, 1, 1, 1,
   '选题报告', '完成课程项目选题并提交简要说明。',
   1, 'doc', NULL, 0,
   b'1', 10.00, 2,
   'doc,docx,pdf', 10, b'1', '选题报告_学号_姓名', 3,
   2, 0, NULL, NULL,
   '2024-09-05 00:00:00', '2024-09-12 23:59:59',
   1, b'0', b'0', NULL,
   NULL, NULL, NULL, NULL,
   NULL, NULL, NULL, NULL,
   0, 1, NULL, 0, NULL,
   '{}', 1, 1, 1,
   'teacher01', '2024-08-24 09:00:00', 'teacher01', '2024-08-24 09:00:00',
   b'0', 1),
  (1002, NULL, 1, 1, 1, 1,
   '需求规格说明书', '根据给定业务场景完成 SRS 文档。',
   2, 'doc', 100, 0,
   b'1', 40.00, 3,
   'doc,docx,pdf', 20, b'1', 'SRS_小组_课题', 5,
   2, 1, 1001, 1,
   '2024-09-10 00:00:00', '2024-09-25 23:59:59',
   1, b'0', b'1', '请严格按照 IEEE SRS 模板撰写需求。',
   NULL, NULL, NULL, NULL,
   NULL, NULL, NULL, NULL,
   0, 1, NULL, 0, NULL,
   '{}', 2, 2, 1,
   'teacher01', '2024-08-24 09:10:00', 'teacher01', '2024-08-24 09:10:00',
   b'0', 1),
  (1003, NULL, 1, 1, 1, 2,
   '原型设计', '基于 SRS 完成界面原型与交互说明。',
   2, 'proto', 100, 0,
   b'1', 30.00, 3,
   'pdf,pptx', 30, b'0', 'Prototype_小组', 3,
   2, 1, 1002, 1,
   '2024-09-20 00:00:00', '2024-10-05 23:59:59',
   1, b'0', b'0', NULL,
   NULL, NULL, NULL, NULL,
   NULL, NULL, NULL, NULL,
   0, 1, NULL, 0, NULL,
   '{}', 3, 3, 1,
   'teacher01', '2024-08-24 09:20:00', 'teacher01', '2024-08-24 09:20:00',
   b'0', 1),
  (1004, NULL, 1, 2, 2, 2,
   '迭代计划', '拆分任务并估算工作量，制定迭代计划。',
   2, 'plan', 100, 0,
   b'1', 20.00, 2,
   'xlsx,pdf', 10, b'0', 'IterationPlan_小组', 2,
   2, 1, 1003, 2,
   '2024-10-01 00:00:00', '2024-10-10 23:59:59',
   1, b'0', b'0', NULL,
   NULL, NULL, NULL, NULL,
   NULL, NULL, NULL, NULL,
   0, 1, NULL, 0, NULL,
   '{}', 4, 4, 2,
   'teacher01', '2024-08-24 09:30:00', 'teacher01', '2024-08-24 09:30:00',
   b'0', 1),
  (1005, NULL, 1, 2, 2, 2,
   '迭代复盘报告', '对迭代过程进行总结与反思。',
   1, 'doc', NULL, 0,
   b'1', 20.00, 2,
   'doc,docx,pdf', 10, b'0', 'Review_学号_姓名', 2,
   2, 2, 1004, 2,
   '2024-10-10 00:00:00', '2024-10-20 23:59:59',
   1, b'0', b'0', NULL,
   NULL, NULL, NULL, NULL,
   NULL, NULL, NULL, NULL,
   0, 1, NULL, 0, NULL,
   '{}', 5, 5, 2,
   'teacher01', '2024-08-24 09:40:00', 'teacher01', '2024-08-24 09:40:00',
   b'0', 1),
  (1006, NULL, 1, 2, 2, 2,
   '团队展示', '课堂展示项目成果与反思。',
   2, 'ppt', 100, 0,
   b'0', 30.00, 3,
   'ppt,pptx', 30, b'0', 'Demo_小组', 1,
   2, 2, 1005, 2,
   '2024-10-20 00:00:00', '2024-10-30 23:59:59',
   1, b'0', b'0', NULL,
   NULL, NULL, NULL, NULL,
   NULL, NULL, NULL, NULL,
   0, 1, NULL, 0, NULL,
   '{}', 6, 6, 2,
   'teacher01', '2024-08-24 09:50:00', 'teacher01', '2024-08-24 09:50:00',
   b'0', 1);

-- 6. 任务资料
INSERT INTO course_map_story_material (
  id, super_id, course_id, story_id,
  material_name, material_type, file_name, content,
  code, remark,
  creator, create_time, updater, update_time,
  deleted, tenant_id
) VALUES
  (1, NULL, 1, 1002,
   'SRS 模板（DOCX）', 5, 'srs_template.docx',
   'https://example.com/files/srs_template.docx',
   NULL, '示例需求规格说明书模板',
   'teacher01', '2024-08-25 09:00:00', 'teacher01', '2024-08-25 09:00:00',
   b'0', 1),
  (2, NULL, 1, 1003,
   '原型参考示例', 3, 'prototype_example.png',
   'https://example.com/files/prototype_example.png',
   NULL, '示例原型截图',
   'teacher01', '2024-08-25 09:05:00', 'teacher01', '2024-08-25 09:05:00',
   b'0', 1);

-- 7. 小组 & 学生选课
INSERT INTO course_group (
  id, course_id, group_name, max_size, current_size,
  group_code, sort, dept_id, user_id,
  creator, create_time, updater, update_time,
  deleted, tenant_id
) VALUES
  (11, 1, '第 1 小组', 6, 2,
   'SE-G1', 1, 101, 3,
   'teacher01', '2024-08-26 09:00:00', 'teacher01', '2024-08-26 09:00:00',
   b'0', 1),
  (12, 1, '第 2 小组', 6, 1,
   'SE-G2', 2, 101, 3,
   'teacher01', '2024-08-26 09:05:00', 'teacher01', '2024-08-26 09:05:00',
   b'0', 1);

INSERT INTO course_student (
  id, course_id, student_id, group_id, leader,
  sort, dept_id, user_id,
  creator, create_time, updater, update_time,
  deleted, tenant_id
) VALUES
  (10001, 1, 17, 11, b'1',
   1, 101, 3,
   'teacher01', '2024-09-01 10:00:00', 'teacher01', '2024-09-01 10:00:00',
   b'0', 1),
  (10002, 1, 18, 11, b'0',
   2, 101, 3,
   'teacher01', '2024-09-01 10:05:00', 'teacher01', '2024-09-01 10:05:00',
   b'0', 1);

-- 8. 学生作业
INSERT INTO course_student_work (
  id, course_id, story_id, student_id, submit_id, submit_name,
  teamwork, objective, mysql,
  group_id, contribution,
  answer_json, file_name, file_url,
  scrap_url, scrap_json,
  score, score_by, score_time,
  team_score, status, content,
  round, last_one,
  aspose_ok, aspose_status, aspose_time, aspose_error,
  like_count, favorite_count,
  creator, create_time, updater, update_time,
  deleted, tenant_id,
  recommend, recommend_rank,
  dept_name, group_name
) VALUES
  (1, 1, 1002, 17, 17, 'student01',
   b'1', b'0', b'0',
   11, 0.50,
   NULL, 'SRS_group1.docx', 'https://example.com/files/srs_group1_v1.docx',
   NULL, NULL,
   35.00, 3, '2024-09-26 10:00:00',
   35.00, b'1', '第一次提交，存在遗漏。',
   1, b'0',
   b'0', NULL, NULL, NULL,
   2, 1,
   'student01', '2024-09-20 10:00:00', 'teacher01', '2024-09-26 10:00:00',
   b'0', 1,
   b'0', NULL,
   '软件工程 1 班', '第 1 小组'),
  (2, 1, 1002, 17, 17, 'student01',
   b'1', b'0', b'0',
   11, 0.50,
   NULL, 'SRS_group1_v2.docx', 'https://example.com/files/srs_group1_v2.docx',
   NULL, NULL,
   38.00, 3, '2024-09-28 10:00:00',
   38.00, b'1', '第二次提交，内容较完整。',
   2, b'1',
   b'0', NULL, NULL, NULL,
   5, 3,
   'student01', '2024-09-27 10:00:00', 'teacher01', '2024-09-28 10:00:00',
   b'0', 1,
   b'1', 5,
   '软件工程 1 班', '第 1 小组'),
  (3, 1, 1005, 17, 17, 'student01',
   b'0', b'0', b'0',
   11, NULL,
   NULL, 'review_s1.docx', 'https://example.com/files/review_s1.docx',
   NULL, NULL,
   19.00, 3, '2024-10-21 09:00:00',
   NULL, b'1', '迭代复盘报告，反思充分。',
   1, b'1',
   b'0', NULL, NULL, NULL,
   3, 1,
   'student01', '2024-10-20 21:00:00', 'teacher01', '2024-10-21 09:00:00',
   b'0', 1,
   b'0', NULL,
   '软件工程 1 班', '第 1 小组');

-- 9. 点赞 / 收藏
INSERT INTO course_student_work_like (
  id, work_id, story_id, user_id,
  deleted, tenant_id
) VALUES
  (1, 2, 1002, 17, 0, 1);

INSERT INTO course_student_work_favorite (
  id, work_id, story_id, user_id,
  deleted, tenant_id
) VALUES
  (1, 2, 1002, 17, 0, 1);

-- 10. 任务浏览统计（task_views）
INSERT INTO task_views (
  id, story_id, course_id, user_id,
  views, first_view_time, last_view_time,
  tenant_id
) VALUES
  (1, 1002, 1, 17,
   5, '2024-09-15 10:00:00', '2024-09-28 11:00:00',
   1),
  (2, 1002, 1, 18,
   3, '2024-09-16 09:00:00', '2024-09-27 20:00:00',
   1);

-- 11. 任务讨论（discussions）
INSERT INTO discussions (
  id, story_id, course_id, user_id, user_name,
  content, likes, reply_to,
  creator, create_time, updater, update_time,
  deleted, tenant_id
) VALUES
  (1, 1002, 1, 17, 'student01',
   '老师，这个用例图需要画到什么粒度？', 2, NULL,
   'student01', '2024-09-18 10:00:00', 'student01', '2024-09-18 10:00:00',
   b'0', 1),
  (2, 1002, 1, 3, 'teacher01',
   '覆盖主要业务场景即可，重点关注主干流程。', 1, 1,
   'teacher01', '2024-09-18 11:00:00', 'teacher01', '2024-09-18 11:00:00',
   b'0', 1);

-- 12. 消息（messages）
INSERT INTO messages (
  id, sender_id, receiver_id,
  content, is_read,
  creator, create_time, updater, update_time,
  deleted, tenant_id
) VALUES
  (1, 17, 3,
   '老师好，我有一个问题想请教……', 0,
   'student01', '2024-09-19 09:00:00', 'student01', '2024-09-19 09:00:00',
   0, 1),
  (2, 3, 17,
   '好的，你可以把作业链接发给我。', 0,-- =========================================
-- 大量联动的模拟数据（基于现有表结构）
-- 建议：在执行完建表 SQL 后，执行本脚本
-- 如需指定数据库，请先执行：USE your_db_name;
-- =========================================

SET FOREIGN_KEY_CHECKS = 0;

--------------------------------------------------
-- 1. 新增用户：老师 + 大量学生
--   已有：id=3(teacher01), id=17(student01)
--   这里新增：
--     老师：101~103
--     学生：201~220
--------------------------------------------------

INSERT INTO `user` (
  id, username, password_hash, nickname,
  user_role, status, deleted, tenant_id
) VALUES
  -- 老师
  (101, 'teacher02', '123456', '老师02', 1, 1, 0, 0),
  (102, 'teacher03', '123456', '老师03', 1, 1, 0, 0),
  (103, 'teacher04', '123456', '老师04', 1, 1, 0, 0),
  -- 学生 20 个
  (201, 'stu201', '123456', '学生201', 0, 1, 0, 0),
  (202, 'stu202', '123456', '学生202', 0, 1, 0, 0),
  (203, 'stu203', '123456', '学生203', 0, 1, 0, 0),
  (204, 'stu204', '123456', '学生204', 0, 1, 0, 0),
  (205, 'stu205', '123456', '学生205', 0, 1, 0, 0),
  (206, 'stu206', '123456', '学生206', 0, 1, 0, 0),
  (207, 'stu207', '123456', '学生207', 0, 1, 0, 0),
  (208, 'stu208', '123456', '学生208', 0, 1, 0, 0),
  (209, 'stu209', '123456', '学生209', 0, 1, 0, 0),
  (210, 'stu210', '123456', '学生210', 0, 1, 0, 0),
  (211, 'stu211', '123456', '学生211', 0, 1, 0, 0),
  (212, 'stu212', '123456', '学生212', 0, 1, 0, 0),
  (213, 'stu213', '123456', '学生213', 0, 1, 0, 0),
  (214, 'stu214', '123456', '学生214', 0, 1, 0, 0),
  (215, 'stu215', '123456', '学生215', 0, 1, 0, 0),
  (216, 'stu216', '123456', '学生216', 0, 1, 0, 0),
  (217, 'stu217', '123456', '学生217', 0, 1, 0, 0),
  (218, 'stu218', '123456', '学生218', 0, 1, 0, 0),
  (219, 'stu219', '123456', '学生219', 0, 1, 0, 0),
  (220, 'stu220', '123456', '学生220', 0, 1, 0, 0)
ON DUPLICATE KEY UPDATE
  username = VALUES(username),
  nickname = VALUES(nickname),
  user_role = VALUES(user_role);

--------------------------------------------------
-- 2. 新增课程：在已有 course_id = 1 基础上补充更多课程
--   新增：
--     2: 软件工程实践（A班）
--     3: 数据结构与算法
--     4: Web 全栈开发
--------------------------------------------------

INSERT INTO course (
  course_id, course_name, course_desc, semester,
  start_time, end_time, lesson_status, show_score,
  standard_team_num,
  teacher_ids, teacher_names,
  deleted, tenant_id
) VALUES
  (2, '软件工程实践（A班）', '面向项目实战的课程，包含完整软件工程流程。', '2024秋',
   '2024-09-01 00:00:00', '2024-12-31 23:59:59',
   1, 1,
   5,
   '101,3', '老师02,老师01',
   b'0', 0),

  (3, '数据结构与算法', '涵盖线性表、树、图及常用算法的设计与分析。', '2024秋',
   '2024-09-01 00:00:00', '2024-12-31 23:59:59',
   1, 1,
   4,
   '102', '老师03',
   b'0', 0),

  (4, 'Web 全栈开发', '从前端到后端的综合实践课程。', '2024秋',
   '2024-09-01 00:00:00', '2024-12-31 23:59:59',
   1, 1,
   6,
   '103', '老师04',
   b'0', 0)
ON DUPLICATE KEY UPDATE
  course_name = VALUES(course_name),
  course_desc = VALUES(course_desc),
  teacher_ids = VALUES(teacher_ids),
  teacher_names = VALUES(teacher_names);

--------------------------------------------------
-- 3. 课程地图：为新课程补充目标 / 史诗 / 阶段
--------------------------------------------------

-- 课程 2：软件工程实践（A班）
INSERT IGNORE INTO course_map_goal (
  id, course_id, goal_name, goal_desc, goal_level, goal_reference,
  sort, deleted, tenant_id
) VALUES
  (2, 2, '团队协作能力', '在团队项目中进行有效协作与沟通。', 'M', '2.1.1', 1, b'0', 0),
  (3, 2, '文档编写能力', '撰写规范的软件工程文档。', 'H', '2.1.2', 2, b'0', 0);

INSERT IGNORE INTO course_map_epic (
  id, course_id, goal_id, epic_name, sort, deleted, tenant_id
) VALUES
  (2, 2, 2, '项目选题与立项', 1, b'0', 0),
  (3, 2, 3, '需求分析与设计', 2, b'0', 0);

INSERT IGNORE INTO course_map_release (
  id, course_id, release_name, release_desc, deleted, tenant_id
) VALUES
  (2, 2, '阶段1：选题与调研', '确定项目方向并完成调研报告。', b'0', 0),
  (3, 2, '阶段2：需求与原型', '输出需求规格说明书与原型。', b'0', 0);

-- 课程 3：数据结构与算法
INSERT IGNORE INTO course_map_goal (
  id, course_id, goal_name, goal_desc, goal_level, goal_reference,
  sort, deleted, tenant_id
) VALUES
  (4, 3, '算法设计能力', '能针对问题选择合适的数据结构与算法。', 'H', '3.1.1', 1, b'0', 0),
  (5, 3, '代码实现能力', '能高质量实现常见数据结构。', 'M', '3.1.2', 2, b'0', 0);

INSERT IGNORE INTO course_map_epic (
  id, course_id, goal_id, epic_name, sort, deleted, tenant_id
) VALUES
  (4, 3, 4, '线性结构与查找', 1, b'0', 0),
  (5, 3, 5, '树与图', 2, b'0', 0);

INSERT IGNORE INTO course_map_release (
  id, course_id, release_name, release_desc, deleted, tenant_id
) VALUES
  (4, 3, '阶段1：线性表与栈队列', '完成顺序表、链表、栈和队列的实验。', b'0', 0),
  (5, 3, '阶段2：树与图算法', '实现二叉树、图的遍历与最短路径算法。', b'0', 0);

-- 课程 4：Web 全栈开发
INSERT IGNORE INTO course_map_goal (
  id, course_id, goal_name, goal_desc, goal_level, goal_reference,
  sort, deleted, tenant_id
) VALUES
  (6, 4, '前后端协作能力', '理解前后端接口设计与协作流程。', 'M', '4.1.1', 1, b'0', 0),
  (7, 4, '部署与运维能力', '能将 Web 应用部署到线上环境。', 'L', '4.1.2', 2, b'0', 0);

INSERT IGNORE INTO course_map_epic (
  id, course_id, goal_id, epic_name, sort, deleted, tenant_id
) VALUES
  (6, 4, 6, '前端开发基础', 1, b'0', 0),
  (7, 4, 7, '后端与部署', 2, b'0', 0);

INSERT IGNORE INTO course_map_release (
  id, course_id, release_name, release_desc, deleted, tenant_id
) VALUES
  (6, 4, '阶段1：前端组件开发', '完成若干页面与组件开发。', b'0', 0),
  (7, 4, '阶段2：后端与部署', '完成接口开发与上线部署。', b'0', 0);

--------------------------------------------------
-- 4. 课程地图：为每门课建立多种任务（个人/团队）
--   story_type:
--     1 = 个人
--     2 = 团队(队长提交)
--     3 = 团队(全员提交)
--   这里统一 examine_type = 1
--------------------------------------------------

-- 课程 2 的任务：id 2001~2006
INSERT IGNORE INTO course_map_story (
  id, course_id, goal_id, epic_id, release_id,
  story_name, story_desc,
  story_type, submit_type, total_score,
  max_contribute, min_contribute,
  start_time, end_time,
  examine_type,
  position_x, position_y,
  deleted, tenant_id
) VALUES
  (2001, 2, 2, 2, 2,
   '项目选题报告（个人）', '每位同学提交项目选题与可行性分析。', 
   1, 2, 10,
   NULL, 0,
   '2024-09-05 00:00:00', '2024-09-15 23:59:59',
   1,
   1, 1,
   b'0', 0),

  (2002, 2, 2, 2, 2,
   '需求调研访谈记录（团队-队长提交）', '小组完成不少于 3 次用户访谈，并整理访谈记录。', 
   2, 2, 20,
   60, 10,
   '2024-09-10 00:00:00', '2024-09-25 23:59:59',
   1,
   2, 1,
   b'0', 0),

  (2003, 2, 3, 3, 3,
   '原型设计稿（团队-全员提交）', '每位成员根据分工提交负责部分的原型界面。', 
   3, 2, 20,
   80, 5,
   '2024-09-20 00:00:00', '2024-10-10 23:59:59',
   1,
   3, 1,
   b'0', 0),

  (2004, 2, 3, 3, 3,
   'SRS 需求规格说明书（团队-队长提交）', '小组提交完整的 SRS 文档。', 
   2, 2, 40,
   70, 5,
   '2024-10-01 00:00:00', '2024-10-25 23:59:59',
   1,
   4, 1,
   b'0', 0),

  (2005, 2, 2, 2, 2,
   '用例图（个人）', '根据需求文档绘制完整用例图。', 
   1, 2, 10,
   NULL, 0,
   '2024-10-05 00:00:00', '2024-10-15 23:59:59',
   1,
   1, 2,
   b'0', 0),

  (2006, 2, 3, 3, 3,
   '进度汇报 PPT（团队-队长提交）', '小组制作项目阶段性进度汇报 PPT。', 
   2, 2, 20,
   60, 10,
   '2024-11-01 00:00:00', '2024-11-15 23:59:59',
   1,
   2, 2,
   b'0', 0);

-- 课程 3 的任务：id 2101~2106
INSERT IGNORE INTO course_map_story (
  id, course_id, goal_id, epic_id, release_id,
  story_name, story_desc,
  story_type, submit_type, total_score,
  start_time, end_time,
  examine_type,
  position_x, position_y,
  deleted, tenant_id
) VALUES
  (2101, 3, 4, 4, 4,
   '顺序表与链表实现', '实现顺序表与单向链表的基本操作，并撰写实验报告。', 
   1, 2, 15,
   '2024-09-10 00:00:00', '2024-09-25 23:59:59',
   1,
   1, 1,
   b'0', 0),

  (2102, 3, 4, 4, 4,
   '栈与队列应用', '通过栈与队列实现括号匹配、迷宫求解等小案例。', 
   1, 2, 15,
   '2024-09-20 00:00:00', '2024-10-05 23:59:59',
   1,
   2, 1,
   b'0', 0),

  (2103, 3, 5, 5, 5,
   '二叉树遍历（团队-全员提交）', '每位成员实现不同遍历方式，并提交代码与说明。', 
   3, 2, 20,
   '2024-10-05 00:00:00', '2024-10-20 23:59:59',
   1,
   3, 1,
   b'0', 0),

  (2104, 3, 5, 5, 5,
   '图的最短路径算法（团队-队长提交）', '小组实现 Dijkstra 或 Floyd 算法，并分析复杂度。', 
   2, 2, 30,
   '2024-10-15 00:00:00', '2024-11-05 23:59:59',
   1,
   4, 1,
   b'0', 0),

  (2105, 3, 4, 4, 4,
   '排序算法对比实验', '对比冒泡、快速、归并排序的性能差异。', 
   1, 2, 20,
   '2024-11-01 00:00:00', '2024-11-20 23:59:59',
   1,
   1, 2,
   b'0', 0),

  (2106, 3, 5, 5, 5,
   '期末综合实验报告（团队-队长提交）', '整理整个学期的实验与项目，形成综合报告。', 
   2, 2, 40,
   '2024-11-20 00:00:00', '2024-12-31 23:59:59',
   1,
   2, 2,
   b'0', 0);

-- 课程 4 的任务：id 2201~2206
INSERT IGNORE INTO course_map_story (
  id, course_id, goal_id, epic_id, release_id,
  story_name, story_desc,
  story_type, submit_type, total_score,
  start_time, end_time,
  examine_type,
  position_x, position_y,
  deleted, tenant_id
) VALUES
  (2201, 4, 6, 6, 6,
   '静态页面开发', '完成首页与课程介绍页面的 HTML/CSS 开发。', 
   1, 2, 10,
   '2024-09-05 00:00:00', '2024-09-20 23:59:59',
   1,
   1, 1,
   b'0', 0),

  (2202, 4, 6, 6, 6,
   '单页应用原型（团队-全员提交）', '基于前端框架实现 SPA 原型，每人负责一个模块。', 
   3, 2, 20,
   '2024-09-20 00:00:00', '2024-10-10 23:59:59',
   1,
   2, 1,
   b'0', 0),

  (2203, 4, 7, 7, 7,
   '后端 API 设计（团队-队长提交）', '设计并实现课程管理相关的 RESTful API。', 
   2, 2, 30,
   '2024-10-01 00:00:00', '2024-10-25 23:59:59',
   1,
   3, 1,
   b'0', 0),

  (2204, 4, 7, 7, 7,
   '数据库设计与实现（团队-队长提交）', '完成 ER 图和实际数据库表设计并实现。', 
   2, 2, 25,
   '2024-10-15 00:00:00', '2024-11-05 23:59:59',
   1,
   4, 1,
   b'0', 0),

  (2205, 4, 6, 6, 6,
   '前端组件封装（个人）', '封装若干常用 UI 组件，并撰写文档。', 
   1, 2, 15,
   '2024-11-01 00:00:00', '2024-11-20 23:59:59',
   1,
   1, 2,
   b'0', 0),

  (2206, 4, 7, 7, 7,
   '项目部署与总结（团队-队长提交）', '将项目部署到测试环境并撰写总结报告。', 
   2, 2, 30,
   '2024-11-20 00:00:00', '2024-12-31 23:59:59',
   1,
   2, 2,
   b'0', 0);

--------------------------------------------------
-- 5. 任务资料：为部分任务绑定资料，避免 materials 为空
--------------------------------------------------

INSERT IGNORE INTO course_map_story_material (
  id, course_id, story_id,
  material_name, material_type, file_name, content,
  remark, deleted, tenant_id
) VALUES
  (1001, 2, 2004,
   'SRS 模板（DOCX）', 5, 'srs_template_course2.docx',
   'https://example.com/files/course2/srs_template.docx',
   '课程2 SRS 模板', b'0', 0),

  (1002, 3, 2101,
   '线性表实验指导书', 5, 'ds_exp_linear.pdf',
   'https://example.com/files/ds/exp_linear.pdf',
   '数据结构实验指导书-线性结构', b'0', 0),

  (1003, 4, 2203,
   'API 设计规范', 1, NULL,
   'https://example.com/docs/api-style-guide',
   '学校统一 API 设计规范', b'0', 0),

  (1004, 4, 2206,
   '部署脚本样例', 2, 'deploy_example.sh',
   'https://example.com/files/deploy_example.sh',
   '示例部署脚本', b'0', 0);

--------------------------------------------------
-- 6. 小组 / 团队（course_group）
--   为课程 2/3/4 各建立多个小组
--   id 201~209
--------------------------------------------------

INSERT IGNORE INTO course_group (
  id, course_id, group_name, max_size, current_size,
  group_code, deleted, tenant_id
) VALUES
  -- 课程2：3个小组
  (201, 2, '软工A-第1组', 6, 0, 'SE2-G1', b'0', 0),
  (202, 2, '软工A-第2组', 6, 0, 'SE2-G2', b'0', 0),
  (203, 2, '软工A-第3组', 6, 0, 'SE2-G3', b'0', 0),

  -- 课程3：3个小组
  (204, 3, '算法-第1组', 5, 0, 'DS-G1', b'0', 0),
  (205, 3, '算法-第2组', 5, 0, 'DS-G2', b'0', 0),
  (206, 3, '算法-第3组', 5, 0, 'DS-G3', b'0', 0),

  -- 课程4：3个小组
  (207, 4, '全栈-第1组', 6, 0, 'WEB-G1', b'0', 0),
  (208, 4, '全栈-第2组', 6, 0, 'WEB-G2', b'0', 0),
  (209, 4, '全栈-第3组', 6, 0, 'WEB-G3', b'0', 0);

--------------------------------------------------
-- 7. 选课学生及小组成员（course_student）
--   规则：
--     - 学生 201~210 -> 课程2
--     - 学生 211~220 -> 课程3 和 4（跨课选修）
--     - 每组第一个成员 leader=1，其他为0
--------------------------------------------------

-- 课程2：学生 201~210，分到 201~203 三个组
INSERT IGNORE INTO course_student (
  id, course_id, student_id, group_id, leader,
  deleted, tenant_id
) VALUES
  -- 组 201
  (20001, 2, 201, 201, 1, b'0', 0),
  (20002, 2, 202, 201, 0, b'0', 0),
  (20003, 2, 203, 201, 0, b'0', 0),
  (20004, 2, 204, 201, 0, b'0', 0),

  -- 组 202
  (20005, 2, 205, 202, 1, b'0', 0),
  (20006, 2, 206, 202, 0, b'0', 0),
  (20007, 2, 207, 202, 0, b'0', 0),

  -- 组 203
  (20008, 2, 208, 203, 1, b'0', 0),
  (20009, 2, 209, 203, 0, b'0', 0),
  (20010, 2, 210, 203, 0, b'0', 0);

-- 课程3：学生 211~220，分到 204~206 三个组
INSERT IGNORE INTO course_student (
  id, course_id, student_id, group_id, leader,
  deleted, tenant_id
) VALUES
  -- 组 204
  (30001, 3, 211, 204, 1, b'0', 0),
  (30002, 3, 212, 204, 0, b'0', 0),
  (30003, 3, 213, 204, 0, b'0', 0),

  -- 组 205
  (30004, 3, 214, 205, 1, b'0', 0),
  (30005, 3, 215, 205, 0, b'0', 0),
  (30006, 3, 216, 205, 0, b'0', 0),

  -- 组 206
  (30007, 3, 217, 206, 1, b'0', 0),
  (30008, 3, 218, 206, 0, b'0', 0),
  (30009, 3, 219, 206, 0, b'0', 0),
  (30010, 3, 220, 206, 0, b'0', 0);

-- 课程4：部分学生 211~218 再选修本课，分到 207~209 三个组
INSERT IGNORE INTO course_student (
  id, course_id, student_id, group_id, leader,
  deleted, tenant_id
) VALUES
  -- 组 207
  (40001, 4, 211, 207, 1, b'0', 0),
  (40002, 4, 212, 207, 0, b'0', 0),
  (40003, 4, 213, 207, 0, b'0', 0),

  -- 组 208
  (40004, 4, 214, 208, 1, b'0', 0),
  (40005, 4, 215, 208, 0, b'0', 0),
  (40006, 4, 216, 208, 0, b'0', 0),

  -- 组 209
  (40007, 4, 217, 209, 1, b'0', 0),
  (40008, 4, 218, 209, 0, b'0', 0);

--------------------------------------------------
-- 8. 学生作业（course_student_work）
--   说明：
--     - 为便于后面做点赞/收藏，这里显式指定 id 段：100100+
--     - 包含个人作业、团队作业（含贡献度与团队总分）
--     - recommend=1 / recommend_rank>0 视为“优秀作业”
--------------------------------------------------

INSERT INTO course_student_work (
  id,
  course_id, story_id, student_id,
  submit_id, submit_name,
  group_id, teamwork, contribution,
  file_name, file_url,
  score, team_score,
  recommend, recommend_rank,
  like_count, favorite_count,
  creator, deleted, tenant_id
) VALUES
  -- 课程2，任务2001（个人）：每个学生一份，选取部分样本
  (100100, 2, 2001, 201, 201, '学生201', NULL, 0, NULL,
   '选题报告_学生201.docx', 'https://example.com/files/c2/2001/stu201.docx',
   9.0, NULL, b'1', 5, 5, 2, 'teacher02', b'0', 0),
  (100101, 2, 2001, 202, 202, '学生202', NULL, 0, NULL,
   '选题报告_学生202.docx', 'https://example.com/files/c2/2001/stu202.docx',
   8.5, NULL, b'0', NULL, 1, 0, 'teacher02', b'0', 0),
  (100102, 2, 2001, 203, 203, '学生203', NULL, 0, NULL,
   '选题报告_学生203.docx', 'https://example.com/files/c2/2001/stu203.docx',
   8.0, NULL, b'0', NULL, 0, 0, 'teacher02', b'0', 0),
  (100103, 2, 2001, 204, 204, '学生204', NULL, 0, NULL,
   '选题报告_学生204.docx', 'https://example.com/files/c2/2001/stu204.docx',
   9.5, NULL, b'1', 4, 3, 1, 'teacher02', b'0', 0),
  (100104, 2, 2001, 205, 205, '学生205', NULL, 0, NULL,
   '选题报告_学生205.docx', 'https://example.com/files/c2/2001/stu205.docx',
   9.2, NULL, b'0', NULL, 0, 0, 'teacher02', b'0', 0),
  (100105, 2, 2001, 206, 206, '学生206', NULL, 0, NULL,
   '选题报告_学生206.docx', 'https://example.com/files/c2/2001/stu206.docx',
   8.8, NULL, b'0', NULL, 0, 0, 'teacher02', b'0', 0),

  -- 课程2，任务2002（团队-队长提交）：按组拆成多条记录，每条有贡献度
  -- 组201：201(队长),202,203,204
  (100110, 2, 2002, 201, 201, '学生201', 201, 1, 40.0,
   '访谈记录_软工A_第1组.docx', 'https://example.com/files/c2/2002/g201_leader.docx',
   18.0, 18.0, b'1', 5, 6, 3, 'teacher02', b'0', 0),
  (100111, 2, 2002, 202, 201, '学生201', 201, 1, 20.0,
   '访谈记录_软工A_第1组_学生202.docx', 'https://example.com/files/c2/2002/g201_202.docx',
   18.0, 18.0, b'1', 5, 2, 1, 'teacher02', b'0', 0),
  (100112, 2, 2002, 203, 201, '学生201', 201, 1, 20.0,
   '访谈记录_软工A_第1组_学生203.docx', 'https://example.com/files/c2/2002/g201_203.docx',
   18.0, 18.0, b'1', 5, 1, 1, 'teacher02', b'0', 0),
  (100113, 2, 2002, 204, 201, '学生201', 201, 1, 20.0,
   '访谈记录_软工A_第1组_学生204.docx', 'https://example.com/files/c2/2002/g201_204.docx',
   18.0, 18.0, b'1', 5, 1, 0, 'teacher02', b'0', 0),

  -- 组202：205(队长),206,207
  (100114, 2, 2002, 205, 205, '学生205', 202, 1, 50.0,
   '访谈记录_软工A_第2组.docx', 'https://example.com/files/c2/2002/g202_leader.docx',
   17.5, 17.5, b'0', NULL, 1, 0, 'teacher02', b'0', 0),
  (100115, 2, 2002, 206, 205, '学生205', 202, 1, 30.0,
   '访谈记录_软工A_第2组_学生206.docx', 'https://example.com/files/c2/2002/g202_206.docx',
   17.5, 17.5, b'0', NULL, 0, 0, 'teacher02', b'0', 0),
  (100116, 2, 2002, 207, 205, '学生205', 202, 1, 20.0,
   '访谈记录_软工A_第2组_学生207.docx', 'https://example.com/files/c2/2002/g202_207.docx',
   17.5, 17.5, b'0', NULL, 0, 0, 'teacher02', b'0', 0),

  -- 组203：208(队长),209,210
  (100117, 2, 2002, 208, 208, '学生208', 203, 1, 45.0,
   '访谈记录_软工A_第3组.docx', 'https://example.com/files/c2/2002/g203_leader.docx',
   19.0, 19.0, b'1', 4, 4, 2, 'teacher02', b'0', 0),
  (100118, 2, 2002, 209, 208, '学生208', 203, 1, 30.0,
   '访谈记录_软工A_第3组_学生209.docx', 'https://example.com/files/c2/2002/g203_209.docx',
   19.0, 19.0, b'1', 4, 2, 1, 'teacher02', b'0', 0),
  (100119, 2, 2002, 210, 208, '学生208', 203, 1, 25.0,
   '访谈记录_软工A_第3组_学生210.docx', 'https://example.com/files/c2/2002/g203_210.docx',
   19.0, 19.0, b'1', 4, 1, 1, 'teacher02', b'0', 0),

  -- 课程3，任务2101（个人） 部分学生
  (100130, 3, 2101, 211, 211, '学生211', NULL, 0, NULL,
   '线性表实验报告_学生211.docx', 'https://example.com/files/c3/2101/stu211.docx',
   14.5, NULL, b'1', 5, 6, 2, 'teacher03', b'0', 0),
  (100131, 3, 2101, 212, 212, '学生212', NULL, 0, NULL,
   '线性表实验报告_学生212.docx', 'https://example.com/files/c3/2101/stu212.docx',
   13.5, NULL, b'0', NULL, 2, 0, 'teacher03', b'0', 0),
  (100132, 3, 2101, 213, 213, '学生213', NULL, 0, NULL,
   '线性表实验报告_学生213.docx', 'https://example.com/files/c3/2101/stu213.docx',
   14.0, NULL, b'0', NULL, 1, 0, 'teacher03', b'0', 0),
  (100133, 3, 2101, 214, 214, '学生214', NULL, 0, NULL,
   '线性表实验报告_学生214.docx', 'https://example.com/files/c3/2101/stu214.docx',
   15.0, NULL, b'1', 4, 3, 1, 'teacher03', b'0', 0),

  -- 课程3，任务2104（团队-队长提交），以 204~206 三个组为单位
  -- 组204：211(队长),212,213
  (100140, 3, 2104, 211, 211, '学生211', 204, 1, 50.0,
   '最短路径_算法_第1组.docx', 'https://example.com/files/c3/2104/g204_leader.docx',
   28.0, 28.0, b'1', 5, 5, 2, 'teacher03', b'0', 0),
  (100141, 3, 2104, 212, 211, '学生211', 204, 1, 30.0,
   '最短路径_算法_第1组_学生212.docx', 'https://example.com/files/c3/2104/g204_212.docx',
   28.0, 28.0, b'1', 5, 2, 1, 'teacher03', b'0', 0),
  (100142, 3, 2104, 213, 211, '学生211', 204, 1, 20.0,
   '最短路径_算法_第1组_学生213.docx', 'https://example.com/files/c3/2104/g204_213.docx',
   28.0, 28.0, b'1', 5, 1, 1, 'teacher03', b'0', 0),

  -- 组205：214(队长),215,216
  (100143, 3, 2104, 214, 214, '学生214', 205, 1, 45.0,
   '最短路径_算法_第2组.docx', 'https://example.com/files/c3/2104/g205_leader.docx',
   27.0, 27.0, b'0', NULL, 1, 0, 'teacher03', b'0', 0),
  (100144, 3, 2104, 215, 214, '学生214', 205, 1, 30.0,
   '最短路径_算法_第2组_学生215.docx', 'https://example.com/files/c3/2104/g205_215.docx',
   27.0, 27.0, b'0', NULL, 0, 0, 'teacher03', b'0', 0),
  (100145, 3, 2104, 216, 214, '学生214', 205, 1, 25.0,
   '最短路径_算法_第2组_学生216.docx', 'https://example.com/files/c3/2104/g205_216.docx',
   27.0, 27.0, b'0', NULL, 0, 0, 'teacher03', b'0', 0),

  -- 组206：217(队长),218,219,220
  (100146, 3, 2104, 217, 217, '学生217', 206, 1, 40.0,
   '最短路径_算法_第3组.docx', 'https://example.com/files/c3/2104/g206_leader.docx',
   29.0, 29.0, b'1', 4, 4, 2, 'teacher03', b'0', 0),
  (100147, 3, 2104, 218, 217, '学生217', 206, 1, 25.0,
   '最短路径_算法_第3组_学生218.docx', 'https://example.com/files/c3/2104/g206_218.docx',
   29.0, 29.0, b'1', 4, 2, 1, 'teacher03', b'0', 0),
  (100148, 3, 2104, 219, 217, '学生217', 206, 1, 20.0,
   '最短路径_算法_第3组_学生219.docx', 'https://example.com/files/c3/2104/g206_219.docx',
   29.0, 29.0, b'1', 4, 1, 1, 'teacher03', b'0', 0),
  (100149, 3, 2104, 220, 217, '学生217', 206, 1, 15.0,
   '最短路径_算法_第3组_学生220.docx', 'https://example.com/files/c3/2104/g206_220.docx',
   29.0, 29.0, b'1', 4, 1, 0, 'teacher03', b'0', 0),

  -- 课程4，任务2203（团队-队长提交），207~209 三个组
  -- 组207：211(队长),212,213
  (100160, 4, 2203, 211, 211, '学生211', 207, 1, 50.0,
   'API设计_全栈_第1组.docx', 'https://example.com/files/c4/2203/g207_leader.docx',
   28.5, 28.5, b'1', 5, 5, 3, 'teacher04', b'0', 0),
  (100161, 4, 2203, 212, 211, '学生211', 207, 1, 30.0,
   'API设计_全栈_第1组_学生212.docx', 'https://example.com/files/c4/2203/g207_212.docx',
   28.5, 28.5, b'1', 5, 3, 2, 'teacher04', b'0', 0),
  (100162, 4, 2203, 213, 211, '学生211', 207, 1, 20.0,
   'API设计_全栈_第1组_学生213.docx', 'https://example.com/files/c4/2203/g207_213.docx',
   28.5, 28.5, b'1', 5, 1, 1, 'teacher04', b'0', 0),

  -- 组208：214(队长),215,216
  (100163, 4, 2203, 214, 214, '学生214', 208, 1, 45.0,
   'API设计_全栈_第2组.docx', 'https://example.com/files/c4/2203/g208_leader.docx',
   27.0, 27.0, b'0', NULL, 1, 0, 'teacher04', b'0', 0),
  (100164, 4, 2203, 215, 214, '学生214', 208, 1, 30.0,
   'API设计_全栈_第2组_学生215.docx', 'https://example.com/files/c4/2203/g208_215.docx',
   27.0, 27.0, b'0', NULL, 0, 0, 'teacher04', b'0', 0),
  (100165, 4, 2203, 216, 214, '学生214', 208, 1, 25.0,
   'API设计_全栈_第2组_学生216.docx', 'https://example.com/files/c4/2203/g208_216.docx',
   27.0, 27.0, b'0', NULL, 0, 0, 'teacher04', b'0', 0),

  -- 组209：217(队长),218
  (100166, 4, 2203, 217, 217, '学生217', 209, 1, 60.0,
   'API设计_全栈_第3组.docx', 'https://example.com/files/c4/2203/g209_leader.docx',
   29.5, 29.5, b'1', 4, 3, 2, 'teacher04', b'0', 0),
  (100167, 4, 2203, 218, 217, '学生217', 209, 1, 40.0,
   'API设计_全栈_第3组_学生218.docx', 'https://example.com/files/c4/2203/g209_218.docx',
   29.5, 29.5, b'1', 4, 2, 1, 'teacher04', b'0', 0);

--------------------------------------------------
-- 9. 优秀作业点赞 / 收藏（course_student_work_like / favorite）
--   选取上面 recommend=1 的部分作业作为“优秀作业”
--------------------------------------------------

INSERT INTO course_student_work_like (
  work_id, story_id, user_id,
  deleted, tenant_id
) VALUES
  -- 对课程2 任务2002 第1组优秀作业点赞
  (100110, 2002, 201, 0, 0),
  (100110, 2002, 202, 0, 0),
  (100110, 2002, 205, 0, 0),
  (100117, 2002, 208, 0, 0),
  (100117, 2002, 209, 0, 0),

  -- 对课程3 任务2104 第1、3组优秀作业点赞
  (100140, 2104, 211, 0, 0),
  (100140, 2104, 212, 0, 0),
  (100146, 2104, 217, 0, 0),
  (100146, 2104, 218, 0, 0),
  (100146, 2104, 219, 0, 0),

  -- 对课程4 任务2203 第1、3组优秀作业点赞
  (100160, 2203, 211, 0, 0),
  (100160, 2203, 212, 0, 0),
  (100166, 2203, 217, 0, 0),
  (100166, 2203, 218, 0, 0)
ON DUPLICATE KEY UPDATE deleted = VALUES(deleted);

INSERT INTO course_student_work_favorite (
  work_id, story_id, user_id,
  deleted, tenant_id
) VALUES
  -- 收藏部分优秀作业
  (100110, 2002, 201, 0, 0),
  (100110, 2002, 203, 0, 0),
  (100117, 2002, 205, 0, 0),
  (100140, 2104, 211, 0, 0),
  (100146, 2104, 214, 0, 0),
  (100160, 2203, 213, 0, 0),
  (100166, 2203, 218, 0, 0)
ON DUPLICATE KEY UPDATE deleted = VALUES(deleted);

--------------------------------------------------
-- 10. 任务讨论（discussions）与站内消息（messages）
--   为新任务补充一些讨论与消息，避免这些表为空
--------------------------------------------------

INSERT INTO discussions (
  story_id, course_id, user_id, user_name, content,
  likes, reply_to, deleted, tenant_id
) VALUES
  (2002, 2, 201, '学生201', '老师，我们的访谈对象可以是同学吗？', 2, NULL, b'0', 0),
  (2002, 2, 101, '老师02', '最好是潜在真实用户，如果没有可以适当放宽。', 1, 1, b'0', 0),
  (2104, 3, 214, '学生214', 'Dijkstra 和 Floyd 选哪个更合适？', 1, NULL, b'0', 0),
  (2104, 3, 102, '老师03', '看你们数据规模和实现难度，课堂上我们再详细讨论。', 0, 3, b'0', 0),
  (2203, 4, 211, '学生211', 'API 返回格式是否必须统一使用 JSON 包装？', 3, NULL, b'0', 0),
  (2203, 4, 103, '老师04', '是的，请统一使用约定好的响应结构，方便前端对接。', 1, 5, b'0', 0);

INSERT INTO messages (
  sender_id, receiver_id, content,
  is_read, creator, deleted, tenant_id
) VALUES
  (201, 101, '老师02，我想咨询一下项目选题是否合适。', 0, 'stu201', 0, 0),
  (101, 201, '可以，把你的选题文档发我，我帮你看一下。', 0, 'teacher02', 0, 0),
  (214, 102, '老师03，我们组的最短路径实验有点进度落后。', 0, 'stu214', 0, 0),
  (102, 214, '没关系，本周可以加一次实验辅导，注意检查算法边界情况。', 0, 'teacher03', 0, 0),
  (211, 103, '老师04，部署到测试服务器需要申请什么权限？', 0, 'stu211', 0, 0),
  (103, 211, '在课程群里看置顶信息，按照流程申请你们小组的账号即可。', 0, 'teacher04', 0, 0);

SET FOREIGN_KEY_CHECKS = 1;   'teacher01', '2024-09-19 09:10:00', 'teacher01', '2024-09-19 09:10:00',
   0, 1),
  (3, 17, 3,
   '这是我的 SRS 最新版本链接：https://example.com/files/srs_group1_v2.docx', 1,
   'student01', '2024-09-19 09:20:00', 'student01', '2024-09-19 09:20:00',
   0, 1);

SET FOREIGN_KEY_CHECKS = 1;