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
  searchNotes: (query) => ipcRenderer.invoke('search-notes', query)
});