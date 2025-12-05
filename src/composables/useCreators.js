import { ref, computed } from 'vue';

const FOLLOWED_CREATORS_KEY = 'cineflix_followed_creators';
const CREATOR_ALERTS_KEY = 'cineflix_creator_alerts';

// Load followed creators
const loadFollowedCreators = () => {
  try {
    const stored = localStorage.getItem(FOLLOWED_CREATORS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (err) {
    console.warn('Failed to load followed creators:', err);
    return [];
  }
};

// Save followed creators
const saveFollowedCreators = (creators) => {
  try {
    localStorage.setItem(FOLLOWED_CREATORS_KEY, JSON.stringify(creators));
  } catch (err) {
    console.warn('Failed to save followed creators:', err);
  }
};

export function useCreators() {
  const followedCreators = ref(loadFollowedCreators());
  const creatorAlerts = ref([]);

  // Extract creator/studio from video
  const extractCreator = (video) => {
    return {
      id: video.channel || video.studio || video.creator || `creator_${video.id || video._id}`,
      name: video.channel || video.studio || video.creator || 'Unknown Creator',
      type: video.studio ? 'studio' : 'creator',
      thumbnail: video.creatorThumbnail || video.channelThumbnail || null,
      description: video.creatorDescription || video.channelDescription || '',
      followerCount: video.followers || 0,
      videoCount: video.videoCount || 0,
    };
  };

  // Follow a creator
  const followCreator = (creator) => {
    const creatorId = creator.id || creator;
    const exists = followedCreators.value.some(c => c.id === creatorId);
    
    if (!exists) {
      const creatorData = typeof creator === 'string' 
        ? { id: creatorId, name: creatorId, followedAt: new Date().toISOString() }
        : { ...creator, followedAt: new Date().toISOString() };
      
      followedCreators.value.push(creatorData);
      saveFollowedCreators(followedCreators.value);
    }
  };

  // Unfollow a creator
  const unfollowCreator = (creatorId) => {
    followedCreators.value = followedCreators.value.filter(c => c.id !== creatorId);
    saveFollowedCreators(followedCreators.value);
  };

  // Check if creator is followed
  const isCreatorFollowed = (creatorId) => {
    return followedCreators.value.some(c => c.id === creatorId);
  };

  // Get creator hub data
  const getCreatorHub = (creatorId, allVideos) => {
    const creator = followedCreators.value.find(c => c.id === creatorId);
    if (!creator) return null;

    // Get all videos from this creator
    const creatorVideos = allVideos.filter(video => {
      const videoCreator = extractCreator(video);
      return videoCreator.id === creatorId;
    });

    // Get recent releases (last 30 days)
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    const recentReleases = creatorVideos.filter(video => {
      const videoDate = video.createdAt || video.uploadedAt || video.added;
      if (!videoDate) return false;
      return new Date(videoDate).getTime() > thirtyDaysAgo;
    }).sort((a, b) => {
      const dateA = new Date(a.createdAt || a.uploadedAt || a.added);
      const dateB = new Date(b.createdAt || b.uploadedAt || b.added);
      return dateB - dateA;
    });

    return {
      ...creator,
      videos: creatorVideos,
      recentReleases,
      totalVideos: creatorVideos.length,
      latestRelease: recentReleases[0] || null,
    };
  };

  // Get mini-feed for followed creators
  const getMiniFeed = (allVideos, limit = 20) => {
    const followedIds = followedCreators.value.map(c => c.id);
    
    // Get videos from followed creators
    const feedVideos = allVideos
      .filter(video => {
        const creator = extractCreator(video);
        return followedIds.includes(creator.id);
      })
      .sort((a, b) => {
        const dateA = new Date(a.createdAt || a.uploadedAt || a.added || 0);
        const dateB = new Date(b.createdAt || b.uploadedAt || b.added || 0);
        return dateB - dateA;
      })
      .slice(0, limit);

    return feedVideos;
  };

  // Check for new releases from followed creators
  const checkNewReleases = (allVideos) => {
    const followedIds = followedCreators.value.map(c => c.id);
    const lastCheck = localStorage.getItem('cineflix_last_release_check') || '0';
    const lastCheckTime = parseInt(lastCheck);

    const newReleases = allVideos.filter(video => {
      const creator = extractCreator(video);
      if (!followedIds.includes(creator.id)) return false;

      const videoDate = video.createdAt || video.uploadedAt || video.added;
      if (!videoDate) return false;

      const videoTime = new Date(videoDate).getTime();
      return videoTime > lastCheckTime;
    });

    // Update last check time
    localStorage.setItem('cineflix_last_release_check', String(Date.now()));

    return newReleases;
  };

  // Get all creators from videos
  const getAllCreators = (allVideos) => {
    const creatorsMap = new Map();

    allVideos.forEach(video => {
      const creator = extractCreator(video);
      if (!creatorsMap.has(creator.id)) {
        creatorsMap.set(creator.id, {
          ...creator,
          videos: [],
        });
      }
      creatorsMap.get(creator.id).videos.push(video);
    });

    // Convert to array and add counts
    return Array.from(creatorsMap.values()).map(creator => ({
      ...creator,
      videoCount: creator.videos.length,
      latestVideo: creator.videos.sort((a, b) => {
        const dateA = new Date(a.createdAt || a.uploadedAt || a.added || 0);
        const dateB = new Date(b.createdAt || b.uploadedAt || b.added || 0);
        return dateB - dateA;
      })[0],
    })).sort((a, b) => b.videoCount - a.videoCount);
  };

  return {
    followedCreators,
    creatorAlerts,
    followCreator,
    unfollowCreator,
    isCreatorFollowed,
    getCreatorHub,
    getMiniFeed,
    checkNewReleases,
    getAllCreators,
    extractCreator,
  };
}

