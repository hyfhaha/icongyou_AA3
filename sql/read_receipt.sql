CREATE TABLE `read_receipt` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `conversation_id` varchar(128) NOT NULL COMMENT '会话ID',
  `user_id` bigint NOT NULL COMMENT '用户ID',
  `last_read_msg_id` bigint NOT NULL COMMENT '最后已读消息ID',
  `tenant_id` bigint NOT NULL DEFAULT 0 COMMENT '租户ID',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_conv_user` (`conversation_id`,`user_id`,`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='已读回执';

