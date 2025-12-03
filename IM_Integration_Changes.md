# 数据库与即时通讯模块集成修改说明文档

## 1. 概述
本文档记录了为集成第三方即时通讯（IM）系统及对接新版云数据库所进行的系统修改。修改范围涵盖数据库连接配置、数据表结构变更（SQL）、后端数据模型（Models）及业务逻辑控制（Controllers）。

## 2. 数据库配置变更

### 2.1 连接信息更新
配置文件：`src/config/database.js`
- **Host**: 更新为腾讯云数据库实例 `bj-cynosdbmysql-grp-7d90jsc8.sql.tencentcdb.com`
- **Port**: `23992`
- **User**: `root`
- **Timezone**: `+08:00`
- **新增选项**: `allowPublicKeyRetrieval: true` (解决连接时的公钥获取问题)

## 3. 数据库表结构变更 (SQL)

### 3.1 消息表重构 (`sql/messages.sql`)
原 `messages` 表已被新的 `message` 表结构替换，主要变更点：
- **主键**: 变更为 `msg_id`。
- **新增字段**:
  - `conversation_id`: 会话唯一标识 (格式: `tenant_minId_maxId`)
  - `status`: 消息状态 (1:正常, 2:撤回, 3:删除)
  - `timestamp_ms`: 毫秒级时间戳
  - `content_type`: 消息类型 (默认为 text)
- **删除字段**: `is_read` (移至回执表), `creator`, `updater` 等冗余字段。

### 3.2 新增会话表 (`sql/conversation.sql`)
用于维护用户间的会话列表及未读计数：
- 字段包括：`conversation_id`, `user_a`, `user_b`, `last_msg_content`, `unread_a`, `unread_b` 等。

### 3.3 新增已读回执表 (`sql/read_receipt.sql`)
用于精确记录消息读取状态：
- 字段包括：`conversation_id`, `user_id`, `last_read_msg_id`。

### 3.4 用户表扩展 (`sql/user.sql`)
- **新增字段**: `company_id` (企业ID)，用于关联企业信息。
- **新增索引**: `idx_user_company`。

## 4. 后端代码变更

### 4.1 数据模型 (Models)
- **Updated**: `src/models/message.js` - 映射新的 `message` 表结构。
- **Updated**: `src/models/user.js` - 增加 `company_id` 字段。
- **Created**: `src/models/conversation.js` - 对应 `conversation` 表。
- **Created**: `src/models/readReceipt.js` - 对应 `read_receipt` 表。
- **Updated**: `src/models/index.js` - 注册新模型，移除未使用的引用。

### 4.2 业务逻辑 (Controllers)
**消息控制器** (`src/controllers/messageController.js`) 已完全重写：

1.  **发送消息 (POST /api/messages)**
    - 自动生成或复用 `conversation_id`。
    - 事务处理：同时插入 `message` 表记录并更新 `conversation` 表的 `last_msg` 和接收方的 `unread` 计数。

2.  **获取会话列表 (GET /api/messages/conversations)**
    - 基于 `conversation` 表查询当前用户的活跃会话。
    - 自动计算未读数并返回对方用户信息。

3.  **获取聊天记录 (GET /api/messages/with/:userId)**
    - 查询 `message` 表获取历史记录。
    - 自动重置当前用户在 `conversation` 表中的未读计数。
    - 更新 `read_receipt` 表记录最后阅读位置。

### 4.3 中间件 (Middleware)
- **Updated**: `src/middleware/auth.js` - `req.user` 对象中增加了 `tenant_id` 注入，确保多租户数据隔离。

## 5. 待办/注意事项
- [ ] **数据迁移**: 请在云数据库执行更新后的 SQL 文件以同步表结构。
- [ ] **环境变量**: 确保服务器环境变量 (`DB_PASS` 等) 已更新为新凭据。

