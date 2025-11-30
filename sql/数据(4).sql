-- =========================================
-- 互相关联的示例数据：2 门课、5 学生、团队 + 任务 + 优秀作业
-- 数学课(10)、英语课(11)，严格遵守坐标规则：
--   position_x = 第几个 epic（按 sort）
--   position_y = 第几个阶段（release）
-- =========================================

SET FOREIGN_KEY_CHECKS = 0;

--------------------------------------------------
-- 1. 老师 + 5 个学生
--------------------------------------------------
INSERT INTO `user` (
  id, username, password_hash, nickname,
  user_role, status, deleted, tenant_id
) VALUES
  (100, 'math_teacher',    '123456', '数学老师',   1, 1, 0, 0),
  (101, 'english_teacher', '123456', '英语老师',   1, 1, 0, 0),

  (201, 'stu001', '123456', '学生01', 0, 1, 0, 0),
  (202, 'stu002', '123456', '学生02', 0, 1, 0, 0),
  (203, 'stu003', '123456', '学生03', 0, 1, 0, 0),
  (204, 'stu004', '123456', '学生04', 0, 1, 0, 0),
  (205, 'stu005', '123456', '学生05', 0, 1, 0, 0)
ON DUPLICATE KEY UPDATE
  username = VALUES(username),
  nickname = VALUES(nickname),
  user_role = VALUES(user_role);

--------------------------------------------------
-- 2. 课程：高等数学(10) + 大学英语(11)，均绑定老师
--------------------------------------------------
INSERT INTO course (
  course_id, course_name, course_desc, semester,
  start_time, end_time, lesson_status, show_score,
  standard_team_num,
  teacher_ids, teacher_names,
  deleted, tenant_id
) VALUES
  (10, '高等数学（示例课）', '包含个人作业和团队作业的数学课程示例。', '2024秋',
   '2024-09-01 00:00:00', '2024-12-31 23:59:59',
   1, 1,
   5,
   '100', '数学老师',
   b'0', 0),

  (11, '大学英语（示例课）', '包含个人与团队口语作业的英语课程示例。', '2024秋',
   '2024-09-01 00:00:00', '2024-12-31 23:59:59',
   1, 1,
   3,
   '101', '英语老师',
   b'0', 0)
ON DUPLICATE KEY UPDATE
  course_name   = VALUES(course_name),
  course_desc   = VALUES(course_desc),
  teacher_ids   = VALUES(teacher_ids),
  teacher_names = VALUES(teacher_names);

--------------------------------------------------
-- 3. 课程目标（course_map_goal）
--   课程10：两个 goal
--   课程11：两个 goal
--------------------------------------------------
INSERT IGNORE INTO course_map_goal (
  id, course_id, goal_name, goal_desc, goal_level, goal_reference,
  sort, deleted, tenant_id
) VALUES
  (10, 10, '数学理解与建模', '掌握函数、极限、导数等基础，能用于简单建模。', 'M', 'M1', 1, b'0', 0),
  (11, 10, '数学运算与应用', '能将微积分知识应用到实际问题求解。',         'H', 'M2', 2, b'0', 0),

  (20, 11, '英语听说能力', '提升日常交流和课堂讨论中的听说能力。',         'M', 'E1', 1, b'0', 0),
  (21, 11, '英语阅读写作', '能完成短文阅读和书面表达。',                 'H', 'E2', 2, b'0', 0);

--------------------------------------------------
-- 4. 史诗（course_map_epic）——用于 X 轴列
--   对同一课程按 sort 排序：
--     课程10：E10(sort=1) → x=1；E11(sort=2) → x=2
--     课程11：E20(sort=1) → x=1；E21(sort=2) → x=2
--------------------------------------------------
INSERT IGNORE INTO course_map_epic (
  id, course_id, goal_id, epic_name, sort,
  deleted, tenant_id
) VALUES
  -- 课程10（数学）
  (100, 10, 10, '函数与极限', 1, b'0', 0),
  (101, 10, 11, '微分与应用', 2, b'0', 0),

  -- 课程11（英语）
  (110, 11, 20, '口语与听力', 1, b'0', 0),
  (111, 11, 21, '阅读与写作', 2, b'0', 0);

--------------------------------------------------
-- 5. 阶段（course_map_release）——用于 Y 轴行
--   课程10：R10 → 阶段1(y=1)，R11 → 阶段2(y=2)
--   课程11：R20 → 阶段1(y=1)，R21 → 阶段2(y=2)
--------------------------------------------------
INSERT IGNORE INTO course_map_release (
  id, course_id, release_name, release_desc,
  deleted, tenant_id
) VALUES
  (10, 10, '阶段1：基础', '函数与极限基础训练。', b'0', 0),
  (11, 10, '阶段2：应用', '微分应用与建模训练。',   b'0', 0),

  (20, 11, '阶段1：日常交流', '听说与对话练习阶段。', b'0', 0),
  (21, 11, '阶段2：学术写作', '阅读与写作训练阶段。', b'0', 0);

--------------------------------------------------
-- 6. 任务（course_map_story）
--   坐标规则：
--     课程10:
--       Epic 100(sort=1) → x=1
--       Epic 101(sort=2) → x=2
--       Release 10(阶段1) → y=1
--       Release 11(阶段2) → y=2
--     课程11 同理
--   要求：
--     - 数学课：至少 1 个个人任务 + 1 个团队任务(队长提交)
--     - 英语课：也给 1 个个人 + 1 个团队任务
--------------------------------------------------
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
  -- 课程10：数学 M1 个人任务（x=1, y=1）
  (1001, 10, 10, 100, 10,
   'M1 函数基础作业（个人）',
   '每位学生完成函数概念与图像的基础练习题。',
   1, 2, 10,
   NULL, 0,
   '2024-09-05 00:00:00', '2024-09-20 23:59:59',
   1,
   1, 1,
   b'0', 0),

  -- 课程10：数学 M2 团队任务（队长提交）（x=2, y=2）
  (1002, 10, 11, 101, 11,
   'M2 小组建模报告（团队-队长提交）',
   '5 人小组针对真实场景完成一次简单数学建模报告，由队长统一提交。',
   2, 2, 30,
   100, 10,
   '2024-10-01 00:00:00', '2024-10-25 23:59:59',
   1,
   2, 2,
   b'0', 0),

  -- 课程11：英语 E1 个人任务（x=1, y=1）
  (1101, 11, 20, 110, 20,
   'E1 英语听力日记（个人）',
   '每位学生连续一周记录每日英语听力练习情况，并用英文写简短日记。',
   1, 2, 10,
   NULL, 0,
   '2024-09-05 00:00:00', '2024-09-20 23:59:59',
   1,
   1, 1,
   b'0', 0),

  -- 课程11：英语 E2 团队任务（队长提交）（x=2, y=2）
  (1102, 11, 21, 111, 21,
   'E2 小组英语演讲（团队-队长提交）',
   '3 人小组准备一个 5 分钟的英语演讲，并提交 PPT 与演讲视频，由队长统一提交。',
   2, 2, 30,
   100, 10,
   '2024-10-01 00:00:00', '2024-10-25 23:59:59',
   1,
   2, 2,
   b'0', 0);

--------------------------------------------------
-- 7. 课程小组（course_group）
--   课程10：1 个小组，5 人全在里面
--   课程11：1 个小组，5 人中的 3 人在里面
--------------------------------------------------
INSERT IGNORE INTO course_group (
  id, course_id, group_name, max_size, current_size,
  group_code, deleted, tenant_id
) VALUES
  (10, 10, '高数-学习小组G1', 5, 5, 'MATH-G1', b'0', 0),
  (11, 11, '英语-口语小组A',  3, 3, 'ENG-G1',  b'0', 0);

--------------------------------------------------
-- 8. 选课与小组成员（course_student）
--   规则：
--     - 学生201~205 全部选数学课10，同在组10，201 是队长
--     - 学生201~203 选英语课11，同在组11，202 是队长
--------------------------------------------------
INSERT IGNORE INTO course_student (
  id, course_id, student_id, group_id, leader,
  deleted, tenant_id
) VALUES
  -- 数学课：5 人一组
  (10001, 10, 201, 10, 1, b'0', 0),
  (10002, 10, 202, 10, 0, b'0', 0),
  (10003, 10, 203, 10, 0, b'0', 0),
  (10004, 10, 204, 10, 0, b'0', 0),
  (10005, 10, 205, 10, 0, b'0', 0),

  -- 英语课：3 人一组（从上面 5 人中选 3 人）
  (11001, 11, 201, 11, 0, b'0', 0),
  (11002, 11, 202, 11, 1, b'0', 0),
  (11003, 11, 203, 11, 0, b'0', 0);

--------------------------------------------------
-- 9. 学生作业（course_student_work）
--   要求：
--     - 每个任务至少有 1 条优秀作业（recommend=1）
--     - 团队任务采用“队长提交 + 按成员拆多条记录 + 贡献度”模式
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
  ------------------------------------------------
  -- 数学 M1：个人作业，每人一条，选几条做优秀作业
  ------------------------------------------------
  (20001, 10, 1001, 201,
   201, '学生01',
   NULL, 0, NULL,
   'M1_学生01_函数作业.docx',
   'https://example.com/math/M1/stu01.docx',
   9.5, NULL,
   b'1', 5,
   3, 2,
   'math_teacher', b'0', 0),

  (20002, 10, 1001, 202,
   202, '学生02',
   NULL, 0, NULL,
   'M1_学生02_函数作业.docx',
   'https://example.com/math/M1/stu02.docx',
   8.8, NULL,
   b'0', NULL,
   1, 0,
   'math_teacher', b'0', 0),

  (20003, 10, 1001, 203,
   203, '学生03',
   NULL, 0, NULL,
   'M1_学生03_函数作业.docx',
   'https://example.com/math/M1/stu03.docx',
   9.0, NULL,
   b'1', 4,
   2, 1,
   'math_teacher', b'0', 0),

  (20004, 10, 1001, 204,
   204, '学生04',
   NULL, 0, NULL,
   'M1_学生04_函数作业.docx',
   'https://example.com/math/M1/stu04.docx',
   8.2, NULL,
   b'0', NULL,
   0, 0,
   'math_teacher', b'0', 0),

  (20005, 10, 1001, 205,
   205, '学生05',
   NULL, 0, NULL,
   'M1_学生05_函数作业.docx',
   'https://example.com/math/M1/stu05.docx',
   8.5, NULL,
   b'0', NULL,
   0, 0,
   'math_teacher', b'0', 0),

  ------------------------------------------------
  -- 数学 M2：团队任务（队长 201 提交），5 人同组 group_id=10
  -- 每个成员一条记录，写入 contribution 与 team_score
  ------------------------------------------------
  (20011, 10, 1002, 201,
   201, '学生01',
   10, 1, 30.0,
   'M2_高数建模报告_G1_队长版.docx',
   'https://example.com/math/M2/G1_leader.docx',
   28.0, 28.0,
   b'1', 5,
   5, 3,
   'math_teacher', b'0', 0),

  (20012, 10, 1002, 202,
   201, '学生01',
   10, 1, 25.0,
   'M2_高数建模报告_G1_学生02.docx',
   'https://example.com/math/M2/G1_02.docx',
   28.0, 28.0,
   b'1', 5,
   2, 1,
   'math_teacher', b'0', 0),

  (20013, 10, 1002, 203,
   201, '学生01',
   10, 1, 20.0,
   'M2_高数建模报告_G1_学生03.docx',
   'https://example.com/math/M2/G1_03.docx',
   28.0, 28.0,
   b'1', 4,
   1, 1,
   'math_teacher', b'0', 0),

  (20014, 10, 1002, 204,
   201, '学生01',
   10, 1, 15.0,
   'M2_高数建模报告_G1_学生04.docx',
   'https://example.com/math/M2/G1_04.docx',
   28.0, 28.0,
   b'0', NULL,
   0, 0,
   'math_teacher', b'0', 0),

  (20015, 10, 1002, 205,
   201, '学生01',
   10, 1, 10.0,
   'M2_高数建模报告_G1_学生05.docx',
   'https://example.com/math/M2/G1_05.docx',
   28.0, 28.0,
   b'0', NULL,
   0, 0,
   'math_teacher', b'0', 0),

  ------------------------------------------------
  -- 英语 E1：个人作业，只有 201~203 三人选了这门课
  ------------------------------------------------
  (21001, 11, 1101, 201,
   201, '学生01',
   NULL, 0, NULL,
   'E1_学生01_听力日记.docx',
   'https://example.com/eng/E1/stu01.docx',
   9.0, NULL,
   b'1', 5,
   4, 2,
   'english_teacher', b'0', 0),

  (21002, 11, 1101, 202,
   202, '学生02',
   NULL, 0, NULL,
   'E1_学生02_听力日记.docx',
   'https://example.com/eng/E1/stu02.docx',
   8.7, NULL,
   b'0', NULL,
   1, 0,
   'english_teacher', b'0', 0),

  (21003, 11, 1101, 203,
   203, '学生03',
   NULL, 0, NULL,
   'E1_学生03_听力日记.docx',
   'https://example.com/eng/E1/stu03.docx',
   9.2, NULL,
   b'1', 4,
   3, 1,
   'english_teacher', b'0', 0),

  ------------------------------------------------
  -- 英语 E2：团队任务（队长 202 提交），3 人组 group_id=11
  ------------------------------------------------
  (21011, 11, 1102, 201,
   202, '学生02',
   11, 1, 30.0,
   'E2_英语演讲_G1_学生01.docx',
   'https://example.com/eng/E2/G1_01.docx',
   27.5, 27.5,
   b'1', 5,
   3, 2,
   'english_teacher', b'0', 0),

  (21012, 11, 1102, 202,
   202, '学生02',
   11, 1, 40.0,
   'E2_英语演讲_G1_队长版.docx',
   'https://example.com/eng/E2/G1_leader.docx',
   27.5, 27.5,
   b'1', 5,
   5, 3,
   'english_teacher', b'0', 0),

  (21013, 11, 1102, 203,
   202, '学生02',
   11, 1, 30.0,
   'E2_英语演讲_G1_学生03.docx',
   'https://example.com/eng/E2/G1_03.docx',
   27.5, 27.5,
   b'0', NULL,
   1, 0,
   'english_teacher', b'0', 0);

--------------------------------------------------
-- 10. 点赞（course_student_work_like）和收藏（course_student_work_favorite）
--     只针对上面标记为优秀作业的 work_id
--------------------------------------------------
INSERT INTO course_student_work_like (
  work_id, story_id, user_id,
  deleted, tenant_id
) VALUES
  -- 数学 M1 优秀作业点赞
  (20001, 1001, 202, 0, 0),
  (20001, 1001, 203, 0, 0),
  (20003, 1001, 201, 0, 0),

  -- 数学 M2 优秀作业点赞
  (20011, 1002, 202, 0, 0),
  (20011, 1002, 203, 0, 0),
  (20012, 1002, 201, 0, 0),
  (20013, 1002, 204, 0, 0),

  -- 英语 E1 优秀作业点赞
  (21001, 1101, 202, 0, 0),
  (21001, 1101, 203, 0, 0),
  (21003, 1101, 201, 0, 0),

  -- 英语 E2 优秀作业点赞
  (21011, 1102, 202, 0, 0),
  (21011, 1102, 203, 0, 0),
  (21012, 1102, 201, 0, 0)
ON DUPLICATE KEY UPDATE deleted = VALUES(deleted);

INSERT INTO course_student_work_favorite (
  work_id, story_id, user_id,
  deleted, tenant_id
) VALUES
  -- 数学 M1
  (20001, 1001, 201, 0, 0),
  (20003, 1001, 202, 0, 0),

  -- 数学 M2
  (20011, 1002, 203, 0, 0),
  (20012, 1002, 201, 0, 0),

  -- 英语 E1
  (21001, 1101, 203, 0, 0),
  (21003, 1101, 201, 0, 0),

  -- 英语 E2
  (21011, 1102, 201, 0, 0),
  (21012, 1102, 203, 0, 0)
ON DUPLICATE KEY UPDATE deleted = VALUES(deleted);

SET FOREIGN_KEY_CHECKS = 1;