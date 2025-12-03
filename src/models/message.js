const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class Message extends Model {}

Message.init(
  {
    msg_id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    conversation_id: { type: DataTypes.STRING(128), allowNull: false },
    sender_id: { type: DataTypes.BIGINT, allowNull: false },
    receiver_id: { type: DataTypes.BIGINT, allowNull: false },
    content: { type: DataTypes.TEXT, allowNull: false },
    content_type: { type: DataTypes.STRING(20), defaultValue: 'text', allowNull: false },
    status: { type: DataTypes.TINYINT, defaultValue: 1, allowNull: false }, // 1正常 2撤回 3删除
    timestamp_ms: { type: DataTypes.BIGINT, allowNull: false },
    tenant_id: { type: DataTypes.BIGINT, defaultValue: 0, allowNull: false },
    recall_by: { type: DataTypes.BIGINT, allowNull: true },
    recall_time: { type: DataTypes.BIGINT, allowNull: true },
    create_time: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    update_time: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  },
  {
    sequelize,
    modelName: 'message',
    tableName: 'message', // 注意这里表名变成了单数 message
    timestamps: false
  }
);

module.exports = Message;
