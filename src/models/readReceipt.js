const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class ReadReceipt extends Model {}

ReadReceipt.init(
  {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    conversation_id: { type: DataTypes.STRING(128), allowNull: false },
    user_id: { type: DataTypes.BIGINT, allowNull: false },
    last_read_msg_id: { type: DataTypes.BIGINT, allowNull: false },
    tenant_id: { type: DataTypes.BIGINT, defaultValue: 0, allowNull: false },
    update_time: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  },
  {
    sequelize,
    modelName: 'readReceipt',
    tableName: 'read_receipt',
    timestamps: false
  }
);

module.exports = ReadReceipt;

