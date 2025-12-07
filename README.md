# Cineflix - Movie Streaming Platform

<div align="center">

![Cineflix](https://img.shields.io/badge/Cineflix-Movie%20Streaming-orange?style=for-the-badge)
![Vue.js](https://img.shields.io/badge/Vue.js-3.4-4FC08D?style=for-the-badge&logo=vue.js)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

A modern, feature-rich movie and video streaming web application built with Vue.js 3, featuring a beautiful dark-themed UI, comprehensive content management, user authentication, premium subscriptions, and much more.

[Features](#-features) • [Installation](#-installation) • [Documentation](#-documentation) • [Contributing](#-contributing)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Development](#-development)
- [Deployment](#-deployment)
- [API Documentation](#-api-documentation)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎬 Overview

Cineflix is a comprehensive movie and video streaming platform that provides users with an immersive viewing experience. The application supports multiple content types including movies, videos, stories, and premium content. It features a modern, responsive design with advanced functionality like user authentication, subscription management, content recommendations, and offline viewing capabilities.

### Key Highlights

- 🎨 **Modern UI/UX**: Dark-themed interface inspired by popular streaming services
- 📱 **Progressive Web App (PWA)**: Installable on mobile and desktop devices
- 🌍 **Multi-language Support**: Internationalization (i18n) with 6 languages
- 🔐 **User Authentication**: Email/password and Google OAuth login
- 💎 **Premium Subscriptions**: Monthly, yearly, and lifetime plans with UPI payment
- 📊 **Admin Panel**: Complete content management system
- 🎯 **Smart Recommendations**: Personalized content suggestions
- 📥 **Offline Viewing**: Download videos for offline access
- ⚡ **Performance Optimized**: Code splitting, lazy loading, and prefetching

---

## ✨ Features

### Core Features

- **Movie & Video Streaming**
  - Iframe-based movie player
  - S3-hosted video streaming
  - HLS video support
  - Scene markers and navigation
  - Playback speed control
  - Picture-in-picture mode

- **Content Management**
  - Category-based organization
  - Advanced search and filtering
  - Sorting options (Recent, Alphabetical, Popular)
  - Pagination (40 items per page)
  - Content recommendations
  - Mood-based content discovery

- **User Features**
  - User registration and authentication
  - Google OAuth integration
  - User dashboard
  - Watch history tracking
  - Watch later playlist
  - Custom playlists
  - Star/creator following
  - Category preferences
  - Download management

- **Premium Features**
  - Subscription plans (Monthly, Yearly, Lifetime)
  - UPI payment integration
  - Premium content access
  - Ad-free experience
  - Priority support

- **Admin Features**
  - Admin authentication
  - Movie/video management
  - Category management
  - Story management
  - Analytics dashboard
  - User management
  - Payment verification

- **Additional Features**
  - Age verification system
  - Accessibility settings
  - Network quality detection
  - Background sync
  - Push notifications
  - Badge counts
  - Responsive design
  - SEO optimized

---

## 🛠 Tech Stack

### Frontend

- **Framework**: Vue.js 3.4 (Composition API)
- **Routing**: Vue Router 4.6
- **HTTP Client**: Axios 1.6
- **Icons**: Lucide Vue Next 0.555
- **Video Player**: HLS.js 1.4
- **Build Tool**: Vite 5.0
- **Payment**: Razorpay SDK 2.9 (for future integration)

### Backend (Separate Repository)

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)
- **File Storage**: AWS S3
- **Payment**: UPI Integration

### Development Tools

- **Package Manager**: npm
- **Version Control**: Git
- **Deployment**: Vercel

---

## 📁 Project Structure

```
cineflix-movie-app/
├── public/                 # Static assets
│   ├── icon-192.png       # PWA icon (192x192)
│   ├── icon-512.png       # PWA icon (512x512)
│   ├── icon.svg           # App icon
│   ├── manifest.json      # PWA manifest
│   ├── offline.html       # Offline fallback page
│   └── sw.js              # Service worker
│
├── src/
│   ├── api/               # API service layer
│   │   ├── account.js     # Account management API
│   │   ├── auth.js        # Authentication API
│   │   ├── movies.js      # Movies API
│   │   ├── videos.js      # Videos API
│   │   ├── stars.js       # Stars/Creators API
│   │   ├── subscription.js # Subscription API
│   │   ├── paymentVerification.js # Payment verification
│   │   ├── eporner.js     # External API integration
│   │   ├── pornpics.js    # External API integration
│   │   └── user.js        # User API
│   │
│   ├── components/        # Reusable Vue components
│   │   ├── AccessibilitySettings.vue
│   │   ├── AccountSettings.vue
│   │   ├── AddMovieForm.vue
│   │   ├── AddMovieModal.vue
│   │   ├── AdvancedSearch.vue
│   │   ├── AgeVerification.vue
│   │   ├── AnalyticsChart.vue
│   │   ├── BadgeCount.vue
│   │   ├── BecauseYouWatched.vue
│   │   ├── Card.vue
│   │   ├── CategoryManagement.vue
│   │   ├── EditMovieModal.vue
│   │   ├── EditStarModal.vue
│   │   ├── HomeLayoutCustomizer.vue
│   │   ├── Loader.vue
│   │   ├── ManageMovies.vue
│   │   ├── ManageStories.vue
│   │   ├── MoodMixCard.vue
│   │   ├── MovieCard.vue
│   │   ├── OptimizedImage.vue
│   │   ├── PaymentModal.vue
│   │   ├── PaymentScreenshotUpload.vue
│   │   ├── PaymentVerificationReview.vue
│   │   ├── PictureCard.vue
│   │   ├── PlaylistCard.vue
│   │   ├── PreferencesModal.vue
│   │   ├── PremiumVideoCard.vue
│   │   ├── PWAInstallPrompt.vue
│   │   ├── SceneMarker.vue
│   │   ├── SceneNavigation.vue
│   │   ├── SkeletonCard.vue
│   │   ├── SkeletonGrid.vue
│   │   ├── SkeletonSection.vue
│   │   ├── StoryFormModal.vue
│   │   ├── UPIPaymentModal.vue
│   │   └── VideoCard.vue
│   │
│   ├── composables/       # Vue Composition API composables
│   │   ├── useAccessibility.js
│   │   ├── useAuth.js
│   │   ├── useBackgroundSync.js
│   │   ├── useBadgeCounts.js
│   │   ├── useCreators.js
│   │   ├── useDownloads.js
│   │   ├── useEporner.js
│   │   ├── useFetch.js
│   │   ├── useHomeLayout.js
│   │   ├── useLazyLoad.js
│   │   ├── useMovies.js
│   │   ├── useNetworkQuality.js
│   │   ├── useNotifications.js
│   │   ├── usePagination.js
│   │   ├── usePlaylists.js
│   │   ├── usePornPics.js
│   │   ├── usePreferences.js
│   │   ├── usePrefetch.js
│   │   ├── usePushNotifications.js
│   │   ├── usePWA.js
│   │   ├── useRecommendations.js
│   │   ├── useScenes.js
│   │   ├── useStarFollows.js
│   │   ├── useSubscription.js
│   │   ├── useVideos.js
│   │   ├── useWatchHistory.js
│   │   └── useWatchLater.js
│   │
│   ├── i18n/              # Internationalization
│   │   └── locales/
│   │       ├── en.json    # English
│   │       ├── es.json    # Spanish
│   │       ├── fr.json    # French
│   │       ├── de.json    # German
│   │       ├── hi.json    # Hindi
│   │       └── zh.json    # Chinese
│   │
│   ├── layouts/           # Layout components
│   │   └── PublicLayout.vue
│   │
│   ├── pages/            # Route pages
│   │   ├── About.vue
│   │   ├── AdminLogin.vue
│   │   ├── AdminPanel.vue
│   │   ├── Categories.vue
│   │   ├── CategoryDetail.vue
│   │   ├── Contact.vue
│   │   ├── Cookies.vue
│   │   ├── CreatorHub.vue
│   │   ├── Dashboard.vue
│   │   ├── Help.vue
│   │   ├── Home.vue
│   │   ├── Login.vue
│   │   ├── MoodMix.vue
│   │   ├── PlaylistDetail.vue
│   │   ├── Playlists.vue
│   │   ├── Premium.vue
│   │   ├── Privacy.vue
│   │   ├── Signup.vue
│   │   ├── StarDetail.vue
│   │   ├── Stars.vue
│   │   ├── Stories.vue
│   │   ├── StoryDetail.vue
│   │   ├── Terms.vue
│   │   ├── Videos.vue
│   │   └── Watch.vue
│   │
│   ├── plugins/          # Vue plugins
│   │   └── axios.js      # Axios configuration
│   │
│   ├── router/           # Vue Router configuration
│   │   └── index.js
│   │
│   ├── services/        # Business logic services
│   │   └── movieService.js
│   │
│   ├── utils/           # Utility functions
│   │   ├── date.js
│   │   ├── imageOptimization.js
│   │   └── video.js
│   │
│   ├── App.vue          # Root component
│   ├── main.js          # Application entry point
│   └── style.css        # Global styles
│
├── scripts/              # Build scripts
│   └── generate-icons.js # Icon generation script
│
├── index.html           # HTML template
├── package.json        # Dependencies and scripts
├── vite.config.js      # Vite configuration
├── vercel.json         # Vercel deployment config
│
└── Documentation Files:
    ├── README.md                    # This file
    ├── ADMIN_FEATURE_SUMMARY.md     # Admin features documentation
    ├── ADMIN_FEATURES_ROADMAP.md    # Admin roadmap
    ├── ADMIN_SETUP_GUIDE.md         # Admin setup guide
    ├── AUTHENTICATION_IMPLEMENTATION.md # Auth implementation
    ├── BACKEND_SYNC_AND_NOTIFICATIONS.md # Backend sync docs
    ├── DEPLOYMENT_CHECKLIST.md      # Deployment checklist
    ├── DEPLOYMENT_INSTRUCTIONS.md   # Deployment guide
    ├── FEATURES_IMPLEMENTED.md      # Features list
    ├── ICON_SETUP.md                # Icon setup guide
    ├── PREMIUM_FEATURE_SUMMARY.md   # Premium features
    ├── RESTRUCTURE_SUMMARY.md       # Project restructure info
    ├── S3_INTEGRATION_SUMMARY.md    # S3 integration guide
    ├── STRUCTURE.md                 # Project structure guide
    └── UPI_INTEGRATION_SUMMARY.md   # UPI payment integration
```

---

## 🚀 Installation

### Prerequisites

- **Node.js**: v16.x or higher
- **npm**: v7.x or higher (comes with Node.js)
- **MongoDB**: Running instance (local or cloud)
- **Backend API**: The backend server should be running (see backend repository)

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd cineflix-movie-app
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Environment Configuration

Create a `.env` file in the root directory:

```env
# API Configuration
VITE_API_URL=http://localhost:5000/api

# Google OAuth (Optional)
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com

# UPI Payment (Optional)
VITE_UPI_ID=your-upi-id@paytm
```

For production, update `VITE_API_URL` to your production API URL.

### Step 4: Start Development Server

```bash
npm run dev
```

The application will open automatically at `http://localhost:3000`

---

## ⚙️ Configuration

### API Configuration

The API base URL is configured in `src/plugins/axios.js`. It uses the following priority:

1. `VITE_API_URL` environment variable
2. Development: `http://localhost:5000/api`
3. Production: `https://cineflix-api-rho.vercel.app/api`

### Vite Configuration

The Vite configuration (`vite.config.js`) includes:

- **Port**: 3000 (development)
- **Proxy**: `/api` requests proxied to `http://localhost:5000`
- **Code Splitting**: Vendor chunks for Vue and icons
- **Optimization**: Dependency pre-bundling

### PWA Configuration

PWA settings are configured in `public/manifest.json`:

- App name: "Cineflix Movie Hub"
- Theme color: `#0a0e27`
- Icons: 192x192 and 512x512 PNG icons
- Display mode: Standalone

### Router Configuration

Routes are defined in `src/router/index.js` with:

- Route-based code splitting (lazy loading)
- Route guards for authentication
- Age verification checks
- Prefetching for critical routes

---

## 💻 Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Generate PWA icons
npm run generate-icons
```

### Development Workflow

1. **Start Backend Server** (in separate terminal):
   ```bash
   cd ../cineflix-api  # or your backend directory
   npm start
   ```

2. **Start Frontend**:
   ```bash
   npm run dev
   ```

3. **Make Changes**: Edit files in `src/` directory

4. **Hot Reload**: Changes are automatically reflected in the browser

### Code Organization

- **API Layer** (`src/api/`): All HTTP requests to backend
- **Components** (`src/components/`): Reusable UI components
- **Composables** (`src/composables/`): Reusable logic using Composition API
- **Pages** (`src/pages/`): Route components (one file per route)
- **Services** (`src/services/`): Business logic layer
- **Utils** (`src/utils/`): Pure helper functions

### Best Practices

1. **Use Composables**: Extract reusable logic into composables
2. **Component Reusability**: Create small, focused components
3. **API Abstraction**: All API calls go through `src/api/` layer
4. **Type Safety**: Consider adding TypeScript in the future
5. **Error Handling**: Always handle errors in API calls
6. **Loading States**: Show loading indicators during async operations

---

## 🚢 Deployment

### Building for Production

```bash
npm run build
```

This creates an optimized production build in the `dist/` directory.

### Deploying to Vercel

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm i -g vercel
   ```

2. **Deploy**:
   ```bash
   vercel --prod
   ```

3. **Environment Variables**: Add environment variables in Vercel dashboard:
   - `VITE_API_URL`: Your production API URL
   - `VITE_GOOGLE_CLIENT_ID`: Google OAuth client ID
   - `VITE_UPI_ID`: UPI ID (if using)

### Deployment Checklist

- [ ] Build completes without errors
- [ ] Environment variables are set
- [ ] API URL points to production backend
- [ ] PWA manifest is configured
- [ ] Service worker is registered
- [ ] All routes work correctly
- [ ] Authentication flow works
- [ ] Payment integration works (if applicable)
- [ ] Analytics are configured (if applicable)

For detailed deployment instructions, see [DEPLOYMENT_INSTRUCTIONS.md](./DEPLOYMENT_INSTRUCTIONS.md)

---

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Google OAuth Login
```http
POST /api/auth/google
Content-Type: application/json

{
  "token": "google-id-token"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

### Movie Endpoints

#### Get All Movies
```http
GET /api/movies?page=1&limit=40&sort=recent&category=action
```

#### Get Movie by ID
```http
GET /api/movies/:id
```

#### Create Movie (Admin)
```http
POST /api/movies
Authorization: Bearer <admin-token>
Content-Type: multipart/form-data

{
  "title": "Movie Title",
  "category": "action",
  "iframeCode": "<iframe>...</iframe>",
  "thumbnail": <file>
}
```

#### Update Movie (Admin)
```http
PUT /api/movies/:id
Authorization: Bearer <admin-token>
```

#### Delete Movie (Admin)
```http
DELETE /api/movies/:id
Authorization: Bearer <admin-token>
```

### Video Endpoints

#### Get All Videos
```http
GET /api/videos
```

#### Get Video by ID
```http
GET /api/videos/:id
```

#### Sync Videos from S3
```http
POST /api/videos/sync
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "prefix": "videos/"
}
```

### Subscription Endpoints

#### Get Subscription Status
```http
GET /api/subscription/status
Authorization: Bearer <token>
```

#### Create UPI Order
```http
POST /api/subscription/create-upi-order
Authorization: Bearer <token>
Content-Type: application/json

{
  "planId": "monthly",
  "type": "monthly",
  "amount": 299
}
```

#### Verify UPI Payment
```http
POST /api/subscription/verify-upi-payment
Authorization: Bearer <token>
Content-Type: application/json

{
  "orderId": "order_123",
  "transactionId": "txn_456"
}
```

### Account Endpoints

#### Get Profile
```http
GET /api/account/profile
Authorization: Bearer <token>
```

#### Update Profile
```http
PUT /api/account/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Name",
  "email": "newemail@example.com"
}
```

#### Change Password
```http
POST /api/account/change-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "oldpass",
  "newPassword": "newpass"
}
```

#### Delete Account
```http
DELETE /api/account
Authorization: Bearer <token>
Content-Type: application/json

{
  "password": "password123"
}
```

For complete API documentation, refer to the backend repository.

---

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

### Getting Started

1. **Fork the Repository**: Click the "Fork" button on GitHub
2. **Clone Your Fork**:
   ```bash
   git clone https://github.com/your-username/cineflix-movie-app.git
   cd cineflix-movie-app
   ```
3. **Create a Branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

### Development Guidelines

1. **Code Style**:
   - Follow Vue.js style guide
   - Use Composition API for new components
   - Keep components small and focused
   - Write meaningful commit messages

2. **File Naming**:
   - Components: PascalCase (e.g., `MovieCard.vue`)
   - Composables: camelCase with `use` prefix (e.g., `useMovies.js`)
   - Utilities: camelCase (e.g., `date.js`)

3. **Commit Messages**:
   ```
   type(scope): subject

   Examples:
   feat(auth): add Google OAuth login
   fix(player): resolve video playback issue
   docs(readme): update installation instructions
   ```

4. **Testing**:
   - Test your changes thoroughly
   - Check for console errors
   - Test on different screen sizes
   - Verify authentication flows

### Pull Request Process

1. **Update Documentation**: Update README.md if needed
2. **Test Your Changes**: Ensure everything works
3. **Create Pull Request**: 
   - Provide clear description
   - Reference related issues
   - Include screenshots if UI changes
4. **Code Review**: Address feedback from maintainers

### Areas for Contribution

- 🐛 **Bug Fixes**: Fix existing issues
- ✨ **New Features**: Add requested features
- 📚 **Documentation**: Improve documentation
- 🎨 **UI/UX**: Enhance user interface
- ⚡ **Performance**: Optimize performance
- 🌍 **i18n**: Add more languages
- ♿ **Accessibility**: Improve accessibility
- 🧪 **Testing**: Add unit/integration tests

### Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Help others learn and grow
- Follow the project's coding standards

---

## 📖 Additional Documentation

- [Admin Features](./ADMIN_FEATURE_SUMMARY.md) - Admin panel documentation
- [Authentication](./AUTHENTICATION_IMPLEMENTATION.md) - Auth implementation guide
- [Premium Features](./PREMIUM_FEATURE_SUMMARY.md) - Premium subscription details
- [S3 Integration](./S3_INTEGRATION_SUMMARY.md) - S3 video storage setup
- [UPI Integration](./UPI_INTEGRATION_SUMMARY.md) - UPI payment setup
- [Project Structure](./STRUCTURE.md) - Detailed structure guide
- [Deployment](./DEPLOYMENT_INSTRUCTIONS.md) - Deployment guide

---

## 🐛 Troubleshooting

### Common Issues

#### API Connection Errors

**Problem**: Cannot connect to backend API

**Solutions**:
1. Ensure backend server is running
2. Check `VITE_API_URL` in `.env` file
3. Verify CORS is configured on backend
4. Check browser console for errors

#### Authentication Issues

**Problem**: Login not working

**Solutions**:
1. Check backend authentication routes are deployed
2. Verify JWT_SECRET is set in backend
3. Clear localStorage and try again
4. Check browser console for errors

#### Build Errors

**Problem**: `npm run build` fails

**Solutions**:
1. Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
2. Check for syntax errors in code
3. Verify all dependencies are installed
4. Check Node.js version (should be v16+)

#### PWA Not Working

**Problem**: App doesn't install as PWA

**Solutions**:
1. Ensure HTTPS in production
2. Check `manifest.json` is valid
3. Verify service worker is registered
3. Check browser console for service worker errors

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Vue.js team for the amazing framework
- All contributors who have helped improve this project
- Open source community for inspiration and tools

---

## 📞 Support

For support, please:
- Open an issue on GitHub
- Check existing documentation
- Review troubleshooting section

---

## 🗺 Roadmap

Future enhancements planned:

- [ ] TypeScript migration
- [ ] Unit and E2E testing
- [ ] Advanced analytics
- [ ] Social features (comments, sharing)
- [ ] Live streaming support
- [ ] Mobile apps (React Native)
- [ ] More payment gateways
- [ ] Advanced recommendation engine
- [ ] Content moderation tools
- [ ] Multi-tenant support

---

<div align="center">

**Made with ❤️ by the Cineflix Team**

⭐ Star this repo if you find it helpful!

</div>
