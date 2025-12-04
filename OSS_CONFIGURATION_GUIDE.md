# 阿里云 OSS 配置与使用指南

## 1. 核心流程说明

目前系统实现了以下文件上传与存储流程：
1. **上传 (Upload)**: 前端将文件发送给后端 `/api/upload/:type` 接口。
2. **转存 (Transfer)**: 后端接收文件后，自动将其上传到阿里云 OSS。
3. **返回地址 (Return URL)**: 阿里云返回文件的网络地址（URL），后端将此 URL 返回给前端。
4. **保存 (Save)**: 前端拿到 URL 后，将其作为参数（如 `avatar_url`, `file_url`）提交给对应的业务接口（如更新个人信息、提交作业），最终存入数据库。

## 2. 阿里云 OSS 配置步骤

要启用此功能，你需要开通阿里云 OSS 服务并获取相应的密钥。

### 第一步：开通 OSS 并创建 Bucket
1. 登录 [阿里云 OSS 控制台](https://oss.console.aliyun.com/)。
2. 点击 **Bucket 列表** -> **创建 Bucket**。
   - **Bucket 名称**: 例如 `my-school-files` (请记下这个名字)。
   - **地域**: 选择离你最近的，例如 `华北2（北京）` -> `oss-cn-beijing`。
   - **读写权限**: 选择 **公共读** (Public Read)。这很重要，否则生成的 URL 无法直接访问。

### 第二步：创建 RAM 用户并获取 AccessKey
为了安全，不要使用阿里云主账号，请创建一个专门的 RAM 用户。
1. 进入 [RAM 访问控制](https://ram.console.aliyun.com/)。
2. **用户** -> **创建用户**。
   - 登录名称：例如 `oss-uploader`。
   - 访问方式：勾选 **OpenAPI 调用访问**。
3. 创建完成后，复制并保存 **AccessKey ID** 和 **AccessKey Secret**。
4. 点击刚创建的用户，进入 **权限管理** -> **新增授权**。
5. 搜索并添加 `AliyunOSSFullAccess` 权限。

### 第三步：配置项目环境变量
在项目根目录下找到 `.env` 文件（如果没有则创建），填入以下信息：

```ini
# 阿里云 AccessKey
ALIYUN_ACCESS_KEY_ID=你的AccessKeyID
ALIYUN_ACCESS_KEY_SECRET=你的AccessKeySecret

# OSS Bucket 配置
OSS_BUCKET=你的Bucket名称 (例如 my-school-files)
OSS_REGION=你的Region (例如 oss-cn-beijing)

# 可选：如果你需要前端直传功能，还需要配置角色 ARN
ALIYUN_OSS_ROLE_ARN=
```

## 3. 代码修改说明

系统已包含完整的 OSS 集成代码，主要位于：
- `src/controllers/uploadController.js`: 核心上传逻辑。检测到环境变量配置了 OSS 后，会自动切换到 OSS 上传模式。
- `src/middleware/uploadMiddleware.js`: 处理文件接收。

### 如何在数据库中保存地址？

无需修改后端上传代码。上传接口 `/api/upload/...` 会返回如下 JSON：
```json
{
  "url": "https://my-school-files.oss-cn-beijing.aliyuncs.com/images/avatars/xxxx.png",
  "filename": "xxxx.png"
}
```

**前端/客户端的使用方式：**

1. **上传头像**:
   - 调用 `POST /api/upload/avatar` 上传图片。
   - 获取返回的 `url`。
   - 调用 `PUT /api/user/me`，Body: `{ "avatar_url": "https://..." }`。

2. **提交作业**:
   - 调用 `POST /api/upload/homework` 上传文档。
   - 获取返回的 `url`。
   - 调用 `POST /api/tasks/:id/submit`，Body: `{ "file_url": "https://..." }`。

## 4. 验证配置

项目包含一个测试脚本 `test_oss_integration.js`。
配置好 `.env` 后，运行以下命令测试：

```bash
node test_oss_integration.js
```

如果看到 "✓ URL 指向阿里云 OSS"，则说明配置成功。

