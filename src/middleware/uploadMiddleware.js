const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const UPLOAD_ROOT = path.join(__dirname, '../../uploads');

// 允许的任务资料文件类型
const ALLOWED_MATERIAL_TYPES = ['.pdf', '.doc', '.docx'];
const ALLOWED_MATERIAL_MIMETYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

// 文件类型验证函数
const fileFilter = (req, file, cb) => {
  const type = req.params.type;
  
  // 如果是任务资料上传，需要验证文件类型
  if (type === 'material') {
    const ext = path.extname(file.originalname).toLowerCase();
    const mimetype = file.mimetype;
    
    // 检查扩展名和MIME类型
    const isValidExt = ALLOWED_MATERIAL_TYPES.includes(ext);
    const isValidMime = ALLOWED_MATERIAL_MIMETYPES.includes(mimetype);
    
    if (!isValidExt || !isValidMime) {
      return cb(new Error(`任务资料仅支持 PDF 和 DOC/DOCX 格式。当前文件类型: ${ext || mimetype}`), false);
    }
  }
  
  cb(null, true);
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let folder = '';
    
    // Decide folder based on route parameter 'type'
    const type = req.params.type;

    switch (type) {
      case 'cover':
        folder = 'images/covers';
        break;
      case 'avatar':
        folder = 'images/avatars';
        break;
      case 'icon':
        folder = 'icons';
        break;
      case 'material':
        folder = 'materials';
        break;
      case 'homework':
        folder = 'homeworks';
        break;
      default:
        // Fallback for generic uploads or if 'type' is missing (e.g. legacy route)
        folder = ''; 
    }

    const uploadPath = path.join(UPLOAD_ROOT, folder);
    
    // Ensure directory exists
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Generate random filename with original extension
    const randomName = crypto.randomBytes(16).toString('hex');
    // Handle case where file.originalname might not have extension
    const ext = path.extname(file.originalname) || '';
    cb(null, randomName + ext);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit
});

module.exports = upload;

