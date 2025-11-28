require('dotenv').config();

module.exports = {
  // GET /api/oss/sts-token 或 /oss/sts-token
  async getStsToken(req, res) {
    try {
      // 这里提供一个最小可用的实现：
      // - 推荐做法：在这里调用阿里云 STS AssumeRole 接口，动态获取临时凭证；
      // - 简化做法：从环境变量读取已生成好的临时凭证（便于本地联调）。
      const accessKeyId = process.env.OSS_STS_ACCESS_KEY_ID;
      const accessKeySecret = process.env.OSS_STS_ACCESS_KEY_SECRET;
      const securityToken = process.env.OSS_STS_SECURITY_TOKEN || '';
      const expiration = process.env.OSS_STS_EXPIRATION;

      if (!accessKeyId || !accessKeySecret || !expiration) {
        return res.status(500).json({
          code: 500,
          message:
            'OSS STS 凭证未配置，请在环境变量中设置 OSS_STS_ACCESS_KEY_ID / OSS_STS_ACCESS_KEY_SECRET / OSS_STS_EXPIRATION（以及可选的 OSS_STS_SECURITY_TOKEN）'
        });
      }

      return res.json({
        code: 200,
        data: {
          accessKeyId,
          accessKeySecret,
          securityToken,
          expiration
        }
      });
    } catch (err) {
      return res.status(500).json({ code: 500, message: '获取 OSS STS Token 失败', error: err.message });
    }
  }
};


