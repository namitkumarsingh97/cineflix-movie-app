import { createRouter, createWebHistory } from 'vue-router'
import Home from '../pages/Home.vue'
import Videos from '../pages/Videos.vue'
import Watch from '../pages/Watch.vue'
import Stories from '../pages/Stories.vue'
import StoryDetail from '../pages/StoryDetail.vue'
import AdminLogin from '../pages/AdminLogin.vue'
import AdminPanel from '../pages/AdminPanel.vue'

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
  },
  {
    path: '/stories',
    name: 'Stories',
    component: Stories
  },
  {
    path: '/story/:id',
    name: 'StoryDetail',
    component: StoryDetail
  },
  {
    path: '/admin/login',
    name: 'AdminLogin',
    component: AdminLogin
  },
  {
    path: '/admin/panel',
    name: 'AdminPanel',
    component: AdminPanel,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard for admin routes
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth) {
    const token = localStorage.getItem('adminToken')
    if (!token) {
      next('/admin/login')
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router

