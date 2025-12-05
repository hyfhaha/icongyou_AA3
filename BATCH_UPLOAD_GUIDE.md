# 批量上传文件到阿里云 OSS 使用指南

## 功能说明

这个脚本可以帮你将 `uploads` 文件夹中的所有文件（头像、封面、资料文件等）批量上传到阿里云 OSS，并自动返回每个文件的 OSS 访问地址。

## 使用前准备

### 1. 确保已配置阿里云 OSS

在 `.env` 文件中配置以下环境变量：

```ini
ALIYUN_ACCESS_KEY_ID=你的AccessKeyID
ALIYUN_ACCESS_KEY_SECRET=你的AccessKeySecret
OSS_BUCKET=你的Bucket名称
OSS_REGION=oss-cn-beijing  # 可选，默认值
```

### 2. 确认 uploads 目录结构

脚本会自动扫描以下三个指定文件夹中的所有文件：
- `uploads/homeworks/` - 作业文件
- `uploads/images/` - 图片文件（包括 avatars 和 covers 子文件夹）
- `uploads/materials/` - 资料文件

**注意**: 脚本只会上传这三个文件夹中的文件，不会上传 `uploads` 根目录下的其他文件。

## 使用方法

### 运行脚本

```bash
node batch_upload_to_oss.js
```

### 脚本执行流程

1. **扫描文件**: 脚本会自动扫描 `uploads` 目录下的所有文件
2. **显示列表**: 显示将要上传的文件列表
3. **确认上传**: 询问你是否继续上传（输入 `y` 继续）
4. **批量上传**: 逐个上传文件到阿里云 OSS
5. **显示结果**: 
   - 显示每个文件的上传状态和 OSS URL
   - 生成结果文件 `upload_results.json`
   - 生成 URL 映射表 `oss_url_mapping.txt`
6. **清理选项**: 询问是否删除已成功上传的本地文件（可选）

## 输出文件说明

### 1. `upload_results.json`

包含完整的上传结果，格式如下：

```json
{
  "timestamp": "2024-12-02T10:30:00.000Z",
  "total": 10,
  "success": 10,
  "failed": 0,
  "files": {
    "success": [
      {
        "localPath": "images/avatars/avatar.png",
        "objectName": "images/avatars/avatar.png",
        "url": "https://your-bucket.oss-cn-beijing.aliyuncs.com/images/avatars/avatar.png",
        "size": 102400
      }
    ],
    "failed": []
  }
}
```

### 2. `oss_url_mapping.txt`

简单的文本格式映射表，便于查看：

```
# 本地文件路径 -> OSS URL 映射表
# ==========================================

images/avatars/avatar.png
→ https://your-bucket.oss-cn-beijing.aliyuncs.com/images/avatars/avatar.png

images/covers/cover.jpg
→ https://your-bucket.oss-cn-beijing.aliyuncs.com/images/covers/cover.jpg
```

## 重要提示

### ✅ 文件路径保持

- 上传到 OSS 的文件会**保持原有的目录结构**
- 例如：`uploads/images/avatars/xxx.png` → OSS 中的 `images/avatars/xxx.png`

### ⚠️ 注意事项

1. **备份数据**: 如果选择删除本地文件，建议先备份
2. **网络稳定**: 确保网络连接稳定，避免上传中断
3. **权限检查**: 确保 RAM 用户拥有 `AliyunOSSFullAccess` 权限
4. **Bucket 权限**: 确保 Bucket 设置为"公共读"，否则 URL 无法直接访问

## 常见问题

**Q: 上传失败怎么办？**
A: 检查 `.env` 配置是否正确，以及 RAM 用户权限是否足够。失败的文件会在 `upload_results.json` 的 `failed` 数组中记录。

**Q: 可以只上传特定类型的文件吗？**
A: 可以，你可以修改脚本中的 `validFiles` 过滤逻辑，例如只上传 `.png` 和 `.jpg` 文件。

**Q: 上传后如何更新数据库？**
A: 使用生成的 `oss_url_mapping.txt` 或 `upload_results.json` 文件，编写 SQL 语句批量更新数据库中的文件地址。

## 示例：批量更新数据库中的文件地址

假设你要更新 `user` 表中的 `avatar_url` 字段，可以使用以下 SQL 模板：

```sql
-- 根据本地路径匹配更新（需要根据实际情况调整）
UPDATE user SET avatar_url = 'https://your-bucket.oss-cn-beijing.aliyuncs.com/images/avatars/xxx.png' 
WHERE avatar_url LIKE '%/uploads/images/avatars/xxx.png';
```

或者查看 `upload_results.json` 文件，手动编写更新语句。

