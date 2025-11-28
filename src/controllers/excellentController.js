const { CourseStudentWork, sequelize } = require('../models');
const { QueryTypes } = require('sequelize');

module.exports = {
  async listExcellent(req, res) {
    try {
      const storyId = req.params.storyId || req.params.taskId;
      const userId = req.user && req.user.id;

      const works = await CourseStudentWork.findAll({
        where: { story_id: storyId, recommend: 1, deleted: 0 },
        order: [['recommend_rank', 'DESC'], ['score', 'DESC']]
      });

      // 默认未登录用户（理论上不会发生，因为路由有鉴权），直接返回原始数据
      if (!userId) {
        return res.json(
          works.map((w) => ({
            ...w.toJSON(),
            liked: false,
            favorited: false
          }))
        );
      }

      const workIds = works.map((w) => w.id);
      if (!workIds.length) {
        return res.json([]);
      }

      // 查询当前用户对这些作业的点赞/收藏状态
      const likeRows = await sequelize.query(
        `
        SELECT work_id
        FROM course_student_work_like
        WHERE work_id IN (:ids)
          AND user_id = :userId
          AND deleted = 0
        `,
        {
          replacements: { ids: workIds, userId },
          type: QueryTypes.SELECT
        }
      );
      const favRows = await sequelize.query(
        `
        SELECT work_id
        FROM course_student_work_favorite
        WHERE work_id IN (:ids)
          AND user_id = :userId
          AND deleted = 0
        `,
        {
          replacements: { ids: workIds, userId },
          type: QueryTypes.SELECT
        }
      );

      const likedSet = new Set(likeRows.map((r) => String(r.work_id)));
      const favSet = new Set(favRows.map((r) => String(r.work_id)));

      const result = works.map((w) => {
        const json = w.toJSON();
        const idStr = String(json.id);
        const bookmarked = favSet.has(idStr);
        return {
          ...json,
          liked: likedSet.has(idStr),
          // 对齐文档中的字段名，同时保留 favorited 以兼容旧前端
          bookmarked,
          favorited: bookmarked
        };
      });

      return res.json(result);
    } catch (err) {
      return res.status(500).json({ message: '优秀作业列表获取失败', error: err.message });
    }
  },

  async like(req, res) {
    try {
      const workId = req.params.workId;
      const userId = req.user && req.user.id;
      if (!userId) {
        return res.status(401).json({ message: '未登录或登录已过期' });
      }

      const work = await CourseStudentWork.findOne({
        where: { id: workId, deleted: 0 }
      });
      if (!work) {
        return res.status(404).json({ message: '作业不存在' });
      }

      // 查询是否已点赞
      const [row] = await sequelize.query(
        `
        SELECT id, deleted
        FROM course_student_work_like
        WHERE work_id = ?
          AND user_id = ?
        LIMIT 1
        `,
        {
          replacements: [workId, userId],
          type: QueryTypes.SELECT
        }
      );

      let liked;

      if (!row || row.deleted) {
        // 目前视为「未点赞」 => 执行点赞
        if (!row) {
          await sequelize.query(
            `
            INSERT INTO course_student_work_like (work_id, story_id, user_id, deleted, tenant_id)
            VALUES (?, ?, ?, 0, ?)
            `,
            {
              replacements: [work.id, work.story_id, userId, work.tenant_id || 0],
              type: QueryTypes.INSERT
            }
          );
        } else {
          await sequelize.query(
            'UPDATE course_student_work_like SET deleted = 0 WHERE id = ?',
            { replacements: [row.id], type: QueryTypes.UPDATE }
          );
        }

        // 原子地增加点赞计数
        await sequelize.query(
          `
          UPDATE course_student_work
          SET like_count = COALESCE(like_count, 0) + 1
          WHERE id = ?
          `,
          { replacements: [workId], type: QueryTypes.UPDATE }
        );
        liked = true;
      } else {
        // 已点赞 => 取消点赞
        await sequelize.query(
          'UPDATE course_student_work_like SET deleted = 1 WHERE id = ?',
          { replacements: [row.id], type: QueryTypes.UPDATE }
        );
        await sequelize.query(
          `
          UPDATE course_student_work
          SET like_count = GREATEST(COALESCE(like_count, 0) - 1, 0)
          WHERE id = ?
          `,
          { replacements: [workId], type: QueryTypes.UPDATE }
        );
        liked = false;
      }

      const [countRow] = await sequelize.query(
        'SELECT like_count FROM course_student_work WHERE id = ?',
        { replacements: [workId], type: QueryTypes.SELECT }
      );

      return res.json({
        message: liked ? '点赞成功' : '已取消点赞',
        liked,
        like_count: Number((countRow && countRow.like_count) || 0)
      });
    } catch (err) {
      return res.status(500).json({ message: '点赞操作失败', error: err.message });
    }
  },

  async bookmark(req, res) {
    try {
      const workId = req.params.workId;
      const userId = req.user && req.user.id;
      if (!userId) {
        return res.status(401).json({ message: '未登录或登录已过期' });
      }

      const work = await CourseStudentWork.findOne({
        where: { id: workId, deleted: 0 }
      });
      if (!work) {
        return res.status(404).json({ message: '作业不存在' });
      }

      // 查询是否已收藏
      const [row] = await sequelize.query(
        `
        SELECT id, deleted
        FROM course_student_work_favorite
        WHERE work_id = ?
          AND user_id = ?
        LIMIT 1
        `,
        {
          replacements: [workId, userId],
          type: QueryTypes.SELECT
        }
      );

      let favorited;

      if (!row || row.deleted) {
        // 当前为未收藏 => 执行收藏
        if (!row) {
          await sequelize.query(
            `
            INSERT INTO course_student_work_favorite (work_id, story_id, user_id, deleted, tenant_id)
            VALUES (?, ?, ?, 0, ?)
            `,
            {
              replacements: [work.id, work.story_id, userId, work.tenant_id || 0],
              type: QueryTypes.INSERT
            }
          );
        } else {
          await sequelize.query(
            'UPDATE course_student_work_favorite SET deleted = 0 WHERE id = ?',
            { replacements: [row.id], type: QueryTypes.UPDATE }
          );
        }

        await sequelize.query(
          `
          UPDATE course_student_work
          SET favorite_count = COALESCE(favorite_count, 0) + 1
          WHERE id = ?
          `,
          { replacements: [workId], type: QueryTypes.UPDATE }
        );

        favorited = true;
      } else {
        // 已收藏 => 取消收藏
        await sequelize.query(
          'UPDATE course_student_work_favorite SET deleted = 1 WHERE id = ?',
          { replacements: [row.id], type: QueryTypes.UPDATE }
        );
        await sequelize.query(
          `
          UPDATE course_student_work
          SET favorite_count = GREATEST(COALESCE(favorite_count, 0) - 1, 0)
          WHERE id = ?
          `,
          { replacements: [workId], type: QueryTypes.UPDATE }
        );

        favorited = false;
      }

      const [countRow] = await sequelize.query(
        'SELECT favorite_count FROM course_student_work WHERE id = ?',
        { replacements: [workId], type: QueryTypes.SELECT }
      );

      const favoriteCount = Number((countRow && countRow.favorite_count) || 0);

      return res.json({
        message: favorited ? '收藏成功' : '已取消收藏',
        // 文档使用 bookmarked，额外返回 favorited/favorite_count 兼容历史代码
        bookmarked: favorited,
        favorited,
        favorite_count: favoriteCount
      });
    } catch (err) {
      return res.status(500).json({ message: '收藏操作失败', error: err.message });
    }
  },

  // POST /api/excellent/:workId/set
  async setRecommend(req, res) {
    try {
      if (!req.user || req.user.user_role === 0) {
        return res.status(403).json({ message: '权限不足，仅教师/助教可设置优秀作业' });
      }
      const workId = req.params.workId;
      const { recommend_rank } = req.body || {};
      const work = await CourseStudentWork.findOne({ where: { id: workId, deleted: 0 } });
      if (!work) return res.status(404).json({ message: '作业不存在' });

      work.recommend = 1;
      if (recommend_rank !== undefined) {
        work.recommend_rank = recommend_rank;
      }
      work.updater = req.user.username || work.updater;
      work.update_time = new Date();
      await work.save();

      return res.json({ message: '设置优秀作业成功', work });
    } catch (err) {
      return res.status(500).json({ message: '设置优秀作业失败', error: err.message });
    }
  },

  // POST /api/excellent/:workId/unset
  async unsetRecommend(req, res) {
    try {
      if (!req.user || req.user.user_role === 0) {
        return res.status(403).json({ message: '权限不足，仅教师/助教可取消优秀作业' });
      }
      const workId = req.params.workId;
      const work = await CourseStudentWork.findOne({ where: { id: workId, deleted: 0 } });
      if (!work) return res.status(404).json({ message: '作业不存在' });

      work.recommend = 0;
      work.recommend_rank = null;
      work.updater = req.user.username || work.updater;
      work.update_time = new Date();
      await work.save();

      return res.json({ message: '取消优秀作业成功', work });
    } catch (err) {
      return res.status(500).json({ message: '取消优秀作业失败', error: err.message });
    }
  }
};
