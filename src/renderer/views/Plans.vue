<template>
  <div class="plans-page">
    <div class="plans-header">
      <h1>我的计划</h1>
      <div class="header-actions">
        <button class="create-plan-btn" @click="showCreatePlanModal = true">
          <div class="plus-icon">+</div>
          <span>创建计划</span>
        </button>
      </div>
    </div>

    <div class="plans-filters">
      <div class="filter-tabs">
        <button 
          v-for="filter in filters" 
          :key="filter.id"
          :class="['filter-tab', { active: activeFilter === filter.id }]"
          @click="activeFilter = filter.id"
        >
          {{ filter.name }}
          <span v-if="filter.id !== 'all'" class="plan-count">{{ getPlanCount(filter.id) }}</span>
        </button>
      </div>
    </div>

    <!-- 计划列表 -->
    <div class="plans-list">
      <div 
        v-for="plan in getFilteredPlans()" 
        :key="plan.id" 
        class="plan-card"
        @click="showPlanDetails(plan)"
      >
        <div class="plan-header">
          <h3 class="plan-title">{{ plan.title }}</h3>
          <button class="delete-plan-btn" @click.stop="handlePlanDelete(plan.id)">×</button>
        </div>
        <div class="plan-description" v-if="plan.description">{{ plan.description }}</div>
        
        <!-- 计划进度条 -->
        <div class="plan-progress-container" v-if="plan.subtasks && plan.subtasks.length > 0">
          <div class="progress-info">
            <span>进度: {{ getPlanProgress(plan) }}%</span>
            <span>{{ getCompletedSubtasksCount(plan) }}/{{ plan.subtasks.length }}</span>
          </div>
          <div class="progress-bar">
            <div 
              class="progress-fill" 
              :style="{ width: getPlanProgress(plan) + '%' }"
            ></div>
          </div>
        </div>
        
        <!-- 计划类型 -->
        <div class="plan-tags">
          <span v-for="tag in plan.tags" :key="tag" class="plan-tag">{{ tag }}</span>
        </div>
        
        <!-- 计划日期 -->
        <div class="plan-dates">
          <div v-if="plan.startDate && plan.endDate">
            <span class="date-label">时间范围:</span>
            <span>{{ formatDate(plan.startDate) }} 至 {{ formatDate(plan.endDate) }}</span>
          </div>
          <div v-if="plan.endDate">
            <span class="date-label">剩余时间:</span>
            <span :class="getDeadlineClass(plan)">{{ getDeadlineText(plan) }}</span>
          </div>
        </div>
        
        <!-- 计划目标 -->
        <div class="plan-goal" v-if="plan.goal">
          <span class="goal-label">目标:</span>
          <span>{{ plan.goal }}</span>
        </div>
      </div>
      
      <!-- 无计划时的提示 -->
      <div v-if="getFilteredPlans().length === 0" class="no-plans">
        <div class="no-plans-icon">📝</div>
        <p>还没有创建计划</p>
        <button class="create-first-plan-btn" @click="showCreatePlanModal = true">
          创建第一个计划
        </button>
      </div>
    </div>

    <!-- 创建计划弹窗 -->
    <div v-if="showCreatePlanModal" class="modal-overlay" @click.self="showCreatePlanModal = false">
      <div class="modal">
        <div class="modal-header">
          <h2>{{ isEditing ? '编辑计划' : '创建新计划' }}</h2>
          <button class="close-btn" @click="showCreatePlanModal = false">&times;</button>
        </div>
        <div class="modal-body">
          <!-- 计划标题 -->
          <div class="form-group">
            <label for="plan-title">计划标题 *</label>
            <input 
              type="text" 
              id="plan-title" 
              v-model="newPlan.title" 
              placeholder="输入计划标题"
              required
            >
          </div>
          
          <!-- 计划描述 -->
          <div class="form-group">
            <label for="plan-description">计划描述</label>
            <textarea 
              id="plan-description" 
              v-model="newPlan.description" 
              placeholder="输入计划描述"
              rows="4"
            ></textarea>
          </div>
          
          <!-- 计划类型 -->
          <div class="form-group">
            <label for="plan-tags">计划类型</label>
            <div class="tags-input">
              <div class="selected-tags">
                <span v-for="tag in newPlan.tags" :key="tag" class="selected-tag">
                  {{ tag }}
                  <button class="remove-tag-btn" @click.stop="removeTag(tag)">&times;</button>
                </span>
              </div>
              <input 
                type="text" 
                v-model="newTagInput" 
                placeholder="添加类型标签（按回车确认）"
                @keyup.enter="addTag"
                class="tag-input"
              >
            </div>
          </div>
          
          <!-- 时间范围 -->
          <div class="form-group">
            <label>时间范围</label>
            <div class="date-range-inputs">
              <div class="date-input-group">
                <label>开始日期</label>
                <input 
                  type="date" 
                  v-model="newPlan.startDate"
                  class="date-input"
                >
              </div>
              <div class="date-input-group">
                <label>结束日期</label>
                <input 
                  type="date" 
                  v-model="newPlan.endDate"
                  class="date-input"
                >
              </div>
            </div>
          </div>
          
          <!-- 计划目标 -->
          <div class="form-group">
            <label for="plan-goal">计划目标</label>
            <input 
              type="text" 
              id="plan-goal" 
              v-model="newPlan.goal" 
              placeholder="例如：读完3本书、减重5公斤"
            >
          </div>
          
          <!-- 子任务 -->
          <div class="form-group">
            <label>任务清单</label>
            <div class="subtasks-container">
              <div v-for="(subtask, index) in newPlan.subtasks" :key="index" class="subtask-item">
                <input 
                  type="text" 
                  v-model="subtask.title" 
                  placeholder="任务内容"
                  class="subtask-input"
                >
                <button 
                  class="remove-subtask-btn" 
                  @click.stop="removeSubtask(index)"
                >
                  ×
                </button>
              </div>
              <button 
                class="add-subtask-btn" 
                @click="addSubtask"
              >
                + 添加任务
              </button>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="cancel-btn" @click="showCreatePlanModal = false">取消</button>
          <button class="create-btn" @click="createPlan">{{ isEditing ? '保存修改' : '创建计划' }}</button>
        </div>
      </div>
    </div>

    <!-- 计划详情弹窗 -->
    <div v-if="showPlanDetailsModal" class="modal-overlay" @click.self="closePlanDetails">
      <div class="modal details-modal">
        <div class="modal-header">
          <h2>计划详情</h2>
          <div class="modal-actions">
            <button class="edit-btn" @click="editPlan">编辑</button>
            <button class="close-btn" @click="closePlanDetails">&times;</button>
          </div>
        </div>
        <div class="modal-body">
          <div class="plan-details-header">
            <h3 class="plan-details-title">{{ currentPlan.title }}</h3>
            <div class="plan-details-tags">
              <span v-for="tag in currentPlan.tags" :key="tag" class="plan-tag">{{ tag }}</span>
            </div>
          </div>
          
          <!-- 计划进度 -->
          <div class="plan-details-progress">
            <div class="progress-header">
              <h4>完成进度</h4>
              <span class="progress-percentage">{{ getPlanProgress(currentPlan) }}%</span>
            </div>
            <div class="progress-bar">
              <div 
                class="progress-fill" 
                :style="{ width: getPlanProgress(currentPlan) + '%' }"
              ></div>
            </div>
            <div class="progress-stats">
              <span>{{ getCompletedSubtasksCount(currentPlan) }} 个已完成任务，共 {{ currentPlan.subtasks ? currentPlan.subtasks.length : 0 }} 个</span>
            </div>
          </div>
          
          <!-- 计划描述 -->
          <div v-if="currentPlan.description" class="plan-details-description">
            <h4>计划描述</h4>
            <p>{{ currentPlan.description }}</p>
          </div>
          
          <!-- 计划时间 -->
          <div class="plan-details-dates">
            <h4>时间信息</h4>
            <div v-if="currentPlan.startDate && currentPlan.endDate">
              <span class="date-label">时间范围:</span>
              <span>{{ formatDate(currentPlan.startDate) }} 至 {{ formatDate(currentPlan.endDate) }}</span>
            </div>
            <div>
              <span class="date-label">剩余时间:</span>
              <span :class="getDeadlineClass(currentPlan)">{{ getDeadlineText(currentPlan) }}</span>
            </div>
          </div>
          
          <!-- 计划目标 -->
          <div v-if="currentPlan.goal" class="plan-details-goal">
            <h4>计划目标</h4>
            <p>{{ currentPlan.goal }}</p>
          </div>
          
          <!-- 任务清单 -->
          <div class="plan-details-subtasks">
            <div class="subtasks-header">
              <h4>任务清单</h4>
              <button class="add-subtask-btn" @click="addSubtaskToDetail">+ 添加任务</button>
            </div>
            <div class="subtasks-list">
              <div v-for="(subtask, index) in currentPlan.subtasks" :key="index" class="subtask-item">
                <input 
                  type="checkbox" 
                  v-model="subtask.completed" 
                  class="subtask-checkbox"
                  @change="updateSubtaskStatus(index)"
                >
                <input 
                  type="text" 
                  v-model="subtask.title" 
                  class="subtask-input"
                  @blur="updateSubtaskTitle(index)"
                >
                <button 
                  class="remove-subtask-btn" 
                  @click="removeSubtaskFromDetail(index)"
                >
                  ×
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Plans',
  data() {
    return {
      // 计划列表
      plans: [],
      
      // 过滤器
      filters: [
        { id: 'all', name: '全部' },
        { id: 'notStarted', name: '未开始' },
        { id: 'inProgress', name: '进行中' },
        { id: 'completed', name: '已完成' }
      ],
      activeFilter: 'all',
      
      // 弹窗状态
      showCreatePlanModal: false,
      showPlanDetailsModal: false,
      
      // 新计划数据
      newPlan: {
        title: '',
        description: '',
        tags: [],
        startDate: '',
        endDate: '',
        goal: '',
        subtasks: []
      },
      newTagInput: '',
      
      // 当前查看的计划
      currentPlan: null,
      
      // 编辑状态
      isEditing: false
    }
  },
  
  mounted() {
    this.loadPlans();
    // 监听ESC键关闭弹窗
    document.addEventListener('keydown', this.handleKeydown);
  },
  
  beforeUnmount() {
    document.removeEventListener('keydown', this.handleKeydown);
  },
  
  methods: {
    // 加载计划列表
    async loadPlans() {
      try {
        const plans = await window.electronAPI.getAllPlans();
        // 转换数据格式
        this.plans = plans.map(plan => ({
          ...plan,
          status: plan.status || 'not_started',
          tags: plan.type_tags ? JSON.parse(plan.type_tags) : [],
          startDate: plan.start_date,
          endDate: plan.end_date,
          subtasks: [] // 后续加载
        }));
        
        // 加载每个计划的子任务
        for (const plan of this.plans) {
          plan.subtasks = await this.loadSubtasks(plan.id);
        }
      } catch (error) {
        console.error('加载计划失败:', error);
        // 加载模拟数据
        this.loadMockData();
      }
    },
    
    // 加载子任务
    async loadSubtasks(planId) {
      try {
        const subtasks = await window.electronAPI.getPlanTasksByPlanId(planId);
        return subtasks || [];
      } catch (error) {
        console.error('加载子任务失败:', error);
        return [];
      }
    },
    
    // 加载模拟数据
    loadMockData() {
      this.plans = [
        {
          id: '1',
          title: '学习Vue3',
          description: '系统学习Vue3的基础知识和高级特性，包括组合式API、响应式系统等。',
          tags: ['学习', '技术'],
          startDate: '2023-12-01',
          endDate: '2023-12-31',
          goal: '掌握Vue3核心概念并完成一个项目',
          status: 'inProgress',
          subtasks: [
            { id: '1-1', title: '阅读官方文档', completed: true },
            { id: '1-2', title: '完成基础教程', completed: true },
            { id: '1-3', title: '学习组合式API', completed: false },
            { id: '1-4', title: '构建示例项目', completed: false }
          ]
        },
        {
          id: '2',
          title: '健身计划',
          description: '每周进行有氧运动和力量训练，提高身体素质。',
          tags: ['健康', '健身'],
          startDate: '2023-12-01',
          endDate: '2024-03-01',
          goal: '减重5公斤，增强体质',
          status: 'inProgress',
          subtasks: [
            { id: '2-1', title: '每周跑步3次', completed: true },
            { id: '2-2', title: '每周力量训练2次', completed: false },
            { id: '2-3', title: '调整饮食结构', completed: false }
          ]
        },
        {
          id: '3',
          title: '旅行准备',
          description: '为明年的旅行做准备，包括行程规划、预订机票和酒店等。',
          tags: ['旅行', '准备'],
          startDate: '2023-12-15',
          endDate: '2024-01-15',
          goal: '完成所有旅行准备工作',
          status: 'notStarted',
          subtasks: [
            { id: '3-1', title: '确定目的地', completed: false },
            { id: '3-2', title: '规划行程', completed: false },
            { id: '3-3', title: '预订机票', completed: false },
            { id: '3-4', title: '预订酒店', completed: false },
            { id: '3-5', title: '准备行李清单', completed: false }
          ]
        }
      ];
    },
    
    // 根据过滤器获取计划列表
    getFilteredPlans() {
      let filteredPlans = [...this.plans];
      
      switch (this.activeFilter) {
        case 'notStarted':
          filteredPlans = filteredPlans.filter(plan => {
            const progress = this.getPlanProgress(plan);
            return progress === 0 && plan.status !== 'completed';
          });
          break;
        case 'inProgress':
          filteredPlans = filteredPlans.filter(plan => {
            const progress = this.getPlanProgress(plan);
            return progress > 0 && progress < 100;
          });
          break;
        case 'completed':
          filteredPlans = filteredPlans.filter(plan => {
            return this.getPlanProgress(plan) === 100 || plan.status === 'completed';
          });
          break;
      }
      
      return filteredPlans;
    },
    
    // 获取计划数量
    getPlanCount(filterId) {
      return this.getFilteredPlans().length;
    },
    
    // 获取计划进度
    getPlanProgress(plan) {
      if (!plan.subtasks || plan.subtasks.length === 0) {
        return plan.status === 'completed' ? 100 : 0;
      }
      
      const completedCount = plan.subtasks.filter(subtask => subtask.completed).length;
      return Math.round((completedCount / plan.subtasks.length) * 100);
    },
    
    // 获取已完成子任务数量
    getCompletedSubtasksCount(plan) {
      if (!plan.subtasks || plan.subtasks.length === 0) {
        return 0;
      }
      return plan.subtasks.filter(subtask => subtask.completed).length;
    },
    
    // 创建或更新计划
    async createPlan() {
      if (!this.newPlan.title.trim()) {
        alert('请输入计划标题');
        return;
      }
      
      try {
        // 准备计划数据
        const planData = {
          title: this.newPlan.title,
          description: this.newPlan.description,
          typeTags: this.newPlan.tags,
          startDate: this.newPlan.startDate || null,
          endDate: this.newPlan.endDate || null,
          goal: this.newPlan.goal
        };
        
        let result;
        if (this.isEditing && this.newPlan.id) {
          // 更新现有计划
          result = await window.electronAPI.updatePlan(this.newPlan.id, planData);
          
          if (result) {
            // 更新本地列表中的计划
            const planIndex = this.plans.findIndex(plan => plan.id === this.newPlan.id);
            if (planIndex !== -1) {
              // 先删除旧的子任务
              const oldPlan = this.plans[planIndex];
              for (const subtask of oldPlan.subtasks) {
                if (subtask.id) {
                  await window.electronAPI.deletePlanTask(subtask.id);
                }
              }
              
              // 转换结果格式
              const updatedPlan = {
                ...result,
                status: result.status || 'not_started',
                tags: this.newPlan.tags,
                startDate: this.newPlan.startDate,
                endDate: this.newPlan.endDate,
                subtasks: []
              };
              
              // 添加新的子任务
              for (const subtask of this.newPlan.subtasks) {
                if (subtask.title.trim()) {
                  const subtaskData = {
                    planId: result.id,
                    content: subtask.title,
                    isCompleted: 0
                  };
                  const subtaskResult = await window.electronAPI.createPlanTask(subtaskData);
                  if (subtaskResult) {
                    updatedPlan.subtasks.push(subtaskResult);
                  }
                }
              }
              
              // 更新本地列表
              this.plans[planIndex] = updatedPlan;
            }
          }
          this.isEditing = false;
        } else {
          // 创建新计划
          result = await window.electronAPI.createPlan(planData);
          
          if (result) {
            // 转换结果格式
            const newPlan = {
              ...result,
              status: result.status || 'not_started',
              tags: this.newPlan.tags,
              startDate: this.newPlan.startDate,
              endDate: this.newPlan.endDate,
              subtasks: []
            };
            
            // 添加子任务
            for (const subtask of this.newPlan.subtasks) {
              if (subtask.title.trim()) {
                const subtaskData = {
                  planId: result.id,
                  content: subtask.title,
                  isCompleted: 0
                };
                const subtaskResult = await window.electronAPI.createPlanTask(subtaskData);
                if (subtaskResult) {
                  newPlan.subtasks.push(subtaskResult);
                }
              }
            }
            
            // 添加到本地列表
            this.plans.push(newPlan);
          }
        }
        
        // 重置表单
        this.resetNewPlanForm();
        this.showCreatePlanModal = false;
      } catch (error) {
        console.error('创建计划失败:', error);
        alert('创建计划失败: ' + error.message);
      }
    },
    
    // 显示计划详情
    async showPlanDetails(plan) {
      try {
        // 深拷贝，避免直接修改原数据
        this.currentPlan = JSON.parse(JSON.stringify(plan));
        // 重新加载子任务以确保最新状态
        this.currentPlan.subtasks = await this.loadSubtasks(plan.id);
        this.showPlanDetailsModal = true;
      } catch (error) {
        console.error('加载计划详情失败:', error);
        alert('加载计划详情失败');
      }
    },
    
    // 编辑计划
    editPlan() {
      // 设置为编辑模式
      this.isEditing = true;
      // 复制当前计划数据到新计划表单
      this.newPlan = JSON.parse(JSON.stringify(this.currentPlan));
      this.showCreatePlanModal = true;
      this.showPlanDetailsModal = false;
    },
    
    // 关闭计划详情
    closePlanDetails() {
      this.showPlanDetailsModal = false;
      this.currentPlan = null;
    },
    
    // 删除计划
    async handlePlanDelete(planId) {
      if (confirm('确定要删除这个计划吗？删除后将无法恢复。')) {
        try {
          const result = await window.electronAPI.deletePlan(planId);
          if (result) {
            // 从本地列表中移除
            this.plans = this.plans.filter(plan => plan.id !== planId);
            // 如果正在查看这个计划，关闭详情
            if (this.currentPlan && this.currentPlan.id === planId) {
              this.closePlanDetails();
            }
          }
        } catch (error) {
          console.error('删除计划失败:', error);
          alert('删除计划失败: ' + error.message);
        }
      }
    },
    
    // 添加标签
    addTag() {
      if (this.newTagInput.trim() && !this.newPlan.tags.includes(this.newTagInput.trim())) {
        this.newPlan.tags.push(this.newTagInput.trim());
        this.newTagInput = '';
      }
    },
    
    // 移除标签
    removeTag(tag) {
      this.newPlan.tags = this.newPlan.tags.filter(t => t !== tag);
    },
    
    // 添加子任务
    addSubtask() {
      this.newPlan.subtasks.push({ title: '', completed: false });
    },
    
    // 移除子任务
    removeSubtask(index) {
      this.newPlan.subtasks.splice(index, 1);
    },
    
    // 在详情页添加子任务
    addSubtaskToDetail() {
      this.currentPlan.subtasks.push({ title: '', completed: false });
    },
    
    // 在详情页移除子任务
    removeSubtaskFromDetail(index) {
      const subtask = this.currentPlan.subtasks[index];
      if (subtask.id) {
        // 已保存的子任务需要从数据库删除
        window.electronAPI.deletePlanTask(subtask.id).catch(error => {
          console.error('删除子任务失败:', error);
        });
      }
      this.currentPlan.subtasks.splice(index, 1);
    },
    
    // 更新子任务状态
    updateSubtaskStatus(index) {
      const subtask = this.currentPlan.subtasks[index];
      if (subtask.id) {
        // 已保存的子任务需要更新到数据库
        window.electronAPI.updatePlanTask(subtask.id, {
          isCompleted: subtask.completed ? 1 : 0
        }).catch(error => {
          console.error('更新子任务失败:', error);
          // 回滚状态
          subtask.completed = !subtask.completed;
        });
      } else {
        // 新创建的子任务需要保存
        window.electronAPI.createPlanTask({
          planId: this.currentPlan.id,
          content: subtask.title,
          isCompleted: subtask.completed ? 1 : 0
        }).then(result => {
          if (result) {
            this.currentPlan.subtasks[index] = result;
          }
        }).catch(error => {
          console.error('创建子任务失败:', error);
        });
      }
      
      // 更新原计划的进度
      const originalPlan = this.plans.find(plan => plan.id === this.currentPlan.id);
      if (originalPlan) {
        // 这里可以优化，只更新子任务的状态
        originalPlan.subtasks = JSON.parse(JSON.stringify(this.currentPlan.subtasks));
      }
    },
    
    // 更新子任务标题
    updateSubtaskTitle(index) {
      const subtask = this.currentPlan.subtasks[index];
      if (subtask.id && subtask.title.trim()) {
        // 已保存的子任务需要更新到数据库
        window.electronAPI.updatePlanTask(subtask.id, {
          content: subtask.title
        }).catch(error => {
          console.error('更新子任务失败:', error);
        });
      } else if (subtask.title.trim()) {
        // 新创建的子任务需要保存
        window.electronAPI.createPlanTask({
          planId: this.currentPlan.id,
          content: subtask.title,
          isCompleted: subtask.completed ? 1 : 0
        }).then(result => {
          if (result) {
            this.currentPlan.subtasks[index] = result;
          }
        }).catch(error => {
          console.error('创建子任务失败:', error);
        });
      }
    },
    
    // 重置新计划表单
    resetNewPlanForm() {
      this.newPlan = {
        title: '',
        description: '',
        tags: [],
        startDate: '',
        endDate: '',
        goal: '',
        subtasks: []
      };
      this.newTagInput = '';
    },
    
    // 格式化日期
    formatDate(dateString) {
      if (!dateString) return '';
      try {
        const date = new Date(dateString);
        return date.toLocaleDateString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        });
      } catch (e) {
        return dateString;
      }
    },
    
    // 获取截止日期文本
    getDeadlineText(plan) {
      if (!plan.endDate) return '无截止日期';
      
      const today = new Date();
      const endDate = new Date(plan.endDate);
      const diffTime = endDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays < 0) {
        return `已逾期 ${Math.abs(diffDays)} 天`;
      } else if (diffDays === 0) {
        return '今天到期';
      } else if (diffDays === 1) {
        return '明天到期';
      } else if (diffDays <= 7) {
        return `${diffDays} 天后到期`;
      } else {
        return `还有 ${diffDays} 天到期`;
      }
    },
    
    // 获取截止日期样式类
    getDeadlineClass(plan) {
      if (!plan.endDate) return '';
      
      const today = new Date();
      const endDate = new Date(plan.endDate);
      const diffTime = endDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays < 0) {
        return 'overdue';
      } else if (diffDays <= 3) {
        return 'urgent';
      } else {
        return '';
      }
    },
    
    // 状态转换工具
    getStatusString(status) {
      const statusMap = { 0: 'todo', 1: 'inProgress', 2: 'done' };
      return statusMap[status] || 'todo';
    },
    
    getPriorityString(priority) {
      const priorityMap = { 0: 'low', 1: 'medium', 2: 'high' };
      return priorityMap[priority] || 'medium';
    },
    
    getStatusNumber(status) {
      const statusMap = { 'todo': 0, 'inProgress': 1, 'done': 2, 'notStarted': 0 };
      return statusMap[status] || 0;
    },
    
    // 键盘事件处理
    handleKeydown(event) {
      if (event.key === 'Escape') {
        if (this.showCreatePlanModal) {
          this.showCreatePlanModal = false;
        } else if (this.showPlanDetailsModal) {
          this.showPlanDetailsModal = false;
        }
      }
    }
  }
}
</script>

<style scoped>
/* 页面布局 */
.plans-page {
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* 页面头部 */
.plans-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 0;
  margin-bottom: 20px;
}

.plans-header h1 {
  font-size: 28px;
  font-weight: 600;
  color: #2c3e50;
}

.create-plan-btn {
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

.create-plan-btn:hover {
  background-color: #2980b9;
}

.plus-icon {
  font-size: 20px;
  margin-right: 8px;
}

/* 过滤器 */
.plans-filters {
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

.plan-count {
  background-color: rgba(0, 0, 0, 0.1);
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 12px;
}

.filter-tab.active .plan-count {
  background-color: rgba(255, 255, 255, 0.3);
}

/* 计划列表 */
.plans-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  flex: 1;
  overflow-y: auto;
}

/* 计划卡片 */
.plan-card {
  background-color: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.plan-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.plan-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.plan-title {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
  flex: 1;
}

.delete-plan-btn {
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

.delete-plan-btn:hover {
  background-color: #e74c3c;
  color: white;
}

.plan-description {
  color: #7f8c8d;
  margin-bottom: 16px;
  line-height: 1.5;
}

/* 进度条 */
.plan-progress-container {
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
.plan-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 16px;
}

.plan-tag {
  background-color: #ecf0f1;
  color: #2c3e50;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 12px;
}

/* 日期 */
.plan-dates {
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
.plan-goal {
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

/* 无计划提示 */
.no-plans {
  text-align: center;
  padding: 60px 20px;
  color: #7f8c8d;
}

.no-plans-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.create-first-plan-btn {
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

.create-first-plan-btn:hover {
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

/* 计划详情页面 */
.plan-details-header {
  margin-bottom: 24px;
}

.plan-details-title {
  font-size: 24px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 12px;
}

.plan-details-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.plan-details-progress {
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

.plan-details-description,
.plan-details-dates,
.plan-details-goal,
.plan-details-subtasks {
  margin-bottom: 24px;
}

.plan-details-description h4,
.plan-details-dates h4,
.plan-details-goal h4,
.plan-details-subtasks h4 {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 12px;
}

.plan-details-description p,
.plan-details-goal p {
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
  .plans-list {
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