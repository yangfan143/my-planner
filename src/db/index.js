const Database = require('better-sqlite3');
const path = require('path');

class DB {
  constructor() {
    this.dbPath = path.join(__dirname, '../../data.db');
    this.db = null;
  }

  connect() {
    try {
      this.db = new Database(this.dbPath);
      this.db.pragma('journal_mode = WAL'); // 提高性能
      console.log('Connected to SQLite database with better-sqlite3');
      return this.db;
    } catch (error) {
      console.error('Error connecting to database:', error);
      throw error;
    }
  }

  disconnect() {
    if (this.db) {
      this.db.close();
      console.log('Disconnected from SQLite database');
    }
  }

  // 执行 SQL 语句（INSERT, UPDATE, DELETE）
  run(sql, params = []) {
    try {
      const stmt = this.db.prepare(sql);
      const result = stmt.run(params);
      return result;
    } catch (error) {
      console.error('Error running SQL:', error);
      throw error;
    }
  }

  // 获取单条记录
  get(sql, params = []) {
    try {
      const stmt = this.db.prepare(sql);
      return stmt.get(params);
    } catch (error) {
      console.error('Error getting data:', error);
      throw error;
    }
  }

  // 获取所有记录
  all(sql, params = []) {
    try {
      const stmt = this.db.prepare(sql);
      return stmt.all(params);
    } catch (error) {
      console.error('Error getting all data:', error);
      throw error;
    }
  }
}

// 创建单例实例
const dbInstance = new DB();
module.exports = dbInstance;