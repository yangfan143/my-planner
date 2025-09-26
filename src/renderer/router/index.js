import { createRouter, createWebHashHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import Notes from '../views/Notes.vue'
import Planner from '../views/Planner.vue'
import Layout from '../components/Layout.vue'
import Calendar from '../views/Calendar.vue'
import Mindmap from '../views/Mindmap.vue'
import Todos from '../views/Todos.vue'

const routes = [
  { path: '/',
    component: Layout,
    children: [
      { path: '', redirect: '/planner' },
      { path: '/notes', name: 'Notes', component: Notes },
      { path: '/planner', name: 'Planner', component: Planner },
      { path: '/calendar', name: 'Calendar', component: Calendar },
      { path: '/mindmap', name: 'Mindmap', component: Mindmap },
      { path: '/todos', name: 'Todos', component: Todos }
    ]
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router