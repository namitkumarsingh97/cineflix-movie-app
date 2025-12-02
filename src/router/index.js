import { createRouter, createWebHistory } from 'vue-router'
import Home from '../pages/Home.vue'
import Videos from '../pages/Videos.vue'
import Watch from '../pages/Watch.vue'

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
  },
  {
    path: '/watch/:id',
    name: 'Watch',
    component: Watch
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router

