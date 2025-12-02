import { createRouter, createWebHistory } from 'vue-router'
import Home from '../pages/Home.vue'
import Videos from '../pages/Videos.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/videos',
    name: 'Videos',
    component: Videos
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router

