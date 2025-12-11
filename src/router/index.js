import { createRouter, createWebHistory } from 'vue-router'

// Route-based code splitting with lazy loading
const routes = [
  {
    path: '/',
    redirect: { name: 'Videos' }
  },
  {
    path: '/home',
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
    path: '/premium',
    name: 'Premium',
    component: () => import('../pages/Premium.vue'),
    meta: {
      preload: false,
      title: 'Premium'
    }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../pages/Login.vue'),
    meta: {
      preload: false,
      title: 'Sign In',
      requiresGuest: true
    }
  },
  {
    path: '/signup',
    name: 'Signup',
    component: () => import('../pages/Signup.vue'),
    meta: {
      preload: false,
      title: 'Sign Up',
      requiresGuest: true
    }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../pages/Dashboard.vue'),
    meta: {
      requiresAuth: true,
      preload: false,
      title: 'Dashboard'
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
  },
  {
    path: '/privacy',
    name: 'Privacy',
    component: () => import('../pages/Privacy.vue'),
    meta: { 
      preload: false,
      title: 'Privacy Policy'
    }
  },
  {
    path: '/terms',
    name: 'Terms',
    component: () => import('../pages/Terms.vue'),
    meta: { 
      preload: false,
      title: 'Terms of Service'
    }
  },
  {
    path: '/cookies',
    name: 'Cookies',
    component: () => import('../pages/Cookies.vue'),
    meta: { 
      preload: false,
      title: 'Cookie Policy'
    }
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('../pages/About.vue'),
    meta: { 
      preload: false,
      title: 'About Us'
    }
  },
  {
    path: '/contact',
    name: 'Contact',
    component: () => import('../pages/Contact.vue'),
    meta: { 
      preload: false,
      title: 'Contact Us'
    }
  },
  {
    path: '/help',
    name: 'Help',
    component: () => import('../pages/Help.vue'),
    meta: { 
      preload: false,
      title: 'Help Center'
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
  
  // Check user authentication (for dashboard, account pages)
  if (to.meta.requiresAuth && !to.path.startsWith('/admin')) {
    const token = localStorage.getItem('cineflix_auth_token');
    if (!token) {
      next({ name: 'Login', query: { redirect: to.fullPath } });
      return;
    }
  }
  
  // Check guest routes (login, signup - redirect if already logged in)
  if (to.meta.requiresGuest) {
    const token = localStorage.getItem('cineflix_auth_token');
    if (token) {
      next({ name: 'Dashboard' });
      return;
    }
  }
  
  // Check admin auth (for admin panel)
  if (to.meta.requiresAuth && to.path.startsWith('/admin')) {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      next('/admin/login');
      return;
    }
  }
  
  next();
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

