require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'icongyou',
  process.env.DB_USER || 'root',
  process.env.DB_PASS || '36qQ9!:q4SNXdrE',
  {
    host: process.env.DB_HOST || 'bj-cynosdbmysql-grp-7d90jsc8.sql.tencentcdb.com',
    port: process.env.DB_PORT || 23992,
  dialect: 'mysql',
    timezone: '+08:00',
  logging: false,
  dialectOptions: {
      dateStrings: true,
      typeCast: true,
      allowPublicKeyRetrieval: true
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
  }
  }
);

module.exports = sequelize;
