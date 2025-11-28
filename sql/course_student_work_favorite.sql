CREATE TABLE `course_student_work_favorite` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `work_id` bigint NOT NULL COMMENT '作业记录ID（course_student_work.id）',
  `story_id` bigint NOT NULL COMMENT '任务ID',
  `user_id` bigint NOT NULL COMMENT '收藏用户ID',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '收藏时间',
  `deleted` tinyint(1) NOT NULL DEFAULT 0 COMMENT '是否删除（取消收藏）',
  `tenant_id` bigint NOT NULL DEFAULT 0 COMMENT '租户编号',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `uniq_work_fav_user` (`work_id`, `user_id`) USING BTREE,
  KEY `idx_fav_story` (`story_id`)
) ENGINE=InnoDB
  AUTO_INCREMENT = 1
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_general_ci
  COMMENT = '优秀作业收藏记录';


