import { createRouter, createWebHashHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import Notes from '../views/Notes.vue'
import Tasks from '../views/Tasks.vue'
import Layout from '../components/Layout.vue'

const routes = [
  { path: '/',
    component: Layout,
    children: [
      {
        path: '',
        redirect: '/notes'
      },
      {
        path: '/notes',
        name: 'Notes',
        component: Notes
      },
      {
        path: '/tasks',
        name: 'Tasks',
        component: Tasks
      }
    ]
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router