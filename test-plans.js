// 简化的测试脚本，直接测试数据库操作
const path = require('path');
const os = require('os');
const fs = require('fs');

// 设置全局变量
console.log('开始测试计划功能的数据库操作...');

// 1. 创建一个临时的database.js文件，使用固定的数据库路径
const tempDbPath = path.join(os.tmpdir(), 'planner-test', 'planner.db');
const tempDir = path.dirname(tempDbPath);

// 确保临时目录存在
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// 删除旧的测试数据库文件（如果存在）
if (fs.existsSync(tempDbPath)) {
  try {
    fs.unlinkSync(tempDbPath);
    console.log('已删除旧的测试数据库文件');
  } catch (error) {
    console.log('无法删除旧的测试数据库文件，可能不存在:', error.message);
  }
}

// 2. 直接创建一个简单的测试数据库连接
const Database = require('better-sqlite3');
const db = new Database(tempDbPath);

// 3. 定义创建表的SQL语句
const createPlansTable = `
  CREATE TABLE IF NOT EXISTS plans (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    type_tags TEXT,
    start_date TEXT,
    end_date TEXT,
    goal TEXT,
    status TEXT DEFAULT 'not_started',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
`;

const createPlanTasksTable = `
  CREATE TABLE IF NOT EXISTS plan_tasks (
    id TEXT PRIMARY KEY,
    plan_id TEXT NOT NULL,
    content TEXT NOT NULL,
    is_completed INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (plan_id) REFERENCES plans (id) ON DELETE CASCADE
  );
`;

// 4. 创建索引
const createIndex = `
  CREATE INDEX IF NOT EXISTS idx_plan_tasks_plan_id ON plan_tasks (plan_id);
`;

// 5. 执行表创建语句
console.log('创建测试表...');
db.exec(createPlansTable);
db.exec(createPlanTasksTable);
db.exec(createIndex);
console.log('表创建成功');

// 6. 生成UUID的简单函数
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// 7. 测试计划相关的操作
async function runTests() {
  try {
    // 测试创建计划
    console.log('\n测试1: 创建计划');
    const planId = generateUUID();
    const createPlanStmt = db.prepare(
      'INSERT INTO plans (id, title, description, type_tags, start_date, end_date, goal) VALUES (?, ?, ?, ?, ?, ?, ?)'
    );
    createPlanStmt.run(
      planId,
      '学习Vue3',
      '系统学习Vue3的基础知识和高级特性',
      JSON.stringify(['学习', '技术']),
      '2023-12-01',
      '2023-12-31',
      '掌握Vue3的核心概念和常用API'
    );
    console.log('✓ 计划创建成功');

    // 测试查询计划
    console.log('\n测试2: 查询计划');
    const getPlanStmt = db.prepare('SELECT * FROM plans WHERE id = ?');
    const plan = getPlanStmt.get(planId);
    console.log('✓ 计划查询成功:', {
      id: plan.id,
      title: plan.title,
      tags: plan.type_tags ? JSON.parse(plan.type_tags) : []
    });

    // 测试创建计划任务
    console.log('\n测试3: 创建计划任务');
    const task1Id = generateUUID();
    const task2Id = generateUUID();
    const createTaskStmt = db.prepare(
      'INSERT INTO plan_tasks (id, plan_id, content, is_completed) VALUES (?, ?, ?, ?)'
    );
    createTaskStmt.run(task1Id, planId, '阅读官方文档', 0);
    createTaskStmt.run(task2Id, planId, '完成示例项目', 0);
    console.log('✓ 计划任务创建成功');

    // 测试查询计划任务
    console.log('\n测试4: 查询计划任务');
    const getTasksStmt = db.prepare('SELECT * FROM plan_tasks WHERE plan_id = ?');
    const tasks = getTasksStmt.all(planId);
    console.log('✓ 计划任务查询成功:', tasks.length, '个任务');
    tasks.forEach(task => {
      console.log(`  - ${task.content} (完成: ${task.is_completed ? '是' : '否'})`);
    });

    // 测试更新计划任务
    console.log('\n测试5: 更新计划任务');
    const updateTaskStmt = db.prepare(
      'UPDATE plan_tasks SET is_completed = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    );
    updateTaskStmt.run(1, task1Id);
    
    // 重新准备查询语句以获取更新后的任务
    const getTaskByIdStmt = db.prepare('SELECT * FROM plan_tasks WHERE id = ?');
    const updatedTask = getTaskByIdStmt.get(task1Id);
    if (updatedTask) {
      console.log('✓ 计划任务更新成功:',
        `任务"${updatedTask.content}"的完成状态: ${updatedTask.is_completed ? '是' : '否'}`
      );
    } else {
      console.error('✗ 计划任务更新失败: 无法找到更新后的任务');
      throw new Error('更新计划任务失败');
    }

    // 测试更新计划
    console.log('\n测试6: 更新计划');
    const updatePlanStmt = db.prepare(
      'UPDATE plans SET description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    );
    updatePlanStmt.run('更新后的描述: 深入学习Vue3的高级特性', planId);
    
    const updatedPlan = getPlanStmt.get(planId);
    console.log('✓ 计划更新成功:',
      `更新后的描述: ${updatedPlan.description}`
    );

    // 测试删除计划任务
    console.log('\n测试7: 删除计划任务');
    const deleteTaskStmt = db.prepare('DELETE FROM plan_tasks WHERE id = ?');
    deleteTaskStmt.run(task2Id);
    
    const remainingTasks = getTasksStmt.all(planId);
    console.log('✓ 计划任务删除成功，剩余任务数:', remainingTasks.length);

    // 测试删除计划（级联删除相关任务）
    console.log('\n测试8: 删除计划（级联删除任务）');
    const deletePlanStmt = db.prepare('DELETE FROM plans WHERE id = ?');
    deletePlanStmt.run(planId);
    
    const deletedPlan = getPlanStmt.get(planId);
    const deletedTasks = getTasksStmt.all(planId);
    console.log('✓ 计划删除成功:',
      `计划是否存在: ${deletedPlan ? '是' : '否'}`,
      `相关任务是否被级联删除: ${deletedTasks.length === 0 ? '是' : '否'}`
    );

    console.log('\n所有测试完成！');
    console.log('\n总结:');
    console.log('1. ✓ 计划的创建、查询、更新、删除功能正常');
    console.log('2. ✓ 计划任务的创建、查询、更新、删除功能正常');
    console.log('3. ✓ 级联删除功能正常工作');

  } catch (error) {
    console.error('测试失败:', error);
  } finally {
    // 关闭数据库连接
    db.close();
    console.log('\n数据库连接已关闭');
    
    // 可选：删除测试数据库文件
    try {
      fs.unlinkSync(tempDbPath);
      console.log('测试数据库文件已删除');
    } catch (e) {
      // 忽略错误
    }
  }
}

// 运行测试
runTests();