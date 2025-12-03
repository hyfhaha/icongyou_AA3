CREATE TABLE `conversation` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `conversation_id` varchar(128) NOT NULL COMMENT '会话ID，tenant_userA_userB',
  `user_a` bigint NOT NULL COMMENT '用户A（较小ID）',
  `user_b` bigint NOT NULL COMMENT '用户B（较大ID）',
  `last_msg_id` bigint DEFAULT NULL COMMENT '最后一条消息ID',
  `last_msg_content` varchar(1000) DEFAULT '' COMMENT '最后一条消息内容',
  `last_msg_time` bigint DEFAULT NULL COMMENT '最后一条消息时间戳(ms)',
  `unread_a` int NOT NULL DEFAULT 0 COMMENT '用户A未读数',
  `unread_b` int NOT NULL DEFAULT 0 COMMENT '用户B未读数',
  `tenant_id` bigint NOT NULL DEFAULT 0 COMMENT '租户ID',
  `deleted` tinyint(1) NOT NULL DEFAULT 0 COMMENT '逻辑删除',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_conv` (`conversation_id`,`tenant_id`),
  KEY `idx_user_a` (`user_a`,`tenant_id`),
  KEY `idx_user_b` (`user_b`,`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='聊天会话';

