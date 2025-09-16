const db = require('./src/db/index');
const notebookModel = require('./src/db/notebooks');
const noteModel = require('./src/db/notes');

// 连接到数据库
db.connect();

try {
  console.log('=== 测试数据库功能 ===');
  
  // 测试笔记本操作
  console.log('\n1. 创建笔记本...');
  const notebookId = notebookModel.create('测试笔记本');
  console.log('创建的笔记本ID:', notebookId);
  
  console.log('\n2. 获取所有笔记本...');
  const notebooks = notebookModel.getAll();
  console.log('所有笔记本:', notebooks);
  
  // 测试笔记操作
  console.log('\n3. 创建笔记...');
  const noteId = noteModel.create(notebookId, '测试笔记', '这是测试内容', ['测试', '示例']);
  console.log('创建的笔记ID:', noteId);
  
  console.log('\n4. 获取笔记本中的笔记...');
  const notes = noteModel.getByNotebook(notebookId);
  console.log('笔记本中的笔记:', notes);
  
  console.log('\n5. 搜索笔记...');
  const searchResults = noteModel.search('测试');
  console.log('搜索结果:', searchResults);
  
  console.log('\n=== 测试完成 ===');
  
} catch (error) {
  console.error('测试失败:', error);
} finally {
  // 断开数据库连接
  db.disconnect();
}