<template>
  <div class="sidebar" :class="{ collapsed: isCollapsed }">
    <div class="sidebar-header">
      <div class="app-logo"></div>
      <div class="app-name" v-if="!isCollapsed">KnowPlan</div>
    </div>
    
    <!-- 搜索框 -->
    <div class="search-container" v-if="!isCollapsed">
      <div class="search-box">
        <div class="search-icon">🔍</div>
        <input 
          type="text" 
          placeholder="搜索笔记、任务..." 
          v-model="searchQuery"
          @keyup.enter="performSearch"
        >
      </div>
    </div>
    
    <div class="nav-menu">
      <div 
        v-for="item in navItems" 
        :key="item.id" 
        class="nav-item"
        :class="{ active: activeNav === item.id }"
        @click="navigateTo(item.path)"
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
      activeNav: 'notes',
      searchQuery: '',
      navItems: [
        { id: 'planner', name: '计划', icon: '📋', path: '/planner' },
        { id: 'todos', name: '待办', icon: '✅', path: '/todos' },
        { id: 'notes', name: '笔记', icon: '📝', path: '/notes' },
        { id: 'calendar', name: '日历', icon: '📅', path: '/calendar' },
        { id: 'mindmap', name: '思维导图', icon: '🧠', path: '/mindmap' }
      ]
    }
  },
  methods: {
    toggleCollapse() {
      this.isCollapsed = !this.isCollapsed
    },
    navigateTo(path) {
      try {
        // 设置活动导航项
        const activeItem = this.navItems.find(item => item.path === path)
        if (activeItem) {
          this.activeNav = activeItem.id
        }
        
        // 直接执行路由跳转，依赖App.vue中的全局错误处理来捕获任何DOM访问错误
        this.$router.push(path)
      } catch (error) {
        console.warn('导航过程中出错，但应用已配置全局错误处理:', error)
      }
    },
    performSearch() {
      console.log('执行搜索:', this.searchQuery)
      // 后续实现搜索功能
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

/* 搜索框样式 */
.search-container {
  padding: 15px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.search-box {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  padding: 8px 12px;
}

.search-box input {
  border: none;
  background: transparent;
  margin-left: 8px;
  flex: 1;
  outline: none;
  color: white;
  font-size: 14px;
}

.search-box input::placeholder {
  color: rgba(255, 255, 255, 0.6);
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