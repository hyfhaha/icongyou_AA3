const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class Discussion extends Model {}

Discussion.init(
  {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    story_id: DataTypes.BIGINT,
    course_id: DataTypes.BIGINT,
    user_id: DataTypes.BIGINT,
    user_name: DataTypes.STRING,
    content: DataTypes.TEXT,
    likes: DataTypes.INTEGER,
    reply_to: DataTypes.BIGINT,
    creator: DataTypes.STRING,
    create_time: DataTypes.DATE,
    updater: DataTypes.STRING,
    update_time: DataTypes.DATE,
    deleted: DataTypes.BOOLEAN,
    tenant_id: DataTypes.BIGINT
  },
  {
    sequelize,
    modelName: 'discussion',
    tableName: 'discussions',
    timestamps: false
  }
);

module.exports = Discussion;


