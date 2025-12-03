const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');
class User extends Model {}
User.init({
  id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  username: DataTypes.STRING,
  password_hash: DataTypes.STRING,
  nickname: DataTypes.STRING,
  remark: DataTypes.STRING,
  dept_id: DataTypes.BIGINT,
  post_ids: DataTypes.STRING,
  email: DataTypes.STRING,
  phone_number: DataTypes.STRING,
  job_number: DataTypes.STRING,
  user_role: DataTypes.TINYINT,
  gender: DataTypes.TINYINT,
  avatar_url: DataTypes.STRING,
  status: DataTypes.TINYINT,
  login_ip: DataTypes.STRING,
  login_date: DataTypes.DATE,
  balance: DataTypes.DECIMAL(10,2),
  create_time: DataTypes.DATE,
  update_time: DataTypes.DATE,
  deleted: DataTypes.TINYINT,
  tenant_id: DataTypes.BIGINT,
  company_id: DataTypes.INTEGER
}, { sequelize, modelName: 'user', tableName: 'user', timestamps: false });
module.exports = User;
