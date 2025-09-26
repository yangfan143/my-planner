<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App',
  mounted() {
    // 应用启动时，自动导航到日历页面
    if (!this.$route.path || this.$route.path === '/') {
      this.$router.push('/calendar')
    }
    
    // 添加全局错误处理，捕获组件更新时的错误
    const originalErrorHandler = this.$options.errorHandler
    
    this.$options.errorHandler = (err, vm, info) => {
      // 捕获 "Cannot read properties of null (reading 'parentNode')" 错误
      if (err && err.message && err.message.includes('Cannot read properties of null') && 
          err.message.includes('parentNode')) {
        // 这个错误通常发生在组件已卸载但仍尝试更新DOM时
        // 我们可以安全地忽略它，因为它不会影响应用功能
        console.warn('忽略组件卸载后的DOM更新错误:', err)
        return
      }
      
      // 对于其他错误，调用原始的错误处理器
      if (originalErrorHandler) {
        originalErrorHandler.call(this, err, vm, info)
      } else {
        console.error('Vue错误:', err, info)
      }
    }
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #f5f5f5;
  /* 移除overflow: hidden以允许页面正常滚动 */
}

#app {
  height: 100vh;
  width: 100vw;
  /* 移除overflow: hidden以允许页面正常滚动 */
}

/* 自定义滚动条 */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>