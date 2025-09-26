const { app } = require('electron');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(path.join(__dirname, 'data.db'));

// 延迟函数
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 创建模拟数据的函数
async function createMockData() {
  try {
    // 等待数据库准备就绪
    await delay(1000);
    
    // 检查思维导图表是否存在
    db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='mindmaps'", (err, row) => {
      if (err) {
        console.error('检查思维导图表失败:', err);
        return;
      }
      
      if (!row) {
        console.log('思维导图表不存在，请先运行应用初始化数据库');
        return;
      }
      
      // 创建模拟笔记
      db.run(`INSERT INTO notes (notebook_id, title, content, tags, created_at) VALUES
        (1, '项目规划笔记', '这是一个测试项目的规划笔记', '项目,规划', '${new Date().toISOString()}'),
        (1, '会议纪要', '记录了今天的团队会议内容', '会议,团队', '${new Date(Date.now() + 86400000).toISOString()}'),
        (1, '学习笔记', 'JavaScript高级概念学习', '学习,编程', '${new Date(Date.now() - 86400000).toISOString()}'`,
        (err) => {
          if (err && !err.message.includes('UNIQUE constraint failed')) {
            console.error('创建模拟笔记失败:', err);
          } else {
            console.log('模拟笔记创建成功');
          }
        }
      );
      
      // 创建模拟计划
      db.run(`INSERT INTO plans (title, description, start_date, end_date) VALUES
        ('产品发布计划', '新产品发布的详细计划', '${new Date().toISOString()}', '${new Date(Date.now() + 7 * 86400000).toISOString()}'),
        ('市场推广活动', 'Q3季度市场推广活动', '${new Date(Date.now() + 3 * 86400000).toISOString()}', '${new Date(Date.now() + 10 * 86400000).toISOString()}'`,
        (err) => {
          if (err && !err.message.includes('UNIQUE constraint failed')) {
            console.error('创建模拟计划失败:', err);
          } else {
            console.log('模拟计划创建成功');
          }
        }
      );
      
      // 创建模拟思维导图
      const mockMindmapData = JSON.stringify({
        nodes: [
          { id: '1', text: '项目概述', x: 0, y: 0, parentId: null },
          { id: '2', text: '目标', x: -100, y: 80, parentId: '1' },
          { id: '3', text: '计划', x: 100, y: 80, parentId: '1' },
          { id: '4', text: '里程碑', x: 0, y: 160, parentId: '1' }
        ],
        edges: [
          { source: '1', target: '2' },
          { source: '1', target: '3' },
          { source: '1', target: '4' }
        ]
      });
      
      db.run(`INSERT INTO mindmaps (title, data, created_at, updated_at) VALUES
        ('项目思维导图', '${mockMindmapData.replace(/'/g, "''")}', '${new Date().toISOString()}', '${new Date().toISOString()}'),
        ('营销策略图', '{"nodes":[{"id":"1","text":"营销策略","x":0,"y":0,"parentId":null}],"edges":[]}', '${new Date(Date.now() + 2 * 86400000).toISOString()}', '${new Date(Date.now() + 2 * 86400000).toISOString()}'`,
        (err) => {
          if (err && !err.message.includes('UNIQUE constraint failed')) {
            console.error('创建模拟思维导图失败:', err);
          } else {
            console.log('模拟思维导图创建成功');
          }
        }
      );
      
      // 关闭数据库连接
      setTimeout(() => {
        db.close();
        console.log('数据库已关闭');
      }, 2000);
    });
  } catch (error) {
    console.error('创建模拟数据时发生错误:', error);
    db.close();
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  createMockData();
}

module.exports = { createMockData };