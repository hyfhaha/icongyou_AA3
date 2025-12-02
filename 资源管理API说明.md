# 资源管理 API 说明文档

> 本文档说明后端资源上传与获取接口的使用方法，包括头像、课程封面、图标和任务资料的管理。

---

## 目录

1. [基础信息](#基础信息)
2. [资源上传接口](#资源上传接口)
3. [资源获取方式](#资源获取方式)
4. [数据库字段对应](#数据库字段对应)
5. [前端使用示例](#前端使用示例)
6. [错误处理](#错误处理)

---

## 基础信息

### 服务配置

- **服务基址（Base URL）**：`http://localhost:3000`（开发环境）
- **文件访问前缀**：`/uploads`
- **完整文件URL格式**：`{FILE_BASE_URL}/uploads/{相对路径}`
  - `FILE_BASE_URL` 通过环境变量 `FILE_BASE_URL` 配置，默认为空字符串
  - 如果未配置，则使用相对路径，前端需要拼接完整域名

### 资源文件夹结构

后端已创建以下资源文件夹：

```
uploads/
├── images/
│   ├── covers/      # 课程封面
│   └── avatars/     # 用户头像
├── icons/           # 图标资源
└── materials/       # 任务辅助资料
```

### 鉴权要求

**所有上传接口都需要登录认证**，请求头需携带：
- `Authorization: Bearer <token>` 或
- 根据后端实际配置的认证方式

---

## 资源上传接口

### 接口地址

```
POST /api/upload/:type
```

### 路径参数

| 参数 | 类型 | 必填 | 说明 | 保存路径 | 文件类型限制 |
|------|------|------|------|----------|-------------|
| `type` | string | 否 | 资源类型 | - | - |
| - `avatar` | - | - | 用户头像 | `uploads/images/avatars/` | 图片格式（jpg, png, gif等） |
| - `cover` | - | - | 课程封面 | `uploads/images/covers/` | 图片格式（jpg, png, gif等） |
| - `icon` | - | - | 图标资源 | `uploads/icons/` | 图标格式（svg, png, ico等） |
| - `material` | - | - | 任务资料 | `uploads/materials/` | **仅支持 PDF 和 DOC/DOCX 格式** |
| - 不传或为空 | - | - | 通用上传（兼容旧接口） | `uploads/` | 无限制 |

### 请求格式

- **Content-Type**：`multipart/form-data`
- **表单字段名**：`file`
- **文件大小限制**：100MB

### 文件类型限制说明

**任务资料（material）特殊要求**：
- ✅ **支持的文件格式**：`.pdf`、`.doc`、`.docx`
- ❌ **不支持其他格式**：如 `.txt`、`.xlsx`、`.pptx` 等
- 如果上传不符合要求的文件类型，接口将返回 `400` 错误

### 响应格式

#### 成功响应（200）

```json
{
  "url": "http://localhost:3000/uploads/images/avatars/a1b2c3d4e5f6g7h8.jpg",
  "filename": "a1b2c3d4e5f6g7h8.jpg",
  "originalname": "my-avatar.jpg",
  "size": 102400,
  "mimetype": "image/jpeg"
}
```

#### 响应字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| `url` | string | 文件的完整访问URL，可直接用于前端展示或存储到数据库 |
| `filename` | string | 服务器生成的文件名（随机哈希值 + 原扩展名） |
| `originalname` | string | 用户上传时的原始文件名 |
| `size` | number | 文件大小（字节） |
| `mimetype` | string | 文件的MIME类型 |

#### 错误响应

**文件缺失错误（400）**：
```json
{
  "message": "没有文件或文件类型不符合要求"
}
```

**文件类型错误（400）**（仅任务资料）：
```json
{
  "message": "任务资料仅支持 PDF 和 DOC/DOCX 格式。当前文件类型: .txt"
}
```

**文件过大错误（413）**：
```json
{
  "message": "文件大小超过100MB限制"
}
```

---

## 资源获取方式

### 静态文件服务

后端已配置静态文件服务，所有上传的资源可通过以下方式直接访问：

```
GET /uploads/{相对路径}
```

### 访问示例

假设上传头像后返回的URL为：
```
http://localhost:3000/uploads/images/avatars/a1b2c3d4e5f6g7h8.jpg
```

前端可以直接使用该URL：
- **HTML `<img>` 标签**：`<img src="http://localhost:3000/uploads/images/avatars/a1b2c3d4e5f6g7h8.jpg" />`
- **CSS 背景图**：`background-image: url('http://localhost:3000/uploads/images/avatars/a1b2c3d4e5f6g7h8.jpg')`
- **前端框架**：直接绑定到图片组件的 `src` 属性

### 注意事项

1. **跨域问题**：如果前端和后端不在同一域名，需要后端配置CORS
2. **缓存策略**：浏览器可能会缓存静态资源，更新文件时注意清除缓存
3. **文件路径**：返回的URL已包含完整路径，无需前端再次拼接

---

## 数据库字段对应

### 用户头像（avatar_url）

- **表名**：`user`
- **字段名**：`avatar_url`
- **类型**：`varchar(512)`
- **存储内容**：上传接口返回的 `url` 字段值
- **示例**：`http://localhost:3000/uploads/images/avatars/a1b2c3d4e5f6g7h8.jpg`

### 课程封面（course_pic）

- **表名**：`course`
- **字段名**：`course_pic`
- **类型**：`varchar(512)`
- **存储内容**：上传接口返回的 `url` 字段值
- **示例**：`http://localhost:3000/uploads/images/covers/b2c3d4e5f6g7h8i9.jpg`

### 任务资料（content）

- **表名**：`course_map_story_material`
- **字段名**：`content`
- **类型**：`longtext`
- **存储内容**：
  - 文件类型（`material_type = 5`）：上传接口返回的 `url` 字段值
  - 外链类型（`material_type = 1`）：直接存储外部URL
  - 其他类型：根据业务逻辑存储相应内容
- **示例**：`http://localhost:3000/uploads/materials/c3d4e5f6g7h8i9j0.pdf`

### 图标资源

图标资源通常不需要存储在数据库中，前端可以直接通过文件路径访问：
```
/uploads/icons/{图标文件名}
```

---

## 前端使用示例

### 1. 上传用户头像

#### JavaScript / Axios 示例

```javascript
// 使用 FormData 上传文件
const uploadAvatar = async (file, token) => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await axios.post(
      'http://localhost:3000/api/upload/avatar',
      formData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      }
    );

    const { url } = response.data;
    console.log('头像上传成功，URL:', url);
    
    // 将 url 保存到用户信息
    await updateUserAvatar(url);
    
    return url;
  } catch (error) {
    console.error('上传失败:', error);
    throw error;
  }
};

// 调用示例
const fileInput = document.querySelector('#avatar-input');
fileInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (file) {
    const avatarUrl = await uploadAvatar(file, userToken);
    // 更新页面显示
    document.querySelector('#avatar-img').src = avatarUrl;
  }
});
```

#### Vue 3 示例

```vue
<template>
  <div>
    <input type="file" @change="handleAvatarUpload" accept="image/*" />
    <img v-if="avatarUrl" :src="avatarUrl" alt="头像" />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';

const avatarUrl = ref('');

const handleAvatarUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await axios.post(
      '/api/upload/avatar',
      formData,
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data'
        }
      }
    );

    avatarUrl.value = response.data.url;
    
    // 更新用户信息到后端
    await axios.patch('/api/user/me', {
      avatar_url: response.data.url
    });
  } catch (error) {
    console.error('上传失败:', error);
  }
};
</script>
```

#### React 示例

```jsx
import React, { useState } from 'react';
import axios from 'axios';

function AvatarUpload() {
  const [avatarUrl, setAvatarUrl] = useState('');

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:3000/api/upload/avatar',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      setAvatarUrl(response.data.url);
      
      // 更新用户信息
      await axios.patch('/api/user/me', {
        avatar_url: response.data.url
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (error) {
      console.error('上传失败:', error);
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} accept="image/*" />
      {avatarUrl && <img src={avatarUrl} alt="头像" />}
    </div>
  );
}
```

### 2. 上传课程封面

```javascript
const uploadCourseCover = async (file, token) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await axios.post(
    'http://localhost:3000/api/upload/cover',
    formData,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    }
  );

  return response.data.url; // 返回的URL存储到 course.course_pic
};
```

### 3. 上传任务资料

**重要提示**：任务资料仅支持 **PDF** 和 **DOC/DOCX** 格式，其他格式将被拒绝。

```javascript
const uploadMaterial = async (file, token) => {
  // 前端预检查文件类型
  const allowedTypes = ['.pdf', '.doc', '.docx'];
  const fileExt = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
  
  if (!allowedTypes.includes(fileExt)) {
    throw new Error('任务资料仅支持 PDF 和 DOC/DOCX 格式');
  }

  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await axios.post(
      'http://localhost:3000/api/upload/material',
      formData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      }
    );

    return response.data.url; // 返回的URL存储到 course_map_story_material.content
  } catch (error) {
    if (error.response && error.response.status === 400) {
      console.error('文件类型不符合要求:', error.response.data.message);
    }
    throw error;
  }
};

// 使用示例（带文件选择器）
const fileInput = document.querySelector('#material-input');
fileInput.setAttribute('accept', '.pdf,.doc,.docx'); // 限制文件选择器

fileInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (file) {
    try {
      const materialUrl = await uploadMaterial(file, userToken);
      console.log('任务资料上传成功，URL:', materialUrl);
      
      // 将 URL 保存到任务资料表
      // await saveMaterialToDatabase(materialUrl);
    } catch (error) {
      alert('上传失败: ' + error.message);
    }
  }
});
```

### 4. 获取图标资源

图标资源通常由前端直接引用，无需通过API上传：

```html
<!-- HTML -->
<img src="http://localhost:3000/uploads/icons/home-icon.svg" alt="首页" />

<!-- CSS -->
.icon-home {
  background-image: url('http://localhost:3000/uploads/icons/home-icon.svg');
}
```

如果需要动态上传图标：

```javascript
const uploadIcon = async (file, token) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await axios.post(
    'http://localhost:3000/api/upload/icon',
    formData,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    }
  );

  return response.data.url;
};
```

---

## 错误处理

### 常见错误码

| 状态码 | 说明 | 可能原因 |
|--------|------|----------|
| 400 | Bad Request | 未提供文件、文件格式错误或任务资料类型不符合要求（仅支持PDF/DOC/DOCX） |
| 401 | Unauthorized | 未登录或token过期 |
| 413 | Payload Too Large | 文件大小超过100MB限制 |
| 500 | Internal Server Error | 服务器内部错误 |

### 错误响应示例

```json
{
  "message": "没有文件"
}
```

### 前端错误处理建议

```javascript
const uploadFile = async (file, type, token) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    // 文件大小检查（前端预检查）
    if (file.size > 100 * 1024 * 1024) {
      throw new Error('文件大小不能超过100MB');
    }

    // 如果是任务资料，检查文件类型
    if (type === 'material') {
      const allowedTypes = ['.pdf', '.doc', '.docx'];
      const fileExt = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
      if (!allowedTypes.includes(fileExt)) {
        throw new Error('任务资料仅支持 PDF 和 DOC/DOCX 格式');
      }
    }

    const response = await axios.post(
      `http://localhost:3000/api/upload/${type}`,
      formData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
        // 设置上传超时时间
        timeout: 60000 // 60秒
      }
    );

    return response.data;
  } catch (error) {
    if (error.response) {
      // 服务器返回了错误响应
      switch (error.response.status) {
        case 400:
          const errorMsg = error.response.data.message || '请求错误';
          console.error('请求错误:', errorMsg);
          // 如果是文件类型错误，给用户更明确的提示
          if (errorMsg.includes('任务资料仅支持')) {
            alert('任务资料仅支持 PDF 和 DOC/DOCX 格式，请重新选择文件');
          } else {
            alert('上传失败: ' + errorMsg);
          }
          break;
        case 401:
          console.error('未授权，请重新登录');
          // 跳转到登录页
          break;
        case 413:
          console.error('文件过大');
          break;
        default:
          console.error('上传失败:', error.response.data);
      }
    } else if (error.request) {
      // 请求已发出但没有收到响应
      console.error('网络错误，请检查网络连接');
    } else {
      // 其他错误
      console.error('错误:', error.message);
    }
    throw error;
  }
};
```

---

## 完整工作流程示例

### 场景：用户上传头像并更新个人信息

```javascript
// 1. 用户选择文件
const fileInput = document.querySelector('#avatar-input');
fileInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  // 2. 上传文件到服务器
  const formData = new FormData();
  formData.append('file', file);

  try {
    const token = localStorage.getItem('token');
    
    // 上传头像
    const uploadResponse = await axios.post(
      'http://localhost:3000/api/upload/avatar',
      formData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      }
    );

    const avatarUrl = uploadResponse.data.url;
    console.log('上传成功，URL:', avatarUrl);

    // 3. 更新用户信息（将URL保存到数据库）
    await axios.patch(
      'http://localhost:3000/api/user/me',
      { avatar_url: avatarUrl },
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    // 4. 更新页面显示
    document.querySelector('#avatar-img').src = avatarUrl;
    alert('头像更新成功！');
  } catch (error) {
    console.error('操作失败:', error);
    alert('上传失败，请重试');
  }
});
```

---

## 注意事项

1. **文件命名**：后端会自动生成随机文件名，避免文件名冲突
2. **文件类型**：建议前端在上传前进行文件类型验证
3. **文件大小**：单个文件限制100MB，大文件建议使用OSS直传
4. **URL存储**：上传成功后，将返回的 `url` 字段完整存储到数据库对应字段
5. **环境变量**：生产环境请配置 `FILE_BASE_URL` 环境变量，确保返回正确的完整URL
6. **静态资源服务**：确保后端 `app.js` 中已配置 `app.use('/uploads', express.static(...))`

---

## 更新日志

- **2025-12-02**：初始版本，支持分类上传（avatar、cover、icon、material）
- **2025-12-02**：任务资料上传限制为 PDF 和 DOC/DOCX 格式

---

## 技术支持

如有问题，请联系后端开发团队或查看项目文档。

