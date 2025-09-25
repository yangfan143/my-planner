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
  </div>
</template>

<script>
export default {
  name: 'Calendar',
  data() {
    return {
      currentDate: new Date(),
      events: [], // 这里应该从API获取实际的事件数据
      selectedDay: null
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
      // 这里可以添加显示所选日期详情的逻辑
      console.log('选择的日期:', date)
    },
    
    // 获取指定日期的事件
    getEventsForDate(date) {
      const targetDate = new Date(date)
      targetDate.setHours(0, 0, 0, 0)
      
      return this.events.filter(event => {
        const eventDate = new Date(event.date)
        eventDate.setHours(0, 0, 0, 0)
        return eventDate.getTime() === targetDate.getTime()
      })
    },
    
    // 获取事件类型对应的颜色
    getEventColor(type) {
      const colorMap = {
        task: '#3498db',
        meeting: '#e74c3c',
        plan: '#2ecc71',
        reminder: '#f39c12'
      }
      return colorMap[type] || '#95a5a6'
    },
    
    // 加载事件数据
    loadEvents() {
      // 这里应该从API获取实际的事件数据
      // 目前使用模拟数据
      this.events = this.getMockEvents()
    },
    
    // 创建新事件
    createNewEvent() {
      // 这里可以打开创建事件的对话框
      console.log('创建新事件')
      // 由于没有实际的创建功能，我们可以添加一个模拟事件
      this.addMockEvent()
    },
    
    // 获取模拟事件数据
    getMockEvents() {
      const today = new Date()
      const tomorrow = new Date(today)
      tomorrow.setDate(today.getDate() + 1)
      const nextWeek = new Date(today)
      nextWeek.setDate(today.getDate() + 7)
      
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
</style>