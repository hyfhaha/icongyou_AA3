CREATE TABLE `course_map_goal`
(
    `id`             bigint                                                        NOT NULL AUTO_INCREMENT COMMENT '主键',
    `super_id`       bigint                                                        NULL     DEFAULT NULL COMMENT '来源的ID',
    `course_id`      bigint                                                        NULL     DEFAULT NULL COMMENT '授课ID',
    `goal_name`      varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL     DEFAULT NULL COMMENT '目标名称(毕业要求)',
    `goal_desc`      text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci         NULL COMMENT '目标详情',
    `goal_level`     varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL     DEFAULT NULL COMMENT '毕业要求级别 H/M/L',
    `goal_reference` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL     DEFAULT NULL COMMENT '毕业要求关联序号',
    `sort`           int                                                           NULL     DEFAULT NULL COMMENT '排序',
    `creator`        varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci  NULL     DEFAULT '' COMMENT '创建者',
    `create_time`    datetime                                                      NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updater`        varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci  NULL     DEFAULT '' COMMENT '更新者',
    `update_time`    datetime                                                      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted`        bit(1)                                                        NOT NULL DEFAULT b'0' COMMENT '是否删除',
    `tenant_id`      bigint                                                        NOT NULL DEFAULT 0 COMMENT '租户编号',
    PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB
  AUTO_INCREMENT = 315
  CHARACTER SET = utf8mb4
  COLLATE = utf8mb4_general_ci COMMENT = '课程地图-毕业要求'
  ROW_FORMAT = Dynamic;

SET FOREIGN_KEY_CHECKS = 1;
