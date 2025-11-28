CREATE TABLE `course_student_work_like` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `work_id` bigint NOT NULL COMMENT '作业记录ID（course_student_work.id）',
  `story_id` bigint NOT NULL COMMENT '任务ID',
  `user_id` bigint NOT NULL COMMENT '点赞用户ID',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '点赞时间',
  `deleted` tinyint(1) NOT NULL DEFAULT 0 COMMENT '是否删除（取消点赞）',
  `tenant_id` bigint NOT NULL DEFAULT 0 COMMENT '租户编号',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `uniq_work_like_user` (`work_id`, `user_id`) USING BTREE,
  KEY `idx_like_story` (`story_id`)
) ENGINE=InnoDB
  AUTO_INCREMENT = 1
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_general_ci
  COMMENT = '优秀作业点赞记录';


