# Project Structure

This project follows a standard Vue.js 3 folder structure for maintainability and scalability.

## 📁 Folder Structure

```
src/
├── api/              # Network requests only
│   ├── movies.js     # Movie API endpoints
│   └── videos.js     # Video API endpoints
│
├── components/       # Small, reusable UI components
│   ├── Card.vue      # Reusable card component
│   ├── Loader.vue    # Loading spinner component
│   └── AddMovieModal.vue  # Add movie modal
│
├── pages/            # Route pages (one file = one route)
│   ├── Home.vue      # Home page
│   └── Videos.vue    # Videos page
│
├── store/            # State management (Pinia/Vuex)
│   └── (future stores)
│
├── composables/      # Reusable composition functions
│   ├── useFetch.js   # Generic fetch composable
│   ├── useMovies.js  # Movies logic composable
│   ├── useVideos.js  # Videos logic composable
│   └── usePagination.js  # Pagination logic
│
├── services/         # Business logic layer
│   └── movieService.js  # Movie business logic
│
├── plugins/          # Configuration plugins
│   └── axios.js      # Axios configuration
│
├── directives/       # Custom Vue directives
│   └── (future directives)
│
├── utils/            # Pure helper functions
│   ├── date.js       # Date formatting utilities
│   └── video.js      # Video utilities
│
├── layouts/          # App layout skeletons
│   └── PublicLayout.vue  # Public layout with navbar/footer
│
├── router/           # Vue Router configuration
│   └── index.js
│
├── App.vue           # Root component
├── main.js           # App entry point
└── style.css         # Global styles
```

## 🎯 Key Principles

### 1. **api/** - Network Requests Only
- Handles all HTTP requests
- No UI logic
- Returns raw API responses

### 2. **components/** - Reusable UI Components
- Small, focused components
- Can be used across multiple pages
- Examples: Card, Loader, Modal

### 3. **pages/** - Route Pages
- One file = one route
- Uses composables and components
- No direct API calls (goes through api/ folder)

### 4. **composables/** - Reusable Logic
- Vue 3 Composition API functions
- Shareable across components
- Examples: useFetch, useMovies, usePagination

### 5. **services/** - Business Logic
- Validates data
- Transforms API responses
- Handles complex business rules

### 6. **plugins/** - Configuration
- Sets up third-party libraries
- Configures Axios, Toast, i18n, etc.

### 7. **utils/** - Pure Functions
- Generic helper functions
- No side effects
- Easy to test

### 8. **layouts/** - App Skeletons
- Wraps pages with common structure
- Examples: PublicLayout, AuthLayout, AdminLayout

## 📝 Usage Examples

### Using a Composable
```vue
<script setup>
import { useMovies } from '../composables/useMovies';

const { movies, loading, loadMovies } = useMovies();
</script>
```

### Using an API
```javascript
import { moviesApi } from '../api/movies';

const response = await moviesApi.getAll();
```

### Using a Service
```javascript
import { movieService } from '../services/movieService';

await movieService.createMovie(title, iframeCode);
```

### Using a Component
```vue
<template>
  <Loader message="Loading..." />
  <Card>
    <h3>Content</h3>
  </Card>
</template>
```

## 🔄 Data Flow

1. **Page** calls **Composable**
2. **Composable** calls **API**
3. **API** uses **Plugin** (axios)
4. **Service** validates/transforms data
5. **Component** displays the data

This ensures clean separation of concerns and makes the codebase maintainable and testable.

