# 阿里云相关功能实现文档

## 1. 概述
本文档描述了本项目中文件存储系统的实现机制。系统目前已集成 **阿里云 OSS (Object Storage Service)**，实现了学生端上传文件（头像、作业资料等）自动转存至云端的功能。这确保了教师端和其他客户端可以访问到统一的云端资源，解决了本地存储在分布式或跨端场景下的访问限制问题。

## 2. 实现原理

本项目采用 **后端转发 (Backend Forwarding)** 模式实现 OSS 上传。流程如下：

1.  **客户端上传**: 学生端/客户端调用 API 接口 `/api/upload/:type` 上传文件。
2.  **本地暂存**: 服务器通过 `multer` 中间件接收文件，并暂时保存到服务器本地磁盘 (`/uploads` 目录)。
3.  **云端转存**: 
    *   `uploadController` 监测到文件上传成功。
    *   检查系统是否配置了阿里云 OSS 凭证 (`OSS_ACCESS_KEY_ID` 等)。
    *   如果配置有效，后端通过 `ali-oss` SDK 将本地文件推送至阿里云 OSS Bucket。
4.  **清理与返回**:
    *   **成功**: 推送成功后，服务器自动删除本地的临时文件（释放空间），并返回文件的 **OSS 链接** (URL) 给客户端。
    *   **失败/降级**: 如果 OSS 上传失败或未配置，系统将保留本地文件，并返回服务器本地的静态资源链接（保证服务不中断）。

## 3. 关键代码位置

*   **控制器**: `src/controllers/uploadController.js`
    *   包含 OSS 客户端初始化逻辑。
    *   包含 `uploadLocal` 方法中的核心转存与降级逻辑。
*   **依赖库**: `package.json` 中已添加 `ali-oss`。
*   **配置文件**: `.env` (存储密钥)。

## 4. 配置说明

要启用此功能，必须在服务器的 `.env` 文件中配置以下环境变量：

```ini
# 阿里云 OSS 配置
OSS_REGION=oss-cn-beijing          # 地域，例如 oss-cn-beijing
OSS_BUCKET=yukino-oss              # 存储桶名称
OSS_ACCESS_KEY_ID=your_key_id      # 访问密钥 ID
OSS_ACCESS_KEY_SECRET=your_secret  # 访问密钥 Secret
```

> **注意**: `OSS_ACCESS_KEY_ID` 和 `OSS_ACCESS_KEY_SECRET` 为敏感信息，严禁提交到代码仓库。

## 5. 验证方法

1.  **检查配置**: 确认 `.env` 文件已填写正确的阿里云 AccessKey。
2.  **上传测试**: 使用 Postman 或前端页面上传一张图片（例如头像）。
3.  **观察结果**:
    *   查看接口返回的 JSON 数据，`url` 字段应以 `http://yukino-oss...` 或阿里云域名开头，而非本地 IP。
    *   登录阿里云 OSS 控制台，检查 `yukino-oss` Bucket 中是否出现了新上传的文件。
    *   检查服务器本地 `uploads/` 对应目录，确认临时文件已被自动清理（如果上传成功）。

## 6. 异常处理

*   如果 `.env` 中缺少配置，系统会自动降级为“本地存储模式”，功能不受影响，但文件将无法被外网直接访问（除非服务器配置了公网 IP 和静态资源映射）。
*   如果 OSS 网络超时或密钥错误，控制台会输出错误日志 `OSS upload failed`，并回退到本地 URL。


