const path = require('path');
module.exports = {
  async uploadLocal(req, res) {
    if (!req.file) return res.status(400).json({ message: '没有文件' });
    const url = `${process.env.FILE_BASE_URL || ''}/uploads/${req.file.filename}`;
    res.json({ url });
  }
};
