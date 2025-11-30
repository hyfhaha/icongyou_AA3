# 讨论功能 API 说明（支持 AI 自动回复）

## 概述

讨论功能已增强，支持与 AI 进行作业讨论。当学生提问时，可以自动调用 AI 生成回复。

---

## API 接口

### 1. 获取任务讨论列表

**GET** `/api/tasks/:storyId/discussions`

获取指定任务下的所有讨论记录（包括用户提问和 AI 回复）。

**请求参数：**
- `storyId` (路径参数): 任务ID
- `page` (查询参数，可选): 页码，默认 1
- `pageSize` (查询参数，可选): 每页数量，默认 10

**响应示例：**
```json
{
  "story_id": 1001,
  "total": 5,
  "page": 1,
  "pageSize": 10,
  "items": [
    {
      "id": 1,
      "story_id": 1001,
      "course_id": 1,
      "user_id": 201,
      "user_name": "学生01",
      "content": "老师，这个用例图需要画到什么粒度？",
      "likes": 0,
      "reply_to": null,
      "create_time": "2024-09-15T10:00:00.000Z"
    },
    {
      "id": 2,
      "story_id": 1001,
      "course_id": 1,
      "user_id": 0,
      "user_name": "AI助手",
      "content": "用例图应该覆盖主要业务场景...",
      "likes": 0,
      "reply_to": 1,
      "create_time": "2024-09-15T10:00:05.000Z"
    }
  ]
}
```

**说明：**
- `user_id = 0` 且 `user_name = "AI助手"` 的讨论是 AI 自动回复
- `reply_to` 字段表示这是对哪条讨论的回复

---

### 2. 创建讨论（支持 AI 自动回复）

**POST** `/api/tasks/:storyId/discussions`

创建新的讨论记录。支持请求 AI 自动回复。

**请求参数：**
- `storyId` (路径参数): 任务ID
- `content` (必填): 讨论内容
- `reply_to` (可选): 回复的讨论ID，如果是对他人讨论的回复
- `ask_ai` (可选): 是否请求 AI 回复，`true` 表示需要 AI 自动回复

**请求体示例（普通讨论）：**
```json
{
  "content": "老师，这个用例图需要画到什么粒度？"
}
```

**请求体示例（请求 AI 回复）：**
```json
{
  "content": "老师，这个用例图需要画到什么粒度？",
  "ask_ai": true
}
```

**请求体示例（回复他人讨论）：**
```json
{
  "content": "我也有同样的疑问",
  "reply_to": 1
}
```

**响应示例（请求了 AI 回复）：**
```json
{
  "discussion": {
    "id": 1,
    "story_id": 1001,
    "course_id": 1,
    "user_id": 201,
    "user_name": "学生01",
    "content": "老师，这个用例图需要画到什么粒度？",
    "reply_to": null,
    "create_time": "2024-09-15T10:00:00.000Z"
  },
  "ai_reply": {
    "id": 2,
    "story_id": 1001,
    "course_id": 1,
    "user_id": 0,
    "user_name": "AI助手",
    "content": "用例图应该覆盖主要业务场景，重点关注主干流程...",
    "reply_to": 1,
    "create_time": "2024-09-15T10:00:05.000Z"
  },
  "message": "讨论创建成功，AI已自动回复"
}
```

**响应示例（未请求 AI 回复）：**
```json
{
  "discussion": {
    "id": 1,
    "story_id": 1001,
    "course_id": 1,
    "user_id": 201,
    "user_name": "学生01",
    "content": "老师，这个用例图需要画到什么粒度？",
    "reply_to": null,
    "create_time": "2024-09-15T10:00:00.000Z"
  },
  "ai_reply": null,
  "message": "讨论创建成功"
}
```

**注意事项：**
1. AI 自动回复只在 `ask_ai = true` 且 `reply_to` 为空时触发（即用户主动提问时）
2. 如果 AI 调用失败，讨论仍然会创建成功，但 `ai_reply` 为 `null`
3. AI 回复会作为对用户讨论的回复保存，`reply_to` 指向用户的讨论ID

---

## 功能特性

### 1. AI 上下文理解
- AI 会自动获取任务背景（任务名称、任务描述）作为上下文
- AI 会根据任务内容给出有针对性的指导建议

### 2. 错误处理
- 如果 AI 服务不可用或调用失败，不影响用户讨论的创建
- 错误信息会记录在服务端日志中

### 3. AI 回复标识
- AI 回复的讨论记录中，`user_id = 0`，`user_name = "AI助手"`
- 前端可以根据这些字段区分 AI 回复和人工回复

---

## 使用示例

### PowerShell 测试脚本

```powershell
# 1. 登录获取 Token
$loginBodyObj = @{username="student01"; password="123456"}
$loginBodyBytes = [System.Text.Encoding]::UTF8.GetBytes(($loginBodyObj | ConvertTo-Json -Compress))
$loginResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method POST -ContentType "application/json; charset=utf-8" -Body $loginBodyBytes
$token = $loginResponse.token

# 2. 创建讨论并请求 AI 回复
$headers = @{"Authorization"="Bearer $token"; "Content-Type"="application/json"}
$discussionBodyObj = @{
    content = "老师，这个用例图需要画到什么粒度？"
    ask_ai = $true
}
$discussionBodyBytes = [System.Text.Encoding]::UTF8.GetBytes(($discussionBodyObj | ConvertTo-Json -Compress))
$response = Invoke-RestMethod -Uri "http://localhost:3000/api/tasks/1001/discussions" -Method POST -Headers $headers -Body $discussionBodyBytes -ContentType "application/json; charset=utf-8"
$response | ConvertTo-Json -Depth 5

# 3. 获取讨论列表
$discussions = Invoke-RestMethod -Uri "http://localhost:3000/api/tasks/1001/discussions?page=1&pageSize=10" -Method GET -Headers $headers
$discussions | ConvertTo-Json -Depth 5
```

---

## 配置要求

确保 `.env` 文件中配置了智谱 AI 的 API Key：

```bash
ZHIPU_API_KEY=你的_智谱_API_Key
```

如果没有配置，讨论功能仍然可以正常使用（创建和查看讨论），但 AI 自动回复功能将不可用。

---

## 前端集成建议

1. **讨论列表展示**：
   - 区分显示用户提问和 AI 回复
   - 可以通过 `user_id === 0` 判断是否为 AI 回复
   - 可以通过 `reply_to` 字段构建回复关系树

2. **创建讨论界面**：
   - 添加一个复选框"请求 AI 回复"
   - 当用户勾选并提交后，等待 AI 回复自动生成并显示

3. **AI 回复标识**：
   - 在 AI 回复旁边显示"AI助手"标识
   - 可以使用不同的样式区分 AI 回复和人工回复

---

## 注意事项

1. AI 回复需要一定时间生成（通常 1-5 秒），前端应适当显示加载状态
2. 如果 AI 服务不可用，不会影响普通讨论功能的正常使用
3. 建议在前端缓存讨论列表，减少重复请求

