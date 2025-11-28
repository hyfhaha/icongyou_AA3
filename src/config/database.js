require('dotenv').config();
const { Sequelize } = require('sequelize');
const sequelize = new Sequelize(process.env.DB_NAME || 'learning_app', process.env.DB_USER || 'root', process.env.DB_PASS || 'Wn810628', {
  host: process.env.DB_HOST || 'localhost',
  dialect: 'mysql',
  logging: false,
  dialectOptions: {
    // add if needed
  }
});
module.exports = sequelize;
