<template>
  <div class="calendar-container">
    <div class="calendar-header">
      <h2>日历</h2>
      <div class="calendar-controls">
        <button class="control-btn" @click="changeMonth(-1)">&lt;</button>
        <div class="current-month">{{ currentMonthText }}</div>
        <button class="control-btn" @click="changeMonth(1)">&gt;</button>
      </div>
    </div>

    <!-- 日历主体 -->
    <div class="calendar-grid">
      <!-- 星期标题 -->
      <div class="calendar-weekdays">
        <div class="weekday">日</div>
        <div class="weekday">一</div>
        <div class="weekday">二</div>
        <div class="weekday">三</div>
        <div class="weekday">四</div>
        <div class="weekday">五</div>
        <div class="weekday">六</div>
      </div>

      <!-- 日期格子 -->
      <div class="calendar-days">
        <!-- 上个月的日期 -->
        <div v-for="emptyDay in prevMonthDays" :key="'empty-' + emptyDay" class="day empty-day"></div>
        
        <!-- 当前月的日期 -->
        <div 
          v-for="day in currentMonthDays" 
          :key="day.date"
          class="day"
          :class="{
            'today': isToday(day.date),
            'has-event': day.events.length > 0
          }"
          @click="selectDay(day.date)"
        >
          <span class="day-number">{{ day.day }}</span>
          <div class="day-events" v-if="day.events.length > 0">
            <div 
              v-for="(event, index) in day.events.slice(0, 2)" 
              :key="index"
              class="event-indicator"
              :style="{ backgroundColor: getEventColor(event.type) }"
            ></div>
            <div v-if="day.events.length > 2" class="event-more">+{{ day.events.length - 2 }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 今日事件列表 -->
    <div class="today-events" v-if="todayEvents.length > 0">
      <h3>今日事件</h3>
      <div class="events-list">
        <div v-for="event in todayEvents" :key="event.id" class="event-item">
          <div class="event-dot" :style="{ backgroundColor: getEventColor(event.type) }"></div>
          <div class="event-content">
            <div class="event-title">{{ event.title }}</div>
            <div class="event-time" v-if="event.time">{{ event.time }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态显示 -->
  <div class="empty-state" v-if="isEmptyState">
    <div class="empty-icon">📅</div>
    <div class="empty-text">日历中暂无事件</div>
    <button class="create-event-btn" @click="createNewEvent">创建新事件</button>
  </div>
  
  <!-- 当日文件列表 -->
  <div v-if="selectedDay" class="day-files">
    <div class="day-files-header">
      <h3>{{ selectedDay.getFullYear() }}年{{ selectedDay.getMonth() + 1 }}月{{ selectedDay.getDate() }}日 {{ dayFiles.length > 0 ? '创建的文件' : '暂无文件' }}</h3>
      <div class="file-actions">
        <button class="create-file-btn" @click="createNewEvent">
          <span class="btn-icon">📅</span>
          <span class="btn-text">创建日程</span>
        </button>
        <button class="create-file-btn secondary" @click="createNewNote">
          <span class="btn-icon">📝</span>
          <span class="btn-text">创建笔记</span>
        </button>
        <button class="create-file-btn secondary" @click="createNewPlan">
          <span class="btn-icon">📋</span>
          <span class="btn-text">创建计划</span>
        </button>
      </div>
    </div>
    
    <div class="files-list" v-if="dayFiles.length > 0">
      <div 
        v-for="file in dayFiles" 
        :key="file.id"
        class="file-item"
        :style="{ borderLeft: `3px solid ${getEventColor(file.type)}` }"
        @click="openFile(file)"
      >
        <div class="file-icon">{{ getFileIcon(file.type) }}</div>
        <div class="file-content">
          <div class="file-title">{{ file.title }}</div>
          <div class="file-type">{{ getFileTypeLabel(file.type) }}</div>
        </div>
        <div class="file-arrow">→</div>
      </div>
    </div>
    
    <div v-else class="no-files">
      <div class="no-files-icon">📄</div>
      <div class="no-files-text">该日期暂无创建的文件</div>
    </div>
  </div>
  </div>

  <!-- 事件详情/创建对话框 -->
  <div v-if="showEventDialog" class="modal-overlay" @click.self="showEventDialog = false">
    <div class="modal">
      <div class="modal-header">
        <h2>添加日程</h2>
        <button class="close-btn" @click="showEventDialog = false">&times;</button>
      </div>
      <div class="modal-body">
        <!-- 选中的日期显示 -->
        <div class="form-group">
          <label>选择日期</label>
          <div class="selected-date">
            {{ selectedDay.getFullYear() }}年{{ selectedDay.getMonth() + 1 }}月{{ selectedDay.getDate() }}日
          </div>
        </div>
        
        <!-- 事件标题 -->
        <div class="form-group">
          <label for="event-title">事件标题 *</label>
          <input 
            type="text" 
            id="event-title" 
            v-model="eventForm.title" 
            placeholder="输入事件标题"
            required
          >
        </div>
        
        <!-- 事件类型 -->
        <div class="form-group">
          <label for="event-type">事件类型</label>
          <select id="event-type" v-model="eventForm.type">
            <option value="reminder">提醒</option>
            <option value="meeting">会议</option>
            <option value="task">任务</option>
            <option value="plan">计划</option>
          </select>
        </div>
        
        <!-- 事件时间 -->
        <div class="form-group">
          <label for="event-time">事件时间</label>
          <input 
            type="text" 
            id="event-time" 
            v-model="eventForm.time" 
            placeholder="如：14:00-15:00"
          >
        </div>
        
        <!-- 事件描述 -->
        <div class="form-group">
          <label for="event-description">事件描述</label>
          <textarea 
            id="event-description" 
            v-model="eventForm.description" 
            placeholder="输入事件描述"
            rows="3"
          ></textarea>
        </div>
      </div>
      <div class="modal-footer">
        <button class="cancel-btn" @click="showEventDialog = false">取消</button>
        <button class="create-btn" @click="saveEvent">保存事件</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Calendar',
  data() {
    return {
      currentDate: new Date(),
      events: [], // 这里应该从API获取实际的事件数据
      selectedDay: null,
      showEventDialog: false,
      eventForm: {
        title: '',
        type: 'reminder',
        time: '',
        description: ''
      },
      dayFiles: []
    }
  },
  computed: {
    // 当前月份的文本显示
    currentMonthText() {
      const year = this.currentDate.getFullYear()
      const month = this.currentDate.getMonth() + 1
      return `${year}年${month}月`
    },
    
    // 当前月份的总天数
    currentMonthDays() {
      const year = this.currentDate.getFullYear()
      const month = this.currentDate.getMonth()
      
      const daysInMonth = new Date(year, month + 1, 0).getDate()
      const firstDayOfMonth = new Date(year, month, 1).getDay()
      
      // 生成当月的所有日期，并分配事件
      const days = []
      for (let i = 1; i <= daysInMonth; i++) {
        const date = new Date(year, month, i)
        days.push({
          day: i,
          date: date,
          events: this.getEventsForDate(date)
        })
      }
      
      return days
    },
    
    // 上个月需要显示的天数
    prevMonthDays() {
      const year = this.currentDate.getFullYear()
      const month = this.currentDate.getMonth()
      const firstDayOfMonth = new Date(year, month, 1).getDay()
      return firstDayOfMonth
    },
    
    // 今日的事件列表
    todayEvents() {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return this.events.filter(event => {
        const eventDate = new Date(event.date)
        eventDate.setHours(0, 0, 0, 0)
        return eventDate.getTime() === today.getTime()
      })
    },
    
    // 是否显示空状态
    isEmptyState() {
      return this.events.length === 0
    }
  },
  mounted() {
    // 组件挂载时加载事件数据
    this.loadEvents()
  },
  methods: {
    // 切换月份
    changeMonth(delta) {
      this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + delta, 1)
      this.loadEvents() // 切换月份后重新加载事件
    },
    
    // 检查是否是今天
    isToday(date) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      date.setHours(0, 0, 0, 0)
      return date.getTime() === today.getTime()
    },
    
    // 选择日期
    selectDay(date) {
      this.selectedDay = date
      // 获取该日期创建的文件
      this.fetchDayFiles(date)
      // 不自动显示创建/查看事件对话框
      // this.showEventDialog = true
    },
    
    // 获取指定日期创建的文件
    fetchDayFiles(date) {
      // 发送调试信息
      window.electronAPI.sendDebugInfo({
        component: 'Calendar',
        action: 'fetchDayFiles',
        date: date.toISOString()
      })
      
      // 构建日期范围（当天00:00:00到23:59:59）
      const startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
      startDate.setHours(0, 0, 0, 0)
      const endDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
      endDate.setHours(23, 59, 59, 999)
      
      try {
        window.electronAPI.getCalendarEvents(startDate.toISOString(), endDate.toISOString())
          .then(files => {
            window.electronAPI.sendDebugInfo({
              component: 'Calendar',
              action: 'fetchDayFilesSuccess',
              filesCount: files.length
            })
            
            // 转换文件格式
            this.dayFiles = files.map(file => ({
              id: file.id,
              title: file.title,
              type: file.type,
              date: new Date(file.date),
              relatedId: file.related_id,
              relatedType: file.related_type
            }))
          })
          .catch(error => {
            window.electronAPI.sendDebugInfo({
              component: 'Calendar',
              action: 'fetchDayFilesError',
              errorMessage: error.message || 'Unknown error',
              errorStack: error.stack || ''
            })
            this.dayFiles = []
          })
      } catch (error) {
        window.electronAPI.sendDebugInfo({
          component: 'Calendar',
          action: 'fetchDayFilesException',
          errorMessage: error.message || 'Unknown exception',
          errorStack: error.stack || ''
        })
        this.dayFiles = []
      }
    },
    
    // 打开文件（跳转到编辑页面）
    openFile(file) {
      window.electronAPI.sendDebugInfo({
        component: 'Calendar',
        action: 'openFile',
        fileId: file.id,
        fileType: file.type
      })
      
      // 先关闭事件对话框
      this.showEventDialog = false
      
      // 根据文件类型跳转到对应的编辑页面
      if (file.type === 'note') {
        // 对于笔记，需要先获取笔记本信息，然后再跳转
        this.fetchNoteAndNavigate(file.id)
      } else if (file.type === 'plan') {
        // 对于计划，跳转到计划页面并带上ID参数
        this.$router.push({ path: '/plans', query: { planId: file.id } })
      } else if (file.type === 'mindmap') {
        // 对于思维导图，跳转到思维导图页面并带上ID参数
        this.$router.push({ path: '/mindmap', query: { id: file.id } })
      }
    },
    
    // 获取笔记信息并导航
    async fetchNoteAndNavigate(noteId) {
      try {
        // 先获取所有笔记，查找该笔记所属的笔记本
        const allNotebooks = await window.electronAPI.getNotebooksWithNotes();
        let targetNote = null;
        let targetNotebookId = null;
        
        // 查找目标笔记及其所属笔记本
        for (let i = 0; i < allNotebooks.length; i++) {
          const notebook = allNotebooks[i];
          for (let j = 0; j < notebook.notes.length; j++) {
            const note = notebook.notes[j];
            if (note.id === noteId) {
              targetNote = note;
              targetNotebookId = notebook.id;
              break;
            }
          }
          if (targetNote) {
            break;
          }
        }
        
        if (targetNote && targetNotebookId) {
          // 跳转到笔记页面，并传递笔记本ID和笔记ID
          this.$router.push({
            path: '/notes',
            query: {
              notebookId: targetNotebookId,
              noteId: noteId
            }
          });
        } else {
          // 如果找不到，至少跳转到笔记页面
          this.$router.push('/notes');
        }
      } catch (error) {
        console.error('获取笔记信息失败:', error);
        window.electronAPI.sendDebugInfo({
          component: 'Calendar',
          action: 'fetchNoteError',
          errorMessage: error.message || 'Unknown error'
        });
        // 出错时也跳转到笔记页面
        this.$router.push('/notes');
      }
    },
    
    // 获取文件类型对应的图标
    getFileIcon(type) {
      const iconMap = {
        note: '📝',
        plan: '📋',
        mindmap: '🧠'
      }
      return iconMap[type] || '📄'
    },
    
    // 获取文件类型的中文标签
    getFileTypeLabel(type) {
      const labelMap = {
        note: '笔记',
        plan: '计划',
        mindmap: '思维导图'
      }
      return labelMap[type] || '文件'
    },
    
    // 获取指定日期的事件
    getEventsForDate(date) {
      const targetDate = new Date(date)
      targetDate.setHours(0, 0, 0, 0)
      
      return this.events.filter(event => {
        const eventDate = new Date(event.date)
        eventDate.setHours(0, 0, 0, 0)
        
        // 如果是计划且有结束日期，需要检查日期范围
        if (event.type === 'plan' && event.endDate) {
          const endDate = new Date(event.endDate)
          endDate.setHours(0, 0, 0, 0)
          return targetDate.getTime() >= eventDate.getTime() && targetDate.getTime() <= endDate.getTime()
        }
        
        // 其他类型的事件只需要检查创建日期
        return eventDate.getTime() === targetDate.getTime()
      })
    },
    
    // 获取事件类型对应的颜色
    getEventColor(type) {
      const colorMap = {
        note: '#3498db', // 笔记 - 蓝色
        plan: '#2ecc71', // 计划 - 绿色
        mindmap: '#e74c3c', // 思维导图 - 红色
        task: '#3498db',
        meeting: '#e74c3c',
        reminder: '#f39c12'
      }
      return colorMap[type] || '#95a5a6'
    },
    
    // 加载事件数据
    loadEvents() {
      // 检查window.electronAPI是否存在
      if (window && window.electronAPI) {
        // 发送调试信息到主进程
        window.electronAPI.sendDebugInfo({
          component: 'Calendar',
          action: 'loadEvents',
          timestamp: new Date().toISOString(),
          electronAPIExists: true,
          availableMethods: Object.keys(window.electronAPI)
        })
        
        // 检查getCalendarEvents方法是否存在
        if (typeof window.electronAPI.getCalendarEvents === 'function') {
          window.electronAPI.sendDebugInfo({
            component: 'Calendar',
            action: 'checkMethod',
            methodName: 'getCalendarEvents',
            isFunction: true,
            methodType: typeof window.electronAPI.getCalendarEvents
          })
          
          // 获取当前月份的起始和结束日期
          const year = this.currentDate.getFullYear()
          const month = this.currentDate.getMonth()
          const startDate = new Date(year, month, 1).toISOString()
          const endDate = new Date(year, month + 1, 0).toISOString()
          
          window.electronAPI.sendDebugInfo({
            component: 'Calendar',
            action: 'prepareAPI',
            startDate: startDate,
            endDate: endDate
          })
          
          try {
            // 调用API获取日历事件 - 现在传递参数
            window.electronAPI.getCalendarEvents(startDate, endDate)
              .then(events => {
                window.electronAPI.sendDebugInfo({
                  component: 'Calendar',
                  action: 'apiSuccess',
                  eventsCount: events.length
                })
                
                // 转换事件格式以适应前端显示
                this.events = events.map(event => ({
                  id: event.id,
                  title: event.title,
                  type: event.type,
                  date: new Date(event.date),
                  endDate: event.end_date ? new Date(event.end_date) : null,
                  relatedId: event.related_id,
                  relatedType: event.related_type
                }))
              })
              .catch(error => {
                const errorInfo = {
                  component: 'Calendar',
                  action: 'apiError',
                  errorMessage: error.message || 'Unknown error',
                  errorStack: error.stack || ''
                }
                window.electronAPI.sendDebugInfo(errorInfo)
                // 如果API调用失败，使用模拟数据
                this.events = this.getMockEvents()
              })
          } catch (error) {
            const exceptionInfo = {
              component: 'Calendar',
              action: 'exception',
              errorMessage: error.message || 'Unknown exception',
              errorStack: error.stack || ''
            }
            window.electronAPI.sendDebugInfo(exceptionInfo)
            this.events = this.getMockEvents()
          }
        } else {
          window.electronAPI.sendDebugInfo({
            component: 'Calendar',
            action: 'methodError',
            methodName: 'getCalendarEvents',
            isFunction: false,
            methodType: typeof window.electronAPI.getCalendarEvents
          })
          this.events = this.getMockEvents()
        }
      } else {
        // 如果在渲染器环境中没有electronAPI，使用模拟数据
        this.events = this.getMockEvents()
      }
    },
    
    // 创建新事件
    createNewEvent() {
      // 如果没有选择日期，则默认选择今天
      if (!this.selectedDay) {
        this.selectedDay = new Date()
      }
      this.showEventDialog = true
    },
    
    // 创建新笔记
    createNewNote() {
      if (!this.selectedDay) {
        this.selectedDay = new Date()
      }
      // 跳转到笔记页面创建新笔记
      this.$router.push({ path: '/notes', query: { newNote: true, date: this.selectedDay.toISOString() } })
    },
    
    // 创建新计划
    createNewPlan() {
      if (!this.selectedDay) {
        this.selectedDay = new Date()
      }
      // 跳转到计划页面创建新计划
      this.$router.push({ path: '/plans', query: { newPlan: true, date: this.selectedDay.toISOString() } })
    },
    
    // 获取模拟事件数据
    getMockEvents() {
      const today = new Date()
      const tomorrow = new Date(today)
      tomorrow.setDate(today.getDate() + 1)
      const nextWeek = new Date(today)
      nextWeek.setDate(today.getDate() + 7)
      
      // 在加载模拟数据时也初始化dayFiles数组，用于测试
      this.dayFiles = [
        {
          id: 101,
          title: '项目需求分析',
          type: 'note',
          date: today,
          relatedId: 1,
          relatedType: 'notebook'
        },
        {
          id: 102,
          title: '产品发布计划',
          type: 'plan',
          date: today,
          relatedId: null,
          relatedType: null
        },
        {
          id: 103,
          title: '系统架构图',
          type: 'mindmap',
          date: today,
          relatedId: null,
          relatedType: null
        }
      ]
      
      return [
        {
          id: 1,
          title: '团队周会',
          type: 'meeting',
          date: today,
          time: '14:00-15:00'
        },
        {
          id: 2,
          title: '完成项目提案',
          type: 'task',
          date: today
        },
        {
          id: 3,
          title: '客户演示',
          type: 'meeting',
          date: tomorrow,
          time: '10:00-11:30'
        },
        {
          id: 4,
          title: 'Vue学习计划',
          type: 'plan',
          date: nextWeek
        },
        {
          id: 5,
          title: '提交周报',
          type: 'task',
          date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3)
        }
      ]
    },
    
    // 添加模拟事件
    addMockEvent() {
      const today = new Date()
      const newEvent = {
        id: Date.now(),
        title: '新添加的事件',
        type: 'reminder',
        date: today,
        time: '16:00'
      }
      this.events.push(newEvent)
    },
    
    // 保存事件
    saveEvent() {
      // 验证必填字段
      if (!this.eventForm.title.trim()) {
        alert('请输入事件标题')
        return
      }
      
      // 创建新事件对象
      const newEvent = {
        id: Date.now(),
        title: this.eventForm.title,
        type: this.eventForm.type,
        date: new Date(this.selectedDay),
        time: this.eventForm.time,
        description: this.eventForm.description
      }
      
      // 添加到事件数组
      this.events.push(newEvent)
      
      // 关闭对话框
      this.showEventDialog = false
      
      // 重置表单
      this.eventForm = {
        title: '',
        type: 'reminder',
        time: '',
        description: ''
      }
    }
  }
}
</script>

<style scoped>
.calendar-container {
  padding: 20px;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.calendar-header h2 {
  font-size: 24px;
  color: #2c3e50;
  margin: 0;
}

.calendar-controls {
  display: flex;
  align-items: center;
  gap: 15px;
}

.control-btn {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  padding: 8px 12px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.2s;
}

.control-btn:hover {
  background: #e2e8f0;
}

.current-month {
  font-size: 16px;
  font-weight: 500;
  color: #334155;
}

.calendar-grid {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.weekday {
  padding: 15px;
  text-align: center;
  font-weight: 500;
  color: #64748b;
  font-size: 14px;
}

.calendar-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background: #e2e8f0;
}

.day {
  min-height: 100px;
  padding: 10px;
  background: white;
  position: relative;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
}

.day:hover {
  background: #f8fafc;
}

.empty-day {
  background: #f1f5f9;
  cursor: default;
}

.day.today {
  background: #e0f2fe;
}

.day-number {
  font-size: 14px;
  font-weight: 500;
  color: #334155;
  margin-bottom: 8px;
}

.day-events {
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
}

.event-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.event-more {
  font-size: 10px;
  color: #64748b;
  margin-left: 2px;
}

.today-events {
  margin-top: 30px;
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.today-events h3 {
  margin: 0 0 15px 0;
  color: #2c3e50;
  font-size: 18px;
}

.events-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.event-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  background: #f8fafc;
  border-radius: 8px;
}

.event-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.event-content {
  flex: 1;
}

.event-title {
  font-size: 14px;
  font-weight: 500;
  color: #2c3e50;
}

.event-time {
  font-size: 12px;
  color: #64748b;
  margin-top: 2px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
  text-align: center;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 20px;
  opacity: 0.5;
}

.empty-text {
  font-size: 18px;
  color: #64748b;
  margin-bottom: 20px;
}

.create-event-btn {
  background: #3498db;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.create-event-btn:hover {
  background: #2980b9;
}

/* 当日文件列表样式 */
.day-files {
  margin-top: 30px;
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.day-files-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  flex-wrap: wrap;
  gap: 10px;
}

.day-files-header h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 18px;
}

.file-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.create-file-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.create-file-btn:hover {
  background: #2980b9;
  transform: translateY(-1px);
}

.create-file-btn.secondary {
  background: #ecf0f1;
  color: #2c3e50;
}

.create-file-btn.secondary:hover {
  background: #bdc3c7;
}

.btn-icon {
  font-size: 16px;
}

.btn-text {
  font-weight: 500;
}

.files-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f8fafc;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.file-item:hover {
  background: #e6f7ff;
  transform: translateX(2px);
}

.file-icon {
  font-size: 20px;
  flex-shrink: 0;
}

.file-content {
  flex: 1;
}

.file-title {
  font-size: 14px;
  font-weight: 500;
  color: #2c3e50;
}

.file-type {
  font-size: 12px;
  color: #64748b;
  margin-top: 2px;
}

.file-arrow {
  font-size: 14px;
  color: #94a3b8;
}

.no-files {
  text-align: center;
  padding: 40px 20px;
  color: #64748b;
}

.no-files-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.no-files-text {
  font-size: 16px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .calendar-header {
    flex-direction: column;
    gap: 20px;
  }
  
  .day {
    min-height: 80px;
  }
  
  .events-list {
    gap: 8px;
  }
  
  .event-item {
    padding: 8px;
  }
}

/* 模态框样式 */
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
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e2e8f0;
}

.modal-header h2 {
  margin: 0;
  font-size: 20px;
  color: #2c3e50;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #64748b;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.close-btn:hover {
  background-color: #f8fafc;
}

.modal-body {
  padding: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #334155;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #3498db;
}

.selected-date {
  padding: 10px;
  background-color: #f8fafc;
  border-radius: 8px;
  font-weight: 500;
  color: #2c3e50;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px;
  border-top: 1px solid #e2e8f0;
}

.cancel-btn {
  padding: 10px 20px;
  border: 1px solid #e2e8f0;
  background: white;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-btn:hover {
  background-color: #f8fafc;
}

.create-btn {
  padding: 10px 20px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.create-btn:hover {
  background: #2980b9;
}
</style>