import { createRouter, createWebHistory } from 'vue-router'

// Route-based code splitting with lazy loading
const routes = [
  {
    path: '/',
    redirect: { name: 'Home' }
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
    path: '/japanese',
    name: 'Japanese',
    component: () => import('../pages/Japanese.vue'),
    meta: { 
      preload: false,
      title: 'Japanese'
    }
  },
  {
    path: '/indian',
    name: 'Indian',
    component: () => import('../pages/Indian.vue'),
    meta: {
      preload: false,
      title: 'Indian'
    }
  },
  {
    path: '/double-penetration',
    name: 'DoublePenetration',
    component: () => import('../pages/DoublePenetration.vue'),
    meta: {
      preload: false,
      title: 'Double Penetration'
    }
  },
  {
    path: '/amateur',
    name: 'Amateur',
    component: () => import('../pages/Amateur.vue'),
    meta: {
      preload: false,
      title: 'Amateur'
    }
  },
  {
    path: '/anal',
    name: 'Anal',
    component: () => import('../pages/Anal.vue'),
    meta: {
      preload: false,
      title: 'Anal'
    }
  },
  {
    path: '/asian',
    name: 'Asian',
    component: () => import('../pages/Asian.vue'),
    meta: {
      preload: false,
      title: 'Asian'
    }
  },
  {
    path: '/bdsm',
    name: 'Bdsm',
    component: () => import('../pages/Bdsm.vue'),
    meta: {
      preload: false,
      title: 'BDSM'
    }
  },
  {
    path: '/big-ass',
    name: 'BigAss',
    component: () => import('../pages/BigAss.vue'),
    meta: {
      preload: false,
      title: 'Big Ass'
    }
  },
  {
    path: '/big-dick',
    name: 'BigDick',
    component: () => import('../pages/BigDick.vue'),
    meta: {
      preload: false,
      title: 'Big Dick'
    }
  },
  {
    path: '/big-tits',
    name: 'BigTits',
    component: () => import('../pages/BigTits.vue'),
    meta: {
      preload: false,
      title: 'Big Tits'
    }
  },
  {
    path: '/bisexual',
    name: 'Bisexual',
    component: () => import('../pages/Bisexual.vue'),
    meta: {
      preload: false,
      title: 'Bisexual'
    }
  },
  {
    path: '/blonde',
    name: 'Blonde',
    component: () => import('../pages/Blonde.vue'),
    meta: {
      preload: false,
      title: 'Blonde'
    }
  },
  {
    path: '/blowjob',
    name: 'Blowjob',
    component: () => import('../pages/Blowjob.vue'),
    meta: {
      preload: false,
      title: 'Blowjob'
    }
  },
  {
    path: '/brunette',
    name: 'Brunette',
    component: () => import('../pages/Brunette.vue'),
    meta: {
      preload: false,
      title: 'Brunette'
    }
  },
  {
    path: '/bukkake',
    name: 'Bukkake',
    component: () => import('../pages/Bukkake.vue'),
    meta: {
      preload: false,
      title: 'Bukkake'
    }
  },
  {
    path: '/creampie',
    name: 'Creampie',
    component: () => import('../pages/Creampie.vue'),
    meta: {
      preload: false,
      title: 'Creampie'
    }
  },
  {
    path: '/cumshot',
    name: 'Cumshot',
    component: () => import('../pages/Cumshot.vue'),
    meta: {
      preload: false,
      title: 'Cumshot'
    }
  },
  {
    path: '/ebony',
    name: 'Ebony',
    component: () => import('../pages/Ebony.vue'),
    meta: {
      preload: false,
      title: 'Ebony'
    }
  },
  {
    path: '/for-women',
    name: 'ForWomen',
    component: () => import('../pages/ForWomen.vue'),
    meta: {
      preload: false,
      title: 'For Women'
    }
  },
  {
    path: '/group-sex',
    name: 'GroupSex',
    component: () => import('../pages/GroupSex.vue'),
    meta: {
      preload: false,
      title: 'Group Sex'
    }
  },
  {
    path: '/handjob',
    name: 'Handjob',
    component: () => import('../pages/Handjob.vue'),
    meta: {
      preload: false,
      title: 'Handjob'
    }
  },
  {
    path: '/hardcore',
    name: 'Hardcore',
    component: () => import('../pages/Hardcore.vue'),
    meta: {
      preload: false,
      title: 'Hardcore'
    }
  },
  {
    path: '/hentai',
    name: 'Hentai',
    component: () => import('../pages/Hentai.vue'),
    meta: {
      preload: false,
      title: 'Hentai'
    }
  },
  {
    path: '/homemade',
    name: 'Homemade',
    component: () => import('../pages/Homemade.vue'),
    meta: {
      preload: false,
      title: 'Homemade'
    }
  },
  {
    path: '/hotel',
    name: 'Hotel',
    component: () => import('../pages/Hotel.vue'),
    meta: {
      preload: false,
      title: 'Hotel'
    }
  },
  {
    path: '/housewives',
    name: 'Housewives',
    component: () => import('../pages/Housewives.vue'),
    meta: {
      preload: false,
      title: 'Housewives'
    }
  },
  {
    path: '/interracial',
    name: 'Interracial',
    component: () => import('../pages/Interracial.vue'),
    meta: {
      preload: false,
      title: 'Interracial'
    }
  },
  {
    path: '/latina',
    name: 'Latina',
    component: () => import('../pages/Latina.vue'),
    meta: {
      preload: false,
      title: 'Latina'
    }
  },
  {
    path: '/lesbian',
    name: 'Lesbian',
    component: () => import('../pages/Lesbian.vue'),
    meta: {
      preload: false,
      title: 'Lesbian'
    }
  },
  {
    path: '/massage',
    name: 'Massage',
    component: () => import('../pages/Massage.vue'),
    meta: {
      preload: false,
      title: 'Massage'
    }
  },
  {
    path: '/masturbation',
    name: 'Masturbation',
    component: () => import('../pages/Masturbation.vue'),
    meta: {
      preload: false,
      title: 'Masturbation'
    }
  },
  {
    path: '/mature',
    name: 'Mature',
    component: () => import('../pages/Mature.vue'),
    meta: {
      preload: false,
      title: 'Mature'
    }
  },
  {
    path: '/milf',
    name: 'MILF',
    component: () => import('../pages/MILF.vue'),
    meta: {
      preload: false,
      title: 'MILF'
    }
  },
  {
    path: '/nurse',
    name: 'Nurse',
    component: () => import('../pages/Nurse.vue'),
    meta: {
      preload: false,
      title: 'Nurse'
    }
  },
  {
    path: '/office',
    name: 'Office',
    component: () => import('../pages/Office.vue'),
    meta: {
      preload: false,
      title: 'Office'
    }
  },
  {
    path: '/outdoor',
    name: 'Outdoor',
    component: () => import('../pages/Outdoor.vue'),
    meta: {
      preload: false,
      title: 'Outdoor'
    }
  },
  {
    path: '/pov',
    name: 'POV',
    component: () => import('../pages/POV.vue'),
    meta: {
      preload: false,
      title: 'POV'
    }
  },
  {
    path: '/public',
    name: 'Public',
    component: () => import('../pages/Public.vue'),
    meta: {
      preload: false,
      title: 'Public'
    }
  },
  {
    path: '/shemale',
    name: 'Shemale',
    component: () => import('../pages/Shemale.vue'),
    meta: {
      preload: false,
      title: 'Shemale'
    }
  },
  {
    path: '/sleep',
    name: 'Sleep',
    component: () => import('../pages/Sleep.vue'),
    meta: {
      preload: false,
      title: 'Sleep'
    }
  },
  {
    path: '/small-tits',
    name: 'SmallTits',
    component: () => import('../pages/SmallTits.vue'),
    meta: {
      preload: false,
      title: 'Small Tits'
    }
  },
  {
    path: '/squirt',
    name: 'Squirt',
    component: () => import('../pages/Squirt.vue'),
    meta: {
      preload: false,
      title: 'Squirt'
    }
  },
  {
    path: '/big-dick',
    name: 'BigDick',
    component: () => import('../pages/BigDick.vue'),
    meta: {
      preload: false,
      title: 'Big Dick'
    }
  },
  {
    path: '/big-tits',
    name: 'BigTits',
    component: () => import('../pages/BigTits.vue'),
    meta: {
      preload: false,
      title: 'Big Tits'
    }
  },
  {
    path: '/bisexual',
    name: 'Bisexual',
    component: () => import('../pages/Bisexual.vue'),
    meta: {
      preload: false,
      title: 'Bisexual'
    }
  },
  {
    path: '/blonde',
    name: 'Blonde',
    component: () => import('../pages/Blonde.vue'),
    meta: {
      preload: false,
      title: 'Blonde'
    }
  },
  {
    path: '/blowjob',
    name: 'Blowjob',
    component: () => import('../pages/Blowjob.vue'),
    meta: {
      preload: false,
      title: 'Blowjob'
    }
  },
  {
    path: '/brunette',
    name: 'Brunette',
    component: () => import('../pages/Brunette.vue'),
    meta: {
      preload: false,
      title: 'Brunette'
    }
  },
  {
    path: '/bukkake',
    name: 'Bukkake',
    component: () => import('../pages/Bukkake.vue'),
    meta: {
      preload: false,
      title: 'Bukkake'
    }
  },
  {
    path: '/creampie',
    name: 'Creampie',
    component: () => import('../pages/Creampie.vue'),
    meta: {
      preload: false,
      title: 'Creampie'
    }
  },
  {
    path: '/cumshot',
    name: 'Cumshot',
    component: () => import('../pages/Cumshot.vue'),
    meta: {
      preload: false,
      title: 'Cumshot'
    }
  },
  {
    path: '/ebony',
    name: 'Ebony',
    component: () => import('../pages/Ebony.vue'),
    meta: {
      preload: false,
      title: 'Ebony'
    }
  },
  {
    path: '/for-women',
    name: 'ForWomen',
    component: () => import('../pages/ForWomen.vue'),
    meta: {
      preload: false,
      title: 'For Women'
    }
  },
  {
    path: '/group-sex',
    name: 'GroupSex',
    component: () => import('../pages/GroupSex.vue'),
    meta: {
      preload: false,
      title: 'Group Sex'
    }
  },
  {
    path: '/handjob',
    name: 'Handjob',
    component: () => import('../pages/Handjob.vue'),
    meta: {
      preload: false,
      title: 'Handjob'
    }
  },
  {
    path: '/hardcore',
    name: 'Hardcore',
    component: () => import('../pages/Hardcore.vue'),
    meta: {
      preload: false,
      title: 'Hardcore'
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
    path: '/analytics',
    name: 'Analytics',
    component: () => import('../pages/Analytics.vue'),
    meta: {
      requiresAuth: false, // Accessible to guests
      title: 'Watch Analytics'
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

