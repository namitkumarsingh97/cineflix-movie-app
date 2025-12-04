import { createRouter, createWebHistory } from 'vue-router'
import Home from '../pages/Home.vue'
import Videos from '../pages/Videos.vue'
import Watch from '../pages/Watch.vue'
import Stories from '../pages/Stories.vue'
import StoryDetail from '../pages/StoryDetail.vue'
import Categories from '../pages/Categories.vue'
import CategoryDetail from '../pages/CategoryDetail.vue'
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
    path: '/categories',
    name: 'Categories',
    component: Categories
  },
  {
    path: '/category/:category',
    name: 'CategoryDetail',
    component: CategoryDetail
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

// Navigation guard for age verification and admin routes
router.beforeEach((to, from, next) => {
  // Check age verification first (except for admin login)
  if (to.path !== '/admin/login') {
    const verified = localStorage.getItem('ageVerified')
    const timestamp = localStorage.getItem('ageVerifiedTimestamp')
    
    if (verified === 'true' && timestamp) {
      // Check if verification is still valid (expires after 30 days)
      const verificationDate = parseInt(timestamp)
      const daysSinceVerification = (Date.now() - verificationDate) / (1000 * 60 * 60 * 24)
      
      if (daysSinceVerification >= 30) {
        // Expired - require re-verification
        localStorage.removeItem('ageVerified')
        localStorage.removeItem('ageVerifiedTimestamp')
        // Stay on current route but age verification modal will show
      }
    } else {
      // Not verified - allow navigation but age verification modal will block
      // This ensures the modal shows on any route
    }
  }
  
  // Check admin auth
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

