<template>
  <div class="watch-page">
    <div class="watch-container">
      <!-- Main Video Player Section -->
      <div class="watch-main">
        <!-- Video Player -->
        <div class="video-player-section">
          <div class="video-player-wrapper">
            <!-- Iframe for movies and Eporner videos -->
            <div v-if="video && (video.iframe || ((isEporner || video._source === 'eporner') && (video.embedUrl || video.url)))" class="watch-iframe-container">
              <div v-if="video.iframe" v-html="video.iframe" class="watch-iframe-player"></div>
              <iframe
                v-else-if="(isEporner || video._source === 'eporner') && (video.embedUrl || video.url)"
                :src="video.embedUrl || video.url"
                frameborder="0"
                allowfullscreen
                allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
                class="watch-iframe-player"
                loading="lazy"
              ></iframe>
            </div>
            <!-- Video tag for S3 videos -->
            <video
              v-else-if="video && video.url && !isEporner"
              ref="videoPlayer"
              :src="isHlsSource ? '' : video.url"
              controls
              :autoplay="shouldAutoplay"
              :preload="shouldAutoplay ? 'auto' : 'metadata'"
              playsinline
              class="watch-video-player"
              @loadedmetadata="handleVideoLoaded"
              @timeupdate="handleTimeUpdate"
              @play="handlePlay"
              @pause="handlePause"
            >
              Your browser does not support the video tag.
            </video>
            
            <!-- Loading State -->
            <Loader v-if="loading" message="Loading video..." />
            
            <!-- Playback Speed Control -->
            <div v-else-if="video && video.url && videoPlayer" class="playback-controls">
              <div class="speed-control">
                <label>Speed:</label>
                <select v-model="playbackSpeed" @change="changePlaybackSpeed" class="speed-select">
                  <option value="0.5">0.5x</option>
                  <option value="0.75">0.75x</option>
                  <option value="1">1x</option>
                  <option value="1.25">1.25x</option>
                  <option value="1.5">1.5x</option>
                  <option value="1.75">1.75x</option>
                  <option value="2">2x</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Video Info -->
          <div class="video-info-section" v-if="video">
            <h1 class="video-title-main">{{ video.title }}</h1>
            
            <div class="video-actions-bar">
              <div class="video-stats">
                <span class="view-count-main">{{ formatViews(video.views || 0) }} {{ (video.views || 0) === 1 ? 'view' : 'views' }}</span>
                <span class="upload-date-main">{{ formatTimeAgo(video.uploadedAt || video.createdAt) }}</span>
              </div>
              <div class="action-buttons">
                <button class="action-btn like-btn" :class="{ active: isLiked }" @click="handleLike">
                  <ThumbsUp :size="20" />
                  <span>{{ formatViews(video.likes || 0) }}</span>
                </button>
                <button class="action-btn" :class="{ active: isDisliked }" @click="handleDislike">
                  <ThumbsDown :size="20" />
                  <span>{{ formatViews(video.dislikes || 0) }}</span>
                </button>
                <button class="action-btn" @click="handleShare">
                  <Share2 :size="20" />
                  <span>Share</span>
                </button>
                <button class="action-btn" @click="handleDownload">
                  <Download :size="20" />
                  <span>Download</span>
                </button>
                <button 
                  v-if="video.url" 
                  class="action-btn download-offline-btn" 
                  @click="downloadForOffline"
                  title="Download for Offline Viewing"
                >
                  <Download :size="20" />
                  <span>Download for Offline Viewing</span>
                </button>
                <button
                  class="action-btn"
                  :class="{ active: isWatchLater }"
                  @click="toggleWatchLater"
                >
                  <Clock :size="20" />
                  <span>{{ isWatchLater ? 'Saved' : 'Watch Later' }}</span>
                </button>
                <button
                  v-if="followTarget"
                  class="action-btn"
                  :class="{ active: isFollowingStar }"
                  @click="toggleFollowStar"
                  title="Follow star or creator"
                >
                  <Star :size="20" />
                  <span>{{ isFollowingStar ? 'Following' : 'Follow' }}</span>
                </button>
                <button 
                  class="action-btn" 
                  :class="{ active: isFavorite }"
                  @click="handleFavorite"
                  title="Add to favorites"
                >
                  <Heart :size="20" :fill="isFavorite ? 'currentColor' : 'none'" />
                </button>
                <button class="action-btn">
                  <MoreVertical :size="20" />
                </button>
              </div>
            </div>

            <div class="channel-info">
              <div class="channel-header">
                <div class="channel-avatar-large">
                  {{ getInitials(video.channel || 'MovieHub') }}
                </div>
                <div class="channel-details">
                  <h3 class="channel-name-main">{{ video.channel || 'MovieHub' }}</h3>
                  <p class="subscriber-count" v-if="!isMovie">{{ formatViews(video.subscribers || 0) }} subscribers</p>
                </div>
                <button class="subscribe-btn" v-if="!isMovie">Subscribe</button>
              </div>
              <div class="video-description" v-if="video.description">
                <p>{{ video.description }}</p>
              </div>
            </div>

            <!-- Related Content Section -->
            <div v-if="relatedContent.length > 0" class="related-section">
              <h2 class="related-title">Related Content</h2>
              <div class="related-grid">
                <MovieCard
                  v-for="item in relatedContent"
                  :key="item._id"
                  :movie="item"
                  @click="navigateToVideo(item)"
                />
              </div>
            </div>

            <!-- Comments Section -->
            <div class="comments-section">
              <h2 class="comments-title">{{ comments.length }} {{ comments.length === 1 ? 'Comment' : 'Comments' }}</h2>
              
              <!-- Comment Form -->
              <div class="comment-form">
                <div class="comment-input-wrapper">
                  <input
                    v-model="commentAuthor"
                    type="text"
                    placeholder="Your name (optional)"
                    class="comment-author-input"
                    maxlength="50"
                  />
                  <textarea
                    v-model="commentText"
                    placeholder="Add a comment..."
                    class="comment-text-input"
                    rows="3"
                    maxlength="1000"
                  ></textarea>
                </div>
                <div class="comment-form-actions">
                  <span class="char-count">{{ commentText.length }}/1000</span>
                  <button 
                    class="comment-submit-btn" 
                    @click="submitComment"
                    :disabled="!commentText.trim() || submittingComment"
                  >
                    {{ submittingComment ? 'Posting...' : 'Comment' }}
                  </button>
                </div>
              </div>

              <!-- Comments List -->
              <div class="comments-list">
                <div v-if="loadingComments" class="comments-loading">Loading...</div>
                <div v-else-if="comments.length === 0" class="no-comments">
                  <p>No comments yet. Be the first to comment!</p>
                </div>
                <div v-else class="comment-item" v-for="comment in comments" :key="comment._id || comment.createdAt">
                  <div class="comment-avatar">
                    {{ getInitials(comment.author || 'Anonymous') }}
                  </div>
                  <div class="comment-content">
                    <div class="comment-header">
                      <span class="comment-author">{{ comment.author || 'Anonymous' }}</span>
                      <span class="comment-date">{{ formatTimeAgo(comment.createdAt) }}</span>
                    </div>
                    <p class="comment-text">{{ comment.text }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Sidebar with Recommendations -->
      <div class="watch-sidebar">
        <div class="recommendations-header">
          <h3>Up next</h3>
        </div>
        <div class="recommendations-list">
          <template v-if="isEporner || (!isMovie && !isEporner)">
            <VideoCard
              v-for="recVideo in recommendations"
              :key="recVideo.id || recVideo._id"
              :video="recVideo"
              @click="navigateToVideo(recVideo)"
            />
          </template>
          <template v-else-if="isMovie">
            <MovieCard
              v-for="recMovie in recommendations"
              :key="recMovie._id"
              :movie="recMovie"
              @click="navigateToVideo(recMovie)"
            />
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch, nextTick, onBeforeUnmount } from 'vue';
import Hls from 'hls.js';
import { useRoute, useRouter } from 'vue-router';
import { videosApi } from '../api/videos';
import { moviesApi } from '../api/movies';
import { useEporner } from '../composables/useEporner';
import { useVideos } from '../composables/useVideos';
import { useMovies } from '../composables/useMovies';
import { useWatchHistory, useFavorites } from '../composables/useWatchHistory';
import { useDownloads } from '../composables/useDownloads';
import { useWatchLater } from '../composables/useWatchLater';
import { useStarFollows } from '../composables/useStarFollows';
import { useNetworkQuality } from '../composables/useNetworkQuality';
import VideoCard from '../components/VideoCard.vue';
import MovieCard from '../components/MovieCard.vue';
import Loader from '../components/Loader.vue';
import {
  ThumbsUp,
  ThumbsDown,
  Share2,
  Download,
  MoreVertical,
  Heart,
  Clock,
  Star,
} from 'lucide-vue-next';

const route = useRoute();
const router = useRouter();
const video = ref(null);
const loading = ref(true);
const { videos, loadVideos } = useVideos();
const { movies, loadMovies } = useMovies();
const { getVideoById, videos: epornerVideos, searchVideos } = useEporner();

const videoId = computed(() => route.params.id);
const isMovie = ref(false);
const isEporner = computed(() => route.query.source === 'eporner');
const isHlsSource = computed(() => {
  const url = video.value?.url || '';
  return /\.m3u8($|\?)/i.test(url) || url.includes('format=m3u8');
});
const isLiked = ref(false);
const isDisliked = ref(false);
const comments = ref([]);
const loadingComments = ref(false);
const commentText = ref('');
const commentAuthor = ref('');
const submittingComment = ref(false);
const videoPlayer = ref(null);
const playbackSpeed = ref(1);
const hlsInstance = ref(null);
const { addToHistory, updateProgress } = useWatchHistory();
const { isFavorited, toggleFavorite } = useFavorites();
const { downloadForOffline: downloadOffline } = useDownloads();
const { add: addWatchLater, remove: removeWatchLater, isSaved: isInWatchLater } = useWatchLater();
const { follow, unfollow, isFollowed } = useStarFollows();
const { shouldAutoplay, playerBitrate, videoQuality, shouldDeferRecommendations } = useNetworkQuality();

const isFavorite = computed(() => video.value ? isFavorited(video.value._id || video.value.id) : false);
const isWatchLater = computed(() => video.value ? isInWatchLater(video.value._id || video.value.id) : false);
const primaryStar = computed(() => {
  if (!video.value) return '';
  if (Array.isArray(video.value.stars) && video.value.stars.length) return video.value.stars[0];
  if (video.value.channel) return video.value.channel;
  return '';
});

const followTarget = computed(() => {
  if (primaryStar.value) return primaryStar.value;
  if (video.value?.title) return `${video.value.title} (creator)`;
  return '';
});

const isFollowingStar = computed(() => followTarget.value ? isFollowed(followTarget.value) : false);

function getHlsConfig() {
  const connection =
    navigator.connection ||
    navigator.mozConnection ||
    navigator.webkitConnection ||
    {};
  const saveData = Boolean(connection.saveData);
  const effectiveType = connection.effectiveType || '';
  const isSlow = effectiveType === 'slow-2g' || effectiveType === '2g' || effectiveType === '3g';
  const isMobile = /Mobi|Android/i.test(navigator.userAgent);
  const bitrate = playerBitrate.value;

  // Adjust buffer based on network quality
  const maxBufferLength = saveData || isSlow || isMobile ? 4 : 6;
  const liveSync = saveData || isSlow ? 2 : 3;
  
  // Set start level based on bitrate preference
  let startLevel = -1; // Auto-select
  if (bitrate === 'low') {
    startLevel = 0; // Start with lowest quality
  } else if (bitrate === 'medium') {
    startLevel = -1; // Let ABR decide
  }

  return {
    enableWorker: true,
    lowLatencyMode: true,
    backBufferLength: 30,
    maxBufferLength,
    maxMaxBufferLength: maxBufferLength + 4,
    maxBufferSize: bitrate === 'low' ? 15 * 1000 * 1000 : 30 * 1000 * 1000,
    startLevel,
    liveSyncDurationCount: liveSync,
    liveMaxLatencyDurationCount: liveSync + 2,
    fragLoadingTimeOut: isSlow ? 12000 : 8000,
    manifestLoadingTimeOut: isSlow ? 12000 : 8000,
    progressive: true,
    capLevelOnFPSDrop: true,
    nudgeMaxRetry: 3,
    abrEwmaDefaultEstimate: bitrate === 'low' ? 500000 : undefined, // Lower initial estimate for slow networks
  };
}

function destroyHls() {
  if (hlsInstance.value) {
    hlsInstance.value.destroy();
    hlsInstance.value = null;
  }
}

async function setupStreaming() {
  if (!videoPlayer.value || !video.value) return;

  destroyHls();

  if (!isHlsSource.value) {
    // Non-HLS: use native playback
    videoPlayer.value.src = video.value.url || '';
    return;
  }

  // HLS playback
  if (Hls.isSupported()) {
    hlsInstance.value = new Hls(getHlsConfig());
    hlsInstance.value.loadSource(video.value.url);
    hlsInstance.value.attachMedia(videoPlayer.value);
    hlsInstance.value.on(Hls.Events.ERROR, (_event, data) => {
      if (!hlsInstance.value) return;
      if (data.fatal) {
        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          hlsInstance.value.startLoad();
        } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          hlsInstance.value.recoverMediaError();
        } else {
          destroyHls();
        }
      }
    });
  } else if (videoPlayer.value.canPlayType('application/vnd.apple.mpegurl')) {
    // Safari
    videoPlayer.value.src = video.value.url;
    videoPlayer.value.load();
  } else {
    // Fallback
    videoPlayer.value.src = video.value.url || '';
  }
}

// Debug computed for iframe rendering
const shouldShowIframe = computed(() => {
  if (!video.value) return false;
  const hasIframe = !!video.value.iframe;
  const isEpornerVideo = isEporner.value || video.value._source === 'eporner';
  const hasEmbedUrl = !!(video.value.embedUrl || video.value.url);
  const result = hasIframe || (isEpornerVideo && hasEmbedUrl);
  
  console.log('Iframe rendering check:', {
    hasVideo: !!video.value,
    hasIframe,
    isEpornerVideo,
    hasEmbedUrl,
    embedUrl: video.value.embedUrl,
    url: video.value.url,
    _source: video.value._source,
    isEporner: isEporner.value,
    shouldShow: result
  });
  
  return result;
});

const recommendations = computed(() => {
  // Limit recommendations on slow networks
  const limit = shouldDeferRecommendations.value ? 5 : 10;
  
  if (isEporner.value) {
    // Show other Eporner videos as recommendations
    return epornerVideos.value.filter(v => v.id !== videoId.value).slice(0, limit);
  } else if (isMovie.value) {
    // Show other movies as recommendations
    return movies.value.filter(m => m._id !== videoId.value).slice(0, limit);
  } else {
    // Show other videos as recommendations
    return videos.value.filter(v => v.id !== videoId.value).slice(0, limit);
  }
});

// Related content (same category or similar)
const relatedContent = computed(() => {
  if (!video.value || !isMovie.value) return [];
  
  const currentCategory = video.value.category;
  const related = movies.value.filter(m => 
    m._id !== videoId.value && 
    m.category === currentCategory
  );
  
  // If not enough in same category, add random movies
  if (related.length < 6) {
    const random = movies.value
      .filter(m => m._id !== videoId.value && m.category !== currentCategory)
      .slice(0, 6 - related.length);
    return [...related, ...random].slice(0, 6);
  }
  
  return related.slice(0, 6);
});

// Watch for route changes
watch(() => route.params.id, () => {
  loadVideo();
  // Reset states
  isLiked.value = false;
  isDisliked.value = false;
  comments.value = [];
  commentText.value = '';
  commentAuthor.value = '';
});

// Helper function to check if ID looks like Eporner video ID (11 chars, alphanumeric)
function isEpornerVideoId(id) {
  if (!id) return false;
  // Eporner IDs are typically 11 characters, alphanumeric
  // MongoDB ObjectIds are 24 hex characters, so if it's 11 chars and not hex, it's likely Eporner
  return /^[a-zA-Z0-9]{11}$/.test(id) && !/^[0-9a-fA-F]{24}$/.test(id);
}

// Helper function to check if ID looks like MongoDB ObjectId (24 hex chars)
function isMongoObjectId(id) {
  if (!id) return false;
  return /^[0-9a-fA-F]{24}$/.test(id);
}

async function loadVideo() {
  if (!videoId.value) return;
  
  loading.value = true;
  destroyHls();
  try {
    // Determine video type based on ID format
    const isEpornerId = isEpornerVideoId(videoId.value);
    const isMongoId = isMongoObjectId(videoId.value);
    
    // Priority 1: If explicitly marked as Eporner OR ID matches Eporner format (and not MongoDB)
    // Try Eporner API first and skip backend entirely
    if (isEporner.value || (isEpornerId && !isMongoId)) {
      console.log('Loading Eporner video:', {
        videoId: videoId.value,
        isEporner: isEporner.value,
        isEpornerId,
        isMongoId
      });
      
      try {
        const epornerVideo = await getVideoById(videoId.value);
        console.log('Eporner API response:', epornerVideo);
        
        if (epornerVideo) {
          video.value = epornerVideo;
          isMovie.value = false;
          loading.value = false;
          
          console.log('Video set:', {
            id: video.value.id,
            title: video.value.title,
            embedUrl: video.value.embedUrl,
            url: video.value.url,
            hasEmbedUrl: !!video.value.embedUrl,
            hasUrl: !!video.value.url,
            _source: video.value._source,
            isEporner: isEporner.value
          });
          
          // Add to watch history
          addToHistory({
            id: video.value.id,
            title: video.value.title,
            thumbnail: video.value.thumbnail,
            type: 'eporner',
            category: video.value.categories?.[0] || ''
          });
          // Load related videos (defer on slow networks)
          if (!shouldDeferRecommendations.value && video.value.categories && video.value.categories.length > 0) {
            await searchVideos(video.value.categories[0], 1, { perPage: 10 });
          }
          return;
        } else {
          console.warn('Eporner video not found for ID:', videoId.value);
        }
      } catch (epornerError) {
        console.error('Error loading Eporner video:', epornerError);
      }
      // If Eporner fails, don't try backend - it's clearly an Eporner ID
      loading.value = false;
      return;
    }
    
    // Priority 2: Only try backend APIs if it looks like a MongoDB ObjectId
    // Skip backend entirely if it's an Eporner ID format
    if (isMongoId) {
      // Try to load as video from backend
      try {
        const videoResponse = await videosApi.getById(videoId.value);
        if (videoResponse.data && videoResponse.data.success) {
          video.value = videoResponse.data.data;
          isMovie.value = false;
          loading.value = false;
          // Add to watch history
          addToHistory({
            id: video.value.id,
            title: video.value.title,
            thumbnail: video.value.thumbnail,
            type: 'video',
            category: video.value.category
          });
          // Increment view for videos
          try {
            await videosApi.incrementView?.(videoId.value);
          } catch (e) {
            console.log('View increment not available for videos');
          }
          await nextTick();
          await setupStreaming();
          return;
        }
      } catch (videoError) {
        // Only log if it's not a 404/400 (expected for wrong video type)
        if (videoError.response && videoError.response.status !== 404 && videoError.response.status !== 400) {
          console.error('Error loading video from backend:', videoError);
        }
        // Continue to try as movie
      }
      
      // Try to load as movie from backend
      try {
        const movieResponse = await moviesApi.getById(videoId.value);
        if (movieResponse.data && (movieResponse.data.success || movieResponse.data._id)) {
          video.value = movieResponse.data.data || movieResponse.data;
          isMovie.value = true;
          loading.value = false;
          // Add to watch history
          addToHistory({
            id: video.value._id,
            title: video.value.title,
            thumbnail: video.value.thumbnail,
            type: 'movie',
            category: video.value.category
          });
          // Increment view for movies
          try {
            await moviesApi.incrementView(videoId.value);
            video.value.views = (video.value.views || 0) + 1;
          } catch (e) {
            console.error('Error incrementing view:', e);
          }
          // Load comments
          await loadComments();
          await nextTick();
          await setupStreaming();
          return;
        }
      } catch (movieError) {
        // Only log if it's not a 404/400 (expected for wrong video type)
        if (movieError.response && movieError.response.status !== 404 && movieError.response.status !== 400) {
          console.error('Error loading movie from backend:', movieError);
        }
      }
    }
    
    // Priority 3: Final fallback - try Eporner API if not already tried and not a MongoDB ID
    if (!isMongoId && !isEporner.value) {
      try {
        const epornerVideo = await getVideoById(videoId.value);
        if (epornerVideo) {
          video.value = epornerVideo;
          isMovie.value = false;
          loading.value = false;
          // Add to watch history
          addToHistory({
            id: video.value.id,
            title: video.value.title,
            thumbnail: video.value.thumbnail,
            type: 'eporner',
            category: video.value.categories?.[0] || ''
          });
          // Load related videos (defer on slow networks)
          if (!shouldDeferRecommendations.value && video.value.categories && video.value.categories.length > 0) {
            await searchVideos(video.value.categories[0], 1, { perPage: 10 });
          }
          return;
        }
      } catch (epornerError) {
        console.error('Error loading Eporner video (fallback):', epornerError);
      }
    }
    
    // If we get here, video was not found in any source
    console.warn('Video not found in any source:', videoId.value);
  } catch (error) {
    console.error('Unexpected error loading video:', error);
  } finally {
    loading.value = false;
  }
}

async function loadComments() {
  if (!isMovie.value || !videoId.value) return;
  
  loadingComments.value = true;
  try {
    const response = await moviesApi.getComments(videoId.value);
    if (response.data.success) {
      comments.value = response.data.data || [];
      // Sort by newest first
      comments.value.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
  } catch (error) {
    console.error('Error loading comments:', error);
  } finally {
    loadingComments.value = false;
  }
}

async function handleLike() {
  if (!isMovie.value || !videoId.value) return;
  
  try {
    const response = await moviesApi.like(videoId.value);
    if (response.data.success) {
      video.value.likes = response.data.data.likes;
      isLiked.value = true;
      isDisliked.value = false;
    }
  } catch (error) {
    console.error('Error liking movie:', error);
  }
}

async function handleDislike() {
  if (!isMovie.value || !videoId.value) return;
  
  try {
    const response = await moviesApi.dislike(videoId.value);
    if (response.data.success) {
      video.value.dislikes = response.data.data.dislikes;
      isDisliked.value = true;
      isLiked.value = false;
    }
  } catch (error) {
    console.error('Error disliking movie:', error);
  }
}

function handleShare() {
  const url = window.location.href;
  
  if (navigator.share) {
    navigator.share({
      title: video.value?.title || 'Check out this video',
      text: video.value?.title || 'Check out this video',
      url: url
    }).catch(err => {
      console.log('Error sharing:', err);
      copyToClipboard(url);
    });
  } else {
    copyToClipboard(url);
  }
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    alert('Link copied to clipboard!');
  }).catch(err => {
    console.error('Failed to copy:', err);
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    alert('Link copied to clipboard!');
  });
}

function handleDownload() {
  if (!video.value) return;
  
  if (video.value.url) {
    // For S3 videos, create download link
    const link = document.createElement('a');
    link.href = video.value.url;
    link.download = video.value.title || 'video';
    link.click();
  } else if (video.value.iframeSrc) {
    // For iframe videos, open in new tab
    window.open(video.value.iframeSrc, '_blank');
  } else {
    alert(t('download.downloadFailed'));
  }
}

async function downloadForOffline() {
  if (!video.value || !video.value.url) {
    alert(t('download.downloadFailed'));
    return;
  }

  try {
    await downloadOffline({
      id: video.value._id || video.value.id,
      title: video.value.title,
      url: video.value.url,
      thumbnail: video.value.thumbnail,
      type: isMovie.value ? 'movie' : 'video'
    });
    alert(t('download.downloadComplete'));
  } catch (error) {
    console.error('Download error:', error);
    alert(t('download.downloadFailed'));
  }
}

function toggleWatchLater() {
  if (!video.value) return;
  const id = video.value._id || video.value.id;
  if (!id) return;
  const type = isMovie.value ? 'movie' : (isEporner.value ? 'eporner' : 'video');
  if (isWatchLater.value) {
    removeWatchLater(id, type);
  } else {
    addWatchLater({
      id,
      title: video.value.title,
      thumbnail: video.value.thumbnail,
      type,
      category: video.value.category,
    });
  }
}

function toggleFollowStar() {
  const name = followTarget.value;
  if (!name) return;
  if (isFollowingStar.value) {
    unfollow(name);
  } else {
    follow(name);
  }
}

async function submitComment() {
  if (!commentText.value.trim() || !isMovie.value || !videoId.value || submittingComment.value) return;
  
  submittingComment.value = true;
  try {
    const response = await moviesApi.addComment(videoId.value, {
      text: commentText.value.trim(),
      author: commentAuthor.value.trim() || undefined
    });
    
    if (response.data.success) {
      // Add comment to list
      comments.value.unshift(response.data.data);
      // Clear form
      commentText.value = '';
      commentAuthor.value = '';
    }
  } catch (error) {
    console.error('Error submitting comment:', error);
    alert('Failed to post comment. Please try again.');
  } finally {
    submittingComment.value = false;
  }
}

function navigateToVideo(video) {
  const source = video._source === 'eporner' ? '?source=eporner' : '';
  router.push(`/watch/${video.id || video._id}${source}`);
}

function formatViews(views) {
  if (!views) return '0';
  if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
  if (views >= 1000) return `${(views / 1000).toFixed(1)}k`;
  return views.toString();
}

function formatTimeAgo(date) {
  if (!date) return '';
  const now = new Date();
  const uploadDate = new Date(date);
  const diffInSeconds = Math.floor((now - uploadDate) / 1000);
  
  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)} weeks ago`;
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`;
  return `${Math.floor(diffInSeconds / 31536000)} years ago`;
}

function getInitials(name) {
  if (!name) return '?';
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function handleVideoLoaded() {
  // Video metadata loaded
  if (videoPlayer.value) {
    videoPlayer.value.playbackRate = playbackSpeed.value;
  }
}

function changePlaybackSpeed() {
  if (videoPlayer.value) {
    videoPlayer.value.playbackRate = parseFloat(playbackSpeed.value);
  }
}

function handleTimeUpdate() {
  if (videoPlayer.value && video.value) {
    const currentTime = videoPlayer.value.currentTime;
    const duration = videoPlayer.value.duration;
    if (duration > 0) {
      const progress = Math.round((currentTime / duration) * 100);
      updateProgress(video.value._id || video.value.id, progress, duration);
    }
  }
}

function handlePlay() {
  // Video started playing
}

function handlePause() {
  // Video paused
}

function handleFavorite() {
  if (video.value) {
    toggleFavorite({
      id: video.value._id || video.value.id,
      title: video.value.title,
      thumbnail: video.value.thumbnail,
      type: isMovie.value ? 'movie' : 'video',
      category: video.value.category
    });
  }
}

function processIframe() {
  // Process iframe after it's inserted via v-html
  if (video.value && video.value.iframe) {
    nextTick(() => {
      const iframe = document.querySelector('.watch-iframe-player iframe');
      if (iframe) {
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.style.maxWidth = '100%';
        iframe.style.maxHeight = '100%';
        iframe.style.border = 'none';
        iframe.style.display = 'block';
      }
    });
  }
}

// Watch for video changes to process iframe
watch(() => video.value, () => {
  processIframe();
}, { deep: true });

onMounted(async () => {
  await Promise.all([loadVideos(), loadMovies()]);
  await loadVideo();
  processIframe();
  
  // Load recommendations after initial load if deferred
  if (shouldDeferRecommendations.value && video.value) {
    setTimeout(async () => {
      if (video.value?.categories && video.value.categories.length > 0) {
        await searchVideos(video.value.categories[0], 1, { perPage: 5 });
      }
    }, 2000); // Delay 2 seconds on slow networks
  }
});

onBeforeUnmount(() => {
  destroyHls();
});
</script>

<style scoped>
.watch-page {
  background: var(--dark);
  min-height: 100vh;
  padding: 24px 24px 24px 0;
  margin-top: -64px; /* Offset navbar height */
  padding-top: 88px; /* Navbar height + padding */
}

.watch-container {
  max-width: 1600px;
  margin: 0 auto;
  display: flex;
  gap: 24px;
}

.watch-main {
  flex: 1;
  min-width: 0;
}

.video-player-section {
  width: 100%;
}

.video-player-wrapper {
  position: relative;
  width: 100%;
  padding-top: 56.25%; /* 16:9 aspect ratio */
  background: #000;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 16px;
  max-height: calc(100vh - 200px);
  min-height: 400px;
}

@media (max-width: 1200px) {
  .watch-page {
    padding: 20px 20px 20px 0;
  }

  .watch-container {
    gap: 20px;
  }

  .video-player-wrapper {
    min-height: 350px;
    max-height: calc(100vh - 180px);
  }

  .watch-sidebar {
    width: 300px;
  }
}

@media (max-width: 900px) {
  .watch-page {
    padding: 16px 16px 16px 0;
  }

  .watch-sidebar {
    width: 280px;
  }

  .recommendations-list {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  }
}

@media (max-width: 768px) {
  .video-player-wrapper {
    min-height: 250px;
    max-height: calc(100vh - 150px);
    border-radius: 8px;
    margin-bottom: 12px;
  }
}

@media (max-width: 480px) {
  .video-player-wrapper {
    min-height: 200px;
    max-height: calc(100vh - 120px);
    border-radius: 6px;
    margin-bottom: 10px;
  }
}

.watch-video-player {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: none;
  object-fit: contain;
}

.watch-iframe-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.watch-iframe-player {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
}

.watch-iframe-player iframe,
.watch-iframe-player > iframe {
  width: 100% !important;
  height: 100% !important;
  max-width: 100% !important;
  max-height: 100% !important;
  border: none !important;
  display: block !important;
  position: absolute !important;
  top: 0 !important;
  left: 0 !important;
  object-fit: contain;
  box-sizing: border-box;
}

.video-info-section {
  padding: 0 8px;
}

.video-title-main {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 12px 0;
  line-height: 1.4;
  word-break: break-word;
}

.video-actions-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 12px;
}

.video-stats {
  display: flex;
  gap: 12px;
  color: var(--text-secondary);
  font-size: 14px;
  flex-wrap: wrap;
}

.action-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: var(--dark-lighter);
  border: none;
  border-radius: 18px;
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  -webkit-tap-highlight-color: transparent;
}

.action-btn:hover {
  background: var(--dark-lighter);
  opacity: 0.8;
}

.action-btn:active {
  transform: scale(0.95);
}

.action-btn svg {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.channel-info {
  padding: 16px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 16px;
}

.channel-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.channel-avatar-large {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--gradient-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 600;
  color: white;
  flex-shrink: 0;
}

.channel-details {
  flex: 1;
  min-width: 0;
}

.channel-name-main {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 4px 0;
}

.subscriber-count {
  font-size: 13px;
  color: var(--text-secondary);
  margin: 0;
}

.subscribe-btn {
  padding: 10px 24px;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 18px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.subscribe-btn:hover {
  background: var(--primary-dark);
}

.video-description {
  padding: 12px;
  background: var(--dark-lighter);
  border-radius: 12px;
  color: var(--text-primary);
  font-size: 14px;
  line-height: 1.6;
  white-space: pre-wrap;
}

.watch-sidebar {
  width: 402px;
  flex-shrink: 0;
}

.recommendations-header {
  margin-bottom: 16px;
}

.recommendations-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.recommendations-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* Responsive breakpoints */
@media (max-width: 1400px) {
  .watch-sidebar {
    width: 360px;
  }
}

@media (max-width: 1200px) {
  .watch-sidebar {
    width: 320px;
  }
}

@media (max-width: 1024px) {
  .watch-container {
    flex-direction: column;
  }
  
  .watch-sidebar {
    width: 100%;
  }
  
  .recommendations-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 16px;
  }
}

/* Comments Section */
.comments-section {
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.comments-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 20px 0;
}

.comment-form {
  margin-bottom: 32px;
  padding: 16px;
  background: var(--dark-lighter);
  border-radius: 12px;
}

.comment-input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 12px;
}

.comment-author-input {
  padding: 10px 14px;
  background: var(--dark);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 14px;
  font-family: inherit;
}

.comment-author-input:focus {
  outline: none;
  border-color: var(--primary);
}

.comment-text-input {
  padding: 12px 14px;
  background: var(--dark);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  min-height: 80px;
  width: 100%;
}

.comment-text-input:focus {
  outline: none;
  border-color: var(--primary);
}

.comment-text-input::placeholder {
  color: var(--text-secondary);
}

.comment-form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.char-count {
  font-size: 12px;
  color: var(--text-secondary);
}

.comment-submit-btn {
  padding: 10px 24px;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 18px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.comment-submit-btn:hover:not(:disabled) {
  background: var(--primary-dark);
  transform: translateY(-1px);
}

.comment-submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.comments-loading,
.no-comments {
  text-align: center;
  padding: 40px 20px;
  color: var(--text-secondary);
  font-size: 14px;
}

.comment-item {
  display: flex;
  gap: 12px;
  padding: 16px;
  background: var(--dark-lighter);
  border-radius: 12px;
}

.comment-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--gradient-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  color: white;
  flex-shrink: 0;
}

.comment-content {
  flex: 1;
  min-width: 0;
}

.comment-header {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 6px;
}

.comment-author {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.comment-date {
  font-size: 12px;
  color: var(--text-secondary);
}

.comment-text {
  font-size: 14px;
  color: var(--text-primary);
  line-height: 1.5;
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.action-btn.active {
  background: var(--primary);
  color: white;
}

.action-btn.active:hover {
  background: var(--primary-dark);
}

.download-offline-btn {
  background: var(--gradient-primary);
  color: white;
}

.download-offline-btn:hover {
  background: var(--primary-dark);
}

/* Playback Speed Control */
.playback-controls {
  margin-top: 16px;
  padding: 12px;
  background: var(--dark-lighter);
  border-radius: 8px;
}

.speed-control {
  display: flex;
  align-items: center;
  gap: 12px;
}

.speed-control label {
  font-size: 14px;
  color: var(--text-secondary);
  font-weight: 500;
}

.speed-select {
  padding: 6px 12px;
  background: var(--dark);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: var(--text-primary);
  font-size: 14px;
  cursor: pointer;
}

.speed-select:focus {
  outline: none;
  border-color: var(--primary);
}

/* Related Content Section */
.related-section {
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.related-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 20px 0;
}

.related-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

@media (max-width: 768px) {
  .related-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 12px;
  }
}

@media (max-width: 768px) {
  .watch-page {
    padding: 16px 12px;
    margin-top: 0;
    padding-top: 72px;
  }

  .watch-container {
    gap: 20px;
  }

  .video-info-section {
    padding: 0 4px;
  }
  
  .video-title-main {
    font-size: 18px;
    margin-bottom: 10px;
  }
  
  .video-actions-bar {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    padding: 10px 0;
  }

  .video-stats {
    font-size: 13px;
    gap: 8px;
  }
  
  .action-buttons {
    width: 100%;
    gap: 6px;
  }
  
  .action-btn {
    flex: 1;
    justify-content: center;
    padding: 8px 12px;
    font-size: 13px;
    min-width: 0;
  }

  .action-btn span {
    font-size: 12px;
  }

  .action-btn svg {
    width: 18px;
    height: 18px;
  }

  .download-offline-btn span {
    display: none;
  }

  .channel-header {
    flex-wrap: wrap;
    gap: 12px;
  }

  .channel-avatar-large {
    width: 40px;
    height: 40px;
    font-size: 16px;
  }

  .channel-name-main {
    font-size: 15px;
  }

  .subscribe-btn {
    padding: 8px 20px;
    font-size: 13px;
    width: 100%;
  }

  .video-description {
    padding: 10px;
    font-size: 13px;
  }

  .playback-controls {
    padding: 10px;
    margin-top: 12px;
  }

  .speed-control {
    gap: 8px;
  }

  .speed-control label {
    font-size: 13px;
  }

  .speed-select {
    padding: 6px 10px;
    font-size: 13px;
  }

  .related-section {
    margin-top: 24px;
    padding-top: 20px;
  }

  .related-title {
    font-size: 18px;
    margin-bottom: 16px;
  }

  .related-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 12px;
  }

  .comments-section {
    margin-top: 24px;
    padding-top: 20px;
  }

  .comments-title {
    font-size: 16px;
    margin-bottom: 16px;
  }

  .comment-form {
    padding: 12px;
    margin-bottom: 24px;
  }

  .comment-input-wrapper {
    gap: 10px;
    margin-bottom: 10px;
  }

  .comment-author-input,
  .comment-text-input {
    padding: 10px 12px;
    font-size: 13px;
  }

  .comment-text-input {
    min-height: 70px;
  }

  .comment-form-actions {
    flex-wrap: wrap;
    gap: 8px;
  }

  .char-count {
    font-size: 11px;
  }

  .comment-submit-btn {
    padding: 8px 20px;
    font-size: 13px;
  }

  .comments-list {
    gap: 16px;
  }

  .comment-item {
    padding: 12px;
    gap: 10px;
  }

  .comment-avatar {
    width: 36px;
    height: 36px;
    font-size: 13px;
  }

  .comment-author {
    font-size: 13px;
  }

  .comment-date {
    font-size: 11px;
  }

  .comment-text {
    font-size: 13px;
  }

  .recommendations-header h3 {
    font-size: 15px;
  }

  .recommendations-list {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 12px;
  }
}

@media (max-width: 480px) {
  .watch-page {
    padding: 12px 8px;
    padding-top: 64px;
  }

  .watch-container {
    gap: 16px;
  }

  .video-player-wrapper {
    border-radius: 6px;
    margin-bottom: 10px;
    min-height: 200px;
  }

  .video-title-main {
    font-size: 16px;
    margin-bottom: 8px;
  }

  .video-actions-bar {
    gap: 10px;
    padding: 8px 0;
  }

  .video-stats {
    font-size: 12px;
    gap: 6px;
    width: 100%;
  }

  .action-buttons {
    gap: 4px;
    width: 100%;
  }

  .action-btn {
    padding: 6px 10px;
    font-size: 12px;
    border-radius: 16px;
    flex: 1 1 calc(50% - 2px);
    min-width: calc(50% - 2px);
  }

  .action-btn span {
    font-size: 11px;
    display: none;
  }

  .action-btn:has(svg:only-child) {
    flex: 0 0 auto;
    min-width: auto;
    padding: 8px;
  }

  .download-offline-btn {
    flex: 1 1 100%;
    min-width: 100%;
  }

  .download-offline-btn span {
    display: inline;
    font-size: 11px;
  }

  .channel-header {
    gap: 10px;
  }

  .channel-avatar-large {
    width: 36px;
    height: 36px;
    font-size: 14px;
  }

  .channel-name-main {
    font-size: 14px;
  }

  .subscriber-count {
    font-size: 12px;
  }

  .subscribe-btn {
    padding: 8px 16px;
    font-size: 12px;
  }

  .video-description {
    padding: 8px;
    font-size: 12px;
    border-radius: 8px;
  }

  .playback-controls {
    padding: 8px;
    margin-top: 10px;
    border-radius: 6px;
  }

  .speed-control {
    gap: 6px;
  }

  .speed-control label {
    font-size: 12px;
  }

  .speed-select {
    padding: 6px 8px;
    font-size: 12px;
  }

  .related-section {
    margin-top: 20px;
    padding-top: 16px;
  }

  .related-title {
    font-size: 16px;
    margin-bottom: 12px;
  }

  .related-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 10px;
  }

  .comments-section {
    margin-top: 20px;
    padding-top: 16px;
  }

  .comments-title {
    font-size: 15px;
    margin-bottom: 12px;
  }

  .comment-form {
    padding: 10px;
    margin-bottom: 20px;
    border-radius: 8px;
  }

  .comment-input-wrapper {
    gap: 8px;
    margin-bottom: 8px;
  }

  .comment-author-input,
  .comment-text-input {
    padding: 8px 10px;
    font-size: 12px;
    border-radius: 6px;
  }

  .comment-text-input {
    min-height: 60px;
  }

  .comment-form-actions {
    gap: 6px;
  }

  .char-count {
    font-size: 10px;
  }

  .comment-submit-btn {
    padding: 8px 16px;
    font-size: 12px;
    border-radius: 16px;
  }

  .comments-list {
    gap: 12px;
  }

  .comment-item {
    padding: 10px;
    gap: 8px;
    border-radius: 8px;
  }

  .comment-avatar {
    width: 32px;
    height: 32px;
    font-size: 12px;
  }

  .comment-author {
    font-size: 12px;
  }

  .comment-date {
    font-size: 10px;
  }

  .comment-text {
    font-size: 12px;
  }

  .recommendations-header h3 {
    font-size: 14px;
  }

  .recommendations-list {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 10px;
  }
}

/* Touch device optimizations */
@media (hover: none) and (pointer: coarse) {
  .action-btn:hover {
    background: var(--dark-lighter);
    opacity: 1;
  }

  .action-btn:active {
    background: var(--dark-light);
    opacity: 0.9;
  }

  .subscribe-btn:hover {
    background: var(--primary);
  }

  .subscribe-btn:active {
    background: var(--primary-dark);
    transform: scale(0.98);
  }

  .comment-submit-btn:hover {
    background: var(--primary);
  }

  .comment-submit-btn:active {
    background: var(--primary-dark);
    transform: scale(0.98);
  }
}
</style>

