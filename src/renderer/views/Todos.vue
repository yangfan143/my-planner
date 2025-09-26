<template>
  <div class="todos-page">
    <div class="todos-header">
      <h1>我的待办</h1>
      <div class="header-actions">
        <button class="create-todo-btn" @click="showCreateTodoModal = true">
          <div class="plus-icon">+</div>
          <span>添加待办</span>
        </button>
      </div>
    </div>

    <!-- 待办列表 -->
    <div class="todos-list">
      <div 
        v-for="todo in todos" 
        :key="todo.id" 
        class="todo-card"
      >
        <div class="todo-header">
          <h3 class="todo-title">{{ todo.title }}</h3>
          <button class="delete-todo-btn" @click.stop="handleTodoDelete(todo.id)">×</button>
        </div>
        <div class="todo-description" v-if="todo.description">{{ todo.description }}</div>
        
        <!-- 标签 -->
        <div class="todo-tags" v-if="todo.tags && todo.tags.length > 0">
          <span v-for="tag in todo.tags" :key="tag" class="todo-tag">{{ tag }}</span>
        </div>
        
        <!-- 创建时间 -->
        <div class="todo-created-at">
          <span>{{ formatDate(todo.createdAt || new Date()) }}</span>
        </div>
      </div>
      
      <!-- 无待办时的提示 -->
      <div v-if="todos.length === 0" class="no-todos">
        <div class="no-todos-icon">📝</div>
        <p>还没有待办事项</p>
        <button class="create-first-todo-btn" @click="showCreateTodoModal = true">
          添加第一个待办
        </button>
      </div>
    </div>

    <!-- 创建灵感弹窗 -->
    <div v-if="showCreateTodoModal" class="modal-overlay" @click.self="showCreateTodoModal = false">
      <div class="modal">
        <div class="modal-header">
          <h2>{{ isEditing ? '编辑待办' : '添加新待办' }}</h2>
          <button class="close-btn" @click="showCreateTodoModal = false">&times;</button>
        </div>
        <div class="modal-body">
          <!-- 灵感标题 -->
          <div class="form-group">
            <label for="todo-title">灵感标题 *</label>
            <input 
              type="text" 
              id="todo-title" 
              v-model="newTodo.title" 
              placeholder="输入灵感标题"
              required
            >
          </div>
          
          <!-- 灵感描述 -->
          <div class="form-group">
            <label for="todo-description">灵感描述</label>
            <textarea 
              id="todo-description" 
              v-model="newTodo.description" 
              placeholder="详细描述你的灵感"
              rows="4"
            ></textarea>
          </div>
          
          <!-- 标签 -->
          <div class="form-group">
            <label>标签</label>
            <div class="tags-input">
              <div class="selected-tags">
                <span v-for="tag in newTodo.tags" :key="tag" class="selected-tag">
                  {{ tag }}
                  <button class="remove-tag-btn" @click.stop="removeTag(tag)">&times;</button>
                </span>
              </div>
              <input 
                type="text" 
                v-model="newTagInput" 
                placeholder="添加标签（按回车确认）"
                @keyup.enter="addTag"
                class="tag-input"
              >
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="cancel-btn" @click="showCreateTodoModal = false">取消</button>
          <button class="create-btn" @click="createTodo">{{ isEditing ? '保存修改' : '添加待办' }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Todos',
  data() {
    return {
      // 灵感记录列表
      todos: [],
      
      // 弹窗状态
      showCreateTodoModal: false,
      
      // 新灵感数据
      newTodo: {
        title: '',
        description: '',
        tags: []
      },
      newTagInput: '',
      
      // 编辑状态
      isEditing: false
    }
  },
  
  mounted() {
    this.loadTodos();
  },
  
  methods: {
    // 加载待办列表
    async loadTodos() {
      try {
        // 安全地获取electronAPI，处理它可能在Vue组件挂载时不可用的情况
        if (typeof window.electronAPI === 'undefined') {
          // 如果electronAPI不可用，等待一段时间后重试
          await new Promise(resolve => setTimeout(resolve, 100));
          return this.loadTodos();
        }
        
        // 使用专门的待办API
        const todos = await window.electronAPI.getAllTodos?.() || [];
        // 转换数据格式
        this.todos = todos.map(todo => ({
          ...todo,
          tags: todo.tags ? (Array.isArray(todo.tags) ? todo.tags : JSON.parse(todo.tags)) : [],
          createdAt: todo.created_at || new Date().toISOString()
        }));
        
        // 如果没有待办API，使用模拟数据
        if (this.todos.length === 0) {
          this.loadMockData();
        }
      } catch (error) {
        console.error('加载灵感记录失败:', error);
        // 加载模拟数据
        this.loadMockData();
      }
    },
    
    // 加载模拟数据
    loadMockData() {
      this.todos = [
        {
          id: '1',
          title: '完成项目文档',
          description: '编写项目的用户使用手册和开发文档',
          tags: ['工作', '文档'],
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          title: '购买生活用品',
          description: '去超市购买本周的生活用品',
          tags: ['日常', '购物'],
          createdAt: new Date().toISOString()
        }
      ];
    },
    
    // 创建或更新待办
    async createTodo() {
      if (!this.newTodo.title.trim()) {
        alert('请输入待办标题');
        return;
      }
      
      try {
        // 准备待办数据
        const todoData = {
          title: String(this.newTodo.title || '').trim(),
          description: String(this.newTodo.description || '').trim(),
          tags: JSON.parse(JSON.stringify(this.newTodo.tags || []))
        };
        
        let result;
        if (this.isEditing && this.newTodo.id) {
          // 更新现有待办
          if (window.electronAPI.updateTodo) {
            result = await window.electronAPI.updateTodo(this.newTodo.id, todoData);
          } else {
            // 如果没有专门的更新API，使用本地更新
            const todoIndex = this.todos.findIndex(todo => todo.id === this.newTodo.id);
            if (todoIndex !== -1) {
              this.todos[todoIndex] = {
                ...this.todos[todoIndex],
                ...todoData,
                updatedAt: new Date().toISOString()
              };
            }
          }
          this.isEditing = false;
        } else {
          // 创建新待办
          if (window.electronAPI.createTodo) {
            result = await window.electronAPI.createTodo(todoData);
            
            if (result) {
              // 转换结果格式
              const newTodo = {
                ...result,
                tags: this.newTodo.tags,
                createdAt: new Date().toISOString()
              };
              
              // 添加到本地列表
              this.todos.push(newTodo);
            }
          } else {
            // 如果没有专门的创建API，使用本地创建
            const newTodo = {
              id: 'todo_' + Date.now(),
              ...todoData,
              createdAt: new Date().toISOString()
            };
            this.todos.push(newTodo);
          }
        }
        
        // 重置表单
        this.resetNewTodoForm();
        this.showCreateTodoModal = false;
      } catch (error) {
        console.error('创建灵感记录失败:', error);
        alert('创建灵感记录失败: ' + error.message);
      }
    },
    
    // 编辑待办
    editTodo(todo) {
      // 设置为编辑模式
      this.isEditing = true;
      // 复制当前待办数据到新待办表单
      this.newTodo = JSON.parse(JSON.stringify(todo));
      this.showCreateTodoModal = true;
    },
    
    // 删除待办
    async handleTodoDelete(todoId) {
      if (confirm('确定要删除这个待办事项吗？删除后将无法恢复。')) {
        try {
          let deleted = false;
          if (window.electronAPI.deleteTodo) {
            deleted = await window.electronAPI.deleteTodo(todoId);
          }
          
          // 如果API调用成功或没有专门的API，都从本地列表中移除
          if (deleted || !window.electronAPI.deleteTodo) {
            // 从本地列表中移除
            this.todos = this.todos.filter(todo => todo.id !== todoId);
          }
        } catch (error) {
          console.error('删除待办失败:', error);
          alert('删除待办失败: ' + error.message);
        }
      }
    },
    
    // 添加标签
    addTag() {
      if (this.newTagInput.trim() && !this.newTodo.tags.includes(this.newTagInput.trim())) {
        this.newTodo.tags.push(this.newTagInput.trim());
        this.newTagInput = '';
      }
    },
    
    // 移除标签
    removeTag(tag) {
      this.newTodo.tags = this.newTodo.tags.filter(t => t !== tag);
    },
    
    // 重置新灵感表单
    resetNewTodoForm() {
      this.newTodo = {
        title: '',
        description: '',
        tags: []
      };
      this.newTagInput = '';
    },
    
    // 格式化日期
    formatDate(dateString) {
      if (!dateString) return '';
      try {
        const date = new Date(dateString);
        return date.toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        });
      } catch (e) {
        return dateString;
      }
    }
  }
}
</script>

<style scoped>
/* 页面布局 */
.todos-page {
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* 页面头部 */
.todos-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 0;
  margin-bottom: 20px;
}

.todos-header h1 {
  font-size: 28px;
  font-weight: 600;
  color: #2c3e50;
}

.create-todo-btn {
  display: flex;
  align-items: center;
  padding: 10px 20px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.create-todo-btn:hover {
  background-color: #2980b9;
}

.plus-icon {
  font-size: 20px;
  margin-right: 8px;
}

/* 过滤器 */
.todos-filters {
  margin-bottom: 20px;
}

.filter-tabs {
  display: flex;
  gap: 10px;
  background-color: white;
  padding: 8px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.filter-tab {
  padding: 8px 16px;
  border: none;
  background-color: transparent;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.3s ease;
}

.filter-tab.active {
  background-color: #3498db;
  color: white;
}

.filter-tab:hover:not(.active) {
  background-color: #f0f0f0;
}

.todo-count {
  background-color: rgba(0, 0, 0, 0.1);
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 12px;
}

.filter-tab.active .todo-count {
  background-color: rgba(255, 255, 255, 0.3);
}

/* 待办列表 */
.todos-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  flex: 1;
  overflow-y: auto;
}

/* 待办卡片 */
.todo-card {
  background-color: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.todo-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.todo-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.todo-title {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
  flex: 1;
}

.delete-todo-btn {
  background: none;
  border: none;
  font-size: 20px;
  color: #95a5a6;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.delete-todo-btn:hover {
  background-color: #e74c3c;
  color: white;
}

.todo-description {
  color: #7f8c8d;
  margin-bottom: 16px;
  line-height: 1.5;
}

/* 进度条 */
.todo-progress-container {
  margin-bottom: 16px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
  color: #7f8c8d;
}

.progress-bar {
  height: 8px;
  background-color: #ecf0f1;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: #3498db;
  border-radius: 4px;
  transition: width 0.3s ease;
}

/* 标签 */
.todo-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 16px;
}

.todo-tag {
  background-color: #ecf0f1;
  color: #2c3e50;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 12px;
}

/* 日期 */
.todo-dates {
  margin-bottom: 16px;
  font-size: 14px;
  color: #7f8c8d;
}

.date-label {
  font-weight: 500;
  margin-right: 4px;
}

.overdue {
  color: #e74c3c;
  font-weight: 500;
}

.urgent {
  color: #f39c12;
  font-weight: 500;
}

/* 目标 */
.todo-goal {
  font-size: 14px;
  color: #2c3e50;
  padding: 8px;
  background-color: #ecf0f1;
  border-radius: 6px;
}

.goal-label {
  font-weight: 500;
  margin-right: 4px;
}

/* 无待办提示 */
.no-todos {
  text-align: center;
  padding: 60px 20px;
  color: #7f8c8d;
}

.no-todos-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.create-first-todo-btn {
  margin-top: 16px;
  padding: 10px 24px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.create-first-todo-btn:hover {
  background-color: #2980b9;
}

/* 弹窗 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background-color: white;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.15);
}

.details-modal {
  max-width: 800px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #ecf0f1;
}

.modal-header h2 {
  font-size: 20px;
  font-weight: 600;
  color: #2c3e50;
}

.modal-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #95a5a6;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background-color: #ecf0f1;
}

.edit-btn {
  padding: 6px 16px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.edit-btn:hover {
  background-color: #2980b9;
}

.modal-body {
  padding: 24px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid #ecf0f1;
}

.cancel-btn {
  padding: 10px 20px;
  background-color: #ecf0f1;
  color: #2c3e50;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.cancel-btn:hover {
  background-color: #bdc3c7;
}

.create-btn {
  padding: 10px 20px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.create-btn:hover {
  background-color: #2980b9;
}

/* 表单 */
.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #2c3e50;
}

.form-group input[type="text"],
.form-group input[type="date"],
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #bdc3c7;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.3s ease;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: #3498db;
}

.form-group textarea {
  resize: vertical;
  min-height: 80px;
}

/* 日期范围输入 */
.date-range-inputs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.date-input-group {
  display: flex;
  flex-direction: column;
}

/* 标签输入 */
.tags-input {
  border: 1px solid #bdc3c7;
  border-radius: 6px;
  padding: 8px;
  min-height: 40px;
}

.selected-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 8px;
}

.selected-tag {
  background-color: #3498db;
  color: white;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.remove-tag-btn {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
}

.tag-input {
  border: none;
  outline: none;
  flex: 1;
  min-width: 150px;
}

/* 子任务 */
.subtasks-container {
  border: 1px solid #bdc3c7;
  border-radius: 6px;
  padding: 8px;
}

.subtask-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  border-radius: 4px;
  margin-bottom: 8px;
  background-color: #f8f9fa;
}

.subtask-item:last-child {
  margin-bottom: 0;
}

.subtask-checkbox {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.subtask-input {
  flex: 1;
  border: none;
  background: none;
  outline: none;
  font-size: 14px;
}

.remove-subtask-btn {
  background: none;
  border: none;
  font-size: 18px;
  color: #95a5a6;
  cursor: pointer;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.remove-subtask-btn:hover {
  background-color: #e74c3c;
  color: white;
}

.add-subtask-btn {
  width: 100%;
  padding: 8px;
  margin-top: 8px;
  background-color: #ecf0f1;
  color: #2c3e50;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.add-subtask-btn:hover {
  background-color: #bdc3c7;
}

/* 待办详情页面 */
.todo-details-header {
  margin-bottom: 24px;
}

.todo-details-title {
  font-size: 24px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 12px;
}

.todo-details-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.todo-details-progress {
  background-color: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 24px;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.progress-header h4 {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
}

.progress-percentage {
  font-size: 16px;
  font-weight: 600;
  color: #3498db;
}

.progress-stats {
  margin-top: 8px;
  font-size: 14px;
  color: #7f8c8d;
}

.todo-details-description,
.todo-details-dates,
.todo-details-goal,
.todo-details-subtasks {
  margin-bottom: 24px;
}

.todo-details-description h4,
.todo-details-dates h4,
.todo-details-goal h4,
.todo-details-subtasks h4 {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 12px;
}

.todo-details-description p,
.todo-details-goal p {
  line-height: 1.6;
  color: #7f8c8d;
}

.subtasks-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.subtasks-list {
  border: 1px solid #bdc3c7;
  border-radius: 6px;
  padding: 8px;
}

.subtasks-header .add-subtask-btn {
  width: auto;
  margin-top: 0;
  padding: 6px 12px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .todos-list {
    grid-template-columns: 1fr;
  }
  
  .date-range-inputs {
    grid-template-columns: 1fr;
  }
  
  .modal {
    width: 95%;
    margin: 20px;
  }
}
</style>