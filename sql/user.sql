CREATE TABLE `user`
(
    `id`           bigint       NOT NULL AUTO_INCREMENT     COMMENT '用户ID',
    `username`     varchar(30)  NOT NULL                    COMMENT '用户账号',
    `password_hash` varchar(100) NOT NULL DEFAULT ''        COMMENT '哈希后的密码',
    `nickname`     varchar(30)  NOT NULL                    COMMENT '用户昵称',
    `remark`       varchar(500) DEFAULT NULL                COMMENT '备注',
    `dept_id`      bigint       DEFAULT NULL                COMMENT '组织ID',
    `post_ids`     varchar(255) DEFAULT NULL                COMMENT '岗位编号数组',
    `email`        varchar(254) DEFAULT ''                  COMMENT '用户邮箱',
    `phone_number` varchar(11)  DEFAULT ''                  COMMENT '手机号码',
    `job_number`   varchar(255) DEFAULT NULL                COMMENT '工号/学号',
    `user_role`    tinyint      DEFAULT 0                   COMMENT '用户角色 0: 学生 1:教师 2:企业用户 3:管理员',
    `gender`       tinyint      DEFAULT 0                   COMMENT '用户性别： 0:未知 1:男 2:女',
    `avatar_url`   varchar(512) DEFAULT ''                  COMMENT '头像地址',
    `status`       tinyint      NOT NULL DEFAULT 1          COMMENT '帐号状态（0停用 1正常）',
    `login_ip`     varchar(50)  DEFAULT ''                  COMMENT '最后登录IP',
    `login_date`   datetime     DEFAULT NULL                COMMENT '最后登录时间',
    `balance`      decimal(10,2) DEFAULT 0.00               COMMENT '余额',
    `creator`      varchar(64)  DEFAULT ''                  COMMENT '创建者',
    `create_time`  datetime     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updater`      varchar(64)  DEFAULT ''                  COMMENT '更新者',
    `update_time`  datetime     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted`      tinyint(1)   NOT NULL DEFAULT 0          COMMENT '是否删除',
    `tenant_id`    bigint       NOT NULL DEFAULT 0          COMMENT '租户编号',
    PRIMARY KEY (`id`) USING BTREE,
    UNIQUE INDEX `idx_username` (`tenant_id` ASC, `username` ASC, `update_time` ASC) USING BTREE
) ENGINE = InnoDB
  AUTO_INCREMENT = 1
  CHARACTER SET = utf8mb4
  COLLATE = utf8mb4_unicode_ci COMMENT = '用户信息表'
  ROW_FORMAT = Dynamic;
