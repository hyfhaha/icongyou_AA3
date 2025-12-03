const sequelize = require('../config/database');
const User = require('./user');
const Course = require('./course');
const Story = require('./story');
const CourseStudentWork = require('./courseStudentWork');
const TaskView = require('./taskView');
const Discussion = require('./discussion');
const Message = require('./message');
const Conversation = require('./conversation');
const ReadReceipt = require('./readReceipt');

module.exports = {
  sequelize,
  User,
  Course,
  Story,
  CourseStudentWork,
  TaskView,
  Discussion,
  Message,
  Conversation,
  ReadReceipt
};
