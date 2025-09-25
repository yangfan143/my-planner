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
  
  // 任务相关API
  ipcMain.handle('get-all-tasks', async () => {
    try {
      return db.getAllTasks();
    } catch (error) {
      console.error('获取任务列表失败:', error);
      throw error;
    }
  });
  
  ipcMain.handle('get-task', async (event, id) => {
    try {
      return db.getTaskById(id);
    } catch (error) {
      console.error('获取任务失败:', error);
      throw error;
    }
  });
  
  ipcMain.handle('create-task', async (event, task) => {
    try {
      return db.createTask(task);
    } catch (error) {
      console.error('创建任务失败:', error);
      throw error;
    }
  });
  
  ipcMain.handle('update-task', async (event, id, updates) => {
    try {
      return db.updateTask(id, updates);
    } catch (error) {
      console.error('更新任务失败:', error);
      throw error;
    }
  });
  
  ipcMain.handle('delete-task', async (event, id) => {
    try {
      return db.deleteTask(id);
    } catch (error) {
      console.error('删除任务失败:', error);
      throw error;
    }
  });
  
  // 在任务相关API后面添加以下子任务相关的IPC处理程序
  
  // 子任务相关API
  ipcMain.handle('get-subtasks-by-task-id', async (event, taskId) => {
    try {
      return db.getSubtasksByTaskId(taskId);
    } catch (error) {
      console.error('获取子任务列表失败:', error);
      throw error;
    }
  });
  
  ipcMain.handle('create-subtask', async (event, subtask) => {
    try {
      return db.createSubtask(subtask);
    } catch (error) {
      console.error('创建子任务失败:', error);
      throw error;
    }
  });
  
  ipcMain.handle('update-subtask', async (event, id, updates) => {
    try {
      return db.updateSubtask(id, updates);
    } catch (error) {
      console.error('更新子任务失败:', error);
      throw error;
    }
  });
  
  ipcMain.handle('delete-subtask', async (event, id) => {
    try {
      return db.deleteSubtask(id);
    } catch (error) {
      console.error('删除子任务失败:', error);
      throw error;
    }
  });

  // 计划相关API
  ipcMain.handle('get-all-plans', async () => {
    try {
      return db.getAllPlans();
    } catch (error) {
      console.error('获取计划列表失败:', error);
      throw error;
    }
  });

  ipcMain.handle('get-plan-by-id', async (event, id) => {
    try {
      return db.getPlanById(id);
    } catch (error) {
      console.error('获取计划详情失败:', error);
      throw error;
    }
  });

  ipcMain.handle('create-plan', async (event, planData) => {
    try {
      return db.createPlan(planData);
    } catch (error) {
      console.error('创建计划失败:', error);
      throw error;
    }
  });

  ipcMain.handle('update-plan', async (event, id, updates) => {
    try {
      return db.updatePlan(id, updates);
    } catch (error) {
      console.error('更新计划失败:', error);
      throw error;
    }
  });

  ipcMain.handle('delete-plan', async (event, id) => {
    try {
      return db.deletePlan(id);
    } catch (error) {
      console.error('删除计划失败:', error);
      throw error;
    }
  });

  // 计划任务相关API
  ipcMain.handle('get-plan-tasks-by-plan-id', async (event, planId) => {
    try {
      return db.getPlanTasksByPlanId(planId);
    } catch (error) {
      console.error('获取计划任务列表失败:', error);
      throw error;
    }
  });

  ipcMain.handle('create-plan-task', async (event, taskData) => {
    try {
      return db.createPlanTask(taskData);
    } catch (error) {
      console.error('创建计划任务失败:', error);
      throw error;
    }
  });

  ipcMain.handle('update-plan-task', async (event, id, updates) => {
    try {
      return db.updatePlanTask(id, updates);
    } catch (error) {
      console.error('更新计划任务失败:', error);
      throw error;
    }
  });

  ipcMain.handle('delete-plan-task', async (event, id) => {
    try {
      return db.deletePlanTask(id);
    } catch (error) {
      console.error('删除计划任务失败:', error);
      throw error;
    }
  });
}

module.exports = {
  setupDatabaseAPI
};