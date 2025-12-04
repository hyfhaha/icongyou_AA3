const path = require('path');
const fs = require('fs');
const OSS = require('ali-oss');

// 初始化 OSS 客户端
let ossClient = null;

// 优先使用环境变量，否则使用 oss.js 中的默认配置 (作为 fallback)
const ossConfig = {
  region: process.env.OSS_REGION || 'oss-cn-beijing',
  accessKeyId: process.env.OSS_ACCESS_KEY_ID || process.env.ALIYUN_ACCESS_KEY_ID,
  accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET || process.env.ALIYUN_ACCESS_KEY_SECRET,
  bucket: process.env.OSS_BUCKET || 'yukino-oss'
};

if (ossConfig.accessKeyId && ossConfig.accessKeySecret && ossConfig.bucket) {
  ossClient = new OSS(ossConfig);
} else {
  console.warn('OSS environment variables missing. Backend file upload to OSS will be disabled.');
}

module.exports = {
  async uploadLocal(req, res) {
    // 处理文件类型验证错误
    if (req.fileValidationError) {
      return res.status(400).json({ 
        message: req.fileValidationError 
      });
    }
    
    if (!req.file) {
      return res.status(400).json({ 
        message: '没有文件或文件类型不符合要求' 
      });
    }

    try {
      // Calculate relative path from uploads root to the saved file
      const uploadsRoot = path.join(__dirname, '../../uploads');
      const relativePath = path.relative(uploadsRoot, req.file.path);
      // Ensure URL uses forward slashes regardless of OS
      const urlPath = relativePath.split(path.sep).join('/');

      let url = '';

      // 如果配置了 OSS，尝试上传到 OSS
      if (ossClient) {
        try {
          // 上传本地文件到 OSS
          // 保持原有的目录结构，例如 'images/avatars/xxx.png'
          // 也可以加上日期前缀以避免冲突，但这里复用本地存储的路径逻辑
          const objectName = urlPath;
          
          // 使用 put 方法上传
          const result = await ossClient.put(objectName, req.file.path);
          
          // 获取 OSS 访问 URL
          // result.url 是 OSS 返回的 URL，通常是 http://bucket.region.aliyuncs.com/objectName
          // 如果需要 HTTPS，可以替换协议
          url = result.url;
          if (url.startsWith('http://')) {
             url = url.replace('http://', 'https://');
          }
          
          console.log(`[OSS] Upload success: ${url}`);

          // 上传成功后，删除本地文件以节省空间
          fs.unlink(req.file.path, (err) => {
            if (err) console.error('Failed to delete local file after OSS upload:', err);
          });

        } catch (ossErr) {
          console.error('OSS upload failed:', ossErr);
          if (ossErr.code === 'AccessDenied') {
              console.error('🔴 阿里云 OSS 权限不足。请检查 RAM 用户是否拥有 AliyunOSSFullAccess 权限，或 Bucket Policy 是否拒绝了写入。');
          }
          // OSS 上传失败，降级使用本地 URL (如果不希望降级，可以直接抛出错误)
          url = `${process.env.FILE_BASE_URL || ''}/uploads/${urlPath}`;
        }
      } else {
        // 未配置 OSS，使用本地 URL
        url = `${process.env.FILE_BASE_URL || ''}/uploads/${urlPath}`;
      }
      
      res.json({ 
        url, 
        filename: req.file.filename,
        originalname: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype
      });
    } catch (error) {
      console.error('Upload process error:', error);
      return res.status(500).json({ message: '文件上传处理失败' });
    }
  }
};
