const { getDatabase } = require('./index');
const { generateId } = require('../utils/idGenerator');

// 获取所有笔记本
function getAllNotebooks() {
  const db = getDatabase();
  const stmt = db.prepare(`
    SELECT n.*, COUNT(note.id) as noteCount 
    FROM notebooks n 
    LEFT JOIN notes note ON n.id = note.notebook_id 
    GROUP BY n.id 
    ORDER BY n.updated_at DESC
  `);
  return stmt.all();
}

// 根据ID获取笔记本
function getNotebookById(id) {
  const db = getDatabase();
  const stmt = db.prepare('SELECT * FROM notebooks WHERE id = ?');
  return stmt.get(id);
}

// 创建笔记本
function createNotebook(name) {
  const db = getDatabase();
  const id = generateId();
  const now = new Date().toISOString();
  
  const stmt = db.prepare(`
    INSERT INTO notebooks (id, name, created_at, updated_at) 
    VALUES (?, ?, ?, ?)
  `);
  
  const result = stmt.run(id, name, now, now);
  return result.changes ? id : null;
}

// 更新笔记本
function updateNotebook(id, name) {
  const db = getDatabase();
  const now = new Date().toISOString();
  
  const stmt = db.prepare(`
    UPDATE notebooks 
    SET name = ?, updated_at = ? 
    WHERE id = ?
  `);
  
  const result = stmt.run(name, now, id);
  return result.changes;
}

// 删除笔记本
function deleteNotebook(id) {
  const db = getDatabase();
  
  // 先删除该笔记本下的所有笔记
  const deleteNotesStmt = db.prepare('DELETE FROM notes WHERE notebook_id = ?');
  deleteNotesStmt.run(id);
  
  // 再删除笔记本
  const stmt = db.prepare('DELETE FROM notebooks WHERE id = ?');
  const result = stmt.run(id);
  return result.changes;
}

// 获取指定笔记本下的所有笔记
function getNotesByNotebook(notebookId) {
  const db = getDatabase();
  const stmt = db.prepare(`
    SELECT * FROM notes 
    WHERE notebook_id = ? 
    ORDER BY updated_at DESC
  `);
  return stmt.all(notebookId);
}

// 根据ID获取笔记
function getNoteById(id) {
  const db = getDatabase();
  const stmt = db.prepare('SELECT * FROM notes WHERE id = ?');
  return stmt.get(id);
}

// 创建笔记
function createNote(notebookId, title = '无标题笔记', content = '') {
  const db = getDatabase();
  const id = generateId();
  const now = new Date().toISOString();
  
  const stmt = db.prepare(`
    INSERT INTO notes (id, notebook_id, title, content, created_at, updated_at) 
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  
  const result = stmt.run(id, notebookId, title, content, now, now);
  return result.changes ? id : null;
}

// 更新笔记
function updateNote(id, updates) {
  const db = getDatabase();
  const now = new Date().toISOString();
  
  const stmt = db.prepare(`
    UPDATE notes 
    SET title = ?, content = ?, tags = ?, updated_at = ? 
    WHERE id = ?
  `);
  
  const result = stmt.run(
    updates.title,
    updates.content,
    JSON.stringify(updates.tags || []),
    now,
    id
  );
  
  return result.changes;
}

// 删除笔记
function deleteNote(id) {
  const db = getDatabase();
  const stmt = db.prepare('DELETE FROM notes WHERE id = ?');
  const result = stmt.run(id);
  return result.changes;
}

module.exports = {
  getAllNotebooks,
  getNotebookById,
  createNotebook,
  updateNotebook,
  deleteNotebook,
  getNotesByNotebook,
  getNoteById,
  createNote,
  updateNote,
  deleteNote
};