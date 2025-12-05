import { ref, computed } from 'vue';

/**
 * Composable for scene-level navigation and markers
 */
export function useScenes() {
  const scenes = ref([]);
  const currentScene = ref(null);

  // Generate scene markers from video (simplified - would use ML/AI in production)
  const generateScenes = (video, options = {}) => {
    if (!video || !video.duration) return [];

    const {
      autoDetect = true,
      sceneCount = null, // Auto-calculate if null
      semanticLabels = true,
    } = options;

    const duration = video.duration; // in seconds
    const sceneDuration = sceneCount 
      ? duration / sceneCount 
      : Math.max(60, Math.min(300, duration / 10)); // 60s to 300s per scene

    const generatedScenes = [];
    let currentTime = 0;
    let sceneIndex = 0;

    while (currentTime < duration) {
      const sceneEnd = Math.min(currentTime + sceneDuration, duration);
      
      // Generate semantic label based on position and metadata
      const label = semanticLabels 
        ? generateSemanticLabel(video, currentTime, duration, sceneIndex)
        : `Scene ${sceneIndex + 1}`;

      generatedScenes.push({
        id: `scene_${sceneIndex}`,
        startTime: currentTime,
        endTime: sceneEnd,
        duration: sceneEnd - currentTime,
        label,
        thumbnail: generateSceneThumbnail(video, currentTime),
        participants: extractParticipants(video, currentTime),
        vibe: extractVibe(video, currentTime),
        position: sceneIndex,
      });

      currentTime = sceneEnd;
      sceneIndex++;
    }

    scenes.value = generatedScenes;
    return generatedScenes;
  };

  // Generate semantic label
  const generateSemanticLabel = (video, time, totalDuration, index) => {
    const progress = time / totalDuration;
    const categories = video.categories || [];
    const title = video.title || '';

    // Opening scene
    if (progress < 0.1) {
      return categories.length > 0 ? `Opening: ${categories[0]}` : 'Opening Scene';
    }
    
    // Middle scenes
    if (progress >= 0.1 && progress < 0.9) {
      if (categories.length > 0) {
        const categoryIndex = Math.floor((progress - 0.1) / 0.8 * categories.length);
        return categories[categoryIndex] || `Scene ${index + 1}`;
      }
      return `Scene ${index + 1}`;
    }
    
    // Closing scene
    return categories.length > 0 ? `Finale: ${categories[categories.length - 1]}` : 'Final Scene';
  };

  // Generate scene thumbnail (simplified)
  const generateSceneThumbnail = (video, time) => {
    // In production, would extract frame at time
    // For now, return video thumbnail with time parameter
    if (video.thumbnail) {
      return `${video.thumbnail}?t=${Math.floor(time)}`;
    }
    return null;
  };

  // Extract participants from video metadata
  const extractParticipants = (video, time) => {
    // Would use ML/AI in production
    // For now, return stars if available
    return video.stars || [];
  };

  // Extract vibe/emotion from scene
  const extractVibe = (video, time) => {
    const categories = video.categories || [];
    const progress = time / (video.duration || 1);

    // Map categories to vibes
    const vibeMap = {
      'romantic': 'intimate',
      'action': 'energetic',
      'hardcore': 'intense',
      'soft': 'gentle',
      'outdoor': 'adventurous',
    };

    for (const cat of categories) {
      const lowerCat = cat.toLowerCase();
      for (const [key, vibe] of Object.entries(vibeMap)) {
        if (lowerCat.includes(key)) {
          return vibe;
        }
      }
    }

    // Default based on position
    if (progress < 0.3) return 'building';
    if (progress < 0.7) return 'peak';
    return 'climax';
  };

  // Search scenes by label, participants, or vibe
  const searchScenes = (query) => {
    if (!query || !scenes.value.length) return [];

    const lowerQuery = query.toLowerCase();
    return scenes.value.filter(scene => {
      return (
        scene.label.toLowerCase().includes(lowerQuery) ||
        scene.participants.some(p => p.toLowerCase().includes(lowerQuery)) ||
        scene.vibe.toLowerCase().includes(lowerQuery)
      );
    });
  };

  // Get scene at specific time
  const getSceneAtTime = (time) => {
    return scenes.value.find(scene => 
      time >= scene.startTime && time < scene.endTime
    );
  };

  // Jump to scene
  const jumpToScene = (sceneId, videoPlayer) => {
    const scene = scenes.value.find(s => s.id === sceneId);
    if (!scene || !videoPlayer) return false;

    videoPlayer.currentTime = scene.startTime;
    currentScene.value = scene;
    return true;
  };

  return {
    scenes,
    currentScene,
    generateScenes,
    searchScenes,
    getSceneAtTime,
    jumpToScene,
  };
}

