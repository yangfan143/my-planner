<template>
  <div class="sidebar" :class="{ collapsed: isCollapsed }">
    <div class="sidebar-header">
      <div class="app-logo"></div>
      <div class="app-name" v-if="!isCollapsed">KnowPlan</div>
    </div>
    
    <div class="nav-menu">
      <div 
        v-for="item in navItems" 
        :key="item.id" 
        class="nav-item"
        :class="{ active: activeNav === item.id }"
        @click="navigateTo(item.id)"
      >
        <div class="nav-icon">{{ item.icon }}</div>
        <div class="nav-text" v-if="!isCollapsed">{{ item.name }}</div>
      </div>
    </div>
    
    <div class="sidebar-footer">
      <button class="collapse-btn" @click="toggleCollapse">
        <div class="nav-icon">{{ isCollapsed ? '→' : '←' }}</div>
        <div class="nav-text" v-if="!isCollapsed">折叠导航</div>
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Sidebar',
  data() {
    return {
      isCollapsed: false,
      activeNav: 'dashboard',
      navItems: [
        { id: 'dashboard', name: '首页', icon: '📊' },
        { id: 'notes', name: '笔记', icon: '📝' },
        { id: 'tasks', name: '任务', icon: '✅' },
        { id: 'calendar', name: '日历', icon: '📅' },
        { id: 'mindmap', name: '思维导图', icon: '🧠' },
        { id: 'kanban', name: '看板', icon: '📋' }
      ]
    }
  },
  methods: {
    toggleCollapse() {
      this.isCollapsed = !this.isCollapsed
    },
    navigateTo(navId) {
      this.activeNav = navId
      // 后续可以添加路由跳转逻辑
      console.log('导航到:', navId)
    },
navigateTo(navId) {
    this.activeNav = navId
    
    // 根据导航ID跳转到不同页面
    switch (navId) {
      case 'dashboard':
        this.$router.push('/')
        break
      case 'notes':
        this.$router.push('/notes')
        break
      // 其他导航项的路由可以后续添加
      default:
        console.log('导航到:', navId)
    }
  }
  }
}
</script>

<style scoped>
.sidebar {
  width: 240px;
  background-color: #2c3e50;
  color: white;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
}

.sidebar.collapsed {
  width: 60px;
}

.sidebar-header {
  padding: 20px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.app-logo {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
  border-radius: 8px;
  margin-right: 12px;
}

.app-name {
  font-weight: 600;
  font-size: 18px;
}

.sidebar.collapsed .app-name {
  display: none;
}

.nav-menu {
  padding: 20px 0;
  flex: 1;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  cursor: pointer;
  transition: background 0.2s;
}

.nav-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.nav-item.active {
  background-color: #3498db;
}

.nav-icon {
  margin-right: 12px;
  font-size: 20px;
  width: 24px;
  text-align: center;
}

.sidebar.collapsed .nav-text {
  display: none;
}

.sidebar-footer {
  padding: 15px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.collapse-btn {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 8px;
  border-radius: 4px;
}

.collapse-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
}
</style>