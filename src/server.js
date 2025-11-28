const app = require('./app');
const { sequelize, User, Course } = require('./models');
const { QueryTypes } = require('sequelize');
const port = process.env.PORT || 3000;

(async () => {
  try {
    await sequelize.authenticate();
    console.log('DB connected');

    // --- 数据修复与临时测试 ---
    console.log('\n--- [Data Fix & Test Start] ---');

    // 强制修复课程数据，确保 deleted = 0
    console.log('Force updating courses 1 and 2 to ensure deleted = 0...');
    await Course.bulkCreate([
      {
        course_id: 1,
        course_name: '软件工程实践',
        deleted: 0
      },
      {
        course_id: 2,
        course_name: '数据结构与算法',
        deleted: 0
      }
    ], { 
      updateOnDuplicate: ['deleted', 'course_name'] // 如果已存在，则更新 deleted 和 course_name 字段
    });
    console.log('Course data fixed.');

    // 1. 控制台输出课程列表
    console.log('\n1. Fetching all courses (with deleted=0)...');
    const allCourses = await Course.findAll({ where: { deleted: 0 } });
    console.log(JSON.stringify(allCourses.map(c => c.toJSON()), null, 2));

    // 2. 检查 course_id=1 和 student_id=1 是否有关联
    console.log('\n2. Checking association for course_id=1 and student_id=1...');
    const association = await sequelize.query(
      'SELECT * FROM course_student WHERE course_id = 1 AND student_id = 1 AND deleted = 0',
      { type: QueryTypes.SELECT }
    );
    if (association.length > 0) {
      console.log('  => YES, an association exists.');
    } else {
      console.log('  => NO, association not found.');
    }

    console.log('--- [Data Fix & Test End] ---\n');

  } catch (err) {
    console.warn('DB connect failed or test code failed:', err.message);
  }
  app.listen(port, () => console.log(`Server running on ${port}`));
})();
