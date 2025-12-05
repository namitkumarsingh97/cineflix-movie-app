import { ref, computed } from 'vue';
import { useWatchHistory } from './useWatchHistory';

const PLAYLISTS_KEY = 'cineflix_playlists';
const MOOD_MIXES_KEY = 'cineflix_mood_mixes';

// Mood categories
const MOODS = {
  energetic: { keywords: ['action', 'intense', 'fast', 'thrilling'], tempo: 'fast', length: 'short' },
  relaxed: { keywords: ['slow', 'romantic', 'sensual', 'soft'], tempo: 'slow', length: 'medium' },
  adventurous: { keywords: ['outdoor', 'public', 'adventure', 'wild'], tempo: 'medium', length: 'medium' },
  intimate: { keywords: ['couple', 'romantic', 'private', 'close'], tempo: 'slow', length: 'long' },
  quick: { keywords: ['short', 'quick', 'fast', 'brief'], tempo: 'fast', length: 'short' },
  marathon: { keywords: ['long', 'extended', 'full', 'complete'], tempo: 'medium', length: 'long' },
};

// Load playlists from storage
const loadPlaylists = () => {
  try {
    const stored = localStorage.getItem(PLAYLISTS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (err) {
    console.warn('Failed to load playlists:', err);
    return [];
  }
};

// Save playlists to storage
const savePlaylists = (playlists) => {
  try {
    localStorage.setItem(PLAYLISTS_KEY, JSON.stringify(playlists));
  } catch (err) {
    console.warn('Failed to save playlists:', err);
  }
};

// Generate shareable link
const generateShareableLink = (playlistId) => {
  const baseUrl = window.location.origin;
  return `${baseUrl}/playlist/${playlistId}`;
};

export function usePlaylists() {
  const playlists = ref(loadPlaylists());
  const moodMixes = ref([]);

  // Create a new playlist
  const createPlaylist = (name, description = '', isPublic = false) => {
    const newPlaylist = {
      id: `playlist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      description,
      isPublic,
      items: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'local', // Would be user ID in production
      shareableLink: null,
    };
    
    playlists.value.push(newPlaylist);
    savePlaylists(playlists.value);
    return newPlaylist;
  };

  // Add item to playlist
  const addToPlaylist = (playlistId, item) => {
    const playlist = playlists.value.find(p => p.id === playlistId);
    if (!playlist) return false;
    
    // Check if already exists
    const exists = playlist.items.some(i => 
      (i.id || i._id) === (item.id || item._id)
    );
    if (exists) return false;
    
    playlist.items.push({
      ...item,
      addedAt: new Date().toISOString(),
    });
    playlist.updatedAt = new Date().toISOString();
    savePlaylists(playlists.value);
    return true;
  };

  // Remove item from playlist
  const removeFromPlaylist = (playlistId, itemId) => {
    const playlist = playlists.value.find(p => p.id === playlistId);
    if (!playlist) return false;
    
    playlist.items = playlist.items.filter(i => 
      (i.id || i._id) !== itemId
    );
    playlist.updatedAt = new Date().toISOString();
    savePlaylists(playlists.value);
    return true;
  };

  // Delete playlist
  const deletePlaylist = (playlistId) => {
    playlists.value = playlists.value.filter(p => p.id !== playlistId);
    savePlaylists(playlists.value);
  };

  // Make playlist shareable
  const makeShareable = (playlistId) => {
    const playlist = playlists.value.find(p => p.id === playlistId);
    if (!playlist) return null;
    
    playlist.isPublic = true;
    playlist.shareableLink = generateShareableLink(playlistId);
    playlist.updatedAt = new Date().toISOString();
    savePlaylists(playlists.value);
    return playlist.shareableLink;
  };

  // Get playlist by ID
  const getPlaylist = (playlistId) => {
    return playlists.value.find(p => p.id === playlistId);
  };

  // Auto-generate mood mix
  const generateMoodMix = (mood, allItems, limit = 20) => {
    if (!MOODS[mood] || !allItems || allItems.length === 0) return [];

    const moodConfig = MOODS[mood];
    const { keywords, tempo, length } = moodConfig;

    // Score items based on mood
    const scored = allItems.map(item => {
      let score = 0;

      // Keyword matching (40% weight)
      if (item.categories) {
        const categoryMatch = item.categories.some(cat =>
          keywords.some(keyword => cat.toLowerCase().includes(keyword.toLowerCase()))
        );
        if (categoryMatch) score += 0.4;
      }
      if (item.title) {
        const titleMatch = keywords.some(keyword =>
          item.title.toLowerCase().includes(keyword.toLowerCase())
        );
        if (titleMatch) score += 0.2;
      }

      // Duration matching (30% weight)
      if (item.duration) {
        const duration = item.duration; // in seconds
        if (length === 'short' && duration < 1800) score += 0.3; // < 30 min
        else if (length === 'medium' && duration >= 1800 && duration < 3600) score += 0.3; // 30-60 min
        else if (length === 'long' && duration >= 3600) score += 0.3; // > 60 min
      }

      // Tempo matching (30% weight) - simplified based on category keywords
      if (item.categories) {
        const tempoKeywords = {
          fast: ['action', 'intense', 'hardcore', 'rough'],
          slow: ['romantic', 'sensual', 'soft', 'gentle'],
          medium: ['adventure', 'outdoor', 'public'],
        };
        const tempoMatch = tempoKeywords[tempo]?.some(keyword =>
          item.categories.some(cat => cat.toLowerCase().includes(keyword))
        );
        if (tempoMatch) score += 0.3;
      }

      return {
        ...item,
        _moodScore: score,
      };
    })
      .filter(item => item._moodScore > 0.2) // Filter low scores
      .sort((a, b) => b._moodScore - a._moodScore)
      .slice(0, limit);

    return scored;
  };

  // Generate all mood mixes
  const generateAllMoodMixes = (allItems) => {
    const mixes = {};
    Object.keys(MOODS).forEach(mood => {
      mixes[mood] = generateMoodMix(mood, allItems, 20);
    });
    moodMixes.value = mixes;
    return mixes;
  };

  // Get mood mix
  const getMoodMix = (mood) => {
    return moodMixes.value[mood] || [];
  };

  // Collaborative playlist - add collaborator (simplified)
  const addCollaborator = (playlistId, collaboratorId) => {
    const playlist = playlists.value.find(p => p.id === playlistId);
    if (!playlist) return false;
    
    if (!playlist.collaborators) {
      playlist.collaborators = [];
    }
    
    if (!playlist.collaborators.includes(collaboratorId)) {
      playlist.collaborators.push(collaboratorId);
      playlist.updatedAt = new Date().toISOString();
      savePlaylists(playlists.value);
    }
    
    return true;
  };

  return {
    playlists,
    moodMixes,
    createPlaylist,
    addToPlaylist,
    removeFromPlaylist,
    deletePlaylist,
    makeShareable,
    getPlaylist,
    generateMoodMix,
    generateAllMoodMixes,
    getMoodMix,
    addCollaborator,
  };
}

