<template>
  <div class="header">
    <div class="search-box">
      <span class="search-icon">🔍</span>
      <input type="text" placeholder="搜索笔记、任务..." v-model="searchQuery">
    </div>
    <div class="user-area">
      <div class="user-avatar"></div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Header',
  data() {
    return {
      searchQuery: ''
    }
  },
  watch: {
    searchQuery(newVal) {
      this.$emit('search', newVal);
    }
  }
}
</script>

<style scoped>
.header {
  height: 60px;
  background-color: white;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

.search-box {
  display: flex;
  align-items: center;
  background: #f5f7f9;
  border-radius: 6px;
  padding: 8px 15px;
  width: 300px;
}

.search-icon {
  margin-right: 8px;
}

.search-box input {
  border: none;
  background: transparent;
  outline: none;
  flex: 1;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%);
}
</style>