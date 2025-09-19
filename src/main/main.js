const { app, BrowserWindow } = require('electron');
const path = require('path');
const { setupDatabaseAPI } = require('./api');
const initDatabase = require('../db/schema');

const isDev = process.env.NODE_ENV === 'development';

function createWindow() {
  // 创建浏览器窗口
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, '../preload/preload.js')
    },
    show: false // 先隐藏窗口，等加载完成再显示
  });

  // 加载应用
  if (isDev) {
    mainWindow.loadURL('http://localhost:5175');
    // 开发环境下打开开发者工具
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  // 窗口准备好后显示
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  return mainWindow;
}

// 在应用准备就绪时初始化数据库和API
app.whenReady().then(() => {
  // 初始化数据库
  initDatabase();
  
  // 设置数据库API
  setupDatabaseAPI();
  
  // 创建窗口
  createWindow();
});

// 当所有窗口都关闭时退出应用
app.on('window-all-closed', () => {
  // 在 macOS 上，应用及其菜单栏通常保持活动状态，直到用户使用 Cmd + Q 明确退出
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // 在 macOS 上，当单击停靠图标并且没有其他窗口打开时，
  // 通常在应用中重新创建一个窗口。
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});