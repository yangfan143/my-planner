// src/db/schema.js
const Database = require('better-sqlite3');

// 数据库文件路径（在用户数据目录中）
const path = require('path');
const { app } = require('electron');

const dbPath = path.join(app.getPath('userData'), 'planner.db');

function initDatabase() {
  // 连接数据库，如果不存在则会创建
  const db = new Database(dbPath);

  try {
    // 开启外键支持
    db.pragma('foreign_keys = ON');

    // 创建笔记本表
    db.exec(`
      CREATE TABLE IF NOT EXISTS notebooks (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 创建笔记表
    db.exec(`
      CREATE TABLE IF NOT EXISTS notes (
        id TEXT PRIMARY KEY,
        notebook_id TEXT,
        title TEXT NOT NULL,
        content TEXT,
        tags TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (notebook_id) REFERENCES notebooks (id) ON DELETE SET NULL
      )
    `);

    // 创建任务表
    db.exec(`
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        due_date DATETIME,
        priority INTEGER DEFAULT 0,
        status INTEGER DEFAULT 0,
        tags TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 创建日历事件表
    db.exec(`
      CREATE TABLE IF NOT EXISTS events (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        start_date DATETIME NOT NULL,
        end_date DATETIME,
        description TEXT,
        related_id TEXT,
        related_type TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('数据库初始化成功');
  } catch (error) {
    console.error('数据库初始化失败:', error);
  } finally {
    db.close();
  }
}

module.exports = initDatabase;