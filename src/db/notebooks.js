const db = require('./index');
const { generateId } = require('../utils/idGenerator');

const notebookModel = {
  // 获取所有笔记本
  getAll() {
    return db.all('SELECT * FROM notebooks ORDER BY name');
  },
  
  // 根据ID获取笔记本
  getById(id) {
    return db.get('SELECT * FROM notebooks WHERE id = ?', [id]);
  },
  
  // 创建笔记本
  create(name) {
    const id = generateId();
    const now = new Date().toISOString();
    
    db.run(
      'INSERT INTO notebooks (id, name, created_at, updated_at) VALUES (?, ?, ?, ?)',
      [id, name, now, now]
    );
    
    return id;
  },
  
  // 更新笔记本
  update(id, name) {
    const now = new Date().toISOString();
    
    db.run(
      'UPDATE notebooks SET name = ?, updated_at = ? WHERE id = ?',
      [name, now, id]
    );
    
    return true;
  },
  
  // 删除笔记本
  delete(id) {
    db.run('DELETE FROM notebooks WHERE id = ?', [id]);
    return true;
  }
};

module.exports = notebookModel;