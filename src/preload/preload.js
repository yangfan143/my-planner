const { contextBridge, ipcRenderer } = require('electron');

// 向渲染进程暴露安全的API
contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  
  // 笔记本相关API
  getAllNotebooks: () => ipcRenderer.invoke('get-all-notebooks'),
  getNotebooksWithNotes: () => ipcRenderer.invoke('get-notebooks-with-notes'),
  createNotebook: (name) => ipcRenderer.invoke('create-notebook', name),
  updateNotebook: (id, name) => ipcRenderer.invoke('update-notebook', id, name),
  deleteNotebook: (id) => ipcRenderer.invoke('delete-notebook', id),
  
  // 笔记相关API
  getNotesByNotebook: (notebookId) => ipcRenderer.invoke('get-notes-by-notebook', notebookId),
  getNote: (id) => ipcRenderer.invoke('get-note', id),
  createNote: (notebookId, title, content, tags) => 
    ipcRenderer.invoke('create-note', notebookId, title, content, tags),
  updateNote: (id, updates) => ipcRenderer.invoke('update-note', id, updates),
  deleteNote: (id) => ipcRenderer.invoke('delete-note', id),
  searchNotes: (query) => ipcRenderer.invoke('search-notes', query),
  
  // 任务相关API
  getAllTasks: () => ipcRenderer.invoke('get-all-tasks'),
  getTask: (id) => ipcRenderer.invoke('get-task', id),
  createTask: (task) => ipcRenderer.invoke('create-task', task),
  updateTask: (id, updates) => ipcRenderer.invoke('update-task', id, updates),
  deleteTask: (id) => ipcRenderer.invoke('delete-task', id),
  
  // 子任务相关API
  getSubtasksByTaskId: (taskId) => ipcRenderer.invoke('get-subtasks-by-task-id', taskId),
  createSubtask: (subtask) => ipcRenderer.invoke('create-subtask', subtask),
  updateSubtask: (id, updates) => ipcRenderer.invoke('update-subtask', id, updates),
  deleteSubtask: (id) => ipcRenderer.invoke('delete-subtask', id),
  
  // 计划相关API
  getAllPlans: () => ipcRenderer.invoke('get-all-plans'),
  getPlanById: (id) => ipcRenderer.invoke('get-plan-by-id', id),
  createPlan: (planData) => ipcRenderer.invoke('create-plan', planData),
  updatePlan: (id, updates) => ipcRenderer.invoke('update-plan', id, updates),
  deletePlan: (id) => ipcRenderer.invoke('delete-plan', id),
  
  // 计划任务相关API
  getPlanTasksByPlanId: (planId) => ipcRenderer.invoke('get-plan-tasks-by-plan-id', planId),
  createPlanTask: (taskData) => ipcRenderer.invoke('create-plan-task', taskData),
  updatePlanTask: (id, updates) => ipcRenderer.invoke('update-plan-task', id, updates),
  deletePlanTask: (id) => ipcRenderer.invoke('delete-plan-task', id),
  
  // 日历事件API
  getCalendarEvents: (startDate, endDate) => ipcRenderer.invoke('get-calendar-events', startDate, endDate),
  
  // 调试API，用于前端向主进程发送调试信息
  sendDebugInfo: (info) => ipcRenderer.send('debug-info', info),
  
  // 思维导图相关API
  getAllMindmaps: () => ipcRenderer.invoke('get-all-mindmaps'),
  getMindmapById: (id) => ipcRenderer.invoke('get-mindmap-by-id', id),
  createMindmap: (title, data) => ipcRenderer.invoke('create-mindmap', title, data),
  updateMindmap: (id, title, data) => ipcRenderer.invoke('update-mindmap', id, title, data),
  deleteMindmap: (id) => ipcRenderer.invoke('delete-mindmap', id)
});