const path = require('path');
const fs = require('fs');
const OSS = require('ali-oss');

// 初始化 OSS 客户端
let ossClient = null;
if (process.env.OSS_ACCESS_KEY_ID && process.env.OSS_ACCESS_KEY_SECRET && process.env.OSS_BUCKET) {
  ossClient = new OSS({
    region: process.env.OSS_REGION || 'oss-cn-beijing',
    accessKeyId: process.env.OSS_ACCESS_KEY_ID,
    accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET,
    bucket: process.env.OSS_BUCKET
  });
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
          // objectName 可以包含路径，例如 'images/avatars/xxx.png'
          const objectName = urlPath;
          const result = await ossClient.put(objectName, req.file.path);
          
          // 获取 OSS 访问 URL
          // result.url 是 OSS 返回的 URL，通常是 http://bucket.region.aliyuncs.com/objectName
          // 如果有自定义域名，需要手动拼接
          url = result.url;

          // 上传成功后，删除本地文件以节省空间
          fs.unlink(req.file.path, (err) => {
            if (err) console.error('Failed to delete local file:', err);
          });

        } catch (ossErr) {
          console.error('OSS upload failed:', ossErr);
          // OSS 上传失败，降级使用本地 URL
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
