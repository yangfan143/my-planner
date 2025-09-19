const Database = require('better-sqlite3');
const path = require('path');
const { app } = require('electron');

// 数据库文件路径
const dbPath = path.join(app.getPath('userData'), 'planner.db');

let dbInstance = null;

function getDatabase() {
  if (!dbInstance) {
    try {
      dbInstance = new Database(dbPath);
      console.log('数据库连接成功');
    } catch (error) {
      console.error('数据库连接失败:', error);
      throw error;
    }
  }
  return dbInstance;
}

function closeDatabase() {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
    console.log('数据库连接已关闭');
  }
}

module.exports = {
  getDatabase,
  closeDatabase
};