const { sequelize } = require('../models');
const { QueryTypes } = require('sequelize');

module.exports = {
  // GET /api/view/course-students?course_id=
  async getCourseStudentsView(req, res) {
    try {
      const courseId = req.query.course_id;
      if (!courseId) {
        return res.status(400).json({ message: 'course_id 参数必填' });
      }

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
            v.student_id,
            u.username,
            u.nickname,
            IFNULL(v.total_score, 0) AS total_score,
            IFNULL(v.tasks_done, 0) AS tasks_done,
            @rownum := @rownum + 1 AS rank
          FROM (SELECT @rownum := 0) AS vars,
               (
                 SELECT
                   course_id,
                   student_id,
                   SUM(IFNULL(score, 0)) AS total_score,
                   COUNT(DISTINCT story_id) AS tasks_done
                 FROM course_student_work
                 WHERE deleted = 0
                 GROUP BY course_id, student_id
               ) AS v
          JOIN \`user\` u ON u.id = v.student_id
          WHERE v.course_id = ?
          ORDER BY total_score DESC, student_id ASC
        ) AS ranked
        ORDER BY ranked.rank ASC`;

      const rows = await sequelize.query(sql, {
        replacements: [courseId],
        type: QueryTypes.SELECT
      });

      const formatted = rows.map((row) => ({
        student_id: row.student_id,
        username: row.username,
        nickname: row.nickname,
        total_score: Number(row.total_score || 0),
        tasks_done: Number(row.tasks_done || 0),
        rank: Number(row.rank || 0)
      }));

      return res.json({
        course_id: Number(courseId),
        items: formatted
      });
    } catch (err) {
      return res.status(500).json({ message: '课程学生视图获取失败', error: err.message });
    }
  },

  // GET /api/view/task-submission?story_id=
  async getTaskSubmissionView(req, res) {
    try {
      const storyId = req.query.story_id;
      if (!storyId) {
        return res.status(400).json({ message: 'story_id 参数必填' });
      }

      const row = await sequelize.query(
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
      ).then((rows) => rows[0] || null);

      if (!row) {
        return res.json({
          story_id: Number(storyId),
          submitted_students: 0,
          submissions_count: 0,
          recommend_count: 0,
          avg_score: 0
        });
      }

      return res.json({
        story_id: Number(row.story_id),
        submitted_students: Number(row.submitted_students || 0),
        submissions_count: Number(row.submissions_count || 0),
        recommend_count: Number(row.recommend_count || 0),
        avg_score: row.avg_score !== null ? Number(row.avg_score) : null
      });
    } catch (err) {
      return res.status(500).json({ message: '任务提交统计获取失败', error: err.message });
    }
  }
};


