<template>
  <div class="dashboard">
    <h1>欢迎使用个人知识管理与计划系统</h1>
    <p>这是一个整合笔记、任务、日历和思维导图的个人生产力工具。</p>
    
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-title">笔记统计</div>
        <div class="stat-value">0</div>
        <div class="stat-subtext">最近更新: 暂无</div>
      </div>
      <div class="stat-card">
        <div class="stat-title">任务统计</div>
        <div class="stat-value">0/0</div>
        <div class="stat-subtext">待完成/已完成</div>
      </div>
      <div class="stat-card">
        <div class="stat-title">日程安排</div>
        <div class="stat-value">0</div>
        <div class="stat-subtext">本周事件</div>
      </div>
    </div>
    
    <div class="recent-section">
      <h2>最近笔记</h2>
      <p class="empty-state">暂无笔记，<a href="#" @click="createNote">创建第一篇笔记</a></p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Dashboard',
  methods: {
    createNote() {
      console.log('创建新笔记')
      // 后续实现创建笔记功能
    }
  }
}
</script>

<style scoped>
.dashboard {
  padding: 20px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin: 30px 0;
}

.stat-card {
  background: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.stat-title {
  font-size: 14px;
  color: #7f8c8d;
  margin-bottom: 10px;
}

.stat-value {
  font-size: 28px;
  font-weight: 600;
  color: #2c3e50;
}

.stat-subtext {
  font-size: 13px;
  color: #95a5a6;
  margin-top: 5px;
}

.recent-section {
  margin-top: 30px;
}

.empty-state {
  color: #95a5a6;
  font-style: italic;
  margin-top: 10px;
}

.empty-state a {
  color: #3498db;
  text-decoration: none;
}

.empty-state a:hover {
  text-decoration: underline;
}
</style>