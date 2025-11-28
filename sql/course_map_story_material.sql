
CREATE TABLE `course_map_story_material`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `super_id` bigint NULL DEFAULT NULL COMMENT '来源的ID',
  `course_id` bigint NULL DEFAULT NULL COMMENT '授课ID',
  `story_id` bigint NULL DEFAULT NULL COMMENT '故事ID',
  `material_name` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '资料名称',
  `material_type` int NULL DEFAULT NULL COMMENT '资料类型 1=外链 2=网盘 3=图片 4=视频 5=文件 6=富文本',
  `file_name` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '文件名称',
  `content` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '资料内容 URL/OSS地址/富文本等',
  `code` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '网盘提取码',
  `remark` varchar(2000) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '备注',
  `creator` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT '' COMMENT '创建者',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updater` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT '' COMMENT '更新者',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted` bit(1) NOT NULL DEFAULT b'0' COMMENT '是否删除',
  `tenant_id` bigint NOT NULL DEFAULT 0 COMMENT '租户编号',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 12345 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '课程地图-任务资料' ROW_FORMAT = Dynamic;

SET FOREIGN_KEY_CHECKS = 1;
