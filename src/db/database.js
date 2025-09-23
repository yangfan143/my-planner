const Database = require('better-sqlite3');
const path = require('path');
const { app } = require('electron');
let uuidv4;

// 使用异步IIFE加载ES模块uuid
(async () => {
  try {
    const uuidModule = await import('uuid');
    uuidv4 = uuidModule.v4;
  } catch (error) {
    console.error('Failed to load uuid module:', error);
    // 降级方案：如果动态导入失败，尝试同步导入
    try {
      uuidv4 = require('uuid').v4;
    } catch (fallbackError) {
      console.error('Failed to load uuid module with fallback:', fallbackError);
    }
  }
})();

class PlannerDatabase {
  constructor() {
    const dbPath = path.join(app.getPath('userData'), 'planner.db');
    this.db = new Database(dbPath);
    this.init();
  }

  init() {
    // 启用外键约束
    this.db.pragma('foreign_keys = ON');
    
    // 创建表
    this.createTables();
  }

  createTables() {
    // 笔记本表
    this.db.exec(`CREATE TABLE IF NOT EXISTS notebooks (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // 笔记表
    this.db.exec(`CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY,
      notebook_id TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT,
      tags TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (notebook_id) REFERENCES notebooks (id) ON DELETE CASCADE
    )`);
// 任务表
this.db.exec(`CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATETIME,
  priority INTEGER DEFAULT 0,
  status INTEGER DEFAULT 0,
  tags TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

// 子任务表
this.db.exec(`CREATE TABLE IF NOT EXISTS subtasks (
  id TEXT PRIMARY KEY,
  task_id TEXT NOT NULL,
  title TEXT NOT NULL,
  completed INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (task_id) REFERENCES tasks (id) ON DELETE CASCADE
)`);

// 创建索引以提高查询性能
this.db.exec('CREATE INDEX IF NOT EXISTS idx_subtasks_task_id ON subtasks(task_id)');

    // 创建索引以提高查询性能
    this.db.exec('CREATE INDEX IF NOT EXISTS idx_notes_notebook_id ON notes(notebook_id)');
    this.db.exec('CREATE INDEX IF NOT EXISTS idx_notes_updated_at ON notes(updated_at)');
  }

  // 笔记本操作
  getAllNotebooks() {
    const stmt = this.db.prepare(`
      SELECT n.*, COUNT(notes.id) as note_count 
      FROM notebooks n 
      LEFT JOIN notes ON n.id = notes.notebook_id 
      GROUP BY n.id 
      ORDER BY n.updated_at DESC
    `);
    return stmt.all();
  }

  getNotebookById(id) {
    const stmt = this.db.prepare('SELECT * FROM notebooks WHERE id = ?');
    return stmt.get(id);
  }

  async createNotebook(name) {
   if (!uuidv4) {
    // 可以在这里等待一下，或者用更好的方式处理模块加载时序
    await new Promise(resolve => setTimeout(resolve, 50)); // 简单示例，实际可能需要更严谨的逻辑
  }
  const id = uuidv4(); 
    const now = new Date().toISOString();
    
    const stmt = this.db.prepare(`
      INSERT INTO notebooks (id, name, created_at, updated_at) 
      VALUES (?, ?, ?, ?)
    `);
    
    const result = stmt.run(id, name, now, now);
    return result.changes > 0 ? { id, name, note_count: 0 } : null;
  }

  updateNotebook(id, name) {
    const stmt = this.db.prepare(`
      UPDATE notebooks SET name = ?, updated_at = ? WHERE id = ?
    `);
    
    const result = stmt.run(name, new Date().toISOString(), id);
    return result.changes > 0;
  }

  deleteNotebook(id) {
    const stmt = this.db.prepare('DELETE FROM notebooks WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  // 笔记操作
  getNotesByNotebook(notebookId) {
    const stmt = this.db.prepare(`
      SELECT * FROM notes 
      WHERE notebook_id = ? 
      ORDER BY updated_at DESC
    `);
    return stmt.all(notebookId);
  }

  getAllNotes() {
    const stmt = this.db.prepare('SELECT * FROM notes ORDER BY updated_at DESC');
    return stmt.all();
  }

  getNoteById(id) {
    const stmt = this.db.prepare('SELECT * FROM notes WHERE id = ?');
    return stmt.get(id);
  }

  createNote(notebookId, title, content = '', tags = []) {
    const id = uuidv4();
    const now = new Date().toISOString();
    
    const stmt = this.db.prepare(`
      INSERT INTO notes (id, notebook_id, title, content, tags, created_at, updated_at) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      id, 
      notebookId, 
      title, 
      content, 
      JSON.stringify(tags), 
      now, 
      now
    );
    
    return result.changes > 0 ? this.getNoteById(id) : null;
  }

  updateNote(id, updates) {
    const fields = [];
    const values = [];
    
    if (updates.title !== undefined) {
      fields.push('title = ?');
      values.push(updates.title);
    }
    
    if (updates.content !== undefined) {
      fields.push('content = ?');
      values.push(updates.content);
    }
    
    if (updates.tags !== undefined) {
      fields.push('tags = ?');
      values.push(JSON.stringify(updates.tags));
    }
    
    if (updates.notebook_id !== undefined) {
      fields.push('notebook_id = ?');
      values.push(updates.notebook_id);
    }
    
    // 总是更新updated_at
    fields.push('updated_at = ?');
    values.push(new Date().toISOString());
    
    values.push(id);
    
    const stmt = this.db.prepare(`
      UPDATE notes SET ${fields.join(', ')} WHERE id = ?
    `);
    
    const result = stmt.run(...values);
    return result.changes > 0 ? this.getNoteById(id) : null;
  }

  deleteNote(id) {
    const stmt = this.db.prepare('DELETE FROM notes WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  searchNotes(query) {
    const stmt = this.db.prepare(`
      SELECT * FROM notes 
      WHERE title LIKE ? OR content LIKE ? 
      ORDER BY updated_at DESC
    `);
    
    const searchTerm = `%${query}%`;
    return stmt.all(searchTerm, searchTerm);
  }

  // 任务操作
  getAllTasks() {
    const stmt = this.db.prepare(`
      SELECT * FROM tasks 
      ORDER BY updated_at DESC
    `);
    return stmt.all();
  }

  getTaskById(id) {
    const stmt = this.db.prepare('SELECT * FROM tasks WHERE id = ?');
    return stmt.get(id);
  }

  createTask({ title, description = '', dueDate = null, priority = 0, status = 0, tags = [] }) {
    // 确保uuidv4已加载
    if (!uuidv4) {
      try {
        uuidv4 = require('uuid').v4;
      } catch (error) {
        console.error('Failed to load uuid synchronously:', error);
        throw new Error('UUID generator not available');
      }
    }
    const id = uuidv4();
    const now = new Date().toISOString();
    
    const stmt = this.db.prepare(`
      INSERT INTO tasks (id, title, description, due_date, priority, status, tags, created_at, updated_at) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      id, 
      title, 
      description, 
      dueDate, 
      priority, 
      status, 
      JSON.stringify(tags), 
      now, 
      now
    );
    
    return result.changes > 0 ? this.getTaskById(id) : null;
  }

  updateTask(id, updates) {
    const fields = [];
    const values = [];
    
    if (updates.title !== undefined) {
      fields.push('title = ?');
      values.push(updates.title);
    }
    
    if (updates.description !== undefined) {
      fields.push('description = ?');
      values.push(updates.description);
    }
    
    if (updates.dueDate !== undefined) {
      fields.push('due_date = ?');
      values.push(updates.dueDate);
    }
    
    if (updates.priority !== undefined) {
      fields.push('priority = ?');
      values.push(updates.priority);
    }
    
    if (updates.status !== undefined) {
      fields.push('status = ?');
      values.push(updates.status);
    }
    
    if (updates.tags !== undefined) {
      fields.push('tags = ?');
      values.push(JSON.stringify(updates.tags));
    }
    
    // 总是更新updated_at
    fields.push('updated_at = ?');
    values.push(new Date().toISOString());
    
    values.push(id);
    
    const stmt = this.db.prepare(`
      UPDATE tasks SET ${fields.join(', ')} WHERE id = ?
    `);
    
    const result = stmt.run(...values);
    return result.changes > 0 ? this.getTaskById(id) : null;
  }

  deleteTask(id) {
    const stmt = this.db.prepare('DELETE FROM tasks WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  // 子任务操作
  getSubtasksByTaskId(taskId) {
    const stmt = this.db.prepare(`
      SELECT * FROM subtasks 
      WHERE task_id = ? 
      ORDER BY created_at ASC
    `);
    return stmt.all(taskId);
  }

  createSubtask({ taskId, title, completed = 0 }) {
    // 确保uuidv4已加载
    if (!uuidv4) {
      try {
        uuidv4 = require('uuid').v4;
      } catch (error) {
        console.error('Failed to load uuid synchronously:', error);
        throw new Error('UUID generator not available');
      }
    }
    const id = uuidv4();
    const now = new Date().toISOString();
    
    const stmt = this.db.prepare(`
      INSERT INTO subtasks (id, task_id, title, completed, created_at, updated_at) 
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      id, 
      taskId, 
      title, 
      completed, 
      now, 
      now
    );
    
    return result.changes > 0 ? this.getSubtaskById(id) : null;
  }

  getSubtaskById(id) {
    const stmt = this.db.prepare('SELECT * FROM subtasks WHERE id = ?');
    return stmt.get(id);
  }

  updateSubtask(id, updates) {
    const fields = [];
    const values = [];
    
    if (updates.title !== undefined) {
      fields.push('title = ?');
      values.push(updates.title);
    }
    
    if (updates.completed !== undefined) {
      fields.push('completed = ?');
      values.push(updates.completed);
    }
    
    // 总是更新updated_at
    fields.push('updated_at = ?');
    values.push(new Date().toISOString());
    
    values.push(id);
    
    const stmt = this.db.prepare(`
      UPDATE subtasks SET ${fields.join(', ')} WHERE id = ?
    `);
    
    const result = stmt.run(...values);
    return result.changes > 0 ? this.getSubtaskById(id) : null;
  }

  deleteSubtask(id) {
    const stmt = this.db.prepare('DELETE FROM subtasks WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  // 获取笔记本及其所有笔记
 getNotebooksWithNotes() {
    const notebooks = this.getAllNotebooks();
    const allNotes = this.getAllNotes();
    
    const notesByNotebook = {};
    allNotes.forEach(note => {
      if (!notesByNotebook[note.notebook_id]) {
        notesByNotebook[note.notebook_id] = [];
      }
      notesByNotebook[note.notebook_id].push(note);
    });
    
    return notebooks.map(notebook => ({
      ...notebook,
      notes: notesByNotebook[notebook.id] || [],
      expanded: false
    }));
  }

  close() {
    this.db.close();
  }
}

module.exports = PlannerDatabase;