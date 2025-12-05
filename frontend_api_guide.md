# 前端文件上传与阿里云 OSS 集成指南

本文档详细说明了前端如何实现文件上传、获取阿里云 OSS 地址，并将地址保存到业务数据库的完整流程。

## 核心流程概览

整个过程分为两个独立的步骤：
1. **上传文件 (Upload)**: 调用上传接口，将文件传给后端，后端转存至阿里云 OSS，返回一个可访问的 URL。
2. **保存数据 (Save)**: 将上一步拿到的 URL 作为一个普通字符串字段，提交给业务接口（如修改头像、提交作业）。

---

## 详细步骤说明

### 第一步：上传文件并获取 URL

**场景**：用户选择了图片或文件，点击上传。

*   **接口地址**: 
    *   上传头像: `POST /api/upload/avatar`
    *   上传作业: `POST /api/upload/homework`
    *   上传通用素材: `POST /api/upload/material`
*   **Content-Type**: `multipart/form-data`
*   **参数**: `file` (文件对象)

**前端请求示例 (伪代码)**:

```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);

// 1. 发送上传请求
const response = await axios.post('/api/upload/avatar', formData, {
    headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': 'Bearer ' + token // 别忘了 Token
    }
});

// 2. 获取返回的 OSS 地址
const fileUrl = response.data.url; 
console.log('文件已上传到阿里云，地址是:', fileUrl);
// 结果示例: https://your-bucket.oss-cn-beijing.aliyuncs.com/images/avatars/xxx.png
```

---

### 第二步：将 URL 保存到业务数据中

**场景**：文件上传成功后，需要把这个文件的地址关联到用户或任务上。

#### 案例 A：修改用户头像

拿到 `fileUrl` 后，调用更新用户信息的接口。

*   **接口地址**: `PUT /api/user/me`
*   **Content-Type**: `application/json`
*   **Body**:
```json
{
      "avatar_url": "https://your-bucket.oss-cn-beijing.aliyuncs.com/..."
    }
    ```

**前端请求示例**:

```javascript
// 3. 将地址保存到用户资料中
await axios.put('/api/user/me', {
    avatar_url: fileUrl
}, {
    headers: { 'Authorization': 'Bearer ' + token }
});

alert('头像修改成功！');
```

#### 案例 B：提交作业

拿到 `fileUrl` 后，调用提交作业的接口。

*   **接口地址**: `POST /api/tasks/:storyId/submit`
*   **Content-Type**: `application/json`
*   **Body**:
```json
{
      "content": "这是我的作业描述...",
      "file_url": "https://your-bucket.oss-cn-beijing.aliyuncs.com/..."
    }
    ```

**前端请求示例**:

```javascript
// 3. 提交作业
await axios.post(`/api/tasks/${storyId}/submit`, {
    content: '老师，这是我的期末作业',
    file_url: fileUrl,      // 刚才上传得到的 URL
    file_name: '我的作业.pdf' // 可选：文件名
}, {
    headers: { 'Authorization': 'Bearer ' + token }
});

alert('作业提交成功！');
```

---

## 常见问题 (FAQ)

**Q1: 为什么不直接在前端传到阿里云？**
A: 为了安全和简化前端开发。目前采用的是**后端代理上传**模式，前端不需要关心阿里云的 Key 和 Secret，只需要像往常一样传给后端即可。后端会自动处理转存。

**Q2: 如果后端没配置阿里云 OSS 会怎样？**
A: 接口会自动降级。后端会把文件存在服务器本地，并返回一个指向服务器本地的 URL（例如 `http://localhost:3000/uploads/...`）。前端逻辑完全不用变，拿到的都是可访问的 URL。

**Q3: 上传的文件名可以包含中文吗？**
A: 可以，但建议在上传前尽量重命名，后端也会自动生成随机文件名以避免冲突。

**Q4: 上传有大小限制吗？**
A: 有，后端默认限制为 **100MB**。如果需要上传更大的文件，请联系后端调整限制。
