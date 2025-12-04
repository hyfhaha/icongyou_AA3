const OSS = require('ali-oss');

module.exports = {
  // GET /api/oss/sts-token or /oss/sts-token
  async getStsToken(req, res) {
    try {
      // 1. Get credentials from environment variables
      const accessKeyId = process.env.ALIYUN_ACCESS_KEY_ID || process.env.OSS_ACCESS_KEY_ID;
      const accessKeySecret = process.env.ALIYUN_ACCESS_KEY_SECRET || process.env.OSS_ACCESS_KEY_SECRET;
      const roleArn = process.env.ALIYUN_OSS_ROLE_ARN || process.env.OSS_ROLE_ARN;
      const bucket = process.env.OSS_BUCKET || 'yukino-oss';

      // 2. If real credentials are provided, generate STS token dynamically
      if (accessKeyId && accessKeySecret && roleArn) {
        const sts = new OSS.STS({
          accessKeyId,
          accessKeySecret
        });

        // Allow operations on the specific bucket
        // You can refine the Resource path to limit access further if needed
        const policy = {
          Statement: [
            {
              Action: ['oss:PutObject', 'oss:GetObject', 'oss:AbortMultipartUpload', 'oss:ListParts'],
              Effect: 'Allow',
              Resource: [`acs:oss:*:*:${bucket}/*`, `acs:oss:*:*:${bucket}`]
            }
          ],
          Version: '1'
        };

        const expiration = process.env.OSS_STS_EXPIRATION ? parseInt(process.env.OSS_STS_EXPIRATION) : 3600;
        const sessionName = 'frontend-upload-' + Date.now();

        const token = await sts.assumeRole(roleArn, JSON.stringify(policy), expiration, sessionName);

        return res.json({
          code: 200,
          data: {
            accessKeyId: token.credentials.AccessKeyId,
            accessKeySecret: token.credentials.AccessKeySecret,
            securityToken: token.credentials.SecurityToken,
            expiration: token.credentials.Expiration
          }
        });
      }

      // 3. Fallback: Read pre-generated STS from environment (Legacy/Dev mode)
      const envStsAccessKeyId = process.env.OSS_STS_ACCESS_KEY_ID;
      const envStsAccessKeySecret = process.env.OSS_STS_ACCESS_KEY_SECRET;
      const envStsSecurityToken = process.env.OSS_STS_SECURITY_TOKEN || '';
      const envStsExpiration = process.env.OSS_STS_EXPIRATION;

      if (envStsAccessKeyId && envStsAccessKeySecret) {
         return res.json({
          code: 200,
          data: {
            accessKeyId: envStsAccessKeyId,
            accessKeySecret: envStsAccessKeySecret,
            securityToken: envStsSecurityToken,
            expiration: envStsExpiration
          }
        });
      }

      // 4. Error if no configuration found
      return res.status(500).json({
        code: 500,
        message: 'OSS STS configuration missing. Please set ALIYUN_OSS_ROLE_ARN and access keys.'
      });

    } catch (err) {
      console.error('STS Token generation error:', err);
      return res.status(500).json({ code: 500, message: 'Failed to get OSS STS Token', error: err.message });
    }
  }
};
