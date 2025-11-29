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
   '好的，你可以把作业链接发给我。', 0,
   'teacher01', '2024-09-19 09:10:00', 'teacher01', '2024-09-19 09:10:00',
   0, 1),
  (3, 17, 3,
   '这是我的 SRS 最新版本链接：https://example.com/files/srs_group1_v2.docx', 1,
   'student01', '2024-09-19 09:20:00', 'student01', '2024-09-19 09:20:00',
   0, 1);

SET FOREIGN_KEY_CHECKS = 1;