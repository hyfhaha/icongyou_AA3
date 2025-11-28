
CREATE TABLE `course_map_epic`
(
    `id`          bigint                                                        NOT NULL AUTO_INCREMENT COMMENT '主键',
    `super_id`    bigint                                                        NULL     DEFAULT NULL COMMENT '来源的ID',
    `course_id`   bigint                                                        NULL     DEFAULT NULL COMMENT '授课ID',
    `goal_id`     bigint                                                        NULL     DEFAULT NULL COMMENT '所属目标ID',
    `epic_name`   varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL     DEFAULT NULL COMMENT '史诗名称(任务集合)',
    `sort`        int                                                           NULL     DEFAULT NULL COMMENT '排序',
    `creator`     varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci  NULL     DEFAULT '' COMMENT '创建者',
    `create_time` datetime                                                      NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updater`     varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci  NULL     DEFAULT '' COMMENT '更新者',
    `update_time` datetime                                                      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted`     bit(1)                                                        NOT NULL DEFAULT b'0' COMMENT '是否删除',
    `tenant_id`   bigint                                                        NOT NULL DEFAULT 0 COMMENT '租户编号',
    PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB
  AUTO_INCREMENT = 435
  CHARACTER SET = utf8mb4
  COLLATE = utf8mb4_general_ci COMMENT = '课程地图-任务集合'
  ROW_FORMAT = Dynamic;

SET FOREIGN_KEY_CHECKS = 1;
