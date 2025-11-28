CREATE TABLE `discussions` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `story_id` bigint NULL DEFAULT NULL COMMENT '任务ID',
  `course_id` bigint NULL DEFAULT NULL COMMENT '课程ID',
  `user_id` bigint NULL DEFAULT NULL COMMENT '用户ID',
  `user_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '用户名（昵称）',
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '讨论内容',
  `likes` int NULL DEFAULT 0 COMMENT '点赞数',
  `reply_to` bigint NULL DEFAULT NULL COMMENT '回复的讨论ID',
  `creator` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT '' COMMENT '创建者',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updater` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT '' COMMENT '更新者',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted` bit(1) NOT NULL DEFAULT b'0' COMMENT '是否删除',
  `tenant_id` bigint NOT NULL DEFAULT 0 COMMENT '租户编号',
  PRIMARY KEY (`id`) USING BTREE,
  KEY `idx_discussions_story` (`story_id`),
  KEY `idx_discussions_course` (`course_id`),
  KEY `idx_discussions_user` (`user_id`),
  KEY `idx_discussions_reply_to` (`reply_to`)
) ENGINE=InnoDB
  AUTO_INCREMENT = 1
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_general_ci
  COMMENT = '任务讨论/问答表';


