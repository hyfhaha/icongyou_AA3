const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class Message extends Model {}

Message.init(
  {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    sender_id: DataTypes.BIGINT,
    receiver_id: DataTypes.BIGINT,
    content: DataTypes.TEXT,
    is_read: DataTypes.BOOLEAN,
    creator: DataTypes.STRING,
    create_time: DataTypes.DATE,
    updater: DataTypes.STRING,
    update_time: DataTypes.DATE,
    deleted: DataTypes.BOOLEAN,
    tenant_id: DataTypes.BIGINT
  },
  {
    sequelize,
    modelName: 'message',
    tableName: 'messages',
    timestamps: false
  }
);

module.exports = Message;


