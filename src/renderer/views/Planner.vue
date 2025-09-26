<template>
  <div class="planner-page">
    <!-- 页面头部 -->
    <div class="planner-header">
      <h1>计划</h1>
      <div class="header-actions">
        <div class="filter-buttons">
          <button 
            v-for="filter in filters" 
            :key="filter.id"
            :class="['filter-btn', { active: activeFilter === filter.id }]"
            @click="activeFilter = filter.id"
          >
            {{ filter.name }}
            <span v-if="filter.id !== 'all'" class="count">({{ getPlanCount(filter.id) }})</span>
          </button>
        </div>
        <button class="create-btn" @click="showCreateModal = true">
          <span class="plus-icon">+</span> 新建计划
        </button>
      </div>
    </div>

    <!-- 主内容区域（左右布局） -->
    <div class="planner-content">
      <!-- 左侧计划列表 -->
      <div class="plans-list-container">
        <div class="plans-list">
          <div 
            v-for="plan in getFilteredPlans()" 
            :key="plan.id" 
            class="plan-item"
            :class="{ active: selectedPlanId === plan.id }"
            @click="selectPlan(plan.id)"
          >
            <div class="plan-title-section">
              <h3 class="plan-title">{{ plan.title }}</h3>
              <span class="plan-type">{{ plan.type }}</span>
            </div>
            <div class="plan-info">
              <div class="info-item">
                <span class="info-label">复杂度:</span>
                <span class="info-value">{{ plan.complexity || '中等' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">开始时间:</span>
                <span class="info-value">{{ formatDate(plan.startDate) }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">截止时间:</span>
                <span class="info-value" :class="getDeadlineClass(plan)">{{ plan.endDate ? formatDate(plan.endDate) : '无' }}</span>
              </div>
              <div class="plan-progress">
                <div class="progress-bar">
                  <div 
                    class="progress-fill" 
                    :style="{ width: getPlanProgress(plan) + '%' }"
                  ></div>
                </div>
                <span class="progress-text">{{ getPlanProgress(plan) }}%</span>
              </div>
            </div>
          </div>
          
          <!-- 无计划时的提示 -->
          <div v-if="getFilteredPlans().length === 0" class="no-plans">
            <div class="no-plans-icon">📋</div>
            <p>暂无计划</p>
            <button class="create-first-btn" @click="showCreateModal = true">
              创建第一个计划
            </button>
          </div>
        </div>
      </div>

      <!-- 右侧计划详情 -->
      <div class="plan-details-container">
        <div v-if="selectedPlan" class="plan-details">
          <div class="details-header">
            <h2>{{ selectedPlan.title }}</h2>
            <div class="details-actions">
              <button class="edit-btn" @click="editPlan">编辑</button>
              <button class="delete-btn" @click="deletePlan">删除</button>
            </div>
          </div>

          <!-- 计划基本信息 -->
          <div class="details-section">
            <h3>基本信息</h3>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">计划类型:</span>
                <span class="info-value">{{ selectedPlan.type }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">复杂度:</span>
                <span class="info-value">{{ selectedPlan.complexity || '中等' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">开始时间:</span>
                <span class="info-value">{{ formatDate(selectedPlan.startDate) }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">截止时间:</span>
                <span class="info-value" :class="getDeadlineClass(selectedPlan)">{{ selectedPlan.endDate ? formatDate(selectedPlan.endDate) : '无' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">完成进度:</span>
                <span class="info-value">{{ getPlanProgress(selectedPlan) }}%</span>
              </div>
              <div class="info-item">
                <span class="info-label">预计耗时:</span>
                <span class="info-value">{{ selectedPlan.expectedHours || '未设置' }}小时</span>
              </div>
            </div>
          </div>

          <!-- 计划描述 -->
          <div class="details-section" v-if="selectedPlan.description">
            <h3>计划描述</h3>
            <p class="description-text">{{ selectedPlan.description }}</p>
          </div>

          <!-- 任务清单 -->
          <div class="details-section">
            <div class="section-header">
              <h3>任务清单</h3>
              <button class="add-task-btn" @click="addSubtask">添加任务</button>
            </div>
            <div class="subtasks-list">
              <div 
                v-for="(subtask, index) in selectedPlan.subtasks" 
                :key="subtask.id || index" 
                class="subtask-item"
              >
                <input 
                  type="checkbox" 
                  v-model="subtask.completed"
                  @change="updateSubtaskStatus(index)"
                  class="subtask-checkbox"
                >
                <input 
                  type="text" 
                  v-model="subtask.title"
                  @blur="updateSubtaskTitle(index)"
                  class="subtask-input"
                  :class="{ completed: subtask.completed }"
                >
                <button 
                  class="remove-subtask-btn"
                  @click="removeSubtask(index)"
                >
                  ×
                </button>
              </div>
            </div>
          </div>

          <!-- 艾宾浩斯复习提醒（如果是艾宾浩斯计划） -->
          <div class="details-section" v-if="selectedPlan.templateType === '艾宾浩斯计划'">
            <h3>复习提醒</h3>
            <div class="review-schedule">
              <p class="review-info">根据艾宾浩斯记忆曲线，建议按以下时间复习：</p>
              <ul class="review-dates">
                <li v-for="(date, index) in getReviewDates(selectedPlan.startDate)" :key="index">
                  <span class="review-day">{{ getReviewDay(index) }}:</span>
                  <span class="review-date">{{ formatDate(date) }}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- 未选择计划时的提示 -->
        <div v-else class="no-selected-plan">
          <div class="placeholder-icon">📝</div>
          <p>请从左侧选择一个计划</p>
        </div>
      </div>
    </div>

    <!-- 创建/编辑计划弹窗 -->
    <div v-if="showCreateModal" class="modal-overlay" @click.self="closeCreateModal">
      <div class="modal">
        <div class="modal-header">
          <h2>{{ isEditing ? '编辑计划' : '创建新计划' }}</h2>
          <button class="close-modal-btn" @click="closeCreateModal">&times;</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="savePlan">
            <!-- 计划标题 -->
            <div class="form-group">
              <label for="plan-title">计划名称 *</label>
              <input 
                type="text" 
                id="plan-title" 
                v-model="editingPlan.title"
                required
                placeholder="请输入计划名称"
              >
            </div>

            <!-- 计划类型 -->
            <div class="form-group">
              <label for="plan-type">计划类型</label>
              <input 
                type="text" 
                id="plan-type" 
                v-model="editingPlan.type"
                placeholder="例如：学习、工作、健身"
              >
            </div>

            <!-- 模板类型 -->
            <div class="form-group">
              <label for="template-type">模板类型</label>
              <select 
                id="template-type" 
                v-model="editingPlan.templateType"
              >
                <option value="自定义计划">自定义计划</option>
                <option value="艾宾浩斯计划">艾宾浩斯计划</option>
              </select>
            </div>

            <!-- 开始时间 -->
            <div class="form-group">
              <label for="start-date">开始时间</label>
              <input 
                type="date" 
                id="start-date" 
                v-model="editingPlan.startDate"
              >
            </div>

            <!-- 计划描述 -->
            <div class="form-group">
              <label for="plan-description">计划描述</label>
              <textarea 
                id="plan-description" 
                v-model="editingPlan.description"
                rows="4"
                placeholder="请输入计划描述（选填）"
              ></textarea>
            </div>

            <div class="form-actions">
              <button type="button" class="cancel-btn" @click="closeCreateModal">取消</button>
              <button type="submit" class="save-btn">{{ isEditing ? '保存' : '创建' }}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Planner',
  data() {
    return {
      // 计划列表
      plans: [],
      // 过滤器
      filters: [
        { id: 'all', name: '全部' },
        { id: 'completed', name: '已完成' },
        { id: 'uncompleted', name: '未完成' }
      ],
      activeFilter: 'all',
      // 选中的计划ID
      selectedPlanId: null,
      // 创建/编辑弹窗状态
      showCreateModal: false,
      isEditing: false,
      // 编辑中的计划数据
      editingPlan: {
        id: null,
        title: '',
        type: '',
        templateType: '自定义计划',
        startDate: '',
        description: '',
        subtasks: []
      },
      // 组件卸载标志
      isUnmounting: false,
      // 用于取消异步操作的controller
      abortController: null
    }
  },

  computed: {
    // 获取选中的计划
    selectedPlan() {
      return this.plans.find(plan => plan.id === this.selectedPlanId)
    }
  },

  mounted() {
    // 初始化abort controller
    this.abortController = new AbortController()
    this.loadPlans()
  },

  beforeUnmount() {
    // 设置卸载标志
    this.isUnmounting = true
    
    // 取消所有未完成的异步操作
    if (this.abortController) {
      this.abortController.abort()
    }
    
    // 注意：在组件卸载前不应该尝试保存未保存的子任务，因为这会启动新的异步操作
    // 这可能导致在组件已卸载后尝试访问DOM元素
    // 我们应该在组件正常运行时处理保存，而不是在卸载时
    // this.saveUnsavedSubtasks()
  },

  methods: {
    // 保存未保存的子任务
    saveUnsavedSubtasks() {
      try {
        if (this.selectedPlan && this.selectedPlan.subtasks) {
          // 过滤出有内容但没有ID的子任务
          const unsavedSubtasks = this.selectedPlan.subtasks.filter(subtask => 
            subtask.title && subtask.title.trim() && !subtask.id
          )
          
          // 为每个未保存的子任务调用保存方法
          unsavedSubtasks.forEach(subtask => {
            this.saveNewSubtask(subtask)
          })
        }
      } catch (error) {
        console.error('保存未保存的子任务时出错:', error)
      }
    },

    // 根据截止日期获取CSS类名
    getDeadlineClass(plan) {
      if (!plan.endDate) return '';
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const endDate = new Date(plan.endDate);
      endDate.setHours(0, 0, 0, 0);
      
      const diffTime = endDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays < 0) {
        return 'deadline-overdue'; // 已逾期
      } else if (diffDays <= 3) {
        return 'deadline-urgent'; // 紧急（3天内）
      } else if (diffDays <= 7) {
        return 'deadline-warning'; // 警告（7天内）
      }
      
      return ''; // 正常
    },
    
    // 加载计划列表
    async loadPlans() {
      try {
        // 检查组件是否正在卸载或操作是否已取消
        if (this.isUnmounting || !this.abortController || this.abortController.signal.aborted) {
          return
        }
        
        // 检查electronAPI是否可用
        if (typeof window.electronAPI === 'undefined') {
          // 如果不可用，使用模拟数据
          if (!this.isUnmounting) {
            this.loadMockData()
          }
          return
        }

        const plans = await window.electronAPI.getAllPlans()
        
        // 再次检查组件是否已卸载或操作是否已取消
        if (this.isUnmounting || this.abortController.signal.aborted) {
          return
        }
        
        // 转换数据格式
        this.plans = plans.map(plan => ({
          ...plan,
          type: plan.type || '',
          templateType: plan.template_type || '自定义计划',
          startDate: plan.start_date,
          subtasks: plan.subtasks || []
        }))

        // 加载每个计划的子任务
        for (const plan of this.plans) {
          // 在每次迭代前检查是否已取消
          if (this.isUnmounting || this.abortController.signal.aborted) {
            return
          }
          plan.subtasks = await this.loadSubtasks(plan.id)
        }
      } catch (error) {
        // 如果是由于abortController取消导致的错误，不报错
        if (!error || error.name !== 'AbortError') {
          console.error('加载计划失败:', error)
          // 加载模拟数据
          if (!this.isUnmounting) {
            this.loadMockData()
          }
        }
      }
    },

    // 加载子任务
    async loadSubtasks(planId) {
      try {
        // 检查组件是否正在卸载或操作是否已取消
        if (this.isUnmounting || !this.abortController || this.abortController.signal.aborted) {
          return []
        }
        
        if (typeof window.electronAPI === 'undefined') {
          return []
        }
        const subtasks = await window.electronAPI.getPlanTasksByPlanId(planId)
        
        // 再次检查组件是否已卸载或操作是否已取消
        if (this.isUnmounting || this.abortController.signal.aborted) {
          return []
        }
        
        return subtasks || []
      } catch (error) {
        // 如果是由于abortController取消导致的错误，不报错
        if (!error || error.name !== 'AbortError') {
          console.error('加载子任务失败:', error)
        }
        return []
      }
    },

    // 加载模拟数据
    loadMockData() {
      this.plans = [
        {
          id: '1',
          title: '开发新功能模块',
          type: '工作',
          complexity: '高',
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          expectedHours: 40,
          description: '开发项目中的核心功能模块，包括需求分析、设计、编码和测试',
          subtasks: [
            { id: '1-1', title: '需求分析与文档编写', completed: false },
            { id: '1-2', title: '架构设计', completed: false },
            { id: '1-3', title: '核心功能编码', completed: false },
            { id: '1-4', title: '单元测试', completed: false },
            { id: '1-5', title: '集成测试', completed: false },
            { id: '1-6', title: '文档更新', completed: false }
          ]
        },
        {
          id: '2',
          title: '撰写研究论文',
          type: '学习',
          complexity: '高',
          startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          expectedHours: 60,
          description: '撰写关于人工智能应用的研究论文，包括文献综述、实验设计和结果分析',
          subtasks: [
            { id: '2-1', title: '文献综述', completed: true },
            { id: '2-2', title: '研究方法设计', completed: true },
            { id: '2-3', title: '实验数据收集', completed: false },
            { id: '2-4', title: '数据分析', completed: false },
            { id: '2-5', title: '论文撰写', completed: false },
            { id: '2-6', title: '论文修改与润色', completed: false }
          ]
        },
        {
          id: '3',
          title: '市场推广活动策划',
          type: '工作',
          complexity: '中等',
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          expectedHours: 20,
          description: '策划新产品的市场推广活动，包括线上和线下渠道',
          subtasks: [
            { id: '3-1', title: '目标受众分析', completed: true },
            { id: '3-2', title: '推广渠道选择', completed: true },
            { id: '3-3', title: '活动内容设计', completed: false },
            { id: '3-4', title: '预算规划', completed: false },
            { id: '3-5', title: '执行计划制定', completed: false }
          ]
        }
      ]
    },

    // 根据过滤器获取计划列表
    getFilteredPlans() {
      let filteredPlans = [...this.plans]

      switch (this.activeFilter) {
        case 'completed':
          filteredPlans = filteredPlans.filter(plan => this.getPlanProgress(plan) === 100)
          break
        case 'uncompleted':
          filteredPlans = filteredPlans.filter(plan => this.getPlanProgress(plan) < 100)
          break
      }

      return filteredPlans
    },

    // 获取计划数量
    getPlanCount(filterId) {
      return this.getFilteredPlans().length
    },

    // 获取计划进度
    getPlanProgress(plan) {
      if (!plan.subtasks || plan.subtasks.length === 0) {
        return 0
      }

      const completedCount = plan.subtasks.filter(subtask => subtask.completed).length
      return Math.round((completedCount / plan.subtasks.length) * 100)
    },

    // 选择计划
    selectPlan(planId) {
      // 检查组件是否正在卸载或操作是否已取消
      if (this.isUnmounting || !this.abortController || this.abortController.signal.aborted) {
        return
      }
      this.selectedPlanId = planId
    },

    // 显示创建计划弹窗
    showCreatePlanModal() {
      this.isEditing = false
      this.resetEditingPlan()
      this.showCreateModal = true
    },

    // 编辑计划
    editPlan() {
      if (this.selectedPlan) {
        this.isEditing = true
        // 深拷贝选中的计划数据
        this.editingPlan = JSON.parse(JSON.stringify(this.selectedPlan))
        // 确保所有必要的属性都存在
        this.editingPlan.type = this.editingPlan.type || ''
        this.editingPlan.templateType = this.editingPlan.templateType || '自定义计划'
        this.editingPlan.startDate = this.editingPlan.startDate || new Date().toISOString().split('T')[0]
        this.editingPlan.description = this.editingPlan.description || ''
        this.editingPlan.subtasks = this.editingPlan.subtasks || []
        this.editingPlan.complexity = this.editingPlan.complexity || '中等'
        this.editingPlan.endDate = this.editingPlan.endDate || ''
        this.editingPlan.expectedHours = this.editingPlan.expectedHours || 0
        this.showCreateModal = true
      }
    },

    // 保存计划
    async savePlan() {
      try {
        // 检查组件是否正在卸载或操作是否已取消
        if (this.isUnmounting || !this.abortController || this.abortController.signal.aborted) {
          return
        }
        
        // 准备计划数据
        const planData = {
          title: this.editingPlan.title,
          type: this.editingPlan.type,
          complexity: this.editingPlan.complexity,
          start_date: this.editingPlan.startDate,
          end_date: this.editingPlan.endDate,
          expected_hours: this.editingPlan.expectedHours,
          description: this.editingPlan.description || ''
        }

        let result
        if (this.isEditing) {
          // 更新现有计划
          result = await window.electronAPI.updatePlan(this.editingPlan.id, planData)
        } else {
          // 创建新计划
          result = await window.electronAPI.createPlan(planData)
        }

        // 检查组件是否已卸载或操作是否已取消
        if (this.isUnmounting || this.abortController.signal.aborted) {
          return
        }
        
        if (result) {
          // 重新加载计划列表
          await this.loadPlans()
          // 如果是新创建的计划，选中它
          if (!this.isEditing) {
            this.selectPlan(result.id)
          }
          // 关闭弹窗
          this.closeCreateModal()
        }
      } catch (error) {
        // 如果是由于abortController取消导致的错误，不报错
        if (!error || error.name !== 'AbortError') {
          console.error('保存计划失败:', error)
          // 只有在组件未卸载时才显示错误
          if (!this.isUnmounting) {
            alert('保存计划失败: ' + error.message)
          }
        }
      }
    },

    // 删除计划
    async deletePlan() {
      if (this.selectedPlan && confirm('确定要删除这个计划吗？')) {
        try {
          // 检查组件是否正在卸载或操作是否已取消
          if (this.isUnmounting || !this.abortController || this.abortController.signal.aborted) {
            return
          }
          
          await window.electronAPI.deletePlan(this.selectedPlan.id)
          
          // 检查组件是否已卸载或操作是否已取消
          if (this.isUnmounting || this.abortController.signal.aborted) {
            return
          }
          
          // 重新加载计划列表
          await this.loadPlans()
          // 清除选中状态
          this.selectedPlanId = null
        } catch (error) {
          // 如果是由于abortController取消导致的错误，不报错
          if (!error || error.name !== 'AbortError') {
            console.error('删除计划失败:', error)
            // 只有在组件未卸载时才显示错误
            if (!this.isUnmounting) {
              alert('删除计划失败: ' + error.message)
            }
          }
        }
      }
    },

    // 关闭创建弹窗
    closeCreateModal() {
      this.showCreateModal = false
      this.resetEditingPlan()
    },

    // 重置编辑中的计划数据
    resetEditingPlan() {
      this.editingPlan = {
        id: null,
        title: '',
        type: '',
        templateType: '自定义计划',
        startDate: '',
        description: '',
        subtasks: []
      }
    },

    // 添加子任务
    addSubtask() {
      if (this.selectedPlan) {
        // 检查最后一个子任务是否有内容，如果有则保存
        const lastSubtask = this.selectedPlan.subtasks[this.selectedPlan.subtasks.length - 1];
        if (lastSubtask && lastSubtask.title.trim() && !lastSubtask.id) {
          this.saveNewSubtask(lastSubtask);
        }
        // 添加一个新的空任务
        this.selectedPlan.subtasks.push({ title: '', completed: false });
      }
    },

    // 移除子任务
    removeSubtask(index) {
      // 检查组件是否正在卸载或操作是否已取消
      if (this.isUnmounting || !this.abortController || this.abortController.signal.aborted) {
        return
      }
      
      if (this.selectedPlan) {
        const subtask = this.selectedPlan.subtasks[index]
        // 如果子任务已保存到数据库，需要先删除
        if (subtask.id) {
          // 创建一个新的Promise，以便在组件卸载或操作取消时可以终止
          const deletePromise = window.electronAPI.deletePlanTask(subtask.id)
          
          deletePromise.then(() => {
            // 操作成功，不需要额外操作
          }).catch(error => {
            // 只有在非AbortError且组件未卸载时才进行错误处理
            if (!error || error.name !== 'AbortError') {
              console.error('删除子任务失败:', error)
            }
          })
        }
        
        // 从列表中移除（即使删除操作失败也移除，因为UI上已经点击了删除）
        if (!this.isUnmounting && !this.abortController.signal.aborted) {
          this.selectedPlan.subtasks.splice(index, 1)
        }
      }
    },

    // 更新子任务状态
    updateSubtaskStatus(index) {
      // 检查组件是否正在卸载或操作是否已取消
      if (this.isUnmounting || !this.abortController || this.abortController.signal.aborted) {
        return
      }
      
      if (this.selectedPlan) {
        const subtask = this.selectedPlan.subtasks[index]
        // 如果子任务已保存到数据库，需要更新
        if (subtask.id) {
          // 创建一个新的Promise，以便在组件卸载或操作取消时可以终止
          const updatePromise = window.electronAPI.updatePlanTask(subtask.id, {
            isCompleted: subtask.completed ? 1 : 0
          })
          
          updatePromise.then(() => {
            // 操作成功，不需要额外操作
          }).catch(error => {
            // 只有在非AbortError且组件未卸载时才进行错误处理
            if (!error || error.name !== 'AbortError') {
              console.error('更新子任务状态失败:', error)
              // 回滚状态
              if (!this.isUnmounting && !this.abortController.signal.aborted) {
                subtask.completed = !subtask.completed
              }
            }
          })
        } else if (subtask.title.trim()) {
          // 如果是新的子任务且有标题，保存到数据库
          this.saveNewSubtask(subtask)
        }
      }
    },

    // 更新子任务标题
    updateSubtaskTitle(index) {
      // 检查组件是否正在卸载或操作是否已取消
      if (this.isUnmounting || !this.abortController || this.abortController.signal.aborted) {
        return
      }
      
      if (this.selectedPlan) {
        const subtask = this.selectedPlan.subtasks[index]
        // 如果子任务已保存到数据库，需要更新
        if (subtask.id && subtask.title.trim()) {
          // 创建一个新的Promise，以便在组件卸载或操作取消时可以终止
          const updatePromise = window.electronAPI.updatePlanTask(subtask.id, {
            content: subtask.title
          })
          
          updatePromise.then(() => {
            // 操作成功，不需要额外操作
          }).catch(error => {
            // 只有在非AbortError且组件未卸载时才进行错误处理
            if (!error || error.name !== 'AbortError') {
              console.error('更新子任务标题失败:', error)
            }
          })
        } else if (subtask.title.trim()) {
          // 如果是新的子任务且有标题，保存到数据库
          this.saveNewSubtask(subtask)
        } else if (subtask.id) {
          // 如果标题为空且已保存，删除该子任务
          this.removeSubtask(index)
        }
      }
    },

    // 保存新的子任务
    async saveNewSubtask(subtask) {
      try {
        // 检查组件是否正在卸载或操作是否已取消
        if (this.isUnmounting || !this.abortController || this.abortController.signal.aborted) {
          return
        }
        
        if (typeof window.electronAPI === 'undefined' || !this.selectedPlan) {
          return
        }
        
        // 尝试在操作中使用signal（如果electronAPI支持）
        const result = await window.electronAPI.createPlanTask({
          planId: this.selectedPlan.id,
          content: subtask.title,
          isCompleted: subtask.completed ? 1 : 0
        })
        
        // 再次检查组件是否已卸载
        if (result && !this.isUnmounting) {
          // 更新子任务的ID
          const index = this.selectedPlan.subtasks.findIndex(t => t === subtask)
          if (index !== -1) {
            this.selectedPlan.subtasks[index] = result
          }
        }
      } catch (error) {
        // 如果是由于abortController取消导致的错误，不报错
        if (!error || error.name !== 'AbortError') {
          console.error('保存子任务失败:', error)
        }
      }
    },

    // 格式化日期
    formatDate(dateString) {
      if (!dateString) return ''
      try {
        const date = new Date(dateString)
        return date.toLocaleDateString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        })
      } catch (e) {
        return dateString
      }
    },

    // 获取艾宾浩斯复习日期
    getReviewDates(startDate) {
      if (!startDate) return []
      
      const dates = []
      const baseDate = new Date(startDate)
      
      // 艾宾浩斯复习时间点：1天、2天、4天、7天、15天、30天
      const intervals = [1, 2, 4, 7, 15, 30]
      
      intervals.forEach(interval => {
        const reviewDate = new Date(baseDate)
        reviewDate.setDate(reviewDate.getDate() + interval)
        dates.push(reviewDate.toISOString().split('T')[0])
      })
      
      return dates
    },

    // 获取复习天数文本
    getReviewDay(index) {
      const days = ['第一次复习', '第二次复习', '第三次复习', '第四次复习', '第五次复习', '第六次复习']
      return days[index] || `第${index + 1}次复习`
    }
  }
}
</script>

<style scoped>
/* 页面布局 */
.planner-page {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 20px;
  background-color: #f5f7fa;
}

/* 页面头部 */
.planner-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 15px 0;
  border-bottom: 1px solid #e1e5e9;
}

.planner-header h1 {
  font-size: 24px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 20px;
}

/* 过滤按钮 */
.filter-buttons {
  display: flex;
  gap: 8px;
}

.filter-btn {
  padding: 8px 16px;
  border: 1px solid #d1d5db;
  background-color: white;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-btn:hover {
  background-color: #f3f4f6;
}

.filter-btn.active {
  background-color: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.filter-btn .count {
  font-size: 12px;
  opacity: 0.8;
}

/* 创建按钮 */
.create-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.create-btn:hover {
  background-color: #2563eb;
}

.plus-icon {
  font-size: 16px;
  font-weight: bold;
}

/* 主内容区域 */
.planner-content {
  display: flex;
  flex: 1;
  gap: 20px;
  overflow: hidden;
}

/* 左侧计划列表 */
.plans-list-container {
  width: 400px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.plans-list {
  height: 100%;
  overflow-y: auto;
  padding: 10px;
}

.plan-item {
  padding: 15px;
  margin-bottom: 10px;
  border: 1px solid #e1e5e9;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.plan-item:hover {
  border-color: #3b82f6;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.1);
}

.plan-item.active {
  border-color: #3b82f6;
  background-color: #eff6ff;
}

.plan-title-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
}

.plan-title {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
  flex: 1;
  margin-right: 10px;
}

.plan-type {
  padding: 2px 8px;
  background-color: #e5e7eb;
  color: #4b5563;
  border-radius: 12px;
  font-size: 12px;
}

.plan-info {
  font-size: 14px;
}

.info-item {
  display: flex;
  margin-bottom: 8px;
}

.info-label {
  color: #6b7280;
  margin-right: 8px;
  min-width: 80px;
}

.info-value {
  color: #2c3e50;
  flex: 1;
}

.plan-progress {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
}

.progress-bar {
  flex: 1;
  height: 6px;
  background-color: #e5e7eb;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: #3b82f6;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 12px;
  color: #6b7280;
  min-width: 35px;
  text-align: right;
}

/* 无计划提示 */
.no-plans {
  text-align: center;
  padding: 60px 20px;
  color: #6b7280;
}

.no-plans-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.create-first-btn {
  margin-top: 16px;
  padding: 10px 24px;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.create-first-btn:hover {
  background-color: #2563eb;
}

/* 右侧计划详情 */
.plan-details-container {
  flex: 1;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.plan-details {
  padding: 20px;
  height: 100%;
  overflow-y: auto;
}

.details-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e1e5e9;
}

.details-header h2 {
  font-size: 22px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

.details-actions {
  display: flex;
  gap: 10px;
}

.edit-btn, .delete-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.edit-btn {
  background-color: #3b82f6;
  color: white;
}

.edit-btn:hover {
  background-color: #2563eb;
}

.delete-btn {
  background-color: #ef4444;
  color: white;
}

.delete-btn:hover {
  background-color: #dc2626;
}

/* 详情区域 */
.details-section {
  margin-bottom: 25px;
}

.details-section h3 {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 12px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.section-header h3 {
  margin: 0;
}

/* 信息网格 */
.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
}

.info-grid .info-item {
  margin-bottom: 0;
}

/* 描述文本 */
.description-text {
  color: #4b5563;
  line-height: 1.6;
  background-color: #f9fafb;
  padding: 15px;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
}

/* 任务清单 */
.subtasks-list {
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  overflow: hidden;
}

.subtask-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 15px;
  border-bottom: 1px solid #f3f4f6;
}

.subtask-item:last-child {
  border-bottom: none;
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
  color: #2c3e50;
}

.subtask-input.completed {
  text-decoration: line-through;
  color: #6b7280;
}

.remove-subtask-btn {
  width: 24px;
  height: 24px;
  border: none;
  background-color: #f3f4f6;
  color: #6b7280;
  border-radius: 4px;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.remove-subtask-btn:hover {
  background-color: #ef4444;
  color: white;
}

.add-task-btn {
  padding: 6px 12px;
  background-color: #10b981;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.add-task-btn:hover {
  background-color: #059669;
}

/* 艾宾浩斯复习计划 */
.review-schedule {
  background-color: #f9fafb;
  padding: 15px;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
}

.review-info {
  color: #4b5563;
  margin-bottom: 10px;
  font-size: 14px;
}

.review-dates {
  list-style: none;
  padding: 0;
  margin: 0;
}

.review-dates li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f3f4f6;
  font-size: 14px;
}

.review-dates li:last-child {
  border-bottom: none;
}

.review-day {
  color: #6b7280;
}

.review-date {
  color: #3b82f6;
  font-weight: 500;
}

/* 未选择计划提示 */
.no-selected-plan {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #6b7280;
}

.placeholder-icon {
  font-size: 64px;
  margin-bottom: 16px;
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
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.15);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e1e5e9;
}

.modal-header h2 {
  font-size: 20px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

.close-modal-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: none;
  font-size: 24px;
  color: #6b7280;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.close-modal-btn:hover {
  background-color: #f3f4f6;
}

.modal-body {
  padding: 24px;
}

/* 表单 */
.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  color: #2c3e50;
  font-size: 14px;
}

.form-group input[type="text"],
.form-group input[type="date"],
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.3s ease;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-group textarea {
  resize: vertical;
  min-height: 80px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 30px;
}

.cancel-btn, .save-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.cancel-btn {
  background-color: #f3f4f6;
  color: #4b5563;
}

.cancel-btn:hover {
  background-color: #e5e7eb;
}

.save-btn {
  background-color: #3b82f6;
  color: white;
}

.save-btn:hover {
  background-color: #2563eb;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .planner-content {
    flex-direction: column;
  }
  
  .plans-list-container {
    width: 100%;
    max-height: 300px;
  }
}

@media (max-width: 768px) {
  .planner-page {
    padding: 10px;
  }
  
  .planner-header {
    flex-direction: column;
    align-items: stretch;
    gap: 15px;
  }
  
  .header-actions {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-buttons {
    justify-content: center;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
}
</style>