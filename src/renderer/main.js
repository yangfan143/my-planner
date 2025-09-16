import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import Layout from './components/Layout.vue'

// 创建Vue应用
const app = createApp(App)

// 注册全局布局组件
app.component('Layout', Layout)

// 使用路由
app.use(router)

// 挂载应用
app.mount('#app')