CREATE TABLE `document_vectors`
(
    `vector_id`     bigint                                  NOT NULL AUTO_INCREMENT COMMENT '向量ID',
    `file_md5`      varchar(32) COLLATE utf8mb4_unicode_ci  NOT NULL COMMENT '文件MD5哈希值',
    `filename`      varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '' COMMENT '文件名称',
    `chunk_id`      int                                     NOT NULL COMMENT '分块ID',
    `text_content`  longtext COLLATE utf8mb4_unicode_ci COMMENT '文本内容',
    `model_version` varchar(50) COLLATE utf8mb4_unicode_ci           DEFAULT NULL COMMENT '模型版本',
    `user_id`       varchar(64) COLLATE utf8mb4_unicode_ci  NOT NULL COMMENT '上传用户ID',
    `course_id`     bigint                                  NOT NULL COMMENT '文件关联的课程id',
    `creator`       varchar(64) COLLATE utf8mb4_unicode_ci           DEFAULT '' COMMENT '创建者',
    `create_time`   datetime                                NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updater`       varchar(64) COLLATE utf8mb4_unicode_ci           DEFAULT '' COMMENT '更新者',
    `update_time`   datetime                                NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted`       tinyint(1)                              NOT NULL DEFAULT '0' COMMENT '是否删除',
    `tenant_id`     bigint                                  NOT NULL DEFAULT '0' COMMENT '租户编号',
    PRIMARY KEY (`vector_id`) USING BTREE,
    KEY `idx_file_md5` (`file_md5`) USING BTREE,
    KEY `idx_user_id` (`user_id`) USING BTREE,
    KEY `idx_tenant_id` (`tenant_id`) USING BTREE,
    KEY `idx_chunk_id` (`file_md5`, `chunk_id`) USING BTREE,
    KEY `idx_create_time` (`create_time`) USING BTREE,
    KEY `idx_filename` (`filename`) USING BTREE
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci
  ROW_FORMAT = DYNAMIC COMMENT ='文档向量存储表';

CREATE TABLE `post`
(
    `id`          bigint                                                        NOT NULL AUTO_INCREMENT COMMENT '主键',
    `user_id`     bigint                                                        NULL     DEFAULT NULL COMMENT '发帖用户的ID',
    `details`     text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci         NULL COMMENT '帖子内容',
    `title`       text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci         NULL COMMENT '帖子标题',
    `tag`         varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL     DEFAULT NULL COMMENT '关联的标签',
    `likes`       bigint                                                        NOT NULL DEFAULT 0 COMMENT '点赞数量',
    `create_time` datetime                                                      NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` datetime                                                      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted`     bit(1)                                                        NOT NULL DEFAULT b'0' COMMENT '是否删除',
    PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB
  AUTO_INCREMENT = 315
  CHARACTER SET = utf8mb4
  COLLATE = utf8mb4_general_ci COMMENT = '帖子'
  ROW_FORMAT = Dynamic;

CREATE TABLE `comment`
(
    `id`          bigint                                                NOT NULL AUTO_INCREMENT COMMENT '主键',
    `post_id`     bigint                                                NULL     DEFAULT NULL COMMENT '所属帖子的ID',
    `comment_id`  bigint                                                NULL     DEFAULT NULL COMMENT '回复评论的ID',
    `reply_id`    bigint                                                NULL     DEFAULT NULL COMMENT '回复的评论的用户ID',
    `user_id`     bigint                                                NULL     DEFAULT NULL COMMENT '发起评论的用户',
    `details`     text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '评论内容',
    `likes`       bigint                                                NOT NULL DEFAULT 0 COMMENT '点赞数量',
    `create_time` datetime                                              NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` datetime                                              NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted`     bit(1)                                                NOT NULL DEFAULT b'0' COMMENT '是否删除',
    PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB
  AUTO_INCREMENT = 315
  CHARACTER SET = utf8mb4
  COLLATE = utf8mb4_general_ci COMMENT = '帖子评论'
  ROW_FORMAT = Dynamic;

# 该表现仅用于发送系统通知
CREATE TABLE `system_message`
(
    `id`             bigint       NOT NULL AUTO_INCREMENT COMMENT '消息ID',
    `receiver_id`    bigint       NOT NULL COMMENT '接收者用户ID',
    `sender_id`      bigint                DEFAULT NULL COMMENT '发送者用户ID（系统消息时可为空）',
    `sender_name`    varchar(50)           DEFAULT NULL COMMENT '发送者姓名显示',
    `message_type`   tinyint      NOT NULL DEFAULT 1 COMMENT '消息类型：1-系统通知 2-个人消息 3-课程通知 4-作业提醒 5-审核消息',
    `title`          varchar(200) NOT NULL COMMENT '消息标题',
    `content`        text                  DEFAULT NULL COMMENT '消息内容',
    `related_id`     bigint                DEFAULT NULL COMMENT '关联ID（如课程ID、作业ID等）',
    `related_type`   varchar(50)           DEFAULT NULL COMMENT '关联类型（如course、assignment等）',
    `priority`       tinyint      NOT NULL DEFAULT 1 COMMENT '优先级：1-低 2-中 3-高 4-紧急',
    `status`         tinyint      NOT NULL DEFAULT 0 COMMENT '读取状态：0-未读 1-已读 2-已删除',
    `read_time`      datetime              DEFAULT NULL COMMENT '阅读时间',
    `sent_time`      datetime     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '发送时间',
    `expire_time`    datetime              DEFAULT NULL COMMENT '过期时间（可为空表示永不过期）',
    `attachment_url` varchar(512)          DEFAULT '' COMMENT '附件URL',
    `is_system`      bit(1)       NOT NULL DEFAULT b'0' COMMENT '是否系统消息',
    `batch_id`       varchar(50)           DEFAULT NULL COMMENT '批量发送批次ID',
    `creator`        varchar(64)           DEFAULT '' COMMENT '创建者',
    `create_time`    datetime     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updater`        varchar(64)           DEFAULT '' COMMENT '更新者',
    `update_time`    datetime     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted`        bit(1)       NOT NULL DEFAULT b'0' COMMENT '是否删除',
    `tenant_id`      bigint       NOT NULL DEFAULT 0 COMMENT '租户编号',
    PRIMARY KEY (`id`) USING BTREE,
    INDEX `idx_receiver_status` (`receiver_id` ASC, `status` ASC) USING BTREE,
    INDEX `idx_sender_time` (`sender_id` ASC, `sent_time` ASC) USING BTREE,
    INDEX `idx_receiver_time` (`receiver_id` ASC, `sent_time` DESC) USING BTREE,
    INDEX `idx_type_related` (`message_type` ASC, `related_type` ASC, `related_id` ASC) USING BTREE,
    INDEX `idx_batch_id` (`batch_id` ASC) USING BTREE,
    INDEX `idx_status_time` (`status` ASC, `sent_time` DESC) USING BTREE,
    INDEX `idx_tenant_status` (`tenant_id` ASC, `status` ASC) USING BTREE
) ENGINE = InnoDB
  AUTO_INCREMENT = 1
  CHARACTER SET = utf8mb4
  COLLATE = utf8mb4_unicode_ci COMMENT = '消息收件箱表'
  ROW_FORMAT = Dynamic;

-- AI评语表
-- 存储基于学生能力雷达图数据的AI分析评语
CREATE TABLE `student_ai_evaluation`
(
    `id`           bigint NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `student_id`   bigint NOT NULL COMMENT '学生ID',
    `course_id`    bigint NOT NULL COMMENT '课程ID',
    `ai_comment`   longtext COMMENT 'AI生成的详细评语',

    -- 时间戳
    `created_time` datetime   DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_time` datetime   DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `is_deleted`   tinyint(1) DEFAULT 0 COMMENT '是否已删除',

    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_student_course` (`student_id`, `course_id`),
    KEY `idx_course_id` (`course_id`),
    KEY `idx_student_id` (`student_id`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci COMMENT ='学生AI评语表';


-- 新增表定义：AI 分析、学生画像、企业、IM、反馈、标签与人才画像相关

create table ai_analysis_task
(
    id              bigint auto_increment comment '主键'
        primary key,
    task_id         varchar(64)                           not null comment '任务ID（对外暴露）',
    tenant_id       bigint                                not null comment '租户编号',
    student_id      bigint                                not null comment '学生ID',
    task_type       varchar(20)                           not null comment '任务类型：GENERATE/UPDATE',
    status          varchar(20)                           not null comment '状态：PENDING/PROCESSING/SUCCESS/FAILED/RETRY',
    request_params  text                                  null comment '请求参数JSON',
    response_result text                                  null comment '响应结果JSON',
    error_message   text                                  null comment '错误信息',
    retry_count     int         default 0                 not null comment '重试次数',
    max_retry_count int         default 3                 not null comment '最大重试次数',
    start_time      datetime                              null comment '开始处理时间',
    end_time        datetime                              null comment '完成时间',
    creator         varchar(64) default ''                null comment '创建者',
    create_time     datetime    default CURRENT_TIMESTAMP not null comment '创建时间',
    updater         varchar(64) default ''                null comment '更新者',
    update_time     datetime    default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP comment '更新时间',
    deleted         bit         default b'0'              not null comment '逻辑删除标记',
    constraint uk_task_id
        unique (task_id)
)
    comment 'AI分析任务表' collate = utf8mb4_general_ci;

create index idx_status_create_time
    on ai_analysis_task (status, create_time);

create index idx_tenant_student
    on ai_analysis_task (tenant_id, student_id);


create table ai_student_portrait
(
    id                  bigint auto_increment comment '主键'
        primary key,
    tenant_id           bigint                                not null comment '租户编号',
    student_id          bigint                                not null comment '学生/人才ID',
    ai_comment          text                                  null comment 'AI 评语全文',
    career_summary      varchar(1000)                         null comment '职业概述',
    career_description  text                                  null comment '职业规划描述',
    profile_description text                                  null comment '画像描述',
    ability_scores      json                                  null comment '能力得分 JSON',
    key_evidence        text                                  null comment '关键证据',
    key_eviden          json                                  null comment '关键证据 JSON(兼容字段名)',
    creator             varchar(64) default ''                null comment '创建者',
    create_time         datetime    default CURRENT_TIMESTAMP not null comment '创建时间',
    updater             varchar(64) default ''                null comment '更新者',
    update_time         datetime    default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP comment '更新时间',
    deleted             bit         default b'0'              not null comment '逻辑删除标记',
    constraint uk_portrait
        unique (tenant_id, student_id)
)
    comment 'AI 学生能力画像表' collate = utf8mb4_general_ci;


create table company
(
    id                 bigint auto_increment comment '企业ID'
        primary key,
    tenant_id          bigint      default 0                 not null comment '租户ID',
    company_name       varchar(255)                          not null comment '企业名称',
    company_code       varchar(64)                           not null comment '企业编码',
    logo_url           varchar(512)                          null comment '企业Logo',
    industry           varchar(128)                          null comment '所属行业',
    scale              varchar(64)                           null comment '公司规模',
    established_date   date                                  null comment '成立日期',
    registered_capital varchar(128)                          null comment '注册资本',
    legal_person       varchar(128)                          null comment '法定代表人',
    contact_phone      varchar(32)                           null comment '联系电话',
    contact_email      varchar(128)                          null comment '联系邮箱',
    website            varchar(255)                          null comment '官网地址',
    province           varchar(64)                           null comment '省份',
    city               varchar(64)                           null comment '城市',
    district           varchar(64)                           null comment '区县',
    address_detail     varchar(255)                          null comment '详细地址',
    full_address       varchar(512)                          null comment '完整地址',
    business_scope     text                                  null comment '经营范围',
    description        text                                  null comment '企业简介',
    status             tinyint     default 1                 not null comment '企业状态 0停用 1正常',
    user_count         int         default 0                 not null comment '用户数量',
    creator            varchar(64) default ''                null comment '创建者',
    create_time        datetime    default CURRENT_TIMESTAMP not null comment '创建时间',
    updater            varchar(64) default ''                null comment '更新者',
    update_time        datetime    default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP comment '更新时间',
    deleted            bit         default b'0'              not null comment '逻辑删除',
    constraint uk_company_code
        unique (tenant_id, company_code)
)
    comment '企业信息表' collate = utf8mb4_general_ci;

create index idx_company_industry_scale
    on company (industry, scale);

create index idx_company_name
    on company (company_name);

create index idx_company_status_create_time
    on company (status, create_time);


create table conversation
(
    id               bigint auto_increment comment '主键'
        primary key,
    conversation_id  varchar(128)                            not null comment '会话ID，tenant_userA_userB',
    user_a           bigint                                  not null comment '用户A（较小ID）',
    user_b           bigint                                  not null comment '用户B（较大ID）',
    last_msg_id      bigint                                  null comment '最后一条消息ID',
    last_msg_content varchar(1000) default ''                null comment '最后一条消息内容',
    last_msg_time    bigint                                  null comment '最后一条消息时间戳(ms)',
    unread_a         int           default 0                 not null comment '用户A未读数',
    unread_b         int           default 0                 not null comment '用户B未读数',
    tenant_id        bigint        default 0                 not null comment '租户ID',
    deleted          tinyint(1)    default 0                 not null comment '逻辑删除',
    create_time      datetime      default CURRENT_TIMESTAMP not null,
    update_time      datetime      default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP,
    constraint uk_conv
        unique (conversation_id, tenant_id)
)
    comment '聊天会话';

create index idx_user_a
    on conversation (user_a, tenant_id);

create index idx_user_b
    on conversation (user_b, tenant_id);


create table feedback
(
    id            bigint auto_increment comment '主键'
        primary key,
    feedback_id   varchar(64)                           not null comment '反馈ID',
    user_id       bigint                                null comment '提交人ID',
    company_id    int                                   null comment '企业ID',
    type          varchar(64)                           not null comment '反馈类型',
    title         varchar(200)                          not null comment '标题',
    content       text                                  not null comment '反馈内容',
    contact_email varchar(128)                          null comment '联系邮箱',
    contact_phone varchar(32)                           null comment '联系电话',
    status        tinyint     default 0                 not null comment '状态 0新建 1处理中 2已回复',
    creator       varchar(64) default ''                null comment '创建者',
    updater       varchar(64) default ''                null comment '更新者',
    create_time   datetime    default CURRENT_TIMESTAMP not null comment '创建时间',
    update_time   datetime    default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP comment '更新时间',
    constraint uk_feedback_id
        unique (feedback_id)
)
    comment '用户反馈' collate = utf8mb4_general_ci;

create index idx_company
    on feedback (company_id);

create index idx_user
    on feedback (user_id);

-- 消息表
create table message
(
    msg_id          bigint auto_increment comment '消息ID'
        primary key,
    conversation_id varchar(128)                          not null comment '会话ID',
    sender_id       bigint                                not null comment '发送者',
    receiver_id     bigint                                not null comment '接收者',
    content         text                                  not null comment '文本内容',
    content_type    varchar(20) default 'text'            not null comment '内容类型',
    status          tinyint     default 1                 not null comment '1正常 2撤回 3删除',
    timestamp_ms    bigint                                not null comment '发送时间戳(ms)',
    tenant_id       bigint      default 0                 not null comment '租户ID',
    recall_by       bigint                                null comment '撤回人',
    recall_time     bigint                                null comment '撤回时间戳(ms)',
    create_time     datetime    default CURRENT_TIMESTAMP not null,
    update_time     datetime    default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP
)
    comment '聊天消息';

-- 聊天消息表索引
create fulltext index ft_content
    on message (content);

create index idx_conv_receiver
    on message (conversation_id, receiver_id, status);

create index idx_conv_time
    on message (conversation_id, timestamp_ms);

create index idx_tenant_time
    on message (tenant_id, timestamp_ms);

create index idx_sender_time
    on message (sender_id, timestamp_ms);

create table read_receipt
(
    id               bigint auto_increment comment '主键'
        primary key,
    conversation_id  varchar(128)                       not null comment '会话ID',
    user_id          bigint                             not null comment '用户ID',
    last_read_msg_id bigint                             not null comment '最后已读消息ID',
    tenant_id        bigint   default 0                 not null comment '租户ID',
    update_time      datetime default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP,
    constraint uk_conv_user
        unique (conversation_id, user_id, tenant_id)
)
    comment '已读回执';


create table tag
(
    id          bigint auto_increment comment '标签ID'
        primary key,
    tenant_id   bigint      default 0                 not null comment '租户ID',
    category_id bigint                                not null comment '分类ID',
    name        varchar(255)                          not null comment '标签名',
    code        varchar(255)                          null comment '编码',
    color       varchar(32)                           null comment '颜色',
    description varchar(512)                          null comment '描述',
    source_type tinyint     default 0                 not null comment '0自定义 1AI 2系统',
    usage_count int         default 0                 not null comment '使用次数',
    sort        int         default 0                 not null comment '排序',
    active      tinyint     default 1                 not null comment '是否启用',
    creator     varchar(64) default ''                null comment '创建者',
    create_time datetime    default CURRENT_TIMESTAMP not null comment '创建时间',
    updater     varchar(64) default ''                null comment '更新者',
    update_time datetime    default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP comment '更新时间',
    deleted     bit         default b'0'              not null comment '删除标记'
)
    comment '标签表' collate = utf8mb4_general_ci;

create index idx_tag_category
    on tag (category_id);

create index idx_tag_usage
    on tag (usage_count);


create table tag_category
(
    id          bigint auto_increment comment '分类ID'
        primary key,
    tenant_id   bigint      default 0                 not null comment '租户ID',
    name        varchar(128)                          not null comment '分类名称',
    code        varchar(128)                          null comment '分类编码',
    description varchar(512)                          null comment '描述',
    sort        int         default 0                 not null comment '排序',
    visible     tinyint     default 1                 not null comment '是否可见',
    creator     varchar(64) default ''                null comment '创建者',
    create_time datetime    default CURRENT_TIMESTAMP not null comment '创建时间',
    updater     varchar(64) default ''                null comment '更新者',
    update_time datetime    default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP comment '更新时间',
    deleted     bit         default b'0'              not null comment '删除标记'
)
    comment '标签分类' collate = utf8mb4_general_ci;


create table talent_profile
(
    id           bigint auto_increment comment '主键'
        primary key,
    tenant_id    bigint        default 0                 not null comment '租户ID',
    talent_id    bigint                                  not null comment '用户ID=人才ID',
    school       varchar(255)                            null comment '学校',
    major        varchar(255)                            null comment '专业',
    position     varchar(255)                            null comment '职位/职称',
    score        decimal(5, 2) default 0.00              null comment '综合评分',
    brief        varchar(2000)                           null comment '简介',
    follow_owner bigint                                  null comment '跟进人',
    is_follow    tinyint       default 0                 null comment '是否关注',
    is_favorite  tinyint       default 0                 null comment '是否收藏',
    status       tinyint       default 1                 null comment '状态：1正常 2跟进中等',
    creator      varchar(64)   default ''                null comment '创建者',
    create_time  datetime      default CURRENT_TIMESTAMP not null comment '创建时间',
    updater      varchar(64)   default ''                null comment '更新者',
    update_time  datetime      default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP comment '更新时间',
    deleted      bit           default b'0'              not null comment '删除标记',
    constraint uk_talent
        unique (tenant_id, talent_id)
)
    comment '人才画像主表' collate = utf8mb4_general_ci;

create index idx_status
    on talent_profile (status, update_time);


create table talent_tag_relation
(
    id          bigint auto_increment comment '主键'
        primary key,
    tenant_id   bigint         default 0                 not null comment '租户ID',
    talent_id   bigint                                   not null comment '人才ID',
    tag_id      bigint                                   not null comment '标签ID',
    tag_name    varchar(255)                             not null comment '标签名称冗余',
    weight      decimal(10, 2) default 0.00              not null comment '权重',
    source_type tinyint        default 0                 not null comment '0自定义 1AI 2系统',
    creator     varchar(64)    default ''                null comment '创建者',
    create_time datetime       default CURRENT_TIMESTAMP not null comment '创建时间',
    updater     varchar(64)    default ''                null comment '更新者',
    update_time datetime       default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP comment '更新时间',
    deleted     bit            default b'0'              not null comment '删除标记'
)
    comment '人才标签关联' collate = utf8mb4_general_ci;

create index idx_tag_id
    on talent_tag_relation (tag_id);

create index idx_talent_tag
    on talent_tag_relation (tenant_id, talent_id);


create table talent_user_behavior
(
    id           bigint auto_increment comment '主键'
        primary key,
    tenant_id    bigint         default 0                 not null comment '租户ID',
    user_id      bigint                                   not null comment '操作人ID',
    talent_id    bigint                                   not null comment '人才ID',
    action_type  int                                      not null comment '行为类型',
    action_score decimal(10, 2) default 1.00              not null comment '行为得分',
    extra_data   text                                     null comment '扩展数据',
    action_time  datetime                                 not null comment '行为时间',
    creator      varchar(64)    default 'system'          null comment '创建者',
    create_time  datetime       default CURRENT_TIMESTAMP not null comment '创建时间',
    updater      varchar(64)    default 'system'          null comment '更新者',
    update_time  datetime       default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP comment '更新时间',
    deleted      bit            default b'0'              not null comment '删除标记'
)
    comment '人才行为日志' collate = utf8mb4_general_ci;

create index idx_behavior_talent
    on talent_user_behavior (tenant_id, talent_id);

create index idx_behavior_time
    on talent_user_behavior (action_time);

create index idx_behavior_user
    on talent_user_behavior (tenant_id, user_id);


create table user_talent_favorite
(
    id          bigint auto_increment comment '主键'
        primary key,
    tenant_id   bigint   default 0                 not null comment '租户ID',
    user_id     bigint                             not null comment 'HR用户ID',
    talent_id   bigint                             not null comment '人才ID',
    create_time datetime default CURRENT_TIMESTAMP not null comment '收藏时间',
    update_time datetime default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP comment '更新时间',
    deleted     bit      default b'0'              not null comment '删除标记',
    constraint uk_user_talent
        unique (tenant_id, user_id, talent_id)
)
    comment 'HR-人才收藏关系' collate = utf8mb4_general_ci;

create index idx_talent
    on user_talent_favorite (tenant_id, talent_id);

create index idx_user
    on user_talent_favorite (tenant_id, user_id);

-- 在user表中添加company_id字段
ALTER TABLE `user`
    ADD COLUMN `company_id` INT COMMENT '企业ID' AFTER `tenant_id`;

-- 添加索引以提升查询性能
CREATE INDEX `idx_user_company` ON `user` (`company_id`);
