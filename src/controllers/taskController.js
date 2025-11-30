const { Story, CourseStudentWork, TaskView, Discussion, sequelize } = require('../models');
const { QueryTypes, Op } = require('sequelize');
const pagination = require('../utils/pagination');

async function findActiveStory(storyId) {
  return Story.findOne({ where: { id: storyId, deleted: 0 } });
}

module.exports = {
  // GET /api/tasks
  async listTasks(req, res) {
    try {
      const { course_id, q } = req.query;
      if (!course_id) return res.status(400).json({ message: 'course_id 参数必填' });
      const { limit, offset } = pagination(req);
      const where = { course_id, deleted: 0 };
      if (q) where.story_name = { [Op.like]: `%${q}%` };
      const { rows, count } = await Story.findAndCountAll({
        where,
        order: [['sort', 'ASC'], ['id', 'ASC']],
        limit,
        offset
      });
      const storyIds = rows.map((story) => story.id);
      const submissionMap = {};
      if (storyIds.length) {
        const submissions = await CourseStudentWork.findAll({
          where: {
            story_id: { [Op.in]: storyIds },
            student_id: req.user.id,
            deleted: 0
          },
          order: [['create_time', 'DESC'], ['id', 'DESC']]
        });
        submissions.forEach((submission) => {
          if (!submissionMap[submission.story_id]) submissionMap[submission.story_id] = submission;
        });
      }
      const items = rows.map((story) => {
        const plain = story.get({ plain: true });
        const latest = submissionMap[story.id];
        return {
          ...plain,
          done: Boolean(latest),
          // work_status: null=未提交, 0=已提交未点评, 1=已提交已点评
          work_status: latest ? (latest.status === 1 ? 1 : 0) : null,
          latest_submission_id: latest ? latest.id : null,
          latest_score: latest && latest.score !== null ? Number(latest.score) : null,
          latest_submit_time: latest ? latest.create_time : null
        };
      });
      const page = limit ? Math.floor(offset / limit) + 1 : 1;
      return res.json({ total: count, page, pageSize: limit, items });
    } catch (err) {
      return res.status(500).json({ message: '任务列表获取失败', error: err.message });
    }
  },

  async getTaskBoard(req, res) {
    try {
      const storyId = req.params.storyId || req.params.id;
      const story = await findActiveStory(storyId);
      if (!story) return res.status(404).json({ message: '任务不存在' });
      const stats = await sequelize.query(
        `
        SELECT
          w.story_id,
          COUNT(DISTINCT w.student_id) AS submitted_students,
          COUNT(*) AS submissions_count,
          SUM(CASE WHEN w.recommend = 1 THEN 1 ELSE 0 END) AS recommend_count,
          AVG(NULLIF(w.score, 0)) AS avg_score
        FROM course_student_work w
        WHERE w.story_id = ?
          AND w.deleted = 0
        GROUP BY w.story_id
        `,
        {
          replacements: [storyId],
          type: QueryTypes.SELECT
        }
      );
      const heat = await sequelize.query(
        `SELECT
          COALESCE(tv.views,0) + COALESCE(d.discussion_count,0)*5 + COALESCE(sub.submissions_count,0)*2 AS heat_index
        FROM course_map_story s
        LEFT JOIN (
          SELECT story_id, COUNT(*) AS submissions_count
          FROM course_student_work
          WHERE deleted=0
          GROUP BY story_id
        ) sub ON sub.story_id=s.id
        LEFT JOIN (
          SELECT story_id, COUNT(*) AS discussion_count
          FROM discussions
          WHERE deleted=0
          GROUP BY story_id
        ) d ON d.story_id=s.id
        LEFT JOIN (
          SELECT story_id, SUM(views) AS views
          FROM task_views
          GROUP BY story_id
        ) tv ON tv.story_id=s.id
        WHERE s.id = ?`,
        { replacements: [storyId], type: QueryTypes.SELECT }
      );
      return res.json({ story, stats: stats[0] || {}, heat: heat[0] || {} });
    } catch (err) {
      return res.status(500).json({ message: '任务信息获取失败', error: err.message });
    }
  },

  async getTaskDetail(req, res) {
    try {
      const storyId = req.params.storyId || req.params.id;
      const userId = req.user.id;
      const story = await findActiveStory(storyId);
      if (!story) return res.status(404).json({ message: '任务不存在' });
      const myWork = await CourseStudentWork.findOne({
        where: { story_id: storyId, student_id: userId, deleted: 0 },
        order: [['create_time', 'DESC']]
      });

      const materials = await sequelize.query(
        `
        SELECT
          id,
          course_id,
          story_id,
          material_name,
          material_type,
          file_name,
          content,
          code,
          remark
        FROM course_map_story_material
        WHERE deleted = 0
          AND story_id = ?
        ORDER BY id
        `,
        { replacements: [storyId], type: QueryTypes.SELECT }
      );

      const [viewRow] = await sequelize.query(
        'SELECT SUM(views) AS total_views FROM task_views WHERE story_id = ?',
        { replacements: [storyId], type: QueryTypes.SELECT }
      );
      const viewCount = Number((viewRow && viewRow.total_views) || 0);

      // 检查提交权限
      let permission = {
        allowed: true,
        reason: '',
        teamRequired: false,
        onlyLeaderCanSubmit: false
      };

      const storyType = story.story_type ?? 1;
      
      // 如果是团队任务，检查用户是否在团队中
      if (storyType === 2 || storyType === 3) {
        const [teamMember] = await sequelize.query(
          `
          SELECT cs.id, cs.leader, cs.group_id, cg.group_name
          FROM course_student cs
          LEFT JOIN course_group cg ON cg.id = cs.group_id AND cg.deleted = 0
          WHERE cs.student_id = ?
            AND cs.course_id = ?
            AND cs.deleted = 0
            AND cs.group_id IS NOT NULL
          LIMIT 1
          `,
          { replacements: [userId, story.course_id], type: QueryTypes.SELECT }
        );

        if (!teamMember) {
          permission = {
            allowed: false,
            reason: '未加入团队，无法提交团队任务',
            teamRequired: true,
            onlyLeaderCanSubmit: false
          };
        } else if (storyType === 2 && !teamMember.leader) {
          // 类型 2：仅队长可提交
          permission = {
            allowed: false,
            reason: '本任务仅限队长提交',
            teamRequired: true,
            onlyLeaderCanSubmit: true
          };
        } else {
          permission = {
            allowed: true,
            reason: '',
            teamRequired: true,
            onlyLeaderCanSubmit: storyType === 2
          };
        }
      }

      // 为 story 对象添加 done 字段和 work_status 字段
      const storyPlain = story.get ? story.get({ plain: true }) : story;
      storyPlain.done = Boolean(myWork);
      // work_status: null=未提交, 0=已提交未点评, 1=已提交已点评
      storyPlain.work_status = myWork ? (myWork.status === 1 ? 1 : 0) : null;
      
      return res.json({ story: storyPlain, myWork, materials, viewCount, permission });
    } catch (err) {
      return res.status(500).json({ message: '获取任务详情失败', error: err.message });
    }
  },

  async submitTask(req, res) {
    try {
      const storyId = req.params.storyId || req.params.id;
      const userId = req.user.id;
      const story = await findActiveStory(storyId);
      if (!story) return res.status(404).json({ message: '任务不存在' });
      
      const { file_url, content, course_id, file_name, team_contributions } = req.body;
      const storyType = story.story_type ?? 1;
      const isTeamwork = storyType === 2 || storyType === 3;
      
      // 提取文件名（如果 file_url 包含文件名）
      let finalFileName = file_name;
      if (!finalFileName && file_url) {
        // 从 URL 中提取文件名，支持多个文件用 | 分隔
        const urls = file_url.split('|');
        finalFileName = urls.map(url => {
          const parts = url.split('/');
          return parts[parts.length - 1];
        }).join('|');
      }
      
      // 获取学生信息（不依赖 dept 表，因为可能不存在）
      const [studentInfo] = await sequelize.query(
        `
        SELECT cs.group_id, cs.dept_id
        FROM course_student cs
        WHERE cs.student_id = ?
          AND cs.course_id = ?
          AND cs.deleted = 0
        LIMIT 1
        `,
        { replacements: [userId, course_id || story.course_id], type: QueryTypes.SELECT }
      );
      
      // dept_name 字段设为 null（因为 dept 表可能不存在，且该字段不是核心字段）
      const submitterDeptName = null;
      
      if (isTeamwork) {
        // ========== 团队任务：为每个成员创建一条记录 ==========
        if (!studentInfo || !studentInfo.group_id) {
          return res.status(400).json({ message: '您未加入团队，无法提交团队任务' });
        }
        
        // 获取团队信息
        const [teamInfo] = await sequelize.query(
          `
          SELECT id, group_name
          FROM course_group
          WHERE id = ?
            AND deleted = 0
          LIMIT 1
          `,
          { replacements: [studentInfo.group_id], type: QueryTypes.SELECT }
        );
        
        if (!teamInfo) {
          return res.status(400).json({ message: '团队不存在' });
        }
        
        const groupId = teamInfo.id;
        const groupName = teamInfo.group_name;
        
        // 获取所有团队成员（不依赖 dept 表）
        const teamMembers = await sequelize.query(
          `
          SELECT cs.student_id, cs.dept_id, u.nickname, u.username, u.job_number
          FROM course_student cs
          LEFT JOIN \`user\` u ON u.id = cs.student_id AND u.deleted = 0
          WHERE cs.group_id = ?
            AND cs.course_id = ?
            AND cs.deleted = 0
          ORDER BY cs.leader DESC, cs.id ASC
          `,
          { replacements: [groupId, course_id || story.course_id], type: QueryTypes.SELECT }
        );
        
        if (!teamMembers || teamMembers.length === 0) {
          return res.status(400).json({ message: '团队成员为空' });
        }
        
        // 验证贡献度数据
        if (!team_contributions || !Array.isArray(team_contributions) || team_contributions.length === 0) {
          return res.status(400).json({ message: '请提供团队贡献度分配' });
        }
        
        // 创建贡献度映射（以 student_id 为 key，因为团队成员查询返回的是 student_id）
        const contributionMap = {};
        console.log('📊 接收到的贡献度数据:', JSON.stringify(team_contributions, null, 2));
        
        team_contributions.forEach(c => {
          // 优先使用 student_id（用户ID），如果没有则使用 studentId
          // 注意：前端可能传递 studentId（学号）或 student_id（用户ID），需要都尝试匹配
          const memberIdByUserId = c.student_id;
          const memberIdByStudentId = c.studentId;
          
          if (c.percent != null) {
            // 如果提供了 student_id（用户ID），优先使用
            if (memberIdByUserId) {
              const key = String(memberIdByUserId);
              contributionMap[key] = parseFloat(c.percent) || 0;
              console.log(`  ✅ 映射贡献度 (student_id): ${key} -> ${contributionMap[key]}`);
            }
            // 如果提供了 studentId（可能是学号），也尝试映射（需要后续通过学号查找用户ID）
            if (memberIdByStudentId && !memberIdByUserId) {
              // 如果 studentId 是数字，可能是用户ID
              const studentIdNum = Number(memberIdByStudentId);
              if (!isNaN(studentIdNum)) {
                const key = String(studentIdNum);
                contributionMap[key] = parseFloat(c.percent) || 0;
                console.log(`  ✅ 映射贡献度 (studentId as ID): ${key} -> ${contributionMap[key]}`);
              }
            }
          } else {
            console.warn(`  ⚠️ 跳过无效贡献度数据（缺少 percent）:`, c);
          }
        });
        
        console.log('📋 贡献度映射表:', contributionMap);
        console.log('👥 团队成员列表:', teamMembers.map(m => ({ 
          student_id: m.student_id, 
          student_id_type: typeof m.student_id,
          nickname: m.nickname,
          job_number: m.job_number
        })));
        
        // 如果贡献度数据中使用的是学号（studentId），需要通过学号查找用户ID
        // 检查是否有未匹配的贡献度数据（使用学号的）
        const unmatchedContributions = team_contributions.filter(c => {
          if (!c.percent) return false;
          const userId = c.student_id;
          const studentId = c.studentId;
          // 如果只有 studentId（学号）且不是数字，需要通过学号查找用户ID
          if (!userId && studentId && isNaN(Number(studentId))) {
            return true;
          }
          return false;
        });
        
        if (unmatchedContributions.length > 0) {
          console.log('🔍 发现使用学号的贡献度数据，需要通过学号查找用户ID:', unmatchedContributions);
          // 批量查询学号对应的用户ID
          const studentIds = unmatchedContributions.map(c => c.studentId).filter(Boolean);
          if (studentIds.length > 0) {
            const userMappings = await sequelize.query(
              `
              SELECT id, job_number
              FROM \`user\`
              WHERE job_number IN (?)
                AND deleted = 0
              `,
              { replacements: [studentIds], type: QueryTypes.SELECT }
            );
            
            // 创建学号到用户ID的映射
            const studentIdToUserIdMap = {};
            userMappings.forEach(u => {
              if (u.job_number) {
                studentIdToUserIdMap[String(u.job_number)] = u.id;
              }
            });
            
            // 将学号对应的贡献度映射到用户ID
            unmatchedContributions.forEach(c => {
              const userId = studentIdToUserIdMap[String(c.studentId)];
              if (userId && c.percent != null) {
                const key = String(userId);
                contributionMap[key] = parseFloat(c.percent) || 0;
                console.log(`  ✅ 通过学号映射贡献度: ${c.studentId} -> 用户ID ${key} -> ${contributionMap[key]}`);
              }
            });
          }
        }
        
        // 查询团队该任务已提交次数（基于 group_id），计算 round
        const [teamPreviousSubmissions] = await sequelize.query(
          `
          SELECT COUNT(DISTINCT round) AS count
          FROM course_student_work
          WHERE story_id = ?
            AND group_id = ?
            AND deleted = 0
          `,
          { replacements: [storyId, groupId], type: QueryTypes.SELECT }
        );
        const round = (teamPreviousSubmissions?.count || 0) + 1;
        const lastOne = 1; // 默认最后一次提交
        
        // 为每个团队成员创建一条记录
        const submissions = [];
        for (const member of teamMembers) {
          const memberId = member.student_id;
          const memberIdStr = String(memberId);
          const contribution = contributionMap[memberIdStr] ?? 0;
          
          console.log(`  🔍 成员 ${member.nickname} (ID: ${memberIdStr}): 贡献度 = ${contribution}`);
          
          if (contribution === 0 && !contributionMap[memberIdStr]) {
            console.warn(`  ⚠️ 警告: 成员 ${member.nickname} (ID: ${memberIdStr}) 的贡献度未找到，使用默认值 0`);
          }
          
          // dept_name 设为 null（因为 dept 表可能不存在）
          const memberDeptName = null;
          
          const submission = await CourseStudentWork.create({
            course_id: course_id || story.course_id,
            story_id: storyId,
            student_id: memberId, // 每个成员的ID
            submit_id: userId, // 提交人（队长）ID
            submit_name: req.user.nickname || req.user.username || '',
            teamwork: 1, // 团队任务
            group_id: groupId, // 团队ID
            group_name: groupName, // 团队名称
            contribution: contribution, // 该成员的贡献度
            file_name: finalFileName || null,
            file_url: file_url || null,
            content: content || '',
            score: 0,
            status: null, // null=未点评
            round: round, // 同一轮提交
            last_one: lastOne, // 是否是最后一次提交
            recommend: 0, // 0=不推荐
            dept_name: memberDeptName, // 该成员的班级名称
            creator: req.user.username || req.user.nickname || '',
            tenant_id: story.tenant_id || 0,
            create_time: new Date(),
            deleted: 0
          });
          
          submissions.push(submission);
        }
        
        return res.json({ 
          message: '团队提交成功', 
          submissions: submissions,
          count: submissions.length
        });
        
      } else {
        // ========== 个人任务：创建一条记录 ==========
        const contribution = 1.0; // 个人任务贡献度100%
        
        // 查询该学生该任务已提交次数，计算 round
        const [previousSubmissions] = await sequelize.query(
          `
          SELECT COUNT(*) AS count
          FROM course_student_work
          WHERE story_id = ?
            AND student_id = ?
            AND deleted = 0
          `,
          { replacements: [storyId, userId], type: QueryTypes.SELECT }
        );
        const round = (previousSubmissions?.count || 0) + 1;
        const lastOne = 1;
        
        const submission = await CourseStudentWork.create({
          course_id: course_id || story.course_id,
          story_id: storyId,
          student_id: userId,
          submit_id: userId,
          submit_name: req.user.nickname || req.user.username || '',
          teamwork: 0, // 个人任务
          group_id: null,
          group_name: null,
          contribution: contribution, // 个人任务为1.0
          file_name: finalFileName || null,
          file_url: file_url || null,
          content: content || '',
          score: 0,
          status: null, // null=未点评
          round: round, // 第几次提交
          last_one: lastOne, // 是否是最后一次提交
          recommend: 0, // 0=不推荐
          dept_name: submitterDeptName, // 班级名称
          creator: req.user.username || req.user.nickname || '',
          tenant_id: story.tenant_id || 0,
          create_time: new Date(),
          deleted: 0
        });
        
        return res.json({ message: '提交成功', submission });
      }
    } catch (err) {
      return res.status(500).json({ message: '提交失败', error: err.message });
    }
  },

  async recordTaskView(req, res) {
    try {
      const storyId = req.params.storyId;
      const userId = req.user.id;
      const story = await findActiveStory(storyId);
      if (!story) return res.status(404).json({ message: '任务不存在' });
      const [record, created] = await TaskView.findOrCreate({
        where: { story_id: storyId, user_id: userId },
        defaults: {
          story_id: storyId,
          course_id: story.course_id,
          user_id: userId,
          views: 1,
          first_view_time: new Date(),
          last_view_time: new Date(),
          tenant_id: story.tenant_id || 0
        }
      });
      if (!created) {
        record.views = (record.views || 0) + 1;
        record.last_view_time = new Date();
        await record.save();
      }
      return res.json({ message: '记录成功', views: record.views, story_id: Number(storyId) });
    } catch (err) {
      return res.status(500).json({ message: '记录任务浏览失败', error: err.message });
    }
  },

  async getTaskDiscussions(req, res) {
    try {
      const storyId = req.params.storyId;
      const story = await findActiveStory(storyId);
      if (!story) return res.status(404).json({ message: '任务不存在' });
      const { limit, offset } = pagination(req);
      const { rows, count } = await Discussion.findAndCountAll({
        where: { story_id: storyId, deleted: 0 },
        order: [['create_time', 'ASC'], ['id', 'ASC']],
        limit,
        offset
      });
      const items = rows.map((item) => item.get({ plain: true }));
      const page = limit ? Math.floor(offset / limit) + 1 : 1;
      return res.json({ story_id: Number(storyId), total: count, page, pageSize: limit, items });
    } catch (err) {
      return res.status(500).json({ message: '讨论列表获取失败', error: err.message });
    }
  },

  async createTaskDiscussion(req, res) {
    try {
      const storyId = req.params.storyId;
      const story = await findActiveStory(storyId);
      if (!story) return res.status(404).json({ message: '任务不存在' });
      const content = (req.body.content || '').trim();
      const replyTo = req.body.reply_to;
      if (!content) return res.status(400).json({ message: '讨论内容不能为空' });
      let parent = null;
      if (replyTo) {
        parent = await Discussion.findOne({ where: { id: replyTo, deleted: 0 } });
        if (!parent || String(parent.story_id) !== String(storyId)) {
          return res.status(400).json({ message: '回复目标不存在或不属于该任务' });
        }
      }
      
      // 创建用户讨论记录
      const discussion = await Discussion.create({
        story_id: storyId,
        course_id: story.course_id,
        user_id: req.user.id,
        user_name: req.user.nickname || req.user.username,
        content,
        reply_to: parent ? parent.id : null,
        likes: 0,
        creator: req.user.username,
        updater: req.user.username,
        deleted: 0,
        tenant_id: story.tenant_id || 0
      });
      
      // 如果是提问（非回复），尝试调用AI自动回复
      // 注意：这里不阻塞用户讨论的创建，AI回复异步处理
      if (!replyTo) {
        // 异步调用AI，不等待结果
        (async () => {
          try {
            let aiAnswer = null;
            
            // 使用 aiController 的 callLLM 函数
            try {
              const aiController = require('./aiController');
              aiAnswer = await aiController.callLLM({
                prompt: content,
                storyId: storyId,
                type: 'qa'
              });
              console.log('✅ AI回复成功获取');
            } catch (aiCallError) {
              console.warn('AI接口调用失败，使用模拟回复:', aiCallError.message);
              // AI调用失败，使用模拟回复
              aiAnswer = null;
            }
            
            // 如果AI调用失败或未配置，使用模拟回复
            if (!aiAnswer) {
              // 根据问题内容生成简单的模拟回复
              const mockResponses = [
                '收到您的问题："' + content + '"。这是一个很好的问题，建议您可以：\n1. 仔细阅读任务要求\n2. 参考课程资料\n3. 如有疑问可以继续提问',
                '关于"' + content + '"这个问题，我理解您的疑问。建议您：\n1. 查看任务详情页的相关资料\n2. 参考优秀作业示例\n3. 在团队内进行讨论',
                '感谢您的提问："' + content + '"。作为课程助教，我建议：\n1. 先理解任务的核心要求\n2. 按照步骤逐步完成\n3. 遇到具体问题可以详细描述',
                '针对"' + content + '"这个问题，我的建议是：\n1. 仔细分析任务目标\n2. 制定实施计划\n3. 分阶段完成并检查'
              ];
              // 根据问题长度选择不同的回复
              const index = content.length % mockResponses.length;
              aiAnswer = mockResponses[index];
            }
            
            // 创建AI回复记录（无论是否成功调用AI，都保存回复）
            if (aiAnswer) {
              await Discussion.create({
                story_id: storyId,
                course_id: story.course_id,
                user_id: null, // AI回复，user_id为null
                user_name: 'AI助教',
                content: String(aiAnswer).trim(),
                reply_to: discussion.id, // 回复用户的提问
                likes: 0,
                creator: 'system',
                updater: 'system',
                deleted: 0,
                tenant_id: story.tenant_id || 0
              });
              console.log('✅ AI回复已保存到数据库，回复ID:', discussion.id);
            }
          } catch (aiErr) {
            // AI调用失败，不影响用户讨论的创建
            console.error('AI自动回复失败:', aiErr.message);
          }
        })();
      }
      
      return res.status(201).json(discussion);
    } catch (err) {
      return res.status(500).json({ message: '创建讨论失败', error: err.message });
    }
  },

  async listTaskHomeworks(req, res) {
    try {
      if (req.user.user_role === 0) return res.status(403).json({ message: '权限不足' });
      const storyId = req.params.storyId;
      const story = await findActiveStory(storyId);
      if (!story) return res.status(404).json({ message: '任务不存在' });
      const { limit, offset } = pagination(req);
      const [{ total = 0 } = {}] = await sequelize.query(
        'SELECT COUNT(*) AS total FROM course_student_work WHERE story_id=? AND deleted=0',
        { replacements: [storyId], type: QueryTypes.SELECT }
      );
      const items = await sequelize.query(
        `SELECT
          w.id,
          w.course_id,
          w.story_id,
          w.student_id,
          w.submit_id,
          w.submit_name,
          w.file_url,
          w.content,
          w.score,
          w.status,
          w.create_time,
          w.update_time,
          w.recommend,
          u.username,
          u.nickname,
          u.avatar_url
        FROM course_student_work w
        LEFT JOIN \`user\` u ON u.id = w.student_id
        WHERE w.story_id = ? AND w.deleted = 0
        ORDER BY w.create_time DESC, w.id DESC
        LIMIT ? OFFSET ?`,
        { replacements: [storyId, limit, offset], type: QueryTypes.SELECT }
      );
      const page = limit ? Math.floor(offset / limit) + 1 : 1;
      return res.json({
        story_id: Number(storyId),
        total: Number(total || 0),
        page,
        pageSize: limit,
        items
      });
    } catch (err) {
      return res.status(500).json({ message: '作业列表获取失败', error: err.message });
    }
  },

  // 获取我的历史提交记录（个人或团队）
  async getMySubmissions(req, res) {
    try {
      const storyId = req.params.storyId || req.params.id;
      const userId = req.user.id;
      const story = await findActiveStory(storyId);
      if (!story) return res.status(404).json({ message: '任务不存在' });
      
      const storyType = story.story_type ?? 1;
      const isTeamwork = storyType === 2 || storyType === 3;
      
      let submissions = [];
      
      if (isTeamwork) {
        // 团队任务：获取团队的所有提交记录（按 round 分组）
        // 先找到用户所在的团队
        const [teamMember] = await sequelize.query(
          `
          SELECT cs.group_id
          FROM course_student cs
          WHERE cs.student_id = ?
            AND cs.course_id = ?
            AND cs.deleted = 0
            AND cs.group_id IS NOT NULL
          LIMIT 1
          `,
          { replacements: [userId, story.course_id], type: QueryTypes.SELECT }
        );
        
        if (teamMember && teamMember.group_id) {
          // 获取该团队的所有提交记录，按 round 分组
          // 对于每个 round，返回提交人（submit_id）的记录作为主记录，但需要包含当前用户的贡献度
          // 先获取所有提交记录（按 round 分组，每个 round 只取提交人的记录）
          const allSubmissions = await sequelize.query(
            `
            SELECT
              w.id,
              w.course_id,
              w.story_id,
              w.student_id,
              w.submit_id,
              w.submit_name,
              w.teamwork,
              w.group_id,
              w.group_name,
              w.file_name,
              w.file_url,
              w.content,
              w.score,
              CAST(w.status AS UNSIGNED) AS status,
              w.round,
              w.last_one,
              w.recommend,
              w.create_time,
              w.update_time
            FROM course_student_work w
            WHERE w.story_id = ?
              AND w.group_id = ?
              AND w.deleted = 0
              AND w.submit_id = w.student_id
            ORDER BY w.round DESC, w.create_time DESC
            `,
            { replacements: [storyId, teamMember.group_id], type: QueryTypes.SELECT }
          );
          
          // 获取当前用户在每个 round 的贡献度
          const userContributions = await sequelize.query(
            `
            SELECT round, contribution
            FROM course_student_work
            WHERE story_id = ?
              AND group_id = ?
              AND student_id = ?
              AND deleted = 0
            ORDER BY round DESC
            `,
            { replacements: [storyId, teamMember.group_id, userId], type: QueryTypes.SELECT }
          );
          
          // 创建贡献度映射
          const contributionMap = {};
          userContributions.forEach(uc => {
            contributionMap[uc.round] = uc.contribution;
          });
          
          // 合并数据，为每条记录添加当前用户的贡献度
          submissions = allSubmissions.map(sub => ({
            ...sub,
            contribution: contributionMap[sub.round] || null
          }));
        }
      } else {
        // 个人任务：获取个人的所有提交记录
        submissions = await sequelize.query(
          `
          SELECT
            w.id,
            w.course_id,
            w.story_id,
            w.student_id,
            w.submit_id,
            w.submit_name,
            w.teamwork,
            w.group_id,
            w.group_name,
            w.contribution,
            w.file_name,
            w.file_url,
            w.content,
            w.score,
            CAST(w.status AS UNSIGNED) AS status,
            w.round,
            w.last_one,
            w.recommend,
            w.create_time,
            w.update_time,
            u.nickname AS student_name,
            u.job_number AS student_job_number
          FROM course_student_work w
          LEFT JOIN \`user\` u ON u.id = w.student_id
          WHERE w.story_id = ?
            AND w.student_id = ?
            AND w.deleted = 0
          ORDER BY w.round DESC, w.create_time DESC
          `,
          { replacements: [storyId, userId], type: QueryTypes.SELECT }
        );
      }
      
      return res.json({
        story_id: Number(storyId),
        submissions: submissions || []
      });
    } catch (err) {
      return res.status(500).json({ message: '获取历史提交失败', error: err.message });
    }
  },

  async getHomeworkDetail(req, res) {
    try {
      const homeworkId = req.params.homeworkId;
      const homework = await CourseStudentWork.findOne({ where: { id: homeworkId, deleted: 0 } });
      if (!homework) return res.status(404).json({ message: '作业不存在' });
      const isOwner = String(homework.student_id) === String(req.user.id);
      if (!isOwner && req.user.user_role === 0) return res.status(403).json({ message: '权限不足' });
      const story = await findActiveStory(homework.story_id);
      return res.json({ homework, story });
    } catch (err) {
      return res.status(500).json({ message: '作业详情获取失败', error: err.message });
    }
  },

  async updateHomework(req, res) {
    try {
      const homeworkId = req.params.homeworkId;
      const { file_url, content } = req.body;
      if (file_url === undefined && content === undefined) {
        return res.status(400).json({ message: '请至少提供 file_url 或 content 字段' });
      }
      const homework = await CourseStudentWork.findOne({ where: { id: homeworkId, deleted: 0 } });
      if (!homework) return res.status(404).json({ message: '作业不存在' });
      const isOwner = String(homework.student_id) === String(req.user.id);
      if (!isOwner) return res.status(403).json({ message: '只能修改自己的作业' });
      const story = await findActiveStory(homework.story_id);
      if (!story) return res.status(404).json({ message: '任务不存在' });
      if (story.end_time && new Date(story.end_time) < new Date()) {
        return res.status(400).json({ message: '任务已截止，无法再修改作业' });
      }
      if (file_url !== undefined) homework.file_url = file_url;
      if (content !== undefined) homework.content = content;
      await homework.save();
      return res.json({ message: '更新成功', homework });
    } catch (err) {
      return res.status(500).json({ message: '更新作业失败', error: err.message });
    }
  },

  // PUT /api/homework/:id/comment
  async updateHomeworkComment(req, res) {
    try {
      const homeworkId = req.params.id || req.params.homeworkId;
      const homework = await CourseStudentWork.findOne({ where: { id: homeworkId, deleted: 0 } });
      if (!homework) return res.status(404).json({ message: '作业不存在' });

      // 仅教师/助教可点评
      if (!req.user || req.user.user_role === 0) {
        return res.status(403).json({ message: '权限不足，仅教师/助教可点评作业' });
      }

      const comment = (req.body.comment || '').trim();
      if (!comment) return res.status(400).json({ message: '评语不能为空' });

      let extra = {};
      if (homework.scrap_json) {
        try {
          extra = JSON.parse(homework.scrap_json) || {};
        } catch (e) {
          extra = {};
        }
      }
      const now = new Date();
      extra.teacher_comment = comment;
      extra.comment_by = req.user.id;
      extra.comment_by_name = req.user.nickname || req.user.username;
      extra.comment_time = now.toISOString();

      homework.scrap_json = JSON.stringify(extra);
      homework.status = 1;
      homework.updater = req.user.username || homework.updater;
      homework.update_time = now;
      await homework.save();

      return res.json({
        message: '评语更新成功',
        comment: {
          homework_id: homework.id,
          teacher_comment: extra.teacher_comment,
          comment_by: extra.comment_by,
          comment_by_name: extra.comment_by_name,
          comment_time: extra.comment_time
        }
      });
    } catch (err) {
      return res.status(500).json({ message: '更新评语失败', error: err.message });
    }
  },

  // GET /api/homework/:id/comment
  async getHomeworkComment(req, res) {
    try {
      const homeworkId = req.params.id || req.params.homeworkId;
      const homework = await CourseStudentWork.findOne({ where: { id: homeworkId, deleted: 0 } });
      if (!homework) return res.status(404).json({ message: '作业不存在' });

      const isOwner = String(homework.student_id) === String(req.user.id);
      // 学生可以查看自己作业的评语，教师/助教可以查看所有
      if (!isOwner && req.user.user_role === 0) {
        return res.status(403).json({ message: '权限不足' });
      }

      let extra = {};
      if (homework.scrap_json) {
        try {
          extra = JSON.parse(homework.scrap_json) || {};
        } catch (e) {
          extra = {};
        }
      }

      return res.json({
        homework_id: homework.id,
        teacher_comment: extra.teacher_comment || null,
        comment_by: extra.comment_by || null,
        comment_by_name: extra.comment_by_name || null,
        comment_time: extra.comment_time || null
      });
    } catch (err) {
      return res.status(500).json({ message: '获取评语失败', error: err.message });
    }
  }
};

