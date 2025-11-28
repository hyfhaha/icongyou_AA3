require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const path = require('path');
const multer = require('multer');
const upload = multer({ dest: path.join(__dirname, '..', 'uploads') });
const authMiddleware = require('./middleware/auth');
const { sequelize } = require('./models');
const pkg = require('../package.json');

const app = express();

// HTTP 请求日志
app.use(morgan('dev'));

app.use(bodyParser.json({ limit: '5mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

// 打印接收到的 JSON 字段
app.use((req, res, next) => {
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('--- Request Body (JSON) ---');
    console.log(JSON.stringify(req.body, null, 2));
    console.log('---------------------------');
  }
  next();
});

// 打印返回的 JSON 字段
app.use((req, res, next) => {
  const originalJson = res.json;
  res.json = function(body) {
    console.log('--- Response Body (JSON) ---');
    console.log(JSON.stringify(body, null, 2));
    console.log('----------------------------');
    return originalJson.call(this, body);
  };
  next();
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/courses', authMiddleware, require('./routes/courses'));
// OSS STS 临时凭证（同时挂在 /api/oss 与 /oss，方便与现有前端代码对接）
app.use('/api/oss', authMiddleware, require('./routes/oss'));
app.use('/oss', authMiddleware, require('./routes/oss'));
app.use('/api/messages', authMiddleware, require('./routes/messages'));
app.use('/api/tasks', authMiddleware, require('./routes/tasks'));
app.use('/api/homework', authMiddleware, require('./routes/homework'));
app.use('/api/teams', authMiddleware, require('./routes/teams'));
app.use('/api/excellent', authMiddleware, require('./routes/excellent'));
app.use('/api/ai', authMiddleware, require('./routes/ai'));
app.use('/api/user', authMiddleware, require('./routes/user'));
app.use('/api/view', authMiddleware, require('./routes/view'));

// upload route
app.post('/api/upload', authMiddleware, upload.single('file'), require('./controllers/uploadController').uploadLocal);
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.get('/', (req, res) => res.json({ status: 'ok' }));

// 统一健康检查接口：/api/status（无需鉴权）
app.get('/api/status', async (req, res) => {
  const result = {
    status: 'ok',
    version: pkg.version,
    uptime: process.uptime(),
    db: {
      status: 'unknown'
    }
  };

  try {
    await sequelize.query('SELECT 1 AS ok');
    result.db.status = 'up';
  } catch (err) {
    result.status = 'degraded';
    result.db.status = 'down';
    result.db.error = err.message;
  }

  return res.json(result);
});

module.exports = app;
