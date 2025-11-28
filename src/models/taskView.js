const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class TaskView extends Model {}

TaskView.init(
  {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    story_id: DataTypes.BIGINT,
    course_id: DataTypes.BIGINT,
    user_id: DataTypes.BIGINT,
    views: DataTypes.INTEGER,
    first_view_time: DataTypes.DATE,
    last_view_time: DataTypes.DATE,
    tenant_id: DataTypes.BIGINT
  },
  {
    sequelize,
    modelName: 'taskView',
    tableName: 'task_views',
    timestamps: false
  }
);

module.exports = TaskView;


