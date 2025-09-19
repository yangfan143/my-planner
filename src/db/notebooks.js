const { getDatabase } = require('./index');
const { generateId } = require('../utils/idGenerator');

// 获取所有笔记本
function getAllNotebooks() {
  const db = getDatabase();
  try {
    const stmt = db.prepare(`
      SELECT n.*, COUNT(notes.id) as noteCount 
      FROM notebooks n 
      LEFT JOIN notes ON n.id = notes.notebook_id 
      GROUP BY n.id 
      ORDER BY n.updated_at DESC
    `);
    return stmt.all();
  } catch (error) {
    console.error('获取笔记本列表失败:', error);
    throw error;
  }
}

// 创建新笔记本
function createNotebook(name) {
  const db = getDatabase();
  try {
    const id = generateId();
    const now = new Date().toISOString();
    
    const stmt = db.prepare(`
      INSERT INTO notebooks (id, name, created_at, updated_at) 
      VALUES (?, ?, ?, ?)
    `);
    
    const result = stmt.run(id, name, now, now);
    return result.changes > 0 ? id : null;
  } catch (error) {
    console.error('创建笔记本失败:', error);
    throw error;
  }
}

// 更新笔记本
function updateNotebook(id, name) {
  const db = getDatabase();
  try {
    const now = new Date().toISOString();
    
    const stmt = db.prepare(`
      UPDATE notebooks 
      SET name = ?, updated_at = ? 
      WHERE id = ?
    `);
    
    const result = stmt.run(name, now, id);
    return result.changes > 0;
  } catch (error) {
    console.error('更新笔记本失败:', error);
    throw error;
  }
}

// 删除笔记本
function deleteNotebook(id) {
  const db = getDatabase();
  try {
    // 先删除笔记本下的所有笔记
    const deleteNotesStmt = db.prepare('DELETE FROM notes WHERE notebook_id = ?');
    deleteNotesStmt.run(id);
    
    // 然后删除笔记本
    const deleteNotebookStmt = db.prepare('DELETE FROM notebooks WHERE id = ?');
    const result = deleteNotebookStmt.run(id);
    
    return result.changes > 0;
  } catch (error) {
    console.error('删除笔记本失败:', error);
    throw error;
  }
}

module.exports = {
  getAllNotebooks,
  createNotebook,
  updateNotebook,
  deleteNotebook
};