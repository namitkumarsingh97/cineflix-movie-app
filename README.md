# Vue Movie Application

A beautiful movie streaming web application built with Vue.js 3, connected to a Node.js/Express backend with MongoDB.

## Features

- 🎬 Dark-themed UI matching modern streaming services
- 📊 Iframe movie management with MongoDB backend
- 🎨 Beautiful movie cards displayed on homepage
- 🔍 Search functionality
- 📄 Pagination (40 movies per page)
- 🎯 Sorting options (Recent, Alphabetical)
- 💾 Data stored in MongoDB (accessible from any device)
- 🌐 Network accessible (works on any device on your network)

## Installation

1. Navigate to the vue-movie-app directory:
```bash
cd vue-movie-app
```

2. Install dependencies:
```bash
npm install
```

## Running the Application

1. **Start the backend server first** (in `E:\Projects\vue-movie-app-server`):
```bash
cd E:\Projects\vue-movie-app-server
npm install
npm start
```

2. **Start the Vue app**:
```bash
cd vue-movie-app
npm run dev
```

The app will open automatically in your browser at `http://localhost:3000`

## Configuration

### API URL

The app connects to the backend API. By default, it uses:
- Local: `http://localhost:5000/api`
- Network: Update in `src/App.vue` to use your server's IP address

To access from other devices:
1. Find your computer's IP address (e.g., `192.168.1.100`)
2. Update the API_URL in `src/App.vue`:
```javascript
const API_URL = 'http://192.168.1.100:5000/api'
```

## Usage

### Home Tab
- View all movies in a 4-column grid
- Search movies using the search bar
- Sort by Recent or Alphabetical
- Click delete button (🗑️) to remove movies
- Use pagination to navigate through pages

### Add Movie Tab
- Enter movie title
- Paste iframe code
- Click "Add Movie" to save to MongoDB

## Project Structure

```
vue-movie-app/
├── src/
│   ├── App.vue          # Main application component
│   ├── main.js          # Vue app entry point
│   └── style.css        # Global styles
├── index.html           # HTML template
├── vite.config.js       # Vite configuration
└── package.json         # Dependencies
```

## Building for Production

Build the app for production:
```bash
npm run build
```

The built files will be in the `dist` directory.

## Backend Server

The backend server is located at `E:\Projects\vue-movie-app-server`

See the server's README for backend setup instructions.

## License

MIT

