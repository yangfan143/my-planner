const { ipcMain } = require('electron');
const notebookDb = require('../db/notebooks');
const noteDb = require('../db/notes');

// 注册IPC处理器
function setupIpcHandlers() {
  // 笔记本相关处理器
  ipcMain.handle('get-all-notebooks', async () => {
    try {
      return await notebookDb.getAllNotebooks();
    } catch (error) {
      console.error('获取笔记本列表失败:', error);
      throw error;
    }
  });
  
  ipcMain.handle('create-notebook', async (event, name) => {
    try {
      return await notebookDb.createNotebook(name);
    } catch (error) {
      console.error('创建笔记本失败:', error);
      throw error;
    }
  });
  
  ipcMain.handle('update-notebook', async (event, id, name) => {
    try {
      return await notebookDb.updateNotebook(id, name);
    } catch (error) {
      console.error('更新笔记本失败:', error);
      throw error;
    }
  });
  
  ipcMain.handle('delete-notebook', async (event, id) => {
    try {
      return await notebookDb.deleteNotebook(id);
    } catch (error) {
      console.error('删除笔记本失败:', error);
      throw error;
    }
  });
  
  // 笔记相关处理器
  ipcMain.handle('get-notes-by-notebook', async (event, notebookId) => {
    try {
      return await noteDb.getNotesByNotebook(notebookId);
    } catch (error) {
      console.error('获取笔记列表失败:', error);
      throw error;
    }
  });
  
  ipcMain.handle('get-note-by-id', async (event, id) => {
    try {
      return await noteDb.getNoteById(id);
    } catch (error) {
      console.error('获取笔记失败:', error);
      throw error;
    }
  });
  
  ipcMain.handle('create-note', async (event, notebookId, title) => {
    try {
      return await noteDb.createNote(notebookId, title);
    } catch (error) {
      console.error('创建笔记失败:', error);
      throw error;
    }
  });
  
  ipcMain.handle('update-note', async (event, id, updates) => {
    try {
      return await noteDb.updateNote(id, updates);
    } catch (error) {
      console.error('更新笔记失败:', error);
      throw error;
    }
  });
  
  ipcMain.handle('delete-note', async (event, id) => {
    try {
      return await noteDb.deleteNote(id);
    } catch (error) {
      console.error('删除笔记失败:', error);
      throw error;
    }
  });
  
  ipcMain.handle('search-notes', async (event, query) => {
    try {
      return await noteDb.searchNotes(query);
    } catch (error) {
      console.error('搜索笔记失败:', error);
      throw error;
    }
  });
}

module.exports = {
  setupIpcHandlers
};