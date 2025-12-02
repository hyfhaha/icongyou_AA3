const path = require('path');

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
    
    // Calculate relative path from uploads root to the saved file
    const uploadsRoot = path.join(__dirname, '../../uploads');
    const relativePath = path.relative(uploadsRoot, req.file.path);
    
    // Ensure URL uses forward slashes regardless of OS
    const urlPath = relativePath.split(path.sep).join('/');
    
    const url = `${process.env.FILE_BASE_URL || ''}/uploads/${urlPath}`;
    
    res.json({ 
      url, 
      filename: req.file.filename,
      originalname: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype
    });
  }
};
