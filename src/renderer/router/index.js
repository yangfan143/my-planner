import { createRouter, createWebHashHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import Notes from '../views/Notes.vue'
import Tasks from '../views/Tasks.vue'
import Plans from '../views/Plans.vue'
import Layout from '../components/Layout.vue'
import Calendar from '../views/Calendar.vue'
import Mindmap from '../views/Mindmap.vue'

const routes = [
  { path: '/',
    component: Layout,
    children: [
      { path: '', redirect: '/plans' },
      { path: '/notes', name: 'Notes', component: Notes },
      { path: '/tasks', name: 'Tasks', component: Tasks },
      { path: '/plans', name: 'Plans', component: Plans },
      { path: '/calendar', name: 'Calendar', component: Calendar },
      { path: '/mindmap', name: 'Mindmap', component: Mindmap }
    ]
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router