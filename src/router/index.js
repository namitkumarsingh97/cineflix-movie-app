import { createRouter, createWebHistory } from 'vue-router'

// Route-based code splitting with lazy loading
const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../pages/Home.vue'),
    meta: { 
      preload: true, // Critical route - preload immediately
      title: 'Home'
    }
  },
  {
    path: '/videos',
    name: 'Videos',
    component: () => import('../pages/Videos.vue'),
    meta: { 
      preload: true, // Critical route - preload on idle
      title: 'Videos'
    }
  },
  {
    path: '/watch/:id',
    name: 'Watch',
    component: () => import('../pages/Watch.vue'),
    meta: { 
      preload: true, // Critical route - preload on idle
      title: 'Watch'
    }
  },
  {
    path: '/stories',
    name: 'Stories',
    component: () => import('../pages/Stories.vue'),
    meta: { 
      preload: false, // Less critical - load on demand
      title: 'Stories'
    }
  },
  {
    path: '/story/:id',
    name: 'StoryDetail',
    component: () => import('../pages/StoryDetail.vue'),
    meta: { 
      preload: false,
      title: 'Story'
    }
  },
  {
    path: '/categories',
    name: 'Categories',
    component: () => import('../pages/Categories.vue'),
    meta: { 
      preload: false,
      title: 'Categories'
    }
  },
  {
    path: '/category/:category',
    name: 'CategoryDetail',
    component: () => import('../pages/CategoryDetail.vue'),
    meta: { 
      preload: false,
      title: 'Category'
    }
  },
  {
    path: '/admin/login',
    name: 'AdminLogin',
    component: () => import('../pages/AdminLogin.vue'),
    meta: { 
      preload: false,
      title: 'Admin Login'
    }
  },
  {
    path: '/admin/panel',
    name: 'AdminPanel',
    component: () => import('../pages/AdminPanel.vue'),
    meta: { 
      requiresAuth: true,
      preload: false,
      title: 'Admin Panel'
    }
  },
  {
    path: '/playlists',
    name: 'Playlists',
    component: () => import('../pages/Playlists.vue'),
    meta: { 
      preload: false,
      title: 'Playlists'
    }
  },
  {
    path: '/playlist/:id',
    name: 'PlaylistDetail',
    component: () => import('../pages/PlaylistDetail.vue'),
    meta: { 
      preload: false,
      title: 'Playlist'
    }
  },
  {
    path: '/mood-mix/:mood',
    name: 'MoodMix',
    component: () => import('../pages/MoodMix.vue'),
    meta: { 
      preload: false,
      title: 'Mood Mix'
    }
  },
  {
    path: '/creator/:id',
    name: 'CreatorHub',
    component: () => import('../pages/CreatorHub.vue'),
    meta: { 
      preload: false,
      title: 'Creator Hub'
    }
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

// Update document title on route change
router.afterEach((to) => {
  if (to.meta.title) {
    document.title = `${to.meta.title} - Cineflix`;
  }
  
  // Prefetch critical routes on idle
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      const criticalRoutes = router.getRoutes().filter(
        route => route.meta?.preload && route.name !== to.name
      );
      
      criticalRoutes.forEach((route) => {
        if (route.components?.default && typeof route.components.default === 'function') {
          route.components.default().catch(() => {
            // Silently fail prefetch
          });
        }
      });
    }, { timeout: 2000 });
  }
})

export default router

