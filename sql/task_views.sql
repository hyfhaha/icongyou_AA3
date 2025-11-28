CREATE TABLE `task_views` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `story_id` bigint NOT NULL COMMENT '任务ID',
  `course_id` bigint NULL DEFAULT NULL COMMENT '课程ID',
  `user_id` bigint NOT NULL COMMENT '用户ID',
  `views` int NOT NULL DEFAULT 1 COMMENT '查看次数',
  `first_view_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '首次查看时间',
  `last_view_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '最近查看时间',
  `tenant_id` bigint NOT NULL DEFAULT 0 COMMENT '租户编号',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `uniq_task_views_story_user` (`story_id`, `user_id`) USING BTREE,
  KEY `idx_task_views_story` (`story_id`),
  KEY `idx_task_views_course` (`course_id`)
) ENGINE=InnoDB
  AUTO_INCREMENT = 1
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_general_ci
  COMMENT = '任务浏览统计表';


