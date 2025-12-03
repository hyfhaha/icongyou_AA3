const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class Conversation extends Model {}

Conversation.init(
  {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    conversation_id: { type: DataTypes.STRING(128), allowNull: false, unique: 'uk_conv' },
    user_a: { type: DataTypes.BIGINT, allowNull: false },
    user_b: { type: DataTypes.BIGINT, allowNull: false },
    last_msg_id: { type: DataTypes.BIGINT, allowNull: true },
    last_msg_content: { type: DataTypes.STRING(1000), defaultValue: '' },
    last_msg_time: { type: DataTypes.BIGINT, allowNull: true },
    unread_a: { type: DataTypes.INTEGER, defaultValue: 0, allowNull: false },
    unread_b: { type: DataTypes.INTEGER, defaultValue: 0, allowNull: false },
    tenant_id: { type: DataTypes.BIGINT, defaultValue: 0, allowNull: false },
    deleted: { type: DataTypes.BOOLEAN, defaultValue: false, allowNull: false },
    create_time: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    update_time: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  },
  {
    sequelize,
    modelName: 'conversation',
    tableName: 'conversation',
    timestamps: false
  }
);

module.exports = Conversation;

