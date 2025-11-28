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

      return res.json({ story, myWork, materials, viewCount });
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
      const { file_url, content, course_id } = req.body;
      const submission = await CourseStudentWork.create({
        course_id: course_id || story.course_id,
        story_id: storyId,
        student_id: userId,
        submit_id: userId,
        submit_name: req.user.nickname || '',
        file_url,
        content,
        score: 0,
        create_time: new Date(),
        deleted: 0
      });
      return res.json({ message: '提交成功', submission });
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

