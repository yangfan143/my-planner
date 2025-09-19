const { ipcMain } = require('electron');
const { getDatabase } = require('../db');
const PlannerDatabase = require('../db/database'); 
const db = new PlannerDatabase(); // 修复后的代码
function setupDatabaseAPI() {


  // 笔记本相关API
  ipcMain.handle('get-all-notebooks', async () => {
    try {
      return db.getAllNotebooks();
    } catch (error) {
      console.error('获取笔记本列表失败:', error);
      throw error;
    }
  });

  ipcMain.handle('get-notebooks-with-notes', async () => {
    try {
      return db.getNotebooksWithNotes();
    } catch (error) {
      console.error('获取笔记本和笔记失败:', error);
      throw error;
    }
  });

  ipcMain.handle('create-notebook', async (event, name) => {
    try {
      return db.createNotebook(name);
    } catch (error) {
      console.error('创建笔记本失败:', error);
      throw error;
    }
  });

  ipcMain.handle('update-notebook', async (event, id, name) => {
    try {
      return db.updateNotebook(id, name);
    } catch (error) {
      console.error('更新笔记本失败:', error);
      throw error;
    }
  });

  ipcMain.handle('delete-notebook', async (event, id) => {
    try {
      return db.deleteNotebook(id);
    } catch (error) {
      console.error('删除笔记本失败:', error);
      throw error;
    }
  });

  // 笔记相关API
  ipcMain.handle('get-notes-by-notebook', async (event, notebookId) => {
    try {
      if (notebookId) {
        return db.getNotesByNotebook(notebookId);
      } else {
        return db.getAllNotes();
      }
    } catch (error) {
      console.error('获取笔记列表失败:', error);
      throw error;
    }
  });

  ipcMain.handle('get-note', async (event, id) => {
    try {
      return db.getNoteById(id);
    } catch (error) {
      console.error('获取笔记失败:', error);
      throw error;
    }
  });

  ipcMain.handle('create-note', async (event, notebookId, title, content, tags) => {
    try {
      return db.createNote(notebookId, title, content, tags);
    } catch (error) {
      console.error('创建笔记失败:', error);
      throw error;
    }
  });

  ipcMain.handle('update-note', async (event, id, updates) => {
    try {
      return db.updateNote(id, updates);
    } catch (error) {
      console.error('更新笔记失败:', error);
      throw error;
    }
  });

  ipcMain.handle('delete-note', async (event, id) => {
    try {
      return db.deleteNote(id);
    } catch (error) {
      console.error('删除笔记失败:', error);
      throw error;
    }
  });

  ipcMain.handle('search-notes', async (event, query) => {
    try {
      return db.searchNotes(query);
    } catch (error) {
      console.error('搜索笔记失败:', error);
      throw error;
    }
  });
}

module.exports = {
  setupDatabaseAPI
};