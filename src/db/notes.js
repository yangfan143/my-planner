const db = require('./index');
const { generateId } = require('../utils/idGenerator');

const noteModel = {
  // 获取笔记本中的所有笔记
  getByNotebook(notebookId) {
    return db.all(
      'SELECT * FROM notes WHERE notebook_id = ? ORDER BY updated_at DESC',
      [notebookId]
    );
  },
  
  // 根据ID获取笔记
  getById(id) {
    return db.get('SELECT * FROM notes WHERE id = ?', [id]);
  },
  
  // 创建笔记
  create(notebookId, title, content = '', tags = []) {
    const id = generateId();
    const now = new Date().toISOString();
    
    db.run(
      'INSERT INTO notes (id, notebook_id, title, content, tags, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, notebookId, title, content, JSON.stringify(tags), now, now]
    );
    
    return id;
  },
  
  // 更新笔记
  update(id, title, content, tags = []) {
    const now = new Date().toISOString();
    
    db.run(
      'UPDATE notes SET title = ?, content = ?, tags = ?, updated_at = ? WHERE id = ?',
      [title, content, JSON.stringify(tags), now, id]
    );
    
    return true;
  },
  
  // 删除笔记
  delete(id) {
    db.run('DELETE FROM notes WHERE id = ?', [id]);
    return true;
  },
  
  // 搜索笔记
  search(query) {
    return db.all(
      'SELECT * FROM notes WHERE title LIKE ? OR content LIKE ? ORDER BY updated_at DESC',
      [`%${query}%`, `%${query}%`]
    );
  }
};

module.exports = noteModel;