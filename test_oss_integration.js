const path = require('path');
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');
require('dotenv').config();

// 颜色输出
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  reset: '\x1b[0m'
};

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';
// 随机生成一个测试用户，避免和现有数据冲突
const TEST_USER = {
  username: `oss_test_${Date.now()}`, 
  password: 'password123',
  nickname: 'OSS测试员'
};

async function runTests() {
  console.log('🚀 开始阿里云 OSS 功能测试...\n');
  console.log(`  API 地址: ${API_BASE_URL}`);

  let authToken = '';

  // 1. 注册并登录
  try {
    console.log(`${colors.yellow}[Step 1] 注册测试账号并登录...${colors.reset}`);
    
    // 注册
    console.log(`  正在注册用户: ${TEST_USER.username}`);
    try {
        await axios.post(`${API_BASE_URL}/api/auth/register`, TEST_USER);
        console.log(`  注册成功`);
    } catch (regErr) {
        // 409 表示已存在，尝试直接登录
        if (regErr.response && regErr.response.status === 409) {
             console.log(`  用户已存在，直接尝试登录`);
        } else {
             throw regErr;
        }
    }

    // 登录
    console.log(`  正在登录...`);
    const loginRes = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        username: TEST_USER.username,
        password: TEST_USER.password
    });

    if (loginRes.data && loginRes.data.token) {
        authToken = loginRes.data.token;
        console.log(`${colors.green}✓ 登录成功 (Token: ${authToken.substring(0, 15)}...)${colors.reset}`);
    } else {
        throw new Error('登录响应中没有 Token');
    }

  } catch (error) {
    console.error(`${colors.red}✗ 认证失败: ${error.message}${colors.reset}`);
    if (error.response) {
        console.error('  Response:', error.response.data);
    }
    // 认证失败则终止测试，因为后续接口都需要 Auth
    return; 
  }

  const headers = { 'Authorization': `Bearer ${authToken}` };

  // 2. 测试获取 STS Token
  try {
    console.log(`\n${colors.yellow}[Step 2] 测试获取 STS Token (/api/oss/sts-token)...${colors.reset}`);
    const res = await axios.get(`${API_BASE_URL}/api/oss/sts-token`, { headers });
    
    if (res.data.code === 200 && res.data.data && res.data.data.accessKeyId) {
      console.log(`${colors.green}✓ STS Token 获取成功${colors.reset}`);
      console.log('  AccessKeyId:', res.data.data.accessKeyId);
    } else {
      throw new Error('返回数据格式不符合预期');
    }
  } catch (error) {
    console.error(`${colors.red}✗ STS Token 获取失败${colors.reset}`);
    if (error.response) {
        console.error(`  Status: ${error.response.status}`);
        console.error('  Response:', error.response.data);
        if (error.response.status === 500 && JSON.stringify(error.response.data).includes('configuration missing')) {
            console.log(`${colors.yellow}  💡 提示: 这是因为 .env 中缺少 ALIYUN_ACCESS_KEY_ID 等配置。${colors.reset}`);
            console.log(`${colors.yellow}     请在 .env 文件中填入真实的阿里云 AccessKey 和 RoleARN。${colors.reset}`);
        }
    } else {
        console.error('  Error:', error.message);
    }
  }

  // 3. 测试后端代理上传 (Avatar)
  try {
    console.log(`\n${colors.yellow}[Step 3] 测试后端代理上传 - 头像 (/api/upload/avatar)...${colors.reset}`);
    
    const testFilePath = path.join(__dirname, 'test_upload_avatar.txt');
    fs.writeFileSync(testFilePath, 'Test avatar content ' + Date.now());
    
    const form = new FormData();
    form.append('file', fs.createReadStream(testFilePath), 'test_avatar.txt'); 
    
    const res = await axios.post(`${API_BASE_URL}/api/upload/avatar`, form, {
      headers: {
        ...headers,
        ...form.getHeaders()
      }
    });

    console.log(`${colors.green}✓ 上传接口调用成功${colors.reset}`);
    console.log('  URL:', res.data.url);
    
    if (res.data.url.includes('aliyuncs.com')) {
        console.log(`${colors.green}✓ URL 指向阿里云 OSS${colors.reset}`);
    } else {
        console.log(`${colors.yellow}⚠ URL 指向本地 (未配置 OSS 自动降级): ${res.data.url}${colors.reset}`);
    }
    fs.unlinkSync(testFilePath);

  } catch (error) {
    console.error(`${colors.red}✗ 上传失败: ${error.message}${colors.reset}`);
    if (error.response) console.error('  Response:', error.response.data);
  }

  // 4. 测试后端代理上传 (Homework)
  try {
    console.log(`\n${colors.yellow}[Step 4] 测试后端代理上传 - 作业 (/api/upload/homework)...${colors.reset}`);
    
    const testFilePath = path.join(__dirname, 'test_upload_hw.txt');
    fs.writeFileSync(testFilePath, 'Test homework content ' + Date.now());
    
    const form = new FormData();
    form.append('file', fs.createReadStream(testFilePath), 'test_homework.txt');

    const res = await axios.post(`${API_BASE_URL}/api/upload/homework`, form, {
      headers: {
        ...headers,
        ...form.getHeaders()
      }
    });

    console.log(`${colors.green}✓ 作业上传接口调用成功${colors.reset}`);
    console.log('  URL:', res.data.url);

    if (res.data.url.includes('aliyuncs.com')) {
        console.log(`${colors.green}✓ URL 指向阿里云 OSS${colors.reset}`);
    } else {
        console.log(`${colors.yellow}⚠ URL 指向本地: ${res.data.url}${colors.reset}`);
    }

    fs.unlinkSync(testFilePath);

  } catch (error) {
    console.error(`${colors.red}✗ 作业上传失败: ${error.message}${colors.reset}`);
    if (error.response) console.error('  Response:', error.response.data);
  }
  
  console.log('\n测试结束。');
}

runTests();
