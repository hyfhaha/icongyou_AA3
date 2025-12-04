const sequelize = require('./src/config/database');

async function testConnection() {
  try {
    console.log('正在尝试连接云数据库...');
    console.log(`Host: ${sequelize.config.host}`);
    console.log(`Port: ${sequelize.config.port}`);
    console.log(`Database: ${sequelize.config.database}`);
    
    await sequelize.authenticate();
    console.log('✅ 成功连接到云数据库！');
    
    // 简单的查询测试
    const [results] = await sequelize.query('SELECT 1 + 1 AS result');
    console.log('测试查询结果:', results[0].result === 2 ? '正常' : '异常');
    
  } catch (error) {
    console.error('❌ 无法连接到数据库:', error);
  } finally {
    await sequelize.close();
  }
}

testConnection();


