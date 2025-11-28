
CREATE TABLE `course_student`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `course_id` bigint NULL DEFAULT NULL COMMENT '课堂ID',
  `student_id` bigint NULL DEFAULT NULL COMMENT '学生ID(system_users对象主键)',
  `group_id` bigint NULL DEFAULT NULL COMMENT '所属小组ID',
  `leader` bit(1) NULL DEFAULT NULL COMMENT '是否为组长',
  `sort` int NULL DEFAULT NULL COMMENT '排序',
  `dept_id` bigint NULL DEFAULT NULL COMMENT '组织ID(数据权限)',
  `user_id` bigint NULL DEFAULT NULL COMMENT '用户ID(数据权限)',
  `creator` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT '' COMMENT '创建者',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updater` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT '' COMMENT '更新者',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted` bit(1) NOT NULL DEFAULT b'0' COMMENT '是否删除',
  `tenant_id` bigint NOT NULL DEFAULT 0 COMMENT '租户编号',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 10000 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '课堂学生表' ROW_FORMAT = Dynamic;

SET FOREIGN_KEY_CHECKS = 1;
