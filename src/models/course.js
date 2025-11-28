const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');
class Course extends Model {}
Course.init({
  course_id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  invite_code: DataTypes.STRING,
  start_time: DataTypes.DATE,
  end_time: DataTypes.DATE,
  prev_course: DataTypes.STRING,
  course_name: DataTypes.STRING,
  course_desc: DataTypes.STRING(2000),
  course_type: DataTypes.INTEGER,
  course_pic: DataTypes.STRING,
  course_hour: DataTypes.INTEGER,
  course_faculties: DataTypes.STRING,
  standard_team_num: DataTypes.INTEGER,
  teacher_ids: DataTypes.STRING,
  teacher_names: DataTypes.STRING,
  student_allow_team: DataTypes.BOOLEAN,
  student_allow_join: DataTypes.BOOLEAN,
  lesson_status: DataTypes.INTEGER,
  show_score: DataTypes.BOOLEAN,
  dept_id: DataTypes.BIGINT,
  user_id: DataTypes.BIGINT,
  creator: DataTypes.STRING,
  create_time: DataTypes.DATE,
  updater: DataTypes.STRING,
  update_time: DataTypes.DATE,
  deleted: DataTypes.BOOLEAN,
  tenant_id: DataTypes.BIGINT
}, { sequelize, modelName: 'course', tableName: 'course', timestamps: false });
module.exports = Course;
