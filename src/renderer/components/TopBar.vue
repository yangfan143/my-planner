<template>
  <div class="top-bar">
    <div class="page-title">{{ currentPageTitle }}</div>
    <div class="right-controls">
      <div class="search-box">
        <div class="search-icon">🔍</div>
        <input 
          type="text" 
          placeholder="搜索笔记、任务..." 
          v-model="searchQuery"
          @keyup.enter="performSearch"
        >
      </div>
      <div class="user-profile">
        <div class="user-avatar"></div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TopBar',
  data() {
    return {
      searchQuery: '',
      pageTitles: {
        notes: '笔记',
        tasks: '任务',
        calendar: '日历',
        mindmap: '思维导图',
        kanban: '看板'
      }
    }
  },
  computed: {
    currentPageTitle() {
      // 根据当前路由动态设置标题
      const routeName = this.$route.name
      if (routeName && this.pageTitles[routeName.toLowerCase()]) {
        return this.pageTitles[routeName.toLowerCase()]
      }
      return this.pageTitles.notes // 默认显示笔记
    }
  },
  methods: {
    performSearch() {
      console.log('执行搜索:', this.searchQuery)
      // 后续实现搜索功能
    }
  }
}
</script>

<style scoped>
.top-bar {
  height: 60px;
  background-color: white;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  padding: 0 20px;
  justify-content: space-between;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
}

.right-controls {
  display: flex;
  align-items: center;
  gap: 20px;
}

.search-box {
  display: flex;
  align-items: center;
  background: #f0f2f5;
  border-radius: 6px;
  padding: 8px 15px;
  width: 300px;
}

.search-box input {
  border: none;
  background: transparent;
  margin-left: 8px;
  flex: 1;
  outline: none;
}

.user-profile {
  display: flex;
  align-items: center;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%);
}
</style>