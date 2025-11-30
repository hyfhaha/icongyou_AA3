const axios = require('axios');

async function callLLM({ prompt, storyId, type }) {
  // 1）优先使用自定义 LLM_API，便于在学校/企业内部替换模型服务
  // 2）否则使用智谱 AI 官方接口（需要 ZHIPU_API_KEY）
  if (!process.env.ZHIPU_API_KEY && !process.env.LLM_API) {
    const error = new Error('AI service not configured');
    error.code = 'NO_AI';
    throw error;
  }

  if (process.env.LLM_API) {
    const payload = { prompt, storyId, type };
    const r = await axios.post(process.env.LLM_API, payload);
    // 约定优先从 answer 字段读结果；否则直接返回原始响应
    return r.data.answer || r.data.result || r.data;
  }

  // 默认走 智谱大模型 Chat Completions 接口
  const messages = [];
  if (type === 'qa') {
    messages.push({
      role: 'system',
      content: '你是一个有用的AI助手，请用中文回答用户的问题。回答要准确、清晰、有条理。'
    });
  } else if (type === 'generate') {
    messages.push({
      role: 'system',
      content: '你是一名写作助手，请根据用户提供的内容给出结构优化和写作建议，注意条理清晰、分点输出。请用中文回答。'
    });
  } else if (type === 'summary') {
    messages.push({
      role: 'system',
      content: '你是一名总结助手，请在保留关键信息的前提下，用简洁的中文为用户内容生成摘要。'
    });
  } else if (type === 'comment') {
    messages.push({
      role: 'system',
      content: '你是一名课程教师，请根据作业内容给出客观、具体、可操作的点评建议，可适当分条列出优点和改进建议。请用中文回答。'
    });
  }

  messages.push({ role: 'user', content: prompt });

  // 调试：打印实际发送的数据
  console.log('[AI Debug] 发送给智谱API的数据:');
  console.log(JSON.stringify({ model: 'glm-4.6', messages }, null, 2));

  try {
    const r = await axios.post(
      'https://open.bigmodel.cn/api/paas/v4/chat/completions',
      {
        model: 'glm-4.6',
        messages,
        temperature: 0.6,
        stream: false
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.ZHIPU_API_KEY}`
        }
      }
    );

    // 调试：打印智谱API的响应
    console.log('[AI Debug] 智谱API响应结构:', JSON.stringify(r.data, null, 2));

    // 检查响应格式
    if (r.data && r.data.choices && r.data.choices[0] && r.data.choices[0].message) {
      return r.data.choices[0].message.content;
    } else {
      console.error('[AI Error] 智谱API响应格式异常:', r.data);
      throw new Error('智谱API响应格式异常');
    }
  } catch (error) {
    console.error('[AI Error] 智谱API调用失败:', error.response?.data || error.message);
    throw error;
  }
}

module.exports = {
  callLLM, // 导出 callLLM 函数供其他模块使用
  // POST /api/ai/ask
  async ask(req, res) {
    try {
      const { question, storyId } = req.body;
      if (!question || !String(question).trim()) {
        return res.status(400).json({ message: 'question 参数必填' });
      }
      const answer = await callLLM({ prompt: question, storyId, type: 'qa' });
      return res.json({ answer });
    } catch (err) {
      if (err.code === 'NO_AI') {
        return res.status(500).json({ message: 'AI service not configured' });
      }
      return res.status(500).json({ message: 'AI 调用失败', error: err.message });
    }
  },

  // POST /api/ai/generate
  async generate(req, res) {
    try {
      const { content, storyId, requirements } = req.body || {};
      if (!content || !String(content).trim()) {
        return res.status(400).json({ message: 'content 参数必填' });
      }
      const promptParts = [];
      if (requirements) {
        promptParts.push(`【写作要求】${requirements}`);
      }
      promptParts.push(`【待优化内容】\n${content}`);
      const answer = await callLLM({
        prompt: promptParts.join('\n\n'),
        storyId,
        type: 'generate'
      });
      return res.json({ result: answer });
    } catch (err) {
      if (err.code === 'NO_AI') {
        return res.status(500).json({ message: 'AI service not configured' });
      }
      return res.status(500).json({ message: 'AI 写作建议调用失败', error: err.message });
    }
  },

  // POST /api/ai/summary
  async summary(req, res) {
    try {
      const { content, storyId, max_length } = req.body || {};
      if (!content || !String(content).trim()) {
        return res.status(400).json({ message: 'content 参数必填' });
      }
      const extra = max_length ? `（请控制在约 ${max_length} 字以内）` : '';
      const prompt = `请帮我用中文总结下面这段内容${extra}：\n\n${content}`;
      const answer = await callLLM({ prompt, storyId, type: 'summary' });
      return res.json({ summary: answer });
    } catch (err) {
      if (err.code === 'NO_AI') {
        return res.status(500).json({ message: 'AI service not configured' });
      }
      return res.status(500).json({ message: 'AI 总结调用失败', error: err.message });
    }
  },

  // POST /api/ai/comment
  async comment(req, res) {
    try {
      const { content, storyId, rubric } = req.body || {};
      if (!content || !String(content).trim()) {
        return res.status(400).json({ message: 'content 参数必填' });
      }
      const parts = [];
      if (rubric) {
        parts.push(`【评分标准 / 点评侧重点】${rubric}`);
      }
      parts.push(`【学生作业内容】\n${content}`);
      const prompt = parts.join('\n\n');
      const answer = await callLLM({ prompt, storyId, type: 'comment' });
      return res.json({ comment: answer });
    } catch (err) {
      if (err.code === 'NO_AI') {
        return res.status(500).json({ message: 'AI service not configured' });
      }
      return res.status(500).json({ message: 'AI 点评调用失败', error: err.message });
    }
  }
};
