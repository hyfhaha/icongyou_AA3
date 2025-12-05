/**
 * AI接口测试脚本 (Node.js)
 * 
 * 使用方法：
 * 1. 确保服务器正在运行 (npm start 或 npm run dev)
 * 2. 设置环境变量 ZHIPU_API_KEY 或 LLM_API（如果需要）
 * 3. 运行测试：node test_ai.js
 */

const axios = require('axios');

// ==================== 配置 ====================
const BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';
const TEST_USERNAME = 'hero_student';
const TEST_PASSWORD = '123456';

// 颜色输出辅助函数（用于终端显示）
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// 统计字符数（中文按1个字符计算）
function countChars(text) {
  return text.length;
}

// ==================== 辅助函数 ====================

/**
 * 登录获取Token
 */
async function login() {
  try {
    log('\n=== 步骤1：登录获取 Token ===', 'green');
    const response = await axios.post(`${BASE_URL}/api/auth/login`, {
      username: TEST_USERNAME,
      password: TEST_PASSWORD
    });
    
    const token = response.data.token;
    log(`✓ 登录成功，Token: ${token.substring(0, 20)}...`, 'green');
    return token;
  } catch (error) {
    log(`✗ 登录失败: ${error.response?.data?.message || error.message}`, 'red');
    throw error;
  }
}

/**
 * 测试AI问答接口
 */
async function testAsk(token) {
  log('\n=== 步骤2：测试 AI 问答接口 /api/ai/ask ===', 'green');
  
  const question = '请帮我介绍一下软件工程实践这门课';
  log(`发送的问题: ${question}`, 'cyan');
  
  try {
    const response = await axios.post(
      `${BASE_URL}/api/ai/ask`,
      {
        question: question,
        storyId: 1001
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    const answer = response.data.answer;
    const charCount = countChars(answer);
    
    log('✓ 问答接口调用成功！', 'green');
    log(`AI 回复 (${charCount}字):`, 'yellow');
    log(answer, 'reset');
    
    // 验证字数限制
    if (charCount > 100) {
      log(`⚠ 警告：回复超过100字限制（实际${charCount}字）`, 'red');
    } else {
      log(`✓ 字数符合要求（${charCount}字 ≤ 100字）`, 'green');
    }
    
    return { success: true, answer, charCount };
  } catch (error) {
    log(`✗ 问答接口调用失败: ${error.response?.data?.message || error.message}`, 'red');
    if (error.response?.data) {
      log(`错误详情: ${JSON.stringify(error.response.data, null, 2)}`, 'red');
    }
    return { success: false, error: error.message };
  }
}

/**
 * 测试AI写作优化接口
 */
async function testGenerate(token) {
  log('\n=== 步骤3：测试 AI 写作优化接口 /api/ai/generate ===', 'green');
  
  const content = '这是我写的一段课程介绍，请帮我优化一下。软件工程实践是一门重要的课程，它教我们如何开发软件。';
  const requirements = '分点列出，风格正式';
  
  log(`发送的内容: ${content}`, 'cyan');
  log(`写作要求: ${requirements}`, 'cyan');
  
  try {
    const response = await axios.post(
      `${BASE_URL}/api/ai/generate`,
      {
        content: content,
        requirements: requirements,
        storyId: 1001
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    const result = response.data.result;
    const charCount = countChars(result);
    
    log('✓ 写作优化接口调用成功！', 'green');
    log(`优化后的内容 (${charCount}字):`, 'yellow');
    log(result, 'reset');
    
    // 验证字数限制
    if (charCount > 100) {
      log(`⚠ 警告：内容超过100字限制（实际${charCount}字）`, 'red');
    } else {
      log(`✓ 字数符合要求（${charCount}字 ≤ 100字）`, 'green');
    }
    
    return { success: true, result, charCount };
  } catch (error) {
    log(`✗ 写作优化接口调用失败: ${error.response?.data?.message || error.message}`, 'red');
    if (error.response?.data) {
      log(`错误详情: ${JSON.stringify(error.response.data, null, 2)}`, 'red');
    }
    return { success: false, error: error.message };
  }
}

/**
 * 测试AI摘要接口
 */
async function testSummary(token) {
  log('\n=== 步骤4：测试 AI 摘要接口 /api/ai/summary ===', 'green');
  
  const content = '软件工程实践是一门综合性很强的课程。它涵盖了需求分析、系统设计、编码实现、测试部署等软件开发的各个环节。通过这门课程，学生可以学习到如何团队协作、如何撰写技术文档、如何使用版本控制工具等实用技能。课程通常采用项目驱动的方式，让学生在实际项目中应用所学知识。';
  const maxLength = 100;
  
  log(`发送的内容长度: ${countChars(content)}字`, 'cyan');
  log(`最大长度要求: ${maxLength}字`, 'cyan');
  
  try {
    const response = await axios.post(
      `${BASE_URL}/api/ai/summary`,
      {
        content: content,
        max_length: maxLength,
        storyId: 1001
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    const summary = response.data.summary;
    const charCount = countChars(summary);
    
    log('✓ 摘要接口调用成功！', 'green');
    log(`摘要内容 (${charCount}字):`, 'yellow');
    log(summary, 'reset');
    
    // 验证字数限制
    if (charCount > 100) {
      log(`⚠ 警告：摘要超过100字限制（实际${charCount}字）`, 'red');
    } else {
      log(`✓ 字数符合要求（${charCount}字 ≤ 100字）`, 'green');
    }
    
    return { success: true, summary, charCount };
  } catch (error) {
    log(`✗ 摘要接口调用失败: ${error.response?.data?.message || error.message}`, 'red');
    if (error.response?.data) {
      log(`错误详情: ${JSON.stringify(error.response.data, null, 2)}`, 'red');
    }
    return { success: false, error: error.message };
  }
}

/**
 * 测试AI点评接口
 */
async function testComment(token) {
  log('\n=== 步骤5：测试 AI 点评接口 /api/ai/comment ===', 'green');
  
  const content = '我完成了需求分析文档，包括用例图和ER图。用例图描述了系统的主要功能，ER图展示了数据库设计。';
  const rubric = '重点关注文档的完整性和规范性';
  
  log(`发送的作业内容: ${content}`, 'cyan');
  log(`评分标准: ${rubric}`, 'cyan');
  
  try {
    const response = await axios.post(
      `${BASE_URL}/api/ai/comment`,
      {
        content: content,
        rubric: rubric,
        storyId: 1001
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    const comment = response.data.comment;
    const charCount = countChars(comment);
    
    log('✓ 点评接口调用成功！', 'green');
    log(`AI 点评 (${charCount}字):`, 'yellow');
    log(comment, 'reset');
    
    // 验证字数限制
    if (charCount > 100) {
      log(`⚠ 警告：点评超过100字限制（实际${charCount}字）`, 'red');
    } else {
      log(`✓ 字数符合要求（${charCount}字 ≤ 100字）`, 'green');
    }
    
    return { success: true, comment, charCount };
  } catch (error) {
    log(`✗ 点评接口调用失败: ${error.response?.data?.message || error.message}`, 'red');
    if (error.response?.data) {
      log(`错误详情: ${JSON.stringify(error.response.data, null, 2)}`, 'red');
    }
    return { success: false, error: error.message };
  }
}

/**
 * 测试直接调用 callLLM 函数（验证100字限制）
 */
async function testDirectCallLLM() {
  log('\n=== 步骤6：测试直接调用 callLLM 函数（验证100字限制） ===', 'green');
  
  try {
    // 需要引入 aiController
    const aiController = require('./src/controllers/aiController');
    
    const testPrompt = '请详细介绍一下软件工程实践的课程内容和学习重点';
    log(`测试Prompt: ${testPrompt}`, 'cyan');
    
    const result = await aiController.callLLM({
      prompt: testPrompt,
      storyId: 1001,
      type: 'qa'
    });
    
    const charCount = countChars(result);
    
    log('✓ 直接调用 callLLM 成功！', 'green');
    log(`返回结果 (${charCount}字):`, 'yellow');
    log(result, 'reset');
    
    // 验证字数限制
    if (charCount > 100) {
      log(`⚠ 警告：结果超过100字限制（实际${charCount}字）`, 'red');
    } else {
      log(`✓ 字数符合要求（${charCount}字 ≤ 100字）`, 'green');
    }
    
    return { success: true, result, charCount };
  } catch (error) {
    log(`✗ 直接调用失败: ${error.message}`, 'red');
    if (error.code === 'NO_AI') {
      log('提示：请设置环境变量 ZHIPU_API_KEY 或 LLM_API', 'yellow');
    }
    return { success: false, error: error.message };
  }
}

// ==================== 主测试流程 ====================

async function runTests() {
  log('\n========================================', 'blue');
  log('     AI 接口测试脚本 (Node.js)         ', 'blue');
  log('========================================', 'blue');
  
  const results = {
    login: null,
    ask: null,
    generate: null,
    summary: null,
    comment: null,
    directCall: null
  };
  
  try {
    // 登录
    const token = await login();
    results.login = { success: true };
    
    // 等待一下，避免请求过快
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 测试各个接口
    results.ask = await testAsk(token);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    results.generate = await testGenerate(token);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    results.summary = await testSummary(token);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    results.comment = await testComment(token);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 测试直接调用
    results.directCall = await testDirectCallLLM();
    
  } catch (error) {
    log(`\n✗ 测试过程中出现错误: ${error.message}`, 'red');
  }
  
  // 输出测试总结
  log('\n========================================', 'blue');
  log('           测试结果总结                  ', 'blue');
  log('========================================', 'blue');
  
  const totalTests = Object.keys(results).length;
  const passedTests = Object.values(results).filter(r => r?.success).length;
  
  log(`总测试数: ${totalTests}`, 'cyan');
  log(`通过: ${passedTests}`, 'green');
  log(`失败: ${totalTests - passedTests}`, 'red');
  
  // 检查字数限制
  log('\n字数限制验证:', 'cyan');
  const charCountResults = [
    { name: '问答接口', count: results.ask?.charCount },
    { name: '写作优化', count: results.generate?.charCount },
    { name: '摘要接口', count: results.summary?.charCount },
    { name: '点评接口', count: results.comment?.charCount },
    { name: '直接调用', count: results.directCall?.charCount }
  ];
  
  charCountResults.forEach(({ name, count }) => {
    if (count !== undefined) {
      const status = count <= 100 ? '✓' : '✗';
      const color = count <= 100 ? 'green' : 'red';
      log(`${status} ${name}: ${count}字 ${count <= 100 ? '（符合）' : '（超过限制）'}`, color);
    } else {
      log(`- ${name}: 未测试`, 'yellow');
    }
  });
  
  log('\n=== 所有测试完成 ===', 'green');
  
  // 返回退出码
  process.exit(passedTests === totalTests ? 0 : 1);
}

// 运行测试
if (require.main === module) {
  runTests().catch(error => {
    log(`\n✗ 测试运行失败: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = {
  testAsk,
  testGenerate,
  testSummary,
  testComment,
  testDirectCallLLM,
  runTests
};






