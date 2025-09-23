<template>
  <div class="tasks-page">
    <div class="tasks-header">
      <h1>任务管理</h1>
      <button class="create-task-btn" @click="showCreateTaskModal = true">
        <div class="plus-icon">+</div>
        <span>创建任务</span>
      </button>
    </div>

    <div class="tasks-filters">
      <div class="filter-tabs">
        <button 
          v-for="filter in filters" 
          :key="filter.id"
          :class="['filter-tab', { active: activeFilter === filter.id }]"
          @click="activeFilter = filter.id"
        >
          {{ filter.name }}
          <span v-if="filter.id !== 'all'" class="task-count">{{ getTaskCount(filter.id) }}</span>
        </button>
      </div>
    </div>

    <!-- 根据当前激活的过滤器决定任务的显示方式 -->
    <div class="tasks-container">
      <!-- 标准状态分类显示 (全部、待办、进行中) -->
      <template v-if="activeFilter !== 'done' && activeFilter !== 'highPriority'">
        <div class="task-column" v-for="status in taskStatuses" :key="status.id">
          <div class="column-header">
            <h3>{{ status.name }}</h3>
            <span class="task-count">{{ getTasksByStatus(status.id).length }}</span>
          </div>
          <div class="task-list">
            <!-- 调试输出 -->
            <div style="color: red; margin-bottom: 10px;">任务数量: {{ getTasksByStatus(status.id).length }}</div>
            <div v-for="task in getTasksByStatus(status.id)" :key="task.id">
              <!-- 改进版任务卡片，确保所有状态下都能显示详细信息 -->
              <div class="task-card" @click="showTaskDetails(task)">
                <div class="task-header">
                  <div class="task-priority" :class="task.priority">
                    {{ getPriorityLabel(task.priority) }}
                  </div>
                  <button class="delete-task-btn" @click.stop="handleTaskDelete(task.id)">×</button>
                </div>
                <h4 class="task-title" style="color: inherit;">{{ task.title }}</h4>
                <p v-if="task.description" class="task-description" style="display: block; color: inherit;">{{ task.description }}</p>
                <div v-if="task.dueDate" class="task-dueDate" style="display: block;">
                  截止日期: {{ formatDate(task.dueDate) }}
                </div>
                
                <!-- 任务状态显示 -->
                <div class="task-status" style="margin: 8px 0;">
                  状态: <span :class="['status-badge', task.status]">{{ task.status === 'todo' ? '待办' : task.status === 'inProgress' ? '进行中' : '已完成' }}</span>
                </div>
                
                <!-- 任务状态按钮 -->
                <div class="task-actions">
                  <button @click.stop="handleTaskUpdate({ ...task, status: 'todo' })" v-if="task.status !== 'todo'">待办</button>
                  <button @click.stop="handleTaskUpdate({ ...task, status: 'inProgress' })" v-if="task.status !== 'inProgress'">进行中</button>
                  <button @click.stop="handleTaskUpdate({ ...task, status: 'done' })" v-if="task.status !== 'done'">已完成</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
      
      <!-- 已完成任务显示 -->
      <template v-else-if="activeFilter === 'done'">
        <div class="task-column">
          <div class="column-header">
            <h3>已完成任务</h3>
            <span class="task-count">{{ getTaskCount('done') }}</span>
          </div>
          <div class="task-list">
            <!-- 调试输出 -->
            <div style="color: red; margin-bottom: 10px;">任务数量: {{ getTaskCount('done') }}</div>
            <div v-for="task in tasks.filter(task => task.status === 'done')" :key="task.id">
              <div class="task-card" @click="showTaskDetails(task)">
                <div class="task-header">
                  <div class="task-priority" :class="task.priority">
                    {{ getPriorityLabel(task.priority) }}
                  </div>
                  <button class="delete-task-btn" @click.stop="handleTaskDelete(task.id)">×</button>
                </div>
                <h4 class="task-title" style="color: inherit;">{{ task.title }}</h4>
                <p v-if="task.description" class="task-description" style="display: block; color: inherit;">{{ task.description }}</p>
                <div v-if="task.dueDate" class="task-dueDate" style="display: block;">
                  截止日期: {{ formatDate(task.dueDate) }}
                </div>
                
                <!-- 任务完成信息 -->
                <div class="task-status" style="margin: 8px 0;">
                  状态: <span class="status-badge done">已完成</span>
                </div>
                
                <!-- 已完成任务特有的信息 -->
                <div v-if="task.completionDate" class="task-completion-date">
                  完成日期: {{ formatDate(task.completionDate) }}
                </div>
                
                <!-- 任务状态按钮 -->
                <div class="task-actions">
                  <button @click.stop="handleTaskUpdate({ ...task, status: 'todo' })" class="task-action-btn">待办</button>
                  <button @click.stop="handleTaskUpdate({ ...task, status: 'inProgress' })" class="task-action-btn">进行中</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
      
      <!-- 高优先级任务显示 -->
      <template v-else-if="activeFilter === 'highPriority'">
        <div class="task-column">
          <div class="column-header">
            <h3>高优先级任务</h3>
            <span class="task-count">{{ getTaskCount('highPriority') }}</span>
          </div>
          <div class="task-list">
            <!-- 调试输出 -->
            <div style="color: red; margin-bottom: 10px;">任务数量: {{ getTaskCount('highPriority') }}</div>
            <div v-for="task in tasks.filter(task => task.priority === 'high')" :key="task.id">
              <div class="task-card" @click="showTaskDetails(task)">
                <div class="task-header">
                  <div class="task-priority" :class="task.priority">
                    {{ getPriorityLabel(task.priority) }}
                  </div>
                  <button class="delete-task-btn" @click.stop="handleTaskDelete(task.id)">×</button>
                </div>
                <h4 class="task-title" style="color: inherit;">{{ task.title }}</h4>
                <p v-if="task.description" class="task-description" style="display: block; color: inherit;">{{ task.description }}</p>
                <div v-if="task.dueDate" class="task-dueDate" style="display: block;">
                  截止日期: {{ formatDate(task.dueDate) }}
                </div>
                
                <!-- 任务状态显示 -->
                <div class="task-status" style="margin: 8px 0;">
                  状态: <span :class="['status-badge', task.status]">{{ task.status === 'todo' ? '待办' : task.status === 'inProgress' ? '进行中' : '已完成' }}</span>
                </div>
                
                <!-- 任务状态按钮 -->
                <div class="task-actions">
                  <button @click.stop="handleTaskUpdate({ ...task, status: 'todo' })" v-if="task.status !== 'todo'" class="task-action-btn">待办</button>
                  <button @click.stop="handleTaskUpdate({ ...task, status: 'inProgress' })" v-if="task.status !== 'inProgress'" class="task-action-btn">进行中</button>
                  <button @click.stop="handleTaskUpdate({ ...task, status: 'done' })" v-if="task.status !== 'done'" class="task-action-btn">已完成</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- 创建任务弹窗 -->
    <div v-if="showCreateTaskModal" class="modal-overlay" @click.self="showCreateTaskModal = false">
      <div class="modal">
        <div class="modal-header">
          <h2>创建新任务</h2>
          <button class="close-btn" @click="showCreateTaskModal = false">&times;</button>
        </div>
        <div class="modal-body">
 <!-- 快捷功能按钮区 -->
<div class="quick-actions">
  <!-- 标签按钮 -->
  <div class="quick-action-item">
    <button class="action-btn" @click.stop="toggleTagsDropdown">
      <span class="action-icon">🏷️</span>
      <span v-if="newTask.tags.length > 0" class="action-badge">{{ newTask.tags.length }}</span>
    </button>
    <div v-if="showTagsInput" class="action-dropdown tags-dropdown">
      <div class="tags-search">
        <input 
          type="text" 
          v-model="tagSearchQuery" 
          placeholder="搜索标签..." 
          class="tag-search-input"
          @click.stop
        >
      </div>
      
      <!-- 常用标签快速选择 -->
      <div v-if="filteredCommonTags.length > 0" class="common-tags-section">
        <div class="section-title">常用标签</div>
        <div class="common-tags-list">
          <span 
            v-for="tag in filteredCommonTags" 
            :key="tag" 
            class="tag-option common-tag"
            @click.stop="addTagFromExisting(tag)"
          >
            {{ tag }}
          </span>
        </div>
      </div>
      
      <!-- 所有标签列表 -->
      <div v-if="filteredAllTags.length > 0" class="all-tags-section">
        <div class="section-title">所有标签</div>
        <div class="all-tags-list">
          <span 
            v-for="tag in filteredAllTags" 
            :key="tag" 
            class="tag-option"
            @click.stop="addTagFromExisting(tag)"
          >
            {{ tag }}
          </span>
        </div>
      </div>
      
      <!-- 新建标签 -->
      <div class="new-tag-section">
        <div class="section-title">新建标签</div>
        <div class="new-tag-input-container">
          <input 
            type="text" 
            v-model="newTaskTagInput" 
            placeholder="输入新标签名称" 
            @keyup.enter="addTag"
            class="tag-input"
            @click.stop
            ref="tagInput"
          >
          <button class="add-tag-btn" @click.stop="addTag">添加</button>
        </div>
      </div>
      
      <!-- 已选择的标签 -->
      <div class="selected-tags-section" v-if="newTask.tags && newTask.tags.length > 0">
        <div class="section-title">已选择标签</div>
        <div class="selected-tags-list">
          <span v-for="tag in newTask.tags" :key="tag" class="selected-tag">
            {{ tag }}
            <button class="remove-tag-btn" @click.stop="removeTag(tag)">&times;</button>
          </span>
        </div>
      </div>
    </div>
  </div>
  
  <!-- 提醒时间按钮 -->
  <div class="quick-action-item">
    <button class="action-btn" @click.stop="toggleReminderDropdown">
      <span class="action-icon">⏰</span>
      <span v-if="newTask.reminder" class="action-badge">●</span>
    </button>
    <div v-if="showReminderInput" class="action-dropdown reminder-dropdown">
      <div class="reminder-options">
        <div class="quick-times">
          <button 
            v-for="option in quickReminderOptions" 
            :key="option.value"
            class="quick-time-btn"
            @click.stop="setQuickReminder(option.value)"
          >
            {{ option.label }}
          </button>
        </div>
        
        <div class="custom-reminder">
          <div class="section-title">自定义时间</div>
          <div class="datetime-picker-container">
            <input 
              type="datetime-local" 
              v-model="newTask.reminder"
              class="datetime-input"
              @click.stop
            >
            <button 
              class="calendar-btn"
              @click.stop="showCalendarPicker('reminder')"
              title="打开日历"
            >
              📅
            </button>
          </div>
        </div>
        
        <div v-if="newTask.reminder" class="current-reminder">
          <div class="section-title">已设置提醒</div>
          <div class="reminder-display">
            {{ formatDateTime(newTask.reminder) }}
            <button class="clear-reminder-btn" @click.stop="clearReminder">清除</button>
          </div>
        </div>
      </div>
    </div>
  </div>
  
  <!-- 时间范围按钮 -->
  <div class="quick-action-item">
    <button class="action-btn" @click.stop="toggleTimeRangeDropdown">
      <span class="action-icon">🕒</span>
      <span v-if="newTask.startTime || newTask.endTime" class="action-badge">●</span>
    </button>
    <div v-if="showTimeRangeInput" class="action-dropdown time-range-dropdown">
      <div class="time-range-options">
        <div class="quick-durations">
          <button 
            v-for="duration in quickDurations" 
            :key="duration.value"
            class="quick-duration-btn"
            @click.stop="setQuickDuration(duration.value)"
          >
            {{ duration.label }}
          </button>
        </div>
        
        <div class="custom-time-range">
          <div class="section-title">自定义时间段</div>
          <div class="time-range-inputs">
            <div class="time-input-group">
              <label>开始时间</label>
              <div class="datetime-picker-container">
                <input 
                  type="datetime-local" 
                  v-model="newTask.startTime"
                  class="datetime-input"
                  @click.stop
                >
                <button 
                  class="calendar-btn"
                  @click.stop="showCalendarPicker('startTime')"
                  title="打开日历"
                >
                  📅
                </button>
              </div>
            </div>
            
            <div class="time-input-group">
              <label>结束时间</label>
              <div class="datetime-picker-container">
                <input 
                  type="datetime-local" 
                  v-model="newTask.endTime"
                  class="datetime-input"
                  @click.stop
                >
                <button 
                  class="calendar-btn"
                  @click.stop="showCalendarPicker('endTime')"
                  title="打开日历"
                >
                  📅
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div v-if="newTask.startTime && newTask.endTime" class="current-duration">
          <div class="section-title">已设置时间段</div>
          <div class="duration-display">
            {{ formatDateTime(newTask.startTime) }} 至 {{ formatDateTime(newTask.endTime) }}
            <button class="clear-duration-btn" @click.stop="clearDuration">清除</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
          
          <!-- 标题和描述 -->
          <div class="form-group">
            <label for="task-title">任务标题</label>
            <input 
              type="text" 
              id="task-title" 
              v-model="newTask.title" 
              placeholder="输入任务标题"
            >
          </div>
          
          <div class="form-group">
            <label for="task-description">任务描述</label>
            <textarea 
              id="task-description" 
              v-model="newTask.description" 
              placeholder="输入任务描述"
              rows="4"
            ></textarea>
          </div>
          
          <!-- 状态和优先级 -->
          <div class="form-group inline">
            <label for="task-status">状态</label>
            <select id="task-status" v-model="newTask.status">
              <option value="todo">待办</option>
              <option value="inProgress">进行中</option>
              <option value="done">已完成</option>
            </select>
          </div>
          
          <div class="form-group inline">
            <label for="task-priority">优先级</label>
            <select id="task-priority" v-model="newTask.priority">
              <option value="low">低</option>
              <option value="medium">中</option>
              <option value="high">高</option>
            </select>
          </div>
          

          
          <!-- 待办清单 -->
          <div class="form-group">
            <label>待办清单</label>
            <div class="subtasks-container">
              <div v-for="(subtask, index) in newTask.subtasks" :key="index" class="subtask-item">
                <input 
                  type="checkbox" 
                  v-model="subtask.completed" 
                  class="subtask-checkbox"
                >
                <input 
                  type="text" 
                  v-model="subtask.title" 
                  class="subtask-title" 
                  :class="{ 'completed': subtask.completed }"
                  placeholder="待办项标题"
                >
                <input 
                  type="datetime-local" 
                  v-model="subtask.dueDate" 
                  class="subtask-due-date"
                  placeholder="截止时间"
                >
                <button 
                  class="delete-subtask-btn" 
                  @click.stop="removeSubtask(index)"
                >×</button>
              </div>
              <button 
                class="add-subtask-btn"
                @click="addSubtask"
              >+ 添加待办项</button>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="cancel-btn" @click="showCreateTaskModal = false">取消</button>
          <button class="preview-btn" @click="previewTask">预览</button>
          <button class="confirm-btn" @click="createTask">创建</button>
        </div>
      </div>
    </div>
    
    <!-- 任务详情弹窗 -->
    <div v-if="selectedTask" class="modal-overlay" @click.self="selectedTask = null">
      <div class="modal">
        <div class="modal-header">
          <h2>任务详情</h2>
          <button class="close-btn" @click="selectedTask = null">&times;</button>
        </div>
        <div class="modal-body" v-if="selectedTask">
          <div class="task-detail-section">
            <h3>{{ selectedTask.title }}</h3>
            <div class="task-detail-priority" :class="selectedTask.priority">
              {{ getPriorityLabel(selectedTask.priority) }}
            </div>
          </div>
          
          <div class="task-detail-section">
            <h4>任务描述</h4>
            <p v-if="selectedTask.description" class="task-detail-description">{{ selectedTask.description }}</p>
            <p v-else class="task-detail-empty">无描述</p>
          </div>
          
          <div class="task-detail-info">
            <div class="task-detail-item">
              <span class="task-detail-label">状态:</span>
              <span :class="['task-detail-value', 'status-badge', selectedTask.status]">
                {{ selectedTask.status === 'todo' ? '待办' : selectedTask.status === 'inProgress' ? '进行中' : '已完成' }}
              </span>
            </div>
            
            <div class="task-detail-item" v-if="selectedTask.dueDate">
              <span class="task-detail-label">截止日期:</span>
              <span class="task-detail-value">{{ formatDate(selectedTask.dueDate) }}</span>
            </div>
            
            <div class="task-detail-item" v-if="selectedTask.tags && selectedTask.tags.length > 0">
              <span class="task-detail-label">标签:</span>
              <div class="task-detail-tags">
                <span v-for="tag in selectedTask.tags" :key="tag" class="tag">
                  {{ tag }}
                </span>
              </div>
            </div>
          </div>
          
          <!-- 已完成任务特有的信息 -->
          <div class="task-detail-section" v-if="selectedTask.status === 'done'">
            <h4>完成信息</h4>
            <div class="task-detail-item">
              <span class="task-detail-label">完成状态:</span>
              <span class="task-detail-value completed-status">✅ 已完成</span>
            </div>
          </div>
          
          <!-- 任务详情中的待办清单 -->
          <div class="task-detail-section" v-if="selectedTask.subtasks && selectedTask.subtasks.length > 0">
            <h4>待办清单</h4>
            <div class="subtasks-detail">
              <div v-for="(subtask, index) in selectedTask.subtasks" :key="index" class="subtask-detail-item">
                <input 
                  type="checkbox" 
                  :checked="subtask.completed" 
                  disabled
                >
                <span :class="{ 'completed': subtask.completed }">
                  {{ subtask.title || '未命名待办项' }}
                </span>
                <span v-if="subtask.dueDate" class="subtask-due-date-detail">
                  ({{ formatDateTime(subtask.dueDate) }})
                </span>
              </div>
            </div>
          </div>
          
          <!-- 任务时间信息 -->
          <div class="task-detail-section" v-if="selectedTask.reminder || (selectedTask.startTime && selectedTask.endTime)">
            <h4>时间信息</h4>
            <div class="task-detail-item" v-if="selectedTask.reminder">
              <span class="task-detail-label">提醒时间:</span>
              <span class="task-detail-value">{{ formatDateTime(selectedTask.reminder) }}</span>
            </div>
            <div class="task-detail-item" v-if="selectedTask.startTime && selectedTask.endTime">
              <span class="task-detail-label">时间范围:</span>
              <span class="task-detail-value">{{ formatDateTime(selectedTask.startTime) }} 至 {{ formatDateTime(selectedTask.endTime) }}</span>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="cancel-btn" @click="selectedTask = null">关闭</button>
        </div>
      </div>
    </div>
    
    <!-- 任务预览弹窗 -->
    <div v-if="showTaskPreview" class="modal-overlay" @click.self="showTaskPreview = false">
      <div class="modal">
        <div class="modal-header">
          <h2>任务预览</h2>
          <button class="close-btn" @click="showTaskPreview = false">&times;</button>
        </div>
        <div class="modal-body" v-if="previewTask">
          <div class="task-detail-section">
            <h3>{{ previewTask.title }}</h3>
            <div class="task-detail-priority" :class="previewTask.priority">
              {{ getPriorityLabel(previewTask.priority) }}
            </div>
          </div>
          
          <!-- 标签显示 -->
          <div class="task-detail-section" v-if="previewTask.tags && previewTask.tags.length > 0">
            <h4>标签</h4>
            <div class="task-detail-tags">
              <span v-for="tag in previewTask.tags" :key="tag" class="tag">
                {{ tag }}
              </span>
            </div>
          </div>
          
          <!-- 任务时间信息 -->
          <div class="task-detail-section">
            <h4>时间信息</h4>
            <div class="task-detail-item" v-if="previewTask.reminder">
              <span class="task-detail-label">提醒时间:</span>
              <span class="task-detail-value">{{ formatDateTime(previewTask.reminder) }}</span>
            </div>
            <div class="task-detail-item" v-if="previewTask.startTime && previewTask.endTime">
              <span class="task-detail-label">时间范围:</span>
              <span class="task-detail-value">{{ formatDateTime(previewTask.startTime) }} 至 {{ formatDateTime(previewTask.endTime) }}</span>
            </div>
            <div class="task-detail-item" v-if="previewTask.dueDate">
              <span class="task-detail-label">截止日期:</span>
              <span class="task-detail-value">{{ formatDate(previewTask.dueDate) }}</span>
            </div>
          </div>
          
          <!-- 任务描述 -->
          <div class="task-detail-section">
            <h4>任务描述</h4>
            <p v-if="previewTask.description" class="task-detail-description">{{ previewTask.description }}</p>
            <p v-else class="task-detail-empty">无描述</p>
          </div>
          
          <!-- 待办清单 -->
          <div class="task-detail-section" v-if="previewTask.subtasks && previewTask.subtasks.length > 0">
            <h4>待办清单</h4>
            <div class="subtasks-preview">
              <div v-for="(subtask, index) in previewTask.subtasks" :key="index" class="subtask-preview-item">
                <input 
                  type="checkbox" 
                  :checked="subtask.completed" 
                  disabled
                >
                <span :class="{ 'completed': subtask.completed }">
                  {{ subtask.title || '未命名待办项' }}
                </span>
                <span v-if="subtask.dueDate" class="subtask-due-date-preview">
                  ({{ formatDateTime(subtask.dueDate) }})
                </span>
              </div>
            </div>
          </div>
          
          <div class="task-detail-section">
            <h4>状态信息</h4>
            <div class="task-detail-item">
              <span class="task-detail-label">状态:</span>
              <span :class="['task-detail-value', 'status-badge', previewTask.status]">
                {{ previewTask.status === 'todo' ? '待办' : previewTask.status === 'inProgress' ? '进行中' : '已完成' }}
              </span>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="cancel-btn" @click="showTaskPreview = false">关闭</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Tasks',
  data() {
    return {
      showCreateTaskModal: false,
      activeFilter: 'all',
      selectedTask: null, // 用于存储当前选中的任务，显示详情
      showTaskPreview: false, // 任务预览弹窗
      previewTask: null, // 预览的任务数据
      newTaskTagInput: '', // 用于输入标签的临时变量
      showTagsInput: false, // 控制标签输入框显示
      showReminderInput: false, // 控制提醒时间输入框显示
      showTimeRangeInput: false, // 控制时间范围输入框显示
      filters: [
        { id: 'all', name: '全部' },
        { id: 'todo', name: '待办' },
        { id: 'inProgress', name: '进行中' },
        { id: 'done', name: '已完成' },
        { id: 'highPriority', name: '高优先级' }
      ],
      allTags: [], // 存储所有任务使用的标签
      taskStatuses: [
        { id: 'todo', name: '待办' },
        { id: 'inProgress', name: '进行中' },
        { id: 'done', name: '已完成' }
      ],
      // 初始化时包含一些模拟数据，确保即使数据库为空也能看到效果
      tasks: [
        {
          id: 1,
          title: '完成项目文档',
          description: '编写项目的用户手册和API文档',
          status: 'todo',
          priority: 'high',
          dueDate: '2023-12-10',
          tags: ['文档', '重要'],
          reminder: '2023-12-09T10:00',
          startTime: '2023-12-08T09:00',
          endTime: '2023-12-10T18:00',
          subtasks: [
            { id: 1, title: '编写用户手册', completed: false, dueDate: '2023-12-09T18:00' },
            { id: 2, title: '编写API文档', completed: false, dueDate: '2023-12-10T18:00' }
          ]
        },
        {
          id: 2,
          title: '修复首页bug',
          description: '解决首页加载时的崩溃问题',
          status: 'inProgress',
          priority: 'high',
          dueDate: '2023-12-05',
          tags: ['bug', '紧急'],
          reminder: '2023-12-05T09:00',
          startTime: '2023-12-04T14:00',
          endTime: '2023-12-05T18:00',
          subtasks: [
            { id: 1, title: '分析崩溃原因', completed: true, dueDate: '2023-12-04T16:00' },
            { id: 2, title: '编写修复代码', completed: false, dueDate: '2023-12-05T12:00' },
            { id: 3, title: '测试验证', completed: false, dueDate: '2023-12-05T16:00' }
          ]
        },
        {
          id: 3,
          title: '完成数据分析报告',
          description: '分析第三季度销售数据并生成报告',
          status: 'done',
          priority: 'high',
          dueDate: '2023-11-30',
          completionDate: '2023-11-29',
          tags: ['报告', '季度'],
          reminder: '2023-11-29T10:00',
          startTime: '2023-11-28T09:00',
          endTime: '2023-11-29T18:00',
          subtasks: [
            { id: 1, title: '收集数据', completed: true, dueDate: '2023-11-28T12:00' },
            { id: 2, title: '分析数据', completed: true, dueDate: '2023-11-28T18:00' },
            { id: 3, title: '生成报告', completed: true, dueDate: '2023-11-29T16:00' }
          ]
        }
      ],
      newTask: {
        title: '',
        description: '',
        status: 'todo',
        priority: 'medium',
        dueDate: '',
        tags: [],
        reminder: '',
        startTime: '',
        endTime: '',
        subtasks: []
      },
 // 新增数据属性
    tagSearchQuery: '',
    quickReminderOptions: [
      { label: '15分钟后', value: 15 },
      { label: '30分钟后', value: 30 },
      { label: '1小时后', value: 60 },
      { label: '2小时后', value: 120 },
      { label: '明天此时', value: 'tomorrow' },
      { label: '下周此时', value: 'nextWeek' }
    ],
    quickDurations: [
      { label: '30分钟', value: 30 },
      { label: '1小时', value: 60 },
      { label: '2小时', value: 120 },
      { label: '半天', value: 720 },
      { label: '全天', value: 1440 }
    ],
    commonTags: ['重要', '紧急', '工作', '个人', '学习', '项目', '日常', '会议']
    };
  },
  
  mounted() {
    // 组件加载时加载任务数据
    this.loadTasks();
    
    // 添加点击外部关闭下拉菜单的事件监听
    document.addEventListener('click', this.closeAllDropdowns);
  },
  
  beforeUnmount() {
    // 移除事件监听
    document.removeEventListener('click', this.closeAllDropdowns);
  },
  computed: {
  // 新增计算属性
  filteredCommonTags() {
    if (!this.tagSearchQuery) {
      return this.commonTags;
    }
    return this.commonTags.filter(tag => 
      tag.toLowerCase().includes(this.tagSearchQuery.toLowerCase())
    );
  },
  
  filteredAllTags() {
    if (!this.tagSearchQuery) {
      return this.allTags.filter(tag => !this.commonTags.includes(tag));
    }
    return this.allTags.filter(tag => 
      tag.toLowerCase().includes(this.tagSearchQuery.toLowerCase()) && 
      !this.commonTags.includes(tag)
    );
  }
},
  methods: {
    // 将这些辅助方法移到主组件中
    getPriorityLabel(priority) {
      const labels = { low: '低', medium: '中', high: '高' };
      return labels[priority] || priority;
    },
    
    formatDate(dateString) {
      if (!dateString) return '';
      try {
        const date = new Date(dateString);
        return date.toLocaleDateString('zh-CN');
      } catch (e) {
        return dateString;
      }
    },
    
    async loadTasks() {
      try {
        const tasks = await window.electronAPI.getAllTasks();
        // 转换任务数据格式以匹配前端组件的期望
        this.tasks = tasks.map(task => ({
          ...task,
          // 确保tags是数组而不是JSON字符串
          tags: typeof task.tags === 'string' ? JSON.parse(task.tags || '[]') : task.tags || [],
          // 将状态和优先级从数字转换为字符串表示
          status: this.getStatusString(task.status),
          priority: this.getPriorityString(task.priority),
          // 调整日期格式
          dueDate: task.due_date || null
        }));
        
        // 收集所有任务的标签
        this.collectAllTags();
      } catch (error) {
        console.error('加载任务失败:', error);
        // 如果加载失败，提供一些示例数据
        this.tasks = [
          {
            id: 1,
            title: '完成项目文档',
            description: '编写项目的用户手册和API文档',
            status: 'todo',
            priority: 'high',
            dueDate: '2023-12-10'
          },
          {
            id: 2,
            title: '修复首页bug',
            description: '解决首页加载时的崩溃问题',
            status: 'inProgress',
            priority: 'high',
            dueDate: '2023-12-05'
          },
          {
            id: 3,
            title: '完成数据分析报告',
            description: '分析第三季度销售数据并生成报告',
            status: 'done',
            priority: 'high',
            dueDate: '2023-11-30',
            completionDate: '2023-11-29'
          }
        ];
      }
    },
    
    getStatusString(status) {
      const statusMap = { 0: 'todo', 1: 'inProgress', 2: 'done' };
      return statusMap[status] || 'todo';
    },
    
    getPriorityString(priority) {
      const priorityMap = { 0: 'low', 1: 'medium', 2: 'high' };
      return priorityMap[priority] || 'medium';
    },
    
    getStatusNumber(status) {
      const statusMap = { 'todo': 0, 'inProgress': 1, 'done': 2 };
      return statusMap[status] || 0;
    },
    
    getPriorityNumber(priority) {
      const priorityMap = { 'low': 0, 'medium': 1, 'high': 2 };
      return priorityMap[priority] || 1;
    },
    
    getTasksByStatus(status) {
      let filteredTasks = this.tasks.filter(task => task.status === status)
      
      // 应用当前激活的过滤器 - 只在高优先级过滤器时筛选优先级，否则保持原有状态
      if (this.activeFilter === 'highPriority') {
        filteredTasks = filteredTasks.filter(task => task.priority === 'high')
      }
      
      return filteredTasks
    },
    
    getTaskCount(filterId) {
      switch (filterId) {
        case 'todo':
          return this.tasks.filter(task => task.status === 'todo').length
        case 'inProgress':
          return this.tasks.filter(task => task.status === 'inProgress').length
        case 'done':
          return this.tasks.filter(task => task.status === 'done').length
        case 'highPriority':
          return this.tasks.filter(task => task.priority === 'high').length
        default:
          return this.tasks.length
      }
    },
    
    // 确保 handleTaskUpdate 方法正确实现，修复对象克隆错误
    async handleTaskUpdate(updatedTask) {
      try {
        // 创建一个纯数据对象，避免传递不能序列化的对象
        const taskData = {
          id: updatedTask.id,
          title: updatedTask.title,
          description: updatedTask.description || '',
          status: this.getStatusNumber(updatedTask.status),
          priority: this.getPriorityNumber(updatedTask.priority),
          due_date: updatedTask.dueDate || null
        };
        
        // 调用API更新任务
        const result = await window.electronAPI.updateTask(updatedTask.id, taskData);
        
        if (result) {
          // 更新本地任务列表
          const index = this.tasks.findIndex(task => task.id === updatedTask.id);
          if (index !== -1) {
            this.tasks[index] = {
              ...result,
              status: this.getStatusString(result.status),
              priority: this.getPriorityString(result.priority),
              dueDate: result.due_date || null
            };
          }
        }
      } catch (error) {
        console.error('更新任务失败:', error);
        alert('更新任务失败: ' + error.message);
      }
    },
    
    // 确保 handleTaskDelete 方法正确实现
    async handleTaskDelete(taskId) {
      try {
        // 调用API删除任务
        const result = await window.electronAPI.deleteTask(taskId);
        
        if (result) {
          // 从本地任务列表中移除
          this.tasks = this.tasks.filter(task => task.id !== taskId);
        }
      } catch (error) {
        console.error('删除任务失败:', error);
        alert('删除任务失败: ' + error.message);
      }
    },
    
    // 格式化日期时间
    formatDateTime(dateTimeString) {
      if (!dateTimeString) return '';
      try {
        const date = new Date(dateTimeString);
        return date.toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        });
      } catch (e) {
        return dateTimeString;
      }
    },

    // 标签管理
    addTag() {
      if (this.newTaskTagInput.trim() && !this.newTask.tags.includes(this.newTaskTagInput.trim())) {
        this.newTask.tags.push(this.newTaskTagInput.trim());
        this.newTaskTagInput = '';
      }
    },
    
    // 点击外部关闭下拉菜单
    closeAllDropdowns() {
      this.showTagsInput = false;
      this.showReminderInput = false;
      this.showTimeRangeInput = false;
    },

    removeTag(tag) {
      this.newTask.tags = this.newTask.tags.filter(t => t !== tag);
    },

    // 待办清单管理
    addSubtask() {
      this.newTask.subtasks.push({ title: '', completed: false, dueDate: '' });
    },

    removeSubtask(index) {
      this.newTask.subtasks.splice(index, 1);
    },

    // 任务预览
    previewTask() {
      this.previewTask = JSON.parse(JSON.stringify(this.newTask));
      this.showTaskPreview = true;
    },

    async createTask() {
      if (!this.newTask.title.trim()) {
        alert('请输入任务标题')
        return
      }
      
      try {
        // 将前端格式转换为后端期望的格式
        const taskData = {
          ...this.newTask,
          status: this.getStatusNumber(this.newTask.status),
          priority: this.getPriorityNumber(this.newTask.priority),
          due_date: this.newTask.dueDate || null,
          tags: this.newTask.tags || [],
          reminder: this.newTask.reminder || null,
          start_time: this.newTask.startTime || null,
          end_time: this.newTask.endTime || null,
          subtasks: this.newTask.subtasks || []
        };
        
        // 调用API创建任务
        const result = await window.electronAPI.createTask(taskData);
        
        if (result) {
          // 添加到本地任务列表
          this.tasks.push({
            ...result,
            status: this.getStatusString(result.status),
            priority: this.getPriorityString(result.priority),
            dueDate: result.due_date || null,
            tags: result.tags || [],
            reminder: result.reminder || null,
            startTime: result.start_time || null,
            endTime: result.end_time || null,
            subtasks: result.subtasks || []
          });
          
          this.resetNewTask()
          this.showCreateTaskModal = false
        }
      } catch (error) {
        console.error('创建任务失败:', error);
        alert('创建任务失败: ' + error.message);
      }
    },
    
    collectAllTags() {
      // 收集所有任务的标签并去重
      const tagSet = new Set();
      this.tasks.forEach(task => {
        if (task.tags && Array.isArray(task.tags)) {
          task.tags.forEach(tag => {
            if (tag && tag.trim()) {
              tagSet.add(tag.trim());
            }
          });
        }
      });
      this.allTags = Array.from(tagSet);
    },
    
    resetNewTask() {
      this.newTask = {
        title: '',
        description: '',
        status: 'todo',
        priority: 'medium',
        dueDate: '',
        tags: [],
        reminder: '',
        startTime: '',
        endTime: '',
        subtasks: []
      }
      this.newTaskTagInput = '';
      this.closeAllDropdowns();
    },
    
    // 显示任务详情
    showTaskDetails(task) {
      this.selectedTask = task;
    },

    // 从已有标签列表中添加标签
    addTagFromExisting(tag) {
      if (tag && !this.newTask.tags.includes(tag.trim())) {
        this.newTask.tags.push(tag.trim());
      }
    },

    // 标签管理
    addTag() {
      if (this.newTaskTagInput.trim() && !this.newTask.tags.includes(this.newTaskTagInput.trim())) {
        this.newTask.tags.push(this.newTaskTagInput.trim());
        this.newTaskTagInput = '';
      }
    },

    // 点击外部关闭下拉菜单
    closeAllDropdowns() {
      this.showTagsInput = false;
      this.showReminderInput = false;
      this.showTimeRangeInput = false;
    },

    removeTag(tag) {
      this.newTask.tags = this.newTask.tags.filter(t => t !== tag);
    },

    // 待办清单管理
    addSubtask() {
      this.newTask.subtasks.push({ title: '', completed: false, dueDate: '' });
    },

    removeSubtask(index) {
      this.newTask.subtasks.splice(index, 1);
    },

    // 任务预览
    previewTask() {
      this.previewTask = JSON.parse(JSON.stringify(this.newTask));
      this.showTaskPreview = true;
    },
    toggleTagsDropdown() {
    this.showTagsInput = !this.showTagsInput;
    if (this.showTagsInput) {
      this.showReminderInput = false;
      this.showTimeRangeInput = false;
      this.$nextTick(() => {
        if (this.$refs.tagInput) {
          this.$refs.tagInput.focus();
        }
      });
    }
  },
  toggleReminderDropdown() {
    this.showReminderInput = !this.showReminderInput;
    if (this.showReminderInput) {
      this.showTagsInput = false;
      this.showTimeRangeInput = false;
    }
  },
  
  toggleTimeRangeDropdown() {
    this.showTimeRangeInput = !this.showTimeRangeInput;
    if (this.showTimeRangeInput) {
      this.showTagsInput = false;
      this.showReminderInput = false;
    }
  },
  
  setQuickReminder(minutes) {
    const now = new Date();
    let reminderTime;
    if (minutes === 'tomorrow') {
      reminderTime = new Date(now);
      reminderTime.setDate(reminderTime.getDate() + 1);
    } else if (minutes === 'nextWeek') {
      reminderTime = new Date(now);
      reminderTime.setDate(reminderTime.getDate() + 7);
    } else {
      reminderTime = new Date(now.getTime() + minutes * 60 * 1000);
    }
    
    // 格式化为 datetime-local 需要的格式
    this.newTask.reminder = reminderTime.toISOString().slice(0, 16);
    this.showReminderInput = false;
  },
  
  setQuickDuration(minutes) {
    const now = new Date();
    this.newTask.startTime = now.toISOString().slice(0, 16);
    
    const endTime = new Date(now.getTime() + minutes * 60 * 1000);
    this.newTask.endTime = endTime.toISOString().slice(0, 16);
    this.showTimeRangeInput = false;
  },
  clearReminder() {
    this.newTask.reminder = '';
  },
  
  clearDuration() {
    this.newTask.startTime = '';
    this.newTask.endTime = '';
  },
  
  showCalendarPicker(field) {
    // 这里可以集成更复杂的日历组件
    // 目前使用原生 datetime-local 输入类型已经足够
    console.log(`打开 ${field} 的日历选择器`);
  },
   // 修改现有的 closeAllDropdowns 方法
  closeAllDropdowns(event) {
    // 检查点击是否在 dropdown 内部
    const isClickInsideDropdown = event && (
      event.target.closest('.action-dropdown') ||
      event.target.closest('.action-btn')
    );
    
    if (!isClickInsideDropdown) {
      this.showTagsInput = false;
      this.showReminderInput = false;
      this.showTimeRangeInput = false;
      this.tagSearchQuery = '';
    }}
  }
}
</script>

// 更新样式部分，添加子任务相关的样式
<style scoped>
.tasks-page {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.tasks-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
  background: white;
}

.create-task-btn {
  display: flex;
  align-items: center;
  padding: 10px 20px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
}

.plus-icon {
  margin-right: 5px;
  font-size: 18px;
  font-weight: bold;
}

.tasks-filters {
  padding: 10px 20px;
  background: white;
  border-bottom: 1px solid #e0e0e0;
}

.filter-tabs {
  display: flex;
  gap: 10px;
}

.filter-tab {
  padding: 8px 16px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 5px;
}

.filter-tab.active {
  background-color: #3498db;
  color: white;
  border-color: #3498db;
}

.task-count {
  background: rgba(255, 255, 255, 0.2);
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
}

.tasks-container {
  flex: 1;
  display: flex;
  gap: 20px;
  padding: 20px;
  overflow-x: auto;
}

.task-column {
  flex: 1;
  min-width: 300px;
  background: #f5f7f9;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
}

.column-header {
  padding: 15px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  border-radius: 8px 8px 0 0;
}

.task-list {
  flex: 1;
  padding: 15px;
  overflow-y: auto;
}

.task-card {
  background: white;
  padding: 15px;
  margin-bottom: 15px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border-left: 4px solid #ddd;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.task-priority {
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
  color: white;
}

.task-priority.low {
  background: #2ecc71;
}

.task-priority.medium {
  background: #f39c12;
}

.task-priority.high {
  background: #e74c3c;
}

.delete-task-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #999;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.delete-task-btn:hover {
  background: #f5f5f5;
  color: #e74c3c;
}

.task-title {
  margin: 0 0 10px 0;
  font-size: 16px;
  font-weight: 600;
}

.task-description {
  margin: 0 0 10px 0;
  color: #666;
  font-size: 14px;
}

.task-dueDate {
  margin: 0 0 10px 0;
  color: #999;
  font-size: 13px;
}

.task-actions {
  display: flex;
  gap: 10px;
}

.task-actions button {
  padding: 5px 10px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.task-actions button:hover {
  background: #f5f5f5;
}

/* 弹窗样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.modal-header {
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.close-btn:hover {
  background: #f5f5f5;
  color: #333;
}

.modal-body {
  padding: 20px;
  overflow-y: auto;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  color: #333;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.modal-footer {
  padding: 20px;
  border-top: 1px solid #e0e0e0;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.cancel-btn {
  padding: 10px 20px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.confirm-btn {
  padding: 10px 20px;
  border: none;
  background: #3498db;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.confirm-btn:hover {
  background: #2980b9;
}

.subtasks-section {
  margin-top: 12px;
  border-top: 1px solid #eee;
  padding-top: 12px;
}

.subtasks-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  font-size: 14px;
  color: #666;
  padding: 4px 0;
}

.toggle-icon {
  font-size: 16px;
  font-weight: bold;
  color: #999;
}

.subtasks-content {
  margin-top: 8px;
  padding-left: 8px;
}

.subtask-item {
  display: flex;
  align-items: center;
  margin-bottom: 6px;
  font-size: 13px;
}

.subtask-item input[type="checkbox"] {
  margin-right: 8px;
}

.subtask-item .completed {
  text-decoration: line-through;
  color: #999;
}

.delete-subtask-btn {
  margin-left: auto;
  background: none;
  border: none;
  font-size: 18px;
  color: #999;
  cursor: pointer;
  padding: 2px 6px;
}

.delete-subtask-btn:hover {
  color: #e74c3c;
}

.create-subtask {
  display: flex;
  margin-top: 8px;
}

.create-subtask input {
  flex: 1;
  padding: 6px 10px;
  border: 1px solid #ddd;
  border-radius: 4px 0 0 4px;
  font-size: 13px;
}

.add-subtask-btn {
  padding: 6px 12px;
  background-color: #2ecc71;
  color: white;
  border: none;
  border-radius: 0 4px 4px 0;
  cursor: pointer;
  font-size: 13px;
}

.add-subtask-btn:hover {
  background-color: #27ae60;
}

/* 快捷功能按钮区样式 */
.quick-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 20px;
}

.quick-action-item {
  position: relative;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.action-btn:hover {
  background-color: #f8f9fa;
  border-color: #3498db;
}

.action-icon {
  font-size: 16px;
}

.action-text {
  color: #333;
}

.action-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 6px;
  background-color: #3498db;
  color: white;
  font-size: 11px;
  font-weight: 600;
  border-radius: 9px;
  margin-left: 6px;
}

/* 下拉菜单样式 */
.action-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 4px;
  padding: 12px;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 100;
  min-width: 250px;
}

.tag-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  margin-bottom: 8px;
}

.datetime-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

/* 时间范围下拉菜单样式 */
.time-range-dropdown {
  min-width: 400px;
}

.range-separator {
  padding: 0 8px;
  color: #666;
  font-size: 14px;
}

/* 标签相关样式 */
.task-tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.tag {
  background-color: #e3f2fd;
  color: #1565c0;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.tag-option {
  background-color: #f0f0f0;
  color: #666;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.tag-option:hover {
  background-color: #e0e0e0;
}



/* 弹窗样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.modal-header {
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.close-btn:hover {
  background: #f5f5f5;
  color: #333;
}

.modal-body {
  padding: 20px;
  overflow-y: auto;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  color: #333;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.modal-footer {
  padding: 20px;
  border-top: 1px solid #e0e0e0;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.cancel-btn {
  padding: 10px 20px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.confirm-btn {
  padding: 10px 20px;
  border: none;
  background: #3498db;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.confirm-btn:hover {
  background: #2980b9;
}

.subtasks-section {
  gap: 8px;
  margin-top: 8px;
}

.tag {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  background-color: #3498db;
  color: white;
  border-radius: 15px;
  font-size: 12px;
}

.remove-tag-btn {
  margin-left: 6px;
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 14px;
  line-height: 1;
  padding: 0 2px;
}

/* 时间范围输入框样式 */
.time-range-inputs {
  display: flex;
  align-items: center;
  gap: 8px;
}

.time-range-inputs input {
  flex: 1;
}

/* 待办清单样式 */
.subtasks-container {
  margin-top: 10px;
}

.subtask-item {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  padding: 10px;
  background-color: #f8f9fa;
  border-radius: 6px;
}

.subtask-checkbox {
  margin-right: 10px;
  width: 16px;
  height: 16px;
}

.subtask-title {
  flex: 1;
  padding: 6px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 13px;
}

.subtask-title.completed {
  text-decoration: line-through;
  color: #999;
}

.subtask-due-date {
  width: 150px;
  padding: 6px 10px;
  margin: 0 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 12px;
}

.delete-subtask-btn {
  background: none;
  border: none;
  font-size: 20px;
  color: #999;
  cursor: pointer;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.delete-subtask-btn:hover {
  background-color: #f5f5f5;
  color: #e74c3c;
}

.add-subtask-btn {
  display: block;
  width: 100%;
  padding: 10px;
  margin-top: 10px;
  background-color: #2ecc71;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  text-align: center;
}

.add-subtask-btn:hover {
  background-color: #27ae60;
}

/* 预览按钮样式 */
.preview-btn {
  padding: 10px 20px;
  border: none;
  background: #9b59b6;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.preview-btn:hover {
  background: #8e44ad;
}

/* 任务详情弹窗样式 */
.task-detail-section {
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.task-detail-section:last-child {
  border-bottom: none;
}

.task-detail-section h3 {
  margin: 0 0 10px 0;
  font-size: 20px;
  color: #333;
}

.task-detail-section h4 {
  margin: 0 0 10px 0;
  font-size: 16px;
  color: #666;
  font-weight: 500;
}

.task-detail-priority {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 16px;
  color: white;
  font-size: 14px;
  font-weight: 500;
}

.task-detail-priority.low {
  background-color: #2ecc71;
}

.task-detail-priority.medium {
  background-color: #f39c12;
}

.task-detail-priority.high {
  background-color: #e74c3c;
}

.task-detail-description {
  margin: 0;
  line-height: 1.6;
  color: #333;
  font-size: 14px;
}

.task-detail-empty {
  margin: 0;
  color: #999;
  font-style: italic;
  font-size: 14px;
}

.task-detail-info {
  margin-top: 15px;
}

.task-detail-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.task-detail-item:last-child {
  margin-bottom: 0;
}

.task-detail-label {
  min-width: 80px;
  font-weight: 500;
  color: #666;
  font-size: 14px;
}

.task-detail-value {
  flex: 1;
  color: #333;
  font-size: 14px;
}

.task-detail-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  flex: 1;
}

.tag {
  display: inline-block;
  padding: 4px 10px;
  background-color: #ecf0f1;
  border-radius: 16px;
  font-size: 12px;
  color: #7f8c8d;
}

.completed-status {
  color: #27ae60;
  font-weight: 500;
}

/* 确保任务卡片在所有状态下都可点击 */
.task-card {
  cursor: pointer;
}

/* 确保删除按钮和状态切换按钮的点击事件不触发任务详情显示 */
.task-actions button,
.delete-task-btn {
  cursor: pointer;
}

/* 完成日期样式 */
.task-completion-date {
  margin: 8px 0;
  color: #27ae60;
  font-size: 13px;
  font-weight: 500;
}
/* 新增样式规则 */

/* 下拉菜单通用样式 */
.action-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 4px;
  padding: 12px;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 100;
  min-width: 280px;
  max-height: 400px;
  overflow-y: auto;
}

/* 标签下拉菜单特定样式 */
.tags-dropdown {
  min-width: 320px;
}

.tags-search {
  margin-bottom: 12px;
}

.tag-search-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.section-title {
  font-size: 12px;
  font-weight: 600;
  color: #666;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.common-tags-list,
.all-tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 12px;
}

.tag-option {
  display: inline-block;
  padding: 4px 10px;
  background-color: #f0f0f0;
  color: #666;
  border-radius: 12px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.tag-option:hover {
  background-color: #e0e0e0;
  transform: translateY(-1px);
}

.common-tag {
  background-color: #e3f2fd;
  color: #1565c0;
}

.new-tag-input-container {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.tag-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.add-tag-btn {
  padding: 8px 12px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  white-space: nowrap;
}

.add-tag-btn:hover {
  background-color: #2980b9;
}

.selected-tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.selected-tag {
  display: inline-flex;
  align-items: center;
  padding: 4px 8px 4px 12px;
  background-color: #3498db;
  color: white;
  border-radius: 12px;
  font-size: 12px;
}

.remove-tag-btn {
  margin-left: 6px;
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 14px;
  line-height: 1;
  padding: 0 2px;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.remove-tag-btn:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

/* 提醒下拉菜单特定样式 */
.reminder-dropdown {
  min-width: 300px;
}

.quick-times {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 12px;
}

.quick-time-btn {
  padding: 8px 12px;
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  text-align: center;
  transition: all 0.2s;
}

.quick-time-btn:hover {
  background-color: #e9ecef;
  border-color: #3498db;
}

.datetime-picker-container {
  display: flex;
  gap: 8px;
}

.datetime-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.calendar-btn {
  padding: 8px 12px;
  background-color: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.calendar-btn:hover {
  background-color: #e9ecef;
}

.current-reminder {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #eee;
}

.reminder-display {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  color: #666;
}

.clear-reminder-btn {
  padding: 4px 8px;
  background-color: #e74c3c;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 11px;
}

.clear-reminder-btn:hover {
  background-color: #c0392b;
}

/* 时间范围下拉菜单特定样式 */
.time-range-dropdown {
  min-width: 350px;
}

.quick-durations {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 12px;
}

.quick-duration-btn {
  padding: 8px 12px;
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  text-align: center;
  transition: all 0.2s;
}

.quick-duration-btn:hover {
  background-color: #e9ecef;
  border-color: #3498db;
}

.time-input-group {
  margin-bottom: 12px;
}

.time-input-group label {
  display: block;
  margin-bottom: 4px;
  font-size: 12px;
  color: #666;
  font-weight: 500;
}

.current-duration {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #eee;
}

.duration-display {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  color: #666;
}

.clear-duration-btn {
  padding: 4px 8px;
  background-color: #e74c3c;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 11px;
}

.clear-duration-btn:hover {
  background-color: #c0392b;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .action-dropdown {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 90%;
    max-width: 300px;
    max-height: 80vh;
  }
  
  .quick-times,
  .quick-durations {
    grid-template-columns: 1fr;
  }
}
</style>