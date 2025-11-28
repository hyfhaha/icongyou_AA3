## 学习平台后端接口（前端接入说明）

> 本文基于 `migrations/openapi.yaml`，主要面向前端开发者，帮助快速找到所需接口、理解参数与典型调用方式。  
> 实际字段以后端最终返回为准，本文中的响应 JSON 为示例结构。

---

### 1. 基础信息

- **服务基址（Base URL）**：`http://localhost:3000`
- **通用前缀**：大部分业务接口都在 `/api/...` 路径下
- **数据格式**：统一使用 `application/json`
- **鉴权约定（重要）**
  - 登录与注册接口：一般**不需要**携带登录态。
  - 其他 `/api/**` 接口：一般**需要**登录后携带 token。
  - 具体 Header 名称以后端实现为准（常见写法）：
    - `Authorization: Bearer <token>` 或
    - `X-Token: <token>`

前端在封装请求库时，可以统一在拦截器里注入 token。

---

### 2. 认证模块（Auth）

#### 2.1 登录

- **URL**：`POST /api/auth/login`
- **用途**：用户登录，获取 token 与用户基本信息。
- **请求体**

```json
{
  "username": "student01",
  "password": "123456"
}
```

- **成功响应示例**

```json
{
  "token": "xxxxxx",
  "user": {
    "id": 1,
    "username": "student01",
    "nickname": "张三",
    "user_role": 0,
    "dept_id": 101,
    "dept_name": "软件工程 2 班"
  }
}
```

> 提示：前端拿到 `token` 后，保存在 `localStorage` / `sessionStorage` / 内存中，并在后续请求头中带上。

#### 2.2 注册

- **URL**：`POST /api/auth/register`
- **用途**：创建学生 / 教师账号（演示环境）。
- **请求体**

```json
{
  "username": "newUser",
  "password": "123456"
}
```

- **成功响应示例**

```json
{
  "id": 12,
  "username": "newUser"
}
```

---

### 3. 课程模块（Courses）

#### 3.1 课程列表（用于首页课程检索）

- **URL**：`GET /api/courses`
- **说明**：多课程导览入口，支持关键词搜索与分页。
- **查询参数**
  - `q`：搜索关键词（可选）
  - `page`：页码，默认 `1`
  - `pageSize`：每页数量，默认 `10`

- **请求示例**

```ts
// 以 axios 为例
axios.get('/api/courses', {
  params: { q: '软件工程', page: 1, pageSize: 10 }
});
```

- **响应示例**

```json
{
  "list": [
    {
      "id": 1,
      "name": "软件工程实践",
      "semester": "2024-2025-1",
      "description": "项目驱动的软件工程课程",
      "taskCount": 10,
      "completedTaskCount": 7
    }
  ],
  "page": 1,
  "pageSize": 10,
  "total": 20
}
```

#### 3.2 学生多课程导览总览（卡片 + 完成度）

- **URL**：`GET /api/courses/overview`
- **用途**：登录学生查看自己参与的所有课程，卡片展示总得分、完成度等。
- **查询参数**
  - `page`：页码（可选）
  - `pageSize`：每页数量（可选）

- **响应示例**

```json
{
  "list": [
    {
      "courseId": 1,
      "courseName": "软件工程实践",
      "semester": "2024-2025-1",
      "totalScore": 86,
      "finishedTasks": 7,
      "totalTasks": 10,
      "progress": 0.7
    }
  ]
}
```

> 前端建议：用该接口渲染“多课程导览页”的卡片列表，并在卡片上提供“进入课程主页”的跳转。

#### 3.3 单课程详情 + 任务列表

- **URL**：`GET /api/courses/{id}`
- **用途**：课程主页，展示课程基础信息及任务列表。
- **路径参数**
  - `id`：课程 ID

- **响应示例**

```json
{
  "course": {
    "id": 1,
    "name": "软件工程实践",
    "semester": "2024-2025-1",
    "description": "项目驱动的软件工程课程"
  },
  "tasks": [
    {
      "id": 101,
      "title": "需求分析报告",
      "deadline": "2024-10-01T23:59:59Z",
      "type": "report"
    }
  ]
}
```

#### 3.4 单课程内个人数据总览

- **URL**：`GET /api/courses/{id}/personal`
- **用途**：单课程个人主页顶部统计区域（总得分、排名、完成任务数）。

- **响应示例**

```json
{
  "courseId": 1,
  "totalScore": 86,
  "finishedTasks": 7,
  "totalTasks": 10,
  "rank": 5,
  "studentCount": 60
}
```

#### 3.5 课程任务完成情况统计

- **URL**：`GET /api/courses/{id}/tasks/status`
- **用途**
  - `scope=me`：该学生在课程下每个任务是否完成。
  - `scope=course`：整个课程中各任务的提交率，用于任务看板。

- **查询参数**
  - `scope`：`me` 或 `course`（默认 `me`）

- **响应示例（scope=me）**

```json
[
  {
    "taskId": 101,
    "title": "需求分析报告",
    "finished": true
  },
  {
    "taskId": 102,
    "title": "原型设计",
    "finished": false
  }
]
```

#### 3.6 课程学生排行榜

- **URL**：`GET /api/courses/{id}/students`
- **用途**：课程内排行榜 / 大屏。

- **响应示例**

```json
[
  {
    "studentId": 1,
    "name": "张三",
    "totalScore": 95,
    "finishedTasks": 10,
    "rank": 1
  }
]
```

#### 3.7 课程能力维度达成情况

- **URL**：`GET /api/courses/{id}/abilities/me`
- **用途**：能力画像雷达图 / 进度条。

- **响应示例**

```json
[
  {
    "abilityKey": "engineering_design",
    "abilityName": "工程设计能力",
    "taskCount": 5,
    "finishedCount": 4,
    "score": 88,
    "achievementRate": 0.8
  }
]
```

#### 3.8 课程地图元数据（Goals / Epics / Releases）

- **URL**：`GET /api/courses/{id}/map-metadata`
- **用途**：为任务地图（看板）提供表头元数据，包括毕业要求（Goals）、史诗（Epics）、阶段（Releases），以及 Epic 与 Goal 的归属关系。
- **路径参数**
  - `id`：课程 ID

- **响应示例**

```json
{
  "goals": [
    {
      "id": 11,
      "course_id": 1,
      "goal_name": "毕业要求 1-工程设计能力",
      "goal_desc": "能够完成中等复杂工程系统设计……",
      "goal_level": "H",
      "goal_reference": "1.1.2",
      "sort": 1
    }
  ],
  "epics": [
    {
      "id": 21,
      "course_id": 1,
      "goal_id": 11,
      "epic_name": "需求分析阶段任务组",
      "sort": 1
    }
  ],
  "releases": [
    {
      "id": 31,
      "course_id": 1,
      "release_name": "第 1 阶段：项目立项与需求",
      "release_desc": "完成立项说明书与需求规格说明书"
    }
  ]
}
```

> 前端可使用：
> - Goals 生成顶部“毕业要求”层级；
> - Epics 生成中间“史诗/任务集合”层级；
> - Releases 用于 Y 轴或时间轴展示；
> - 再结合任务数据中的 `goal_id`、`epic_id`、`release_id`、`position_x`、`position_y`，完成二维任务地图渲染。

---

### 4. 任务模块（Tasks）

#### 4.1 任务列表（课程内）

- **URL**：`GET /api/tasks`
- **查询参数**
  - `course_id`：课程 ID（必填）
  - `q`：关键词（可选）
  - `page` / `pageSize`：分页（可选）

- **响应示例**

```json
{
  "total": 10,
  "page": 1,
  "pageSize": 10,
  "items": [
    {
      "id": 101,
      "course_id": 1,
      "story_name": "需求分析报告",
      "story_desc": "请根据给定案例完成需求文档……",
      "goal_id": 11,
      "epic_id": 21,
      "release_id": 31,
      "position_x": 3,
      "position_y": 2,
      "story_type": 2,
      "submit_type": 2,
      "total_score": 100,
      "start_time": "2024-10-01T00:00:00Z",
      "end_time": "2024-10-15T23:59:59Z",
      "done": true,
      "latest_submission_id": 1001,
      "latest_score": 88,
      "latest_submit_time": "2024-09-28T10:00:00Z"
    }
  ]
}
```

#### 4.2 单个任务详情

- **URL**：`GET /api/tasks/{storyId}`
- **用途**：单任务详情页（任务信息 + 当前学生作业 + 任务资料 + 浏览量）。

- **响应示例**

```json
{
  "story": {
    "id": 101,
    "course_id": 1,
    "story_name": "需求分析报告",
    "story_desc": "请根据给定案例完成需求文档……",
    "goal_id": 11,
    "epic_id": 21,
    "release_id": 31,
    "position_x": 3,
    "position_y": 2,
    "story_type": 2,
    "submit_type": 2,
    "total_score": 100,
    "start_time": "2024-10-01T00:00:00Z",
    "end_time": "2024-10-15T23:59:59Z"
  },
  "myWork": {
    "id": 1001,
    "course_id": 1,
    "story_id": 101,
    "file_url": "https://xxx/report.pdf",
    "content": "作业说明……",
    "score": 88
  },
  "materials": [
    {
      "id": 1,
      "course_id": 1,
      "story_id": 101,
      "material_name": "任务说明书（PDF）",
      "material_type": 5,
      "file_name": "SE-req-spec.pdf",
      "content": "https://xxx/SE-req-spec.pdf",
      "code": null,
      "remark": "课堂示例文档"
    }
  ],
  "viewCount": 230
}
```

#### 4.3 任务数据看板

- **URL**：`GET /api/tasks/{storyId}/board`
- **用途**：任务数据大屏（提交人数 / 提交率 / 热度指数等）。

- **响应示例**

```json
{
  "task": {
    "id": 101,
    "title": "需求分析报告"
  },
  "submissionStats": {
    "studentCount": 60,
    "submittedCount": 55,
    "submissionRate": 0.92,
    "averageScore": 85
  },
  "heat": {
    "viewCount": 230,
    "discussionCount": 45,
    "submissionCount": 55,
    "heatIndex": 0.86
  }
}
```

#### 4.4 学生提交作业

- **URL**：`POST /api/tasks/{storyId}/submit`

- **请求体**

```json
{
  "file_url": "https://xxx/report.pdf",
  "content": "这是我的作业说明……",
  "course_id": 1
}
```

- **响应示例**

```json
{
  "workId": 1001,
  "storyId": 101,
  "courseId": 1,
  "fileUrl": "https://xxx/report.pdf",
  "content": "这是我的作业说明……",
  "submittedAt": "2024-09-28T10:00:00Z"
}
```

> 提示：`file_url` 通常通过先调用 **上传接口** `POST /api/upload` 获取返回的 `url` 后再写入本接口。

#### 4.5 任务讨论区

- **URL**
  - `GET /api/tasks/{storyId}/discussions`
  - `POST /api/tasks/{storyId}/discussions`

- **GET 响应示例**

```json
{
  "list": [
    {
      "id": 1,
      "user": {
        "id": 2,
        "name": "李四"
      },
      "content": "这里的约束条件怎么理解？",
      "replyTo": null,
      "createdAt": "2024-09-25T08:00:00Z"
    }
  ],
  "page": 1,
  "pageSize": 10,
  "total": 5
}
```

#### 4.6 记录任务浏览量（用于热度统计）

- **URL**：`POST /api/tasks/{storyId}/view`
- **用途**：在学生每次打开任务详情页时调用一次，用于累计浏览次数。前端可在进入详情页时自动触发该请求。

- **响应示例**

```json
{
  "message": "记录成功",
  "story_id": 101,
  "views": 5
}
```

- **POST 请求体示例**

```json
{
  "content": "请问这个任务允许使用现成模板吗？",
  "reply_to": 1
}
```

---

### 5. 作业与评语模块（Homework）

#### 5.1 单个作业详情

- **URL**：`GET /api/homework/{id}`

- **响应示例**

```json
{
  "id": 1001,
  "storyId": 101,
  "courseId": 1,
  "student": {
    "id": 1,
    "name": "张三"
  },
  "fileUrl": "https://xxx/report.pdf",
  "content": "作业说明……",
  "score": 88,
  "isExcellent": true
}
```

#### 5.2 学生修改作业

- **URL**：`PUT /api/homework/{id}`

- **请求体示例**

```json
{
  "file_url": "https://xxx/report_v2.pdf",
  "content": "更新后的作业说明……"
}
```

#### 5.3 作业评语查询与点评

- **URL**
  - `GET /api/homework/{id}/comment`
  - `PUT /api/homework/{id}/comment`

- **GET 响应示例**

```json
{
  "comment": "整体结构清晰，但细节分析略显不足。",
  "teacher": {
    "id": 3,
    "name": "王老师"
  },
  "updatedAt": "2024-09-29T09:00:00Z"
}
```

- **PUT 请求体示例**

```json
{
  "comment": "补充评语：已根据修改再次审阅，整体质量较高。"
}
```

---

### 6. 团队模块（Teams）

#### 6.1 当前用户加入的所有团队

- **URL**：`GET /api/teams/user`

- **响应示例**

```json
[
  {
    "teamId": 10,
    "courseId": 1,
    "courseName": "软件工程实践",
    "groupName": "第1小组",
    "role": "member"
  }
]
```

#### 6.2 课程下全部团队 & 创建团队

- **URL**
  - `GET /api/teams/course/{courseId}`
  - `POST /api/teams/course/{courseId}`

- **GET 响应示例**

```json
[
  {
    "teamId": 10,
    "groupName": "第1小组",
    "memberCount": 5,
    "maxSize": 6
  }
]
```

- **POST 创建团队请求体**

```json
{
  "group_name": "第3小组",
  "max_size": 6,
  "group_code": "SE-3"
}
```

#### 6.3 加入 / 退出团队

- **URL**
  - `POST /api/teams/{teamId}/join`
  - `POST /api/teams/{teamId}/quit`

- **响应示例**

```json
{
  "success": true
}
```

#### 6.4 团队成员列表

- **URL**：`GET /api/teams/{teamId}/members`

- **响应示例**

```json
[
  {
    "id": 1,
    "name": "张三",
    "isLeader": true
  },
  {
    "id": 2,
    "name": "李四",
    "isLeader": false
  }
]
```

#### 6.5 任务维度团队成绩

- **URL**：`GET /api/teams/{storyId}`

- **响应示例**

```json
[
  {
    "teamId": 10,
    "groupName": "第1小组",
    "score": 90,
    "rank": 1
  }
]
```

#### 6.6 团队成员成绩与贡献度

- **URL**：`GET /api/teams/detail/{teamId}`

- **响应示例**

```json
{
  "team": {
    "teamId": 10,
    "groupName": "第1小组"
  },
  "members": [
    {
      "id": 1,
      "name": "张三",
      "score": 92,
      "contributionRate": 0.4
    },
    {
      "id": 2,
      "name": "李四",
      "score": 88,
      "contributionRate": 0.3
    }
  ]
}
```

---

### 7. 优秀作业模块（Excellent）

#### 7.1 某任务优秀作业列表

- **URL**：`GET /api/excellent/{storyId}`

- **响应示例**

```json
[
  {
    "workId": 1001,
    "student": {
      "id": 1,
      "name": "张三"
    },
    "score": 95,
    "recommendRank": 5,
    "liked": true,
    "bookmarked": false,
    "favorited": false
  }
]
```

#### 7.2 点赞 / 收藏优秀作业

- **URL**
  - `POST /api/excellent/{storyId}/{workId}/like`
  - `POST /api/excellent/{storyId}/{workId}/bookmark`

- **响应示例**

```json
{
  "liked": true,
  "likeCount": 12
}
```

#### 7.3 设置 / 取消优秀作业（教师端）

- **URL**
  - `POST /api/excellent/{workId}/set`
  - `POST /api/excellent/{workId}/unset`

- **设置优秀作业请求体**

```json
{
  "recommend_rank": 5
}
```

---

### 8. AI 模块（AI）

> 所有 AI 接口为 `POST`，建议前端在调用前提示用户「内容会发送到 AI 服务处理」。

#### 8.1 AI 任务问答

- **URL**：`POST /api/ai/ask`

- **请求体示例**

```json
{
  "question": "这个任务的用例图需要画到什么粒度？",
  "storyId": 101
}
```

- **响应示例**

```json
{
  "answer": "一般建议覆盖主要业务场景即可，例如……",
  "references": []
}
```

#### 8.2 AI 写作建议 / 润色

- **URL**：`POST /api/ai/generate`

- **请求体示例**

```json
{
  "content": "这是我写的需求分析报告……",
  "storyId": 101,
  "requirements": "从完整性、一致性、可验证性三个维度给出修改建议"
}
```

#### 8.3 AI 自动总结

- **URL**：`POST /api/ai/summary`

- **请求体示例**

```json
{
  "content": "一大段课堂笔记或文档内容……",
  "storyId": 101,
  "max_length": 200
}
```

#### 8.4 AI 作业智能点评

- **URL**：`POST /api/ai/comment`

- **请求体示例**

```json
{
  "content": "学生提交的完整作业内容……",
  "storyId": 101,
  "rubric": "从创新性、逻辑性、表达清晰度三个指标给出打分建议"
}
```

---

### 9. 视图统计接口（View）

#### 9.1 课程学生统计视图

- **URL**：`GET /api/view/course-students`
- **查询参数**
  - `course_id`：课程 ID

- **响应示例**

```json
[
  {
    "studentId": 1,
    "name": "张三",
    "totalScore": 95,
    "finishedTasks": 10,
    "rank": 1
  }
]
```

#### 9.2 任务提交统计视图

- **URL**：`GET /api/view/task-submission`
- **查询参数**
  - `story_id`：任务 ID

- **响应示例**

```json
{
  "storyId": 101,
  "submittedCount": 55,
  "studentCount": 60,
  "excellentCount": 5,
  "averageScore": 85
}
```

---

### 10. 消息沟通模块（Messages）

> 用于“学生端 ↔ 管理端 / JHR”等用户之间的点对点文本消息沟通。  
> 所有接口均需要登录后在请求头中携带 token（`Authorization: Bearer <token>`）。

#### 10.1 发送消息

- **URL**：`POST /api/messages`
- **用途**：当前登录用户向指定用户发送一条文本消息。
- **请求头**
  - `Authorization: Bearer <token>`
- **请求体**

```json
{
  "receiverId": 2,
  "content": "你好，我想咨询一下这个任务的要求……"
}
```

- **说明**
  - `receiverId`：接收方用户 ID（可为 JHR / 管理端 / 学生等的用户 ID）。
  - `content`：文本内容，不能为空。
  - 后端会自动从 token 中获取发送人 `senderId`，不需要前端传。

- **成功响应示例**

```json
{
  "id": 1,
  "senderId": 1,
  "receiverId": 2,
  "content": "你好，我想咨询一下这个任务的要求……",
  "isRead": false,
  "createTime": "2025-11-25T10:00:00.000Z"
}
```

---

#### 10.2 会话列表（按对方用户维度）

- **URL**：`GET /api/messages/conversations`
- **用途**：获取当前登录用户与其他用户的会话列表，用于“对话列表页”。
- **请求头**
  - `Authorization: Bearer <token>`
- **查询参数**
  - 无（首次实现不分页，后续如有需要可扩展）。

- **请求示例**

```ts
axios.get('/api/messages/conversations');
```

- **响应示例**

```json
{
  "list": [
    {
      "conversationId": "2",
      "partnerId": 2,
      "partnerName": "某JHR",
      "partnerRole": 2,
      "lastMessage": "上次说到这里……",
      "lastTime": "2025-11-25T10:00:00.000Z",
      "lastIsFromMe": true,
      "unreadCount": 3
    }
  ]
}
```

- **字段说明**
  - `conversationId`：当前简单实现中，直接使用“对方用户 ID”的字符串形式作为会话标识。
  - `partnerId`：对方用户 ID。
  - `partnerName`：对方昵称或用户名（后端会优先使用 `nickname`，否则用 `username`）。
  - `partnerRole`：对方角色（0 学生、1 教师、2 企业用户、3 管理员）。
  - `lastMessage`：最近一条消息内容。
  - `lastTime`：最近一条消息时间。
  - `lastIsFromMe`：最近一条消息是否是当前登录用户发出的。
  - `unreadCount`：该对话中，当前登录用户尚未读的消息数量。

> 前端建议：在“消息列表 / 联系人列表”页面，使用该接口渲染卡片或列表，并通过 `unreadCount` 展示红点或未读数。

---

#### 10.3 与指定用户的消息列表（轮询用）

- **URL**：`GET /api/messages/with/{userId}`
- **用途**：获取当前登录用户与某个指定用户之间的消息列表，用于聊天详情页。
- **请求头**
  - `Authorization: Bearer <token>`
- **路径参数**
  - `userId`：对话对方的用户 ID（学生端传 JHR / 管理端 ID，管理端传学生 ID）。
- **查询参数**
  - `page`：页码，默认 `1`
  - `pageSize`：每页数量，默认 `20`

- **请求示例**

```ts
// 拉取与用户 2 之间的最近 50 条消息
axios.get('/api/messages/with/2', { params: { page: 1, pageSize: 50 } });
```

- **响应示例**

```json
{
  "list": [
    {
      "id": 1,
      "senderId": 1,
      "receiverId": 2,
      "fromMe": true,
      "content": "老师您好，这是我的问题……",
      "isRead": true,
      "createTime": "2025-11-25T09:00:00.000Z"
    },
    {
      "id": 2,
      "senderId": 2,
      "receiverId": 1,
      "fromMe": false,
      "content": "好的，我来解释一下……",
      "isRead": false,
      "createTime": "2025-11-25T09:05:00.000Z"
    }
  ],
  "page": 1,
  "pageSize": 50,
  "total": 2
}
```

- **字段说明**
  - `fromMe`：是否由当前登录用户发出（前端可据此决定消息气泡是左对齐还是右对齐）。
  - 该接口在返回数据前，会自动把“对方发给当前登录用户且未读的消息”标记为已读，前端不需要额外调用“标记已读”接口。

- **前端轮询建议**
  - 聊天详情页打开时：先请求一次 `GET /api/messages/with/{userId}?page=1&pageSize=50`。
  - 之后每隔 3～5 秒轮询一次同样的接口：
    - 简单实现：每次全量拉最近 N 条消息，前端根据 `id` 做去重。
    - 如需优化，可约定在查询参数中增加 `sinceId` 或 `sinceTime`，只拉取新消息（后端目前未实现，如有需要可再扩展）。

---

### 11. 使用建议（前端）

- **接口封装**
  - 建议在 `axios`/`fetch` 封装层统一处理：
    - Base URL
    - token 注入
    - 401 统一跳转登录
- **错误处理**
  - 后端通常会返回错误码与错误信息（例如 `message` 字段），前端统一在拦截器或统一组件中处理提示。
- **类型管理**
  - 如使用 TypeScript，建议按照本文件的响应示例抽象出接口类型，方便在组件和状态管理（Vuex/Pinia/Redux）中复用。

---

### 12. 上传与用户信息（Upload & User）

#### 12.1 文件上传（获取 file_url）

- **URL**：`POST /api/upload`
- **用途**：上传单个文件到服务器本地 `uploads` 目录，返回可直接用于作业提交的 `file_url`。
- **请求头**
  - 需要携带登录态（`Authorization: Bearer <token>`）。
- **请求体**
  - `Content-Type: multipart/form-data`
  - 表单字段名：`file`

- **响应示例**

```json
{
  "url": "http://localhost:3000/uploads/abcd1234.pdf"
}
```

> 前端通常流程：先调 `POST /api/upload` 获取 `url`，再把该 `url` 写入 `POST /api/tasks/{storyId}/submit` 的 `file_url` 字段。

#### 12.1.1 OSS 直传临时凭证（可选方案）

- **URL**：`GET /oss/sts-token`（或 `GET /api/oss/sts-token`）
- **用途**：如需在前端直接上传到阿里云 OSS（而不是通过 `/api/upload` 走后端中转），可以先调用该接口获取 STS 临时凭证，再按前端约定生成 `policy` 和 `signature`，使用 `uni.uploadFile` 或表单直传到 OSS。
- **鉴权**：需要登录态（`Authorization: Bearer <token>`）。

- **响应示例**

```json
{
  "code": 200,
  "data": {
    "accessKeyId": "STS.xxxxxx",
    "accessKeySecret": "xxxxxxxx",
    "securityToken": "yyyyyyyy",
    "expiration": "2025-12-31T23:59:59Z"
  }
}
```

> 前端拿到这四个字段后即可使用现有的 HMAC-SHA1 + Base64 工具（例如 `bundle.js` / `oss.js` 中的工具方法）生成 OSS 所需的 `policy` 与 `signature`，完成直传。直传成功后，将 OSS 返回的文件 URL 作为 `file_url` 传给 `POST /api/tasks/{storyId}/submit` 即可。

#### 12.2 当前登录用户信息

- **URL**：`GET /api/user/me`
- **用途**：获取当前登录用户的完整基础信息，用于个人中心 / 头像昵称展示 / 班级信息展示。

- **响应示例**

```json
{
  "id": 1,
  "username": "student01",
  "nickname": "张三",
  "user_role": 0,
  "dept_id": 101,
  "dept_name": "软件工程 2 班",
  "avatar_url": "https://xxx/avatar.png",
  "phone_number": "13800000000"
}
```

> 说明：`dept_name` 来自后端对用户备注信息的解析，如果后台已配置该字段，前端即可直接展示人性化的班级/部门名称；若为空则前端可降级为仅展示 `dept_id` 或隐藏该行。