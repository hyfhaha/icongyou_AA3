CREATE TABLE `tenant`
(
    `id`            bigint       NOT NULL AUTO_INCREMENT COMMENT '租户ID',
    `name`          varchar(100) NOT NULL COMMENT '租户名称',
    `contact_name`  varchar(50)           DEFAULT NULL COMMENT '联系人姓名',
    `contact_email` varchar(100)          DEFAULT NULL COMMENT '联系人邮箱',
    `contact_phone` varchar(20)           DEFAULT NULL COMMENT '联系人电话',
    `address`       varchar(255)          DEFAULT NULL COMMENT '联系地址',
    `logo_url`      varchar(512)          DEFAULT '' COMMENT '租户logo地址',
    `description`   varchar(500)          DEFAULT NULL COMMENT '描述',
    `status`        tinyint      NOT NULL DEFAULT 1 COMMENT '租户状态（0停用 1正常）',
    `creator`       varchar(64)           DEFAULT '' COMMENT '创建者',
    `create_time`   datetime     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updater`       varchar(64)           DEFAULT '' COMMENT '更新者',
    `update_time`   datetime     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted`       tinyint(1)   NOT NULL DEFAULT 0 COMMENT '是否删除',
    PRIMARY KEY (`id`) USING BTREE,
    INDEX `idx_tenant_name` (`name` ASC) USING BTREE,
    INDEX `idx_tenant_status` (`status` ASC) USING BTREE
) ENGINE = InnoDB
  AUTO_INCREMENT = 1
  CHARACTER SET = utf8mb4
  COLLATE = utf8mb4_unicode_ci COMMENT = '租户信息表'
  ROW_FORMAT = Dynamic;