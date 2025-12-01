const { Course, Story, sequelize } = require('../models');
const { QueryTypes } = require('sequelize');
const pagination = require('../utils/pagination');

// 根据课程开始时间推算学期标签，例如：2024春 / 2024秋
function getSemesterLabelFromDate(dateValue) {
  if (!dateValue) return null;
  const d = new Date(dateValue);
  if (Number.isNaN(d.getTime())) return null;
  const year = d.getFullYear();
  const month = d.getMonth() + 1;

  // 示例规则：
  // - 3~8 月：当年春季学期 => YYYY春
  // - 9~12 月：当年秋季学期 => YYYY秋
  // - 1~2 月：上一年秋季学期 => (YYYY-1)秋
  if (month >= 3 && month <= 8) {
    return `${year}春`;
  }
  const autumnYear = month <= 2 ? year - 1 : year;
  return `${autumnYear}秋`;
}

module.exports = {
  // GET /api/courses
  async listCourses(req, res) {
    try {
      const { semester, q } = req.query;
      // semester 目前表结构中没有专门字段，这里保留参数以便后续扩展
      const limitOffset = pagination(req);
      let sql = 'SELECT * FROM course WHERE deleted=0';
      const params = [];
      if (q) {
        sql += ' AND course_name LIKE ?';
        params.push('%' + q + '%');
      }
      sql += ' LIMIT ? OFFSET ?';
      params.push(limitOffset.limit, limitOffset.offset);
      const rows = await sequelize.query(sql, {
        replacements: params,
        type: QueryTypes.SELECT
      });

      const courses = rows.map((row) => ({
        ...row,
        semester_label: getSemesterLabelFromDate(row.start_time)
      }));

      return res.json(courses);
    } catch (err) {
      return res.status(500).json({ message: '课程列表获取失败', error: err.message });
    }
  },

  // GET /api/courses/:id/map-metadata
  // 返回课程下的毕业要求（Goals）、史诗（Epics）与阶段（Releases）元数据
  async getCourseMapMetadata(req, res) {
    try {
      const courseId = req.params.id;

      const goals = await sequelize.query(
        `
        SELECT
          id,
          course_id,
          goal_name,
          goal_desc,
          goal_level,
          goal_reference,
          sort
        FROM course_map_goal
        WHERE deleted = 0
          AND course_id = ?
        ORDER BY IFNULL(sort, 9999), id
        `,
        {
          replacements: [courseId],
          type: QueryTypes.SELECT
        }
      );

      const epics = await sequelize.query(
        `
        SELECT
          id,
          course_id,
          goal_id,
          epic_name,
          sort
        FROM course_map_epic
        WHERE deleted = 0
          AND course_id = ?
        ORDER BY IFNULL(sort, 9999), id
        `,
        {
          replacements: [courseId],
          type: QueryTypes.SELECT
        }
      );

      const releases = await sequelize.query(
        `
        SELECT
          id,
          course_id,
          release_name,
          release_desc
        FROM course_map_release
        WHERE deleted = 0
          AND course_id = ?
        ORDER BY id
        `,
        {
          replacements: [courseId],
          type: QueryTypes.SELECT
        }
      );

      const formatId = (v) => (v === undefined || v === null ? null : Number(v));

      return res.json({
        goals: goals.map((g) => ({
          id: formatId(g.id),
          course_id: formatId(g.course_id),
          goal_name: g.goal_name,
          goal_desc: g.goal_desc,
          goal_level: g.goal_level,
          goal_reference: g.goal_reference,
          sort: g.sort === undefined || g.sort === null ? null : Number(g.sort)
        })),
        epics: epics.map((e) => ({
          id: formatId(e.id),
          course_id: formatId(e.course_id),
          goal_id: formatId(e.goal_id),
          epic_name: e.epic_name,
          sort: e.sort === undefined || e.sort === null ? null : Number(e.sort)
        })),
        releases: releases.map((r) => ({
          id: formatId(r.id),
          course_id: formatId(r.course_id),
          release_name: r.release_name,
          release_desc: r.release_desc
        }))
      });
    } catch (err) {
      return res.status(500).json({ message: '课程地图元数据获取失败', error: err.message });
    }
  },

  // GET /api/courses/:id
  async getCourse(req, res) {
    try {
      const id = req.params.id;
      const course = await Course.findOne({ where: { course_id: id, deleted: 0 } });
      if (!course) return res.status(404).json({ message: '课程不存在' });
      const stories = await Story.findAll({
        where: { course_id: id, deleted: 0 },
        order: [['sort', 'ASC'], ['id', 'ASC']]
      });
      return res.json({ course, stories });
    } catch (err) {
      return res.status(500).json({ message: '课程详情获取失败', error: err.message });
    }
  },

  // GET /api/courses/:id/personal
  async getPersonalOverview(req, res) {
    try {
      const courseId = req.params.id;
      const userId = req.user.id;
      
      // 获取当前学生的总分和已完成任务数
      const totals = await sequelize.query(
        'SELECT SUM(IFNULL(score,0)) as total_score, COUNT(DISTINCT story_id) as tasks_done FROM course_student_work WHERE course_id=? AND student_id=? AND deleted=0',
        { replacements: [courseId, userId], type: QueryTypes.SELECT }
      );
      
      // 获取所有学生的总分排名
      const ranking = await sequelize.query(
        'SELECT student_id, SUM(IFNULL(score,0)) as total FROM course_student_work WHERE course_id=? AND deleted=0 GROUP BY student_id ORDER BY total DESC',
        { replacements: [courseId], type: QueryTypes.SELECT }
      );
      
      // 获取课程总任务数
      const totalTasksResult = await sequelize.query(
        'SELECT COUNT(DISTINCT id) as total_tasks FROM course_map_story WHERE course_id=? AND deleted=0',
        { replacements: [courseId], type: QueryTypes.SELECT }
      );
      
      // 获取课程学生总数
      const studentCountResult = await sequelize.query(
        'SELECT COUNT(DISTINCT student_id) as student_count FROM course_student WHERE course_id=? AND deleted=0',
        { replacements: [courseId], type: QueryTypes.SELECT }
      );
      
      const myTotal = totals[0] || { total_score: 0, tasks_done: 0 };
      const totalTasks = Number(totalTasksResult[0]?.total_tasks || 0);
      const studentCount = Number(studentCountResult[0]?.student_count || 0);
      
      // 计算排名
      let rank = null;
      let myTotalScore = parseFloat(myTotal.total_score || 0);
      for (let i = 0; i < ranking.length; i++) {
        if (ranking[i].student_id == userId) {
          rank = i + 1;
          break;
        }
      }
      
      // 计算班级平均分
      let avgScore = 0;
      if (ranking.length > 0) {
        const sum = ranking.reduce((acc, item) => acc + parseFloat(item.total || 0), 0);
        avgScore = ranking.length > 0 ? sum / ranking.length : 0;
      }
      
      // 计算排名百分比
      let rankPercent = 0;
      if (rank && studentCount > 0) {
        rankPercent = ((studentCount - rank + 1) / studentCount) * 100;
      }
      
      const totalScore = myTotalScore;
      const finishedTasks = Number(myTotal.tasks_done || 0);
      
      return res.json({
        // 下划线命名（兼容性）
        total_score: totalScore,
        tasks_done: finishedTasks,
        total_tasks: totalTasks,
        rank: rank,
        avg_score: avgScore,
        rank_percent: rankPercent,
        student_count: studentCount,
        // 驼峰命名（前端友好）
        courseId: Number(courseId),
        totalScore: totalScore,
        finishedTasks: finishedTasks,
        totalTasks: totalTasks,
        rank: rank,
        avgScore: avgScore,
        averageScore: avgScore, // 额外兼容字段
        rankPercent: rankPercent,
        studentCount: studentCount
      });
    } catch (err) {
      return res.status(500).json({ message: '课程个人总览获取失败', error: err.message });
    }
  },

  // GET /api/courses/overview
  async getCoursesOverview(req, res) {
    try {
      const userId = req.user.id;
      const limitOffset = pagination(req);
      const { courseType, q } = req.query;

      const whereParts = ['cs.deleted = 0', 'cs.student_id = ?'];
      const replacements = [userId];

      if (courseType !== undefined && courseType !== null && courseType !== '') {
        whereParts.push('c.course_type = ?');
        replacements.push(Number(courseType));
      }

      if (q && String(q).trim()) {
        whereParts.push('c.course_name LIKE ?');
        replacements.push(`%${String(q).trim()}%`);
      }

      // 以当前用户在 course_student 表中的课程为主，拼接课程信息与完成情况
      const sql = `
        SELECT
          c.course_id,
          c.course_name,
          c.course_desc,
          c.course_pic,
          c.course_type,
          c.semester,
          c.start_time,
          c.end_time,
          IFNULL(v.total_score, 0) AS total_score,
          IFNULL(v.tasks_done, 0) AS tasks_done,
          IFNULL(all_tasks.total_tasks, 0) AS total_tasks,
          IFNULL(cs_count.student_count, 0) AS student_count,
          CASE
            WHEN IFNULL(all_tasks.total_tasks, 0) = 0 THEN 0
            ELSE ROUND(IFNULL(v.tasks_done, 0) / all_tasks.total_tasks * 100, 1)
          END AS complete_percent
        FROM course_student cs
        JOIN course c ON cs.course_id = c.course_id AND c.deleted = 0
        LEFT JOIN (
          SELECT
            course_id,
            student_id,
            SUM(IFNULL(score, 0)) AS total_score,
            COUNT(DISTINCT story_id) AS tasks_done
          FROM course_student_work
          WHERE deleted = 0
          GROUP BY course_id, student_id
        ) AS v
          ON v.course_id = cs.course_id AND v.student_id = cs.student_id
        LEFT JOIN (
          SELECT course_id, COUNT(DISTINCT id) AS total_tasks
          FROM course_map_story
          WHERE deleted = 0
          GROUP BY course_id
        ) AS all_tasks ON all_tasks.course_id = c.course_id
        LEFT JOIN (
          SELECT course_id, COUNT(DISTINCT student_id) AS student_count
          FROM course_student
          WHERE deleted = 0
          GROUP BY course_id
        ) AS cs_count ON cs_count.course_id = c.course_id
        WHERE ${whereParts.join(' AND ')}
        GROUP BY
          c.course_id, c.course_name, c.course_desc, c.course_pic,
          c.course_type, c.semester, c.start_time, c.end_time,
          v.total_score, v.tasks_done, all_tasks.total_tasks, cs_count.student_count
        LIMIT ? OFFSET ?`;
      replacements.push(limitOffset.limit, limitOffset.offset);
      const rows = await sequelize.query(sql, {
        replacements,
        type: QueryTypes.SELECT
      });
      const formatted = rows.map((row) => ({
        ...row,
        total_score: Number(row.total_score || 0),
        tasks_done: Number(row.tasks_done || 0),
        total_tasks: Number(row.total_tasks || 0),
        complete_percent: Number(row.complete_percent || 0),
        // 统一添加学期标签，便于前端筛选与展示
        semester_label: getSemesterLabelFromDate(row.start_time)
      }));
      return res.json(formatted);
    } catch (err) {
      return res.status(500).json({ message: '课程总览获取失败', error: err.message });
    }
  },

  // GET /api/courses/:id/tasks/status
  async getCourseTasksStatus(req, res) {
    try {
      const courseId = req.params.id;
      const userId = req.user.id;
      const scope = req.query.scope || 'me'; // me | course

      if (scope === 'course') {
        const [{ total_students = 0 } = {}] = await sequelize.query(
          'SELECT COUNT(*) AS total_students FROM course_student WHERE deleted = 0 AND course_id = ?',
          { replacements: [courseId], type: QueryTypes.SELECT }
        );
        const totalStudents = Number(total_students || 0);

        const rows = await sequelize.query(
          `
          SELECT
            s.id AS story_id,
            s.story_name,
            COUNT(DISTINCT w.student_id) AS submitted_students
          FROM course_map_story s
          LEFT JOIN course_student_work w
            ON w.story_id = s.id
            AND w.course_id = ?
            AND w.deleted = 0
          WHERE s.course_id = ?
            AND s.deleted = 0
          GROUP BY s.id, s.story_name
          ORDER BY s.id`,
          {
            replacements: [courseId, courseId],
            type: QueryTypes.SELECT
          }
        );

        const items = rows.map((row) => {
          const submitted = Number(row.submitted_students || 0);
          const percent =
            totalStudents > 0 ? Number(((submitted / totalStudents) * 100).toFixed(1)) : 0;
          return {
            story_id: row.story_id,
            story_name: row.story_name,
            submitted_students: submitted,
            total_students: totalStudents,
            completion_percent: percent
          };
        });

        return res.json({ scope: 'course', items, total_students: totalStudents });
      }

      // 默认返回当前用户在本课程下每个任务是否完成
      const sqlMe = `
        SELECT
          s.id AS story_id,
          s.story_name,
          CASE WHEN MAX(CASE WHEN w.id IS NULL THEN 0 ELSE 1 END) = 1 THEN 1 ELSE 0 END AS done
        FROM course_map_story s
        LEFT JOIN course_student_work w
          ON w.story_id = s.id AND w.student_id = ? AND w.deleted = 0
        WHERE s.course_id = ? AND s.deleted = 0
        GROUP BY s.id, s.story_name
        ORDER BY s.id`;
      const rowsMe = await sequelize.query(sqlMe, {
        replacements: [userId, courseId],
        type: QueryTypes.SELECT
      });
      const itemsMe = rowsMe.map((row) => ({
        story_id: row.story_id,
        story_name: row.story_name,
        done: Number(row.done) === 1
      }));
      return res.json({ scope: 'me', items: itemsMe });
    } catch (err) {
      return res.status(500).json({ message: '课程任务完成情况获取失败', error: err.message });
    }
  },

  // GET /api/courses/:id/students
  async getCourseStudents(req, res) {
    try {
      const courseId = req.params.id;
      const sql = `
        SELECT
          ranked.student_id,
          ranked.username,
          ranked.nickname,
          ranked.total_score,
          ranked.tasks_done,
          ranked.rank
        FROM (
          SELECT
            u.id AS student_id,
            u.username,
            u.nickname,
            IFNULL(v.total_score, 0) AS total_score,
            IFNULL(v.tasks_done, 0) AS tasks_done,
            @rownum := @rownum + 1 AS rank
          FROM (SELECT @rownum := 0) AS vars,
               course_student cs
          JOIN \`user\` u ON u.id = cs.student_id
          LEFT JOIN (
            SELECT
              course_id,
              student_id,
              SUM(IFNULL(score, 0)) AS total_score,
              COUNT(DISTINCT story_id) AS tasks_done
            FROM course_student_work
            WHERE deleted = 0
            GROUP BY course_id, student_id
          ) AS v
            ON v.course_id = cs.course_id AND v.student_id = cs.student_id
          WHERE cs.deleted = 0 AND cs.course_id = ?
          ORDER BY total_score DESC, student_id ASC
        ) AS ranked
        ORDER BY ranked.rank ASC`;
      const rows = await sequelize.query(sql, {
        replacements: [courseId],
        type: QueryTypes.SELECT
      });
      const formatted = rows.map((row) => ({
        ...row,
        total_score: Number(row.total_score || 0),
        tasks_done: Number(row.tasks_done || 0),
        rank: Number(row.rank || 0)
      }));
      return res.json(formatted);
    } catch (err) {
      return res.status(500).json({ message: '课程学生列表获取失败', error: err.message });
    }
  },

  // GET /api/courses/:id/abilities/me
  async getCourseAbilitiesMe(req, res) {
    try {
      const courseId = req.params.id;
      const userId = req.user.id;
      const sql = `
        SELECT
          g.id AS ability_id,
          g.goal_name AS ability_name,
          g.goal_level,
          IFNULL(gs.total_tasks, 0) AS total_tasks,
          IFNULL(gs.finished_tasks, 0) AS finished_tasks,
          IFNULL(gs.achieved_score, 0) AS achieved_score,
          IFNULL(gs.max_score, 0) AS max_score,
          CASE
            WHEN IFNULL(gs.max_score, 0) = 0 THEN 0
            ELSE ROUND(IFNULL(gs.achieved_score, 0) / gs.max_score * 100, 1)
          END AS completion_percent
        FROM course_map_goal g
        LEFT JOIN (
          SELECT
            s.goal_id,
            COUNT(DISTINCT s.id) AS total_tasks,
            COUNT(DISTINCT CASE WHEN score_data.score > 0 THEN s.id END) AS finished_tasks,
            SUM(IFNULL(score_data.score, 0)) AS achieved_score,
            SUM(IFNULL(s.total_score, 0)) AS max_score
          FROM course_map_story s
          LEFT JOIN (
            SELECT
              story_id,
              MAX(IFNULL(score, 0)) AS score
            FROM course_student_work
            WHERE student_id = ?
              AND course_id = ?
              AND deleted = 0
            GROUP BY story_id
          ) AS score_data ON score_data.story_id = s.id
          WHERE s.course_id = ?
            AND s.deleted = 0
          GROUP BY s.goal_id
        ) AS gs ON gs.goal_id = g.id
        WHERE g.course_id = ?
          AND g.deleted = 0
        ORDER BY IFNULL(g.sort, 9999), g.id`;
      let rows = await sequelize.query(sql, {
        replacements: [userId, courseId, courseId, courseId],
        type: QueryTypes.SELECT
      });

      if (!rows.length) {
        const fallbackSql = `
          SELECT
            COALESCE(s.story_type, 0) AS ability_id,
            CONCAT('story_type_', COALESCE(s.story_type, 0)) AS ability_name,
            NULL AS goal_level,
            COUNT(DISTINCT s.id) AS total_tasks,
            COUNT(DISTINCT CASE WHEN score_data.score > 0 THEN s.id END) AS finished_tasks,
            SUM(IFNULL(score_data.score, 0)) AS achieved_score,
            SUM(IFNULL(s.total_score, 0)) AS max_score,
            CASE
              WHEN SUM(IFNULL(s.total_score, 0)) = 0 THEN 0
              ELSE ROUND(SUM(IFNULL(score_data.score, 0)) / SUM(IFNULL(s.total_score, 0)) * 100, 1)
            END AS completion_percent
          FROM course_map_story s
          LEFT JOIN (
            SELECT
              story_id,
              MAX(IFNULL(score, 0)) AS score
            FROM course_student_work
            WHERE student_id = ?
              AND course_id = ?
              AND deleted = 0
            GROUP BY story_id
          ) AS score_data ON score_data.story_id = s.id
          WHERE s.course_id = ?
            AND s.deleted = 0
          GROUP BY s.story_type
          ORDER BY ability_id`;
        rows = await sequelize.query(fallbackSql, {
          replacements: [userId, courseId, courseId],
          type: QueryTypes.SELECT
        });
      }

      const formatted = rows.map((row) => {
        const abilityId =
          row.ability_id === undefined || row.ability_id === null
            ? null
            : Number(row.ability_id);
        const baseCompletionPercent = Number(row.completion_percent || 0);
        const goalLevel = (row.goal_level || '').toUpperCase();
        const totalTasks = Number(row.total_tasks || 0);
        const finishedTasks = Number(row.finished_tasks || 0);
        const achievedScore = Number(row.achieved_score || 0);
        const maxScore = Number(row.max_score || 0);

        // 根据 goal_level 使用不同的计算公式
        let adjustedCompletionPercent = baseCompletionPercent;
        let calculationMethod = 'standard';
        let threshold = 0;

        if (goalLevel === 'H') {
          // H (High): 高优先级 - 使用加权计算，要求更高完成度
          // 公式：基础完成度 * 1.15，但不超过100%，且需要达到80%才算合格
          adjustedCompletionPercent = Math.min(baseCompletionPercent * 1.15, 100);
          calculationMethod = 'weighted_high';
          threshold = 80;
        } else if (goalLevel === 'M') {
          // M (Medium): 中等优先级 - 标准计算
          // 公式：标准完成度，需要达到70%才算合格
          adjustedCompletionPercent = baseCompletionPercent;
          calculationMethod = 'standard';
          threshold = 70;
        } else if (goalLevel === 'L') {
          // L (Low): 低优先级 - 使用降权计算，但要求较低
          // 公式：基础完成度 * 0.95，需要达到60%才算合格
          adjustedCompletionPercent = Math.min(baseCompletionPercent * 0.95, 100);
          calculationMethod = 'weighted_low';
          threshold = 60;
        } else {
          // 未设置级别：使用标准计算
          adjustedCompletionPercent = baseCompletionPercent;
          calculationMethod = 'standard';
          threshold = 70;
        }

        return {
          // 下划线命名（兼容性）
          ability_id: abilityId,
          ability_name: row.ability_name,
          goal_level: row.goal_level,
          total_tasks: totalTasks,
          finished_tasks: finishedTasks,
          achieved_score: achievedScore,
          max_score: maxScore,
          completion_percent: adjustedCompletionPercent, // 使用调整后的完成度
          threshold: threshold, // 合格阈值
          // 驼峰命名（前端友好）
          abilityId: abilityId,
          abilityName: row.ability_name,
          goalLevel: row.goal_level,
          totalTasks: totalTasks,
          finishedTasks: finishedTasks,
          achievedScore: achievedScore,
          maxScore: maxScore,
          completionPercent: adjustedCompletionPercent, // 使用调整后的完成度
          threshold: threshold, // 合格阈值
          achievementRate: adjustedCompletionPercent / 100 // 0-1 范围的达成率
        };
      });

      return res.json(formatted);
    } catch (err) {
      return res.status(500).json({ message: '课程能力达成度获取失败', error: err.message });
    }
  }
};
