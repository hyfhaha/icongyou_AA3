CREATE TABLE `course`
(
    `course_id`          bigint                                                         NOT NULL AUTO_INCREMENT COMMENT '课程ID',
    `invite_code`        varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci  NULL     DEFAULT NULL COMMENT '邀请码',
    `start_time`         datetime                                                       NULL     DEFAULT NULL COMMENT '课程开始时间',
    `end_time`           datetime                                                       NULL     DEFAULT NULL COMMENT '课程结束时间',
    `semester`           varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci   NULL     DEFAULT NULL COMMENT '学期标签，如 2024秋、2025春',
    `prev_course`        varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci  NULL     DEFAULT NULL COMMENT '前置课程',
    `course_name`        varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci  NULL     DEFAULT NULL COMMENT '课程名称',
    `course_desc`        varchar(2000) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL     DEFAULT NULL COMMENT '课程简介',
    `course_type`        int                                                            NULL     DEFAULT NULL COMMENT '课程类型 1=实训 2=活动 3=必修 4=选修 5=公共基础',
    `course_pic`         varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci  NULL     DEFAULT NULL COMMENT '课程封面url',
    `course_hour`        int                                                            NULL     DEFAULT NULL COMMENT '课时',
    `course_faculties`   varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci  NULL     DEFAULT NULL COMMENT '实训院系',
    `standard_team_num`  int                                                            NULL     DEFAULT NULL COMMENT '标准团队人数',
    `teacher_ids`        varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci  NULL     DEFAULT NULL COMMENT '共享此课的教师ID',
    `teacher_names`      varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci  NULL     DEFAULT NULL COMMENT '共享此课的教师姓名',
    `student_allow_team` bit(1)                                                         NULL     DEFAULT NULL COMMENT '是否允许学生自己创建分组',
    `student_allow_join` bit(1)                                                         NULL     DEFAULT NULL COMMENT '是否允许学生自己通过验证码进入',
    `lesson_status`      int                                                            NULL     DEFAULT NULL COMMENT '课程状态 0=未开始 1=已开始 99=已结束',
    `show_score`         bit(1)                                                         NULL     DEFAULT NULL COMMENT '是否向学生显示成绩',
    `dept_id`            bigint                                                         NULL     DEFAULT NULL COMMENT '组织ID(数据权限)',
    `user_id`            bigint                                                         NULL     DEFAULT NULL COMMENT '用户ID(数据权限)',
    `creator`            varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci   NULL     DEFAULT '' COMMENT '创建者',
    `create_time`        datetime                                                       NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updater`            varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci   NULL     DEFAULT '' COMMENT '更新者',
    `update_time`        datetime                                                       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted`            bit(1)                                                         NOT NULL DEFAULT b'0' COMMENT '是否删除',
    `tenant_id`          bigint                                                         NOT NULL DEFAULT 0 COMMENT '租户编号',
    PRIMARY KEY (`course_id`) USING BTREE
) ENGINE = InnoDB
  AUTO_INCREMENT = 10000
  CHARACTER SET = utf8mb4
  COLLATE = utf8mb4_general_ci COMMENT = '授课表'
  ROW_FORMAT = Dynamic;

