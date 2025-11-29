const { sequelize } = require('../models');
const { QueryTypes } = require('sequelize');

module.exports = {
  // GET /api/teams/:storyId
  async getTeams(req, res) {
    try {
      const storyId = req.params.storyId;
      const teams = await sequelize.query(
        'SELECT group_id, group_name, SUM(team_score) AS total_score FROM course_student_work WHERE story_id=? AND deleted=0 GROUP BY group_id, group_name',
        { replacements: [storyId], type: QueryTypes.SELECT }
      );
      return res.json(teams);
    } catch (err) {
      return res.status(500).json({ message: '获取团队列表失败', error: err.message });
    }
  },

  // GET /api/teams/detail/:teamId
  async getTeamDetail(req, res) {
    try {
      const teamId = req.params.teamId;
      
      // 验证团队是否存在
      const [team] = await sequelize.query(
        'SELECT id, group_name, course_id FROM course_group WHERE id = ? AND deleted = 0',
        { replacements: [teamId], type: QueryTypes.SELECT }
      );
      
      if (!team) {
        return res.status(404).json({ message: '团队不存在' });
      }

      // 获取团队成员（从 course_student 表）
      const members = await sequelize.query(
        `
        SELECT
          cs.id,
          cs.student_id,
          cs.leader AS isLeader,
          u.username,
          u.nickname AS name,
          u.job_number AS jobNumber,
          u.avatar_url
        FROM course_student cs
        JOIN \`user\` u ON u.id = cs.student_id
        WHERE cs.group_id = ?
          AND cs.deleted = 0
          AND u.deleted = 0
        ORDER BY cs.leader DESC, cs.id ASC
        `,
        { replacements: [teamId], type: QueryTypes.SELECT }
      );

      // 计算团队总分（从 course_student_work 表）
      const [scoreResult] = await sequelize.query(
        `
        SELECT
          SUM(IFNULL(score, 0)) AS totalScore
        FROM course_student_work
        WHERE group_id = ?
          AND deleted = 0
        `,
        { replacements: [teamId], type: QueryTypes.SELECT }
      );

      const totalScore = Number(scoreResult?.totalScore || 0);

      // 计算每个成员的贡献度（基于作业提交情况）
      const memberScores = await sequelize.query(
        `
        SELECT
          student_id,
          COUNT(*) AS submissionCount,
          SUM(IFNULL(score, 0)) AS totalScore
        FROM course_student_work
        WHERE group_id = ?
          AND deleted = 0
        GROUP BY student_id
        `,
        { replacements: [teamId], type: QueryTypes.SELECT }
      );

      const scoreMap = {};
      memberScores.forEach(ms => {
        scoreMap[ms.student_id] = {
          submissionCount: Number(ms.submissionCount || 0),
          totalScore: Number(ms.totalScore || 0)
        };
      });

      const totalSubmissions = memberScores.reduce((sum, ms) => sum + Number(ms.submissionCount || 0), 0);

      // 为每个成员添加贡献度和分数
      const membersWithStats = members.map(member => {
        const stats = scoreMap[member.student_id] || { submissionCount: 0, totalScore: 0 };
        const contributionRate = totalSubmissions > 0 
          ? stats.submissionCount / totalSubmissions 
          : 1 / members.length; // 如果没有提交记录，平均分配

        return {
          ...member,
          // 确保学号字段正确返回（兼容多种命名）
          studentId: member.jobNumber || member.job_number || '',
          jobNumber: member.jobNumber || member.job_number || '',
          job_number: member.jobNumber || member.job_number || '',
          contributionRate: contributionRate,
          contribution: Math.round(contributionRate * 100),
          score: stats.totalScore
        };
      });

      return res.json({
        team: {
          id: team.id,
          groupName: team.group_name,
          courseId: team.course_id,
          totalScore: totalScore
        },
        members: membersWithStats
      });
    } catch (err) {
      return res.status(500).json({ message: '获取团队详情失败', error: err.message });
    }
  },

  // GET /api/teams/user   查看自己加入的所有团队
  async getMyTeams(req, res) {
    try {
      const userId = req.user.id;
      const sql = `
        SELECT
          g.id AS teamId,
          g.id AS group_id,
          g.group_name AS groupName,
          g.group_name,
          g.course_id AS courseId,
          g.course_id,
          c.course_name,
          c.course_desc,
          c.course_pic,
          cs.leader,
          cs.create_time
        FROM course_student cs
        JOIN course_group g
          ON cs.group_id = g.id AND g.deleted = 0
        LEFT JOIN course c
          ON g.course_id = c.course_id AND c.deleted = 0
        WHERE cs.deleted = 0
          AND cs.student_id = ?
          AND cs.group_id IS NOT NULL
        ORDER BY g.course_id, g.sort, g.id`;
      const rows = await sequelize.query(sql, {
        replacements: [userId],
        type: QueryTypes.SELECT
      });

      // 为每个团队计算总分
      const teamsWithScore = await Promise.all(rows.map(async (team) => {
        const [scoreResult] = await sequelize.query(
          `
          SELECT SUM(IFNULL(score, 0)) AS totalScore
          FROM course_student_work
          WHERE group_id = ? AND deleted = 0
          `,
          { replacements: [team.teamId], type: QueryTypes.SELECT }
        );
        return {
          ...team,
          score: Number(scoreResult?.totalScore || 0),
          totalScore: Number(scoreResult?.totalScore || 0)
        };
      }));

      return res.json(teamsWithScore);
    } catch (err) {
      return res.status(500).json({ message: '获取我的团队失败', error: err.message });
    }
  },

  // GET /api/teams/course/:courseId   查看某课程下所有团队
  async getCourseTeams(req, res) {
    try {
      const courseId = req.params.courseId;
      const sql = `
        SELECT
          g.id AS group_id,
          g.group_name,
          g.course_id,
          g.max_size,
          g.current_size,
          g.group_code,
          g.sort
        FROM course_group g
        WHERE g.deleted = 0
          AND g.course_id = ?
        ORDER BY g.sort, g.id`;
      const rows = await sequelize.query(sql, {
        replacements: [courseId],
        type: QueryTypes.SELECT
      });
      return res.json(rows);
    } catch (err) {
      return res.status(500).json({ message: '获取课程团队列表失败', error: err.message });
    }
  },

  // POST /api/teams/course/:courseId   创建团队（默认仅教师/助教等在路由层做权限控制）
  async createTeam(req, res) {
    try {
      const courseId = req.params.courseId;
      const { group_name, max_size, group_code } = req.body || {};
      if (!group_name || !String(group_name).trim()) {
        return res.status(400).json({ message: 'group_name 为必填项' });
      }
      const name = String(group_name).trim();
      const maxSizeVal =
        max_size === undefined || max_size === null || max_size === ''
          ? null
          : Number(max_size);

      // 创建小组
      const [result] = await sequelize.query(
        'INSERT INTO course_group (course_id, group_name, max_size, group_code) VALUES (?, ?, ?, ?)',
        {
          replacements: [courseId, name, maxSizeVal, group_code || null],
          type: QueryTypes.INSERT
        }
      );

      const newId = result && typeof result === 'object' && result.insertId
        ? result.insertId
        : result;

      const [team] = await sequelize.query(
        'SELECT id AS group_id, group_name, course_id, max_size, current_size, group_code, sort FROM course_group WHERE id = ?',
        { replacements: [newId], type: QueryTypes.SELECT }
      );

      return res.status(201).json({ message: '创建团队成功', team });
    } catch (err) {
      return res.status(500).json({ message: '创建团队失败', error: err.message });
    }
  },

  // POST /api/teams/:teamId/join   加入团队（学生）
  async joinTeam(req, res) {
    try {
      const teamId = req.params.teamId;
      const userId = req.user.id;

      // 查询小组
      const [group] = await sequelize.query(
        'SELECT * FROM course_group WHERE id = ? AND deleted = 0',
        { replacements: [teamId], type: QueryTypes.SELECT }
      );
      if (!group) {
        return res.status(404).json({ message: '小组不存在' });
      }

      // 人数上限检查
      const currentSize = Number(group.current_size || 0);
      const maxSize = group.max_size != null ? Number(group.max_size) : null;
      if (maxSize != null && currentSize >= maxSize) {
        return res.status(400).json({ message: '小组人数已满' });
      }

      const courseId = group.course_id;

      // 查询当前在该课程下的记录
      const [record] = await sequelize.query(
        'SELECT * FROM course_student WHERE course_id = ? AND student_id = ? AND deleted = 0 LIMIT 1',
        { replacements: [courseId, userId], type: QueryTypes.SELECT }
      );

      if (record && String(record.group_id) === String(teamId)) {
        return res.json({ message: '已加入该小组', course_id: courseId, group_id: Number(teamId) });
      }

      // 更新或插入
      if (record) {
        await sequelize.query(
          'UPDATE course_student SET group_id = ? WHERE id = ?',
          { replacements: [teamId, record.id], type: QueryTypes.UPDATE }
        );
      } else {
        await sequelize.query(
          'INSERT INTO course_student (course_id, student_id, group_id, leader) VALUES (?, ?, ?, ?)',
          { replacements: [courseId, userId, teamId, 0], type: QueryTypes.INSERT }
        );
      }

      // 更新小组当前人数
      await sequelize.query(
        'UPDATE course_group SET current_size = COALESCE(current_size, 0) + 1 WHERE id = ?',
        { replacements: [teamId], type: QueryTypes.UPDATE }
      );

      return res.json({ message: '加入小组成功', course_id: courseId, group_id: Number(teamId) });
    } catch (err) {
      return res.status(500).json({ message: '加入小组失败', error: err.message });
    }
  },

  // POST /api/teams/:teamId/quit   退出团队（学生）
  async quitTeam(req, res) {
    try {
      const teamId = req.params.teamId;
      const userId = req.user.id;

      const [group] = await sequelize.query(
        'SELECT * FROM course_group WHERE id = ? AND deleted = 0',
        { replacements: [teamId], type: QueryTypes.SELECT }
      );
      if (!group) {
        return res.status(404).json({ message: '小组不存在' });
      }

      const [record] = await sequelize.query(
        'SELECT * FROM course_student WHERE group_id = ? AND student_id = ? AND deleted = 0 LIMIT 1',
        { replacements: [teamId, userId], type: QueryTypes.SELECT }
      );

      if (!record) {
        return res.status(400).json({ message: '当前不在该小组中' });
      }

      await sequelize.query(
        'UPDATE course_student SET group_id = NULL, leader = 0 WHERE id = ?',
        { replacements: [record.id], type: QueryTypes.UPDATE }
      );

      await sequelize.query(
        'UPDATE course_group SET current_size = GREATEST(COALESCE(current_size, 0) - 1, 0) WHERE id = ?',
        { replacements: [teamId], type: QueryTypes.UPDATE }
      );

      return res.json({ message: '已退出小组', course_id: group.course_id, group_id: Number(teamId) });
    } catch (err) {
      return res.status(500).json({ message: '退出小组失败', error: err.message });
    }
  },

  // GET /api/teams/:teamId/members   查看团队成员列表
  async getTeamMembers(req, res) {
    try {
      const teamId = req.params.teamId;
      const sql = `
        SELECT
          cs.id AS id,
          cs.student_id,
          cs.course_id,
          cs.group_id,
          cs.leader,
          cs.create_time,
          u.username,
          u.nickname,
          u.avatar_url
        FROM course_student cs
        JOIN \`user\` u ON u.id = cs.student_id
        WHERE cs.group_id = ?
          AND cs.deleted = 0
        ORDER BY cs.leader DESC, cs.id ASC`;
      const rows = await sequelize.query(sql, {
        replacements: [teamId],
        type: QueryTypes.SELECT
      });
      return res.json(rows);
    } catch (err) {
      return res.status(500).json({ message: '获取小组成员失败', error: err.message });
    }
  }
};
