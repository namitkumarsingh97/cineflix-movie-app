<template>
  <div class="watch-page">
    <div class="watch-container">
      <!-- Main Video Player Section -->
      <div class="watch-main">
        <!-- Video Player -->
        <div class="video-player-section">
          <div class="video-player-wrapper">
            <!-- Premium Lock Screen -->
            <div v-if="video && video.isPremium && !isPremium" class="premium-lock-screen">
              <div class="premium-lock-content">
                <Crown :size="64" />
                <h2>Premium Content</h2>
                <p>This video is available only to premium members</p>
                <div class="premium-features-preview">
                  <div class="premium-feature-item">
                    <Check :size="20" />
                    <span>HD & 4K Quality</span>
                  </div>
                  <div class="premium-feature-item">
                    <Check :size="20" />
                    <span>Ad-Free Experience</span>
                  </div>
                  <div class="premium-feature-item">
                    <Check :size="20" />
                    <span>Exclusive Content</span>
                  </div>
                </div>
                <button class="premium-unlock-btn" @click="goToPremium">
                  Unlock Premium
                </button>
              </div>
            </div>
            <!-- Iframe for movies with iframe content -->
            <div v-else-if="video && video.iframe" class="watch-iframe-container">
              <div v-html="video.iframe" class="watch-iframe-player"></div>
            </div>
            <!-- Iframe for Eporner videos (they only provide embed URLs, not direct video URLs) -->
            <div v-else-if="video && (isEporner || video._source === 'eporner') && (video.embedUrl || video.url)" class="watch-iframe-container">
              <iframe
                :src="video.embedUrl || video.url"
                frameborder="0"
                allowfullscreen
                allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
                class="watch-iframe-player eporner-iframe"
                loading="lazy"
              ></iframe>
              <!-- Overlay to hide Eporner banner -->
              <div class="eporner-banner-overlay"></div>
            </div>
            <!-- Modern Video Player for direct video URLs (S3 videos, etc.) -->
            <ModernVideoPlayer
              v-else-if="video && hasDirectVideoUrl(video) && (!video.isPremium || isPremium)"
              :src="video.url"
              :poster="video.thumbnail"
              :autoplay="shouldAutoplay"
              :muted="false"
              :is-hls="isHlsSource"
              @play="handlePlay"
              @pause="handlePause"
              @ended="handleEnded"
              @timeupdate="handleTimeUpdate"
              @volumechange="handleVolumeChange"
              @fullscreenchange="handleFullscreenChange"
            />
            
            <!-- Loading State -->
            <Loader v-if="loading" message="Loading video..." />
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
                <button class="action-btn" :class="{ active: showSharePanel }" @click="toggleSharePanel">
                  <Share2 :size="20" />
                  <span>Share</span>
                </button>
                <button 
                  class="action-btn" 
                  @click="handleDownload"
                  :disabled="isDownloading"
                  :title="isDownloading ? `Downloading... ${downloadProgress}%` : 'Download video'"
                >
                  <Download :size="20" />
                  <span>{{ isDownloading ? `Downloading ${downloadProgress}%` : 'Download' }}</span>
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
              </div>
            </div>

            <!-- Share Panel -->
            <div v-if="showSharePanel" class="share-panel">
              <div class="share-section">
                <div class="share-section-header">
                  <Link :size="18" />
                  <h3>Copy page link</h3>
                </div>
                <div class="share-input-group">
                  <input 
                    type="text" 
                    :value="pageUrl" 
                    readonly 
                    class="share-input"
                    ref="pageUrlInput"
                  />
                  <button class="copy-btn" @click="copyPageLink" title="Copy link">
                    <Copy :size="16" />
                  </button>
                </div>
              </div>

              <div class="share-section">
                <div class="share-section-header">
                  <Code :size="18" />
                  <h3>Embed this video to your page with this code</h3>
                </div>
                <div class="share-input-group">
                  <textarea 
                    :value="embedCode" 
                    readonly 
                    class="share-textarea"
                    ref="embedCodeInput"
                  ></textarea>
                  <button class="copy-btn" @click="copyEmbedCode" title="Copy embed code">
                    <Copy :size="16" />
                  </button>
                </div>
              </div>

              <div class="share-section">
                <div class="share-section-header">
                  <Share2 :size="18" />
                  <h3>Share this video</h3>
                </div>
                <div class="social-share-buttons">
                  <button class="social-share-btn" @click="shareToTwitter" title="Share on X (Twitter)">
                    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  </button>
                  <button class="social-share-btn" @click="shareToReddit" title="Share on Reddit">
                    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                      <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
                    </svg>
                  </button>
                  <button class="social-share-btn" @click="shareToEmail" title="Share via Email">
                    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                      <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                    </svg>
                  </button>
                </div>
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
                <button 
                  class="subscribe-btn" 
                  v-if="!isMovie"
                  @click="handleFollowCreator"
                  :class="{ active: isCreatorFollowed }"
                >
                  {{ isCreatorFollowed ? 'Following' : 'Follow Creator' }}
                </button>
              </div>
              <div class="video-description" v-if="video.description">
                <p>{{ video.description }}</p>
              </div>
            </div>
            
            <!-- Scene Navigation -->
            <SceneNavigation
              v-if="scenes.length > 0"
              :scenes="scenes"
              :current-scene="currentScene"
              @scene-click="handleSceneJump"
            />

            <!-- Related Videos Section -->
            <div v-if="recommendations.length > 0" class="related-videos-section">
              <h2 class="related-videos-title">Related Videos</h2>
              <div class="related-videos-grid">
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

    </div>
    
    <!-- Because You Watched Section - Outside container for full width -->
    <BecauseYouWatched
      v-if="becauseYouWatched.length > 0"
      :recommendations="becauseYouWatched"
      :source-title="video?.title || 'this'"
      @item-click="navigateToVideo"
    />
  </div>

  <!-- Interactive Choice Overlay -->
  <InteractiveChoiceOverlay
    v-if="isInteractive && currentChoicePoint"
    :choice-point="currentChoicePoint"
    :choices="currentChoicePoint.choices"
    :selected-choices="selectedChoices"
    @choice="handleInteractiveChoice"
    @skip="handleSkipChoice"
  />

  <!-- Watch Party Sidebar -->
  <div v-if="roomId" class="watch-party-overlay">
    <div class="watch-party-container">
      <WatchPartyRoom
        :room-id="roomId"
        @leave="handleLeaveParty"
      />
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
import { useSmartQueue } from '../composables/useSmartQueue';
import { useDownloads } from '../composables/useDownloads';
import { useWatchLater } from '../composables/useWatchLater';
import { useStarFollows } from '../composables/useStarFollows';
import { useNetworkQuality } from '../composables/useNetworkQuality';
import { useRecommendations } from '../composables/useRecommendations';
import { useScenes } from '../composables/useScenes';
import { useSceneDetection } from '../composables/useSceneDetection';
import { useInteractiveVideo } from '../composables/useInteractiveVideo';
import { useSocialWatchParty } from '../composables/useSocialWatchParty';
import { useVRIntegration } from '../composables/useVRIntegration';
import { useCreators } from '../composables/useCreators';
import { useSubscription } from '../composables/useSubscription';
import VideoCard from '../components/VideoCard.vue';
import MovieCard from '../components/MovieCard.vue';
import SceneNavigation from '../components/SceneNavigation.vue';
import BecauseYouWatched from '../components/BecauseYouWatched.vue';
import Loader from '../components/Loader.vue';
import ModernVideoPlayer from '../components/ModernVideoPlayer.vue';
import InteractiveChoiceOverlay from '../components/InteractiveChoiceOverlay.vue';
import WatchPartyRoom from '../components/WatchPartyRoom.vue';
import {
  ThumbsUp,
  ThumbsDown,
  Share2,
  Download,
  MoreVertical,
  Heart,
  Clock,
  Star,
  Users,
  Link,
  Copy,
  Code,
} from 'lucide-vue-next';

const route = useRoute();
const router = useRouter();
const video = ref(null);
const loading = ref(true);
const { videos, loadVideos } = useVideos();
const { movies, loadMovies } = useMovies();
const { getVideoById, videos: epornerVideos, searchVideos } = useEporner();
const { initializeSmartQueue, predictedVideos, isPreloading } = useSmartQueue();

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
const { getBecauseYouWatched, updateSession } = useRecommendations();
const { scenes, currentScene, generateScenes, jumpToScene, getSceneAtTime } = useScenes();
const { 
  detectedScenes, 
  detectScenes: detectScenesAI, 
  getRecommendedSkipTime, 
  scenePreferences,
  setPreferences: setScenePreferences 
} = useSceneDetection();
const {
  isInteractive,
  currentSegment,
  choicePoints,
  selectedChoices,
  initializeInteractiveVideo,
  getCurrentSegmentUrl,
  getChoicesAtTime,
  makeChoice,
} = useInteractiveVideo();
const {
  isHost,
  roomId,
  participants,
  isConnected: isPartyConnected,
  chatMessages,
  createRoom,
  joinRoom,
  broadcastState,
  synchronizePlayback,
  sendMessage: sendPartyMessage,
  leaveRoom,
} = useSocialWatchParty();
const {
  isVRSupported,
  isVRActive,
  enterVRPreview,
  enterFullVR,
  exitVR,
  hasVRContent,
} = useVRIntegration();
const { extractCreator, followCreator, unfollowCreator, isCreatorFollowed: checkCreatorFollowed } = useCreators();
const { isPremium, checkPremiumStatus } = useSubscription();

const isFavorite = computed(() => video.value ? isFavorited(video.value._id || video.value.id) : false);
const isWatchLater = computed(() => video.value ? isInWatchLater(video.value._id || video.value.id) : false);

// Creator follow status
const creatorInfo = computed(() => {
  if (!video.value) return null;
  return extractCreator(video.value);
});

const isCreatorFollowed = computed(() => {
  if (!creatorInfo.value) return false;
  return checkCreatorFollowed(creatorInfo.value.id);
});
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

// Tag-based recommendations
const tagBasedRecommendations = ref([]);
const loadingTagRecommendations = ref(false);

// Load recommendations based on video tags
async function loadTagBasedRecommendations() {
  if (!video.value || loadingTagRecommendations.value) return;
  
  loadingTagRecommendations.value = true;
  try {
    // Get tags/categories from current video
    const tags = video.value.categories || 
                 (video.value.category ? [video.value.category] : []) ||
                 (video.value.tags || []);
    
    if (tags.length === 0) {
      // Fallback to general recommendations if no tags
      tagBasedRecommendations.value = [];
      loadingTagRecommendations.value = false;
      return;
    }
    
    // Use the first tag/category for search
    const primaryTag = tags[0];
    const limit = shouldDeferRecommendations.value ? 5 : 10;
    
    if (isEporner.value || video.value._source === 'eporner') {
      // Search Eporner videos by tag
      await searchVideos(primaryTag, 1, { perPage: limit + 1, order: 'most-popular' });
      // Filter out current video and limit results
      tagBasedRecommendations.value = epornerVideos.value
        .filter(v => v.id !== videoId.value)
        .slice(0, limit);
    } else if (isMovie.value) {
      // For movies, filter by category
      const related = movies.value.filter(m => 
        m._id !== videoId.value && 
        (m.category === primaryTag || (m.tags && m.tags.includes(primaryTag)))
      );
      // If not enough, add random movies
      if (related.length < limit) {
        const random = movies.value
          .filter(m => m._id !== videoId.value && m.category !== primaryTag)
          .slice(0, limit - related.length);
        tagBasedRecommendations.value = [...related, ...random].slice(0, limit);
      } else {
        tagBasedRecommendations.value = related.slice(0, limit);
      }
    } else {
      // For backend videos, filter by category
      const related = videos.value.filter(v => 
        v.id !== videoId.value && 
        (v.category === primaryTag || (v.tags && v.tags.includes(primaryTag)))
      );
      // If not enough, add random videos
      if (related.length < limit) {
        const random = videos.value
          .filter(v => v.id !== videoId.value && v.category !== primaryTag)
          .slice(0, limit - related.length);
        tagBasedRecommendations.value = [...related, ...random].slice(0, limit);
      } else {
        tagBasedRecommendations.value = related.slice(0, limit);
      }
    }
  } catch (error) {
    console.error('Error loading tag-based recommendations:', error);
    tagBasedRecommendations.value = [];
  } finally {
    loadingTagRecommendations.value = false;
  }
}

const recommendations = computed(() => {
  // If we have tag-based recommendations, use those
  if (tagBasedRecommendations.value.length > 0) {
    return tagBasedRecommendations.value;
  }
  
  // Fallback to general recommendations
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

// Because you watched recommendations
const becauseYouWatched = computed(() => {
  if (!video.value) return [];
  
  const allItems = isEporner.value 
    ? [...epornerVideos.value, ...videos.value]
    : isMovie.value
    ? movies.value
    : [...videos.value, ...movies.value];
  
  try {
    return getBecauseYouWatched(video.value, allItems, 12) || [];
  } catch (error) {
    console.warn('Error getting recommendations:', error);
    return [];
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
  // Scroll to top when video changes
  window.scrollTo({ top: 0, behavior: 'smooth' });
  loadVideo();
  // Reset states
  isLiked.value = false;
  isDisliked.value = false;
  comments.value = [];
  commentText.value = '';
  commentAuthor.value = '';
  tagBasedRecommendations.value = []; // Reset tag-based recommendations
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
          
          // Scroll to top when video loads
          window.scrollTo({ top: 0, behavior: 'smooth' });
          
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
          
          // Update session for recommendations
          updateSession({
            id: video.value.id,
            title: video.value.title,
            categories: video.value.categories || [],
            stars: video.value.stars || [],
            duration: video.value.duration || 0,
          });
          
          // Load tag-based recommendations
          if (video.value.categories && video.value.categories.length > 0) {
            if (!shouldDeferRecommendations.value) {
              await loadTagBasedRecommendations();
            } else {
              // Defer loading on slow networks
              setTimeout(() => {
                loadTagBasedRecommendations();
              }, 2000);
            }
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
          // Scroll to top when video loads
          window.scrollTo({ top: 0, behavior: 'smooth' });
          // Add to watch history
          addToHistory({
            id: video.value.id,
            title: video.value.title,
            thumbnail: video.value.thumbnail,
            type: 'video',
            category: video.value.category
          });
          
          // Update session for recommendations
          updateSession({
            id: video.value.id,
            title: video.value.title,
            categories: video.value.category ? [video.value.category] : [],
            stars: video.value.stars || [],
            duration: video.value.duration || 0,
          });
          // Increment view for videos
          try {
            await videosApi.incrementView?.(videoId.value);
          } catch (e) {
            console.log('View increment not available for videos');
          }
          // Detect scenes using AI
          if (video.value) {
            detectScenesAI(video.value, { useAI: true });
            generateScenes(video.value);
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
          // Scroll to top when video loads
          window.scrollTo({ top: 0, behavior: 'smooth' });
          // Add to watch history
          addToHistory({
            id: video.value._id,
            title: video.value.title,
            thumbnail: video.value.thumbnail,
            type: 'movie',
            category: video.value.category
          });
          
          // Update session for recommendations
          updateSession({
            id: video.value._id,
            title: video.value.title,
            categories: video.value.category ? [video.value.category] : [],
            stars: video.value.stars || [],
            duration: video.value.duration || 0,
          });
          
          // Increment view for movies
          try {
            await moviesApi.incrementView(videoId.value);
            video.value.views = (video.value.views || 0) + 1;
          } catch (e) {
            console.error('Error incrementing view:', e);
          }
          // Detect scenes using AI
          if (video.value) {
            detectScenesAI(video.value, { useAI: true });
            generateScenes(video.value);
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
          // Scroll to top when video loads
          window.scrollTo({ top: 0, behavior: 'smooth' });
          // Add to watch history
          addToHistory({
            id: video.value.id,
            title: video.value.title,
            thumbnail: video.value.thumbnail,
            type: 'eporner',
            category: video.value.categories?.[0] || ''
          });
          
          // Update session for recommendations
          updateSession({
            id: video.value.id,
            title: video.value.title,
            categories: video.value.categories || [],
            stars: video.value.stars || [],
            duration: video.value.duration || 0,
          });
          
          // Load tag-based recommendations
          if (video.value.categories && video.value.categories.length > 0) {
            if (!shouldDeferRecommendations.value) {
              await loadTagBasedRecommendations();
            } else {
              // Defer loading on slow networks
              setTimeout(() => {
                loadTagBasedRecommendations();
              }, 2000);
            }
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

const showSharePanel = ref(false);

const pageUrl = computed(() => {
  return window.location.href;
});

const embedCode = computed(() => {
  if (!video.value) return '';
  const videoId = video.value._id || video.value.id;
  const embedUrl = isEporner.value 
    ? `${window.location.origin}/embed/${videoId}?source=eporner`
    : `${window.location.origin}/embed/${videoId}`;
  return `<iframe src="${embedUrl}" frameborder="0" width="510" height="400" scrolling="no" allowfullscreen="allowfullscreen"></iframe>`;
});

function toggleSharePanel() {
  showSharePanel.value = !showSharePanel.value;
}

async function copyPageLink() {
  try {
    await navigator.clipboard.writeText(pageUrl.value);
    // Show feedback
    const btn = document.querySelector('.share-section:first-child .copy-btn');
    if (btn) {
      const originalHTML = btn.innerHTML;
      btn.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>';
      setTimeout(() => {
        btn.innerHTML = originalHTML;
      }, 2000);
    }
  } catch (err) {
    console.error('Failed to copy:', err);
  }
}

async function copyEmbedCode() {
  try {
    await navigator.clipboard.writeText(embedCode.value);
    // Show feedback
    const btn = document.querySelector('.share-section:nth-child(2) .copy-btn');
    if (btn) {
      const originalHTML = btn.innerHTML;
      btn.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>';
      setTimeout(() => {
        btn.innerHTML = originalHTML;
      }, 2000);
    }
  } catch (err) {
    console.error('Failed to copy:', err);
  }
}

function shareToTwitter() {
  const url = encodeURIComponent(pageUrl.value);
  const text = encodeURIComponent(video.value?.title || 'Check out this video');
  window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank');
}

function shareToReddit() {
  const url = encodeURIComponent(pageUrl.value);
  const title = encodeURIComponent(video.value?.title || 'Check out this video');
  window.open(`https://reddit.com/submit?url=${url}&title=${title}`, '_blank');
}

function shareToEmail() {
  const subject = encodeURIComponent(video.value?.title || 'Check out this video');
  const body = encodeURIComponent(`Check out this video: ${pageUrl.value}`);
  window.location.href = `mailto:?subject=${subject}&body=${body}`;
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

const isDownloading = ref(false);
const downloadProgress = ref(0);

async function handleDownload() {
  if (!video.value || isDownloading.value) return;
  
  isDownloading.value = true;
  downloadProgress.value = 0;
  
  try {
    // Check video source type
    if (isEporner.value || video.value._source === 'eporner') {
      // Eporner videos - try to extract direct URL or show message
      await downloadEpornerVideo();
    } else if (isHlsSource.value) {
      // HLS stream - download segments and combine
      await downloadHlsVideo();
    } else if (video.value.url && hasDirectVideoUrl(video.value)) {
      // Direct video URL - simple download
      await downloadDirectVideo(video.value.url);
    } else {
      alert('Download not available for this video type.');
    }
  } catch (error) {
    console.error('Download error:', error);
    alert('Failed to download video. Please try again.');
  } finally {
    isDownloading.value = false;
    downloadProgress.value = 0;
  }
}

async function downloadDirectVideo(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch video');
    
    const contentLength = response.headers.get('content-length');
    const total = contentLength ? parseInt(contentLength, 10) : 0;
    
    const reader = response.body.getReader();
    const chunks = [];
    let received = 0;
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      chunks.push(value);
      received += value.length;
      
      if (total > 0) {
        downloadProgress.value = Math.round((received / total) * 100);
      }
    }
    
    // Combine chunks into blob
    const blob = new Blob(chunks, { type: 'video/mp4' });
    const blobUrl = URL.createObjectURL(blob);
    
    // Create download link
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = `${video.value.title || 'video'}.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up
    URL.revokeObjectURL(blobUrl);
    
    downloadProgress.value = 100;
  } catch (error) {
    console.error('Direct download error:', error);
    // Fallback: try simple link download
    const link = document.createElement('a');
    link.href = url;
    link.download = video.value.title || 'video';
    link.target = '_blank';
    link.click();
  }
}

async function downloadHlsVideo() {
  try {
    // Check if Hls.js is available
    if (typeof Hls === 'undefined') {
      alert('HLS download requires HLS.js library. Please use a direct video URL.');
      return;
    }
    
    const hlsUrl = video.value.url;
    const hls = new Hls();
    
    // Load manifest
    const manifestResponse = await fetch(hlsUrl);
    const manifestText = await manifestResponse.text();
    
    // Parse manifest to get segment URLs
    const baseUrl = hlsUrl.substring(0, hlsUrl.lastIndexOf('/') + 1);
    const segmentUrls = [];
    
    manifestText.split('\n').forEach(line => {
      if (line && !line.startsWith('#')) {
        const segmentUrl = line.startsWith('http') ? line : baseUrl + line;
        segmentUrls.push(segmentUrl);
      }
    });
    
    if (segmentUrls.length === 0) {
      throw new Error('No segments found in HLS manifest');
    }
    
    // Download all segments
    const segments = [];
    const total = segmentUrls.length;
    
    for (let i = 0; i < segmentUrls.length; i++) {
      const response = await fetch(segmentUrls[i]);
      const arrayBuffer = await response.arrayBuffer();
      segments.push(arrayBuffer);
      
      downloadProgress.value = Math.round(((i + 1) / total) * 100);
    }
    
    // Combine segments into single blob
    const totalSize = segments.reduce((sum, seg) => sum + seg.byteLength, 0);
    const combined = new Uint8Array(totalSize);
    let offset = 0;
    
    segments.forEach(segment => {
      combined.set(new Uint8Array(segment), offset);
      offset += segment.byteLength;
    });
    
    // Create blob and download
    const blob = new Blob([combined], { type: 'video/mp4' });
    const blobUrl = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = `${video.value.title || 'video'}.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(blobUrl);
    downloadProgress.value = 100;
  } catch (error) {
    console.error('HLS download error:', error);
    alert('Failed to download HLS video. The video may be protected or the format is not supported.');
  }
}

async function downloadEpornerVideo() {
  // Eporner videos are embedded, so direct download is not possible
  // We can try to extract the video URL from the embed, but it's often protected
  try {
    // Try to get video URL from Eporner API if available
    if (video.value.url && !video.value.url.includes('embed')) {
      // If we have a direct URL (unlikely for Eporner), use it
      await downloadDirectVideo(video.value.url);
    } else {
      // Show user-friendly message
      alert('Direct download is not available for this video. You can:\n\n1. Use browser extensions for video downloading\n2. Right-click on the video player and select "Save video as..."\n3. Use the video URL in a download manager');
      
      // Copy video page URL to clipboard as alternative
      try {
        await navigator.clipboard.writeText(pageUrl.value);
        console.log('Video page URL copied to clipboard');
      } catch (e) {
        console.error('Failed to copy URL:', e);
      }
    }
  } catch (error) {
    console.error('Eporner download error:', error);
    alert('Download not available for embedded videos. Please use browser extensions or download managers.');
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

// Handle scene jump
function handleSceneJump(scene) {
  if (videoPlayer.value) {
    jumpToScene(scene.id, videoPlayer.value);
  }
}

// Handle follow creator
function handleFollowCreator() {
  if (!creatorInfo.value) return;
  
  if (isCreatorFollowed.value) {
    unfollowCreator(creatorInfo.value.id);
  } else {
    followCreator(creatorInfo.value);
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

function goToPremium() {
  router.push('/premium');
}

// Check if video has a direct video URL (not an embed URL or page URL)
function hasDirectVideoUrl(video) {
  if (!video || !video.url) return false;
  
  // Don't use ModernVideoPlayer for Eporner videos (they only have embed URLs)
  if (isEporner.value || video._source === 'eporner') {
    return false;
  }
  
  const url = video.url.toLowerCase();
  
  // Check if it's a direct video file URL
  const isDirectVideo = url.endsWith('.mp4') || 
                       url.endsWith('.webm') || 
                       url.endsWith('.m3u8') ||
                       url.endsWith('.m3u') ||
                       url.includes('/video/') && !url.includes('/embed/') ||
                       url.startsWith('blob:') ||
                       url.startsWith('data:');
  
  // Check if it's NOT an embed URL or page URL
  const isNotEmbed = !url.includes('/embed/') && 
                    !url.includes('embed') &&
                    !url.includes('youtube.com') &&
                    !url.includes('vimeo.com') &&
                    !url.includes('eporner.com/video/');
  
  return isDirectVideo && isNotEmbed;
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

function handleTimeUpdate(time) {
  if (video.value) {
    // Time can come from ModernVideoPlayer event or from videoPlayer ref
    const currentTimeValue = time !== undefined ? time : (videoPlayer.value?.currentTime || 0);
    const durationValue = videoPlayer.value?.duration || 0;
    
    if (durationValue > 0) {
      const progress = Math.round((currentTimeValue / durationValue) * 100);
      updateProgress(video.value._id || video.value.id, progress, durationValue);
      
      // Update current scene
      const sceneAtTime = getSceneAtTime(currentTimeValue);
      if (sceneAtTime && (!currentScene.value || sceneAtTime.id !== currentScene.value.id)) {
        currentScene.value = sceneAtTime;
      }

      // Check for interactive video choices
      if (isInteractive.value) {
        const choices = getChoicesAtTime(currentTimeValue);
        if (choices.length > 0 && !currentChoicePoint.value) {
          currentChoicePoint.value = choices[0];
        }
      }

      // Synchronize playback for watch party
      if (roomId.value && videoPlayer.value) {
        synchronizePlayback(videoPlayer.value);
      }
    }
  }
}

async function handlePlay() {
  // Video started playing - initialize smart queue
  if (video.value) {
    // Get all available videos for prediction
    const allVideos = [
      ...epornerVideos.value,
      ...videos.value,
      ...movies.value
    ];
    
    // Initialize smart queue to predict and pre-load next videos
    await initializeSmartQueue(video.value, allVideos);
    
    // Auto-skip based on preferences
    const skipTime = getRecommendedSkipTime(video.value);
    if (skipTime && videoPlayer.value) {
      // Small delay to ensure player is ready
      setTimeout(() => {
        if (videoPlayer.value && typeof videoPlayer.value.currentTime !== 'undefined') {
          videoPlayer.value.currentTime = skipTime;
        }
      }, 500);
    }
  }
}

function handlePause() {
  // Video paused
  if (roomId.value && isHost.value) {
    broadcastState({ isPlaying: false });
  }
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
  // Scroll to top on initial mount
  window.scrollTo({ top: 0, behavior: 'instant' });
  
  await checkPremiumStatus();
  await Promise.all([loadVideos(), loadMovies()]);
  await loadVideo();
  processIframe();
  
  // Load tag-based recommendations after initial load if deferred
  if (shouldDeferRecommendations.value && video.value) {
    setTimeout(() => {
      loadTagBasedRecommendations();
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
  padding: 24px;
  margin-top: -64px; /* Offset navbar height */
  padding-top: 88px; /* Navbar height + padding */
  width: 100%;
  box-sizing: border-box;
}

.watch-container {
  max-width: 1600px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 100%;
  box-sizing: border-box;
}

/* Large screens (L screens and above) */
@media (min-width: 1920px) {
  .watch-container {
    max-width: 95%;
    gap: 32px;
  }
}

/* 4K screens */
@media (min-width: 2560px) {
  .watch-container {
    max-width: 95%;
    gap: 40px;
  }
}

.watch-main {
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
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

/* Modern Video Player styling */
.video-player-wrapper :deep(.modern-video-player) {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.video-player-wrapper :deep(.video-container) {
  width: 100%;
  height: 100%;
}

/* Large screens (L screens and above) */
@media (min-width: 1920px) {
  .video-player-wrapper {
    max-height: calc(100vh - 220px);
    min-height: 500px;
  }
}

/* 4K screens */
@media (min-width: 2560px) {
  .video-player-wrapper {
    max-height: calc(100vh - 240px);
    min-height: 600px;
  }
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
}

@media (max-width: 900px) {
  .watch-page {
    padding: 16px 16px 16px 0;
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

.premium-lock-screen {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.95), rgba(0, 0, 0, 0.9));
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  border-radius: 12px;
}

.premium-lock-content {
  text-align: center;
  padding: 40px;
  max-width: 500px;
}

.premium-lock-content svg {
  color: var(--primary);
  margin-bottom: 24px;
}

.premium-lock-content h2 {
  font-size: 32px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 12px 0;
}

.premium-lock-content > p {
  font-size: 16px;
  color: var(--text-secondary);
  margin: 0 0 32px 0;
}

.premium-features-preview {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 32px;
  text-align: left;
}

.premium-feature-item {
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--text-primary);
  font-size: 15px;
}

.premium-feature-item svg {
  color: var(--primary);
  margin: 0;
}

.premium-unlock-btn {
  padding: 14px 32px;
  background: var(--gradient-primary);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(255, 69, 0, 0.4);
}

.premium-unlock-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 69, 0, 0.6);
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

/* Overlay to hide Eporner banner at top */
.eporner-banner-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 80px; /* Adjust based on banner height - covers the yellow text banner */
  background: linear-gradient(to bottom, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 0.95) 50%, rgba(0, 0, 0, 0) 100%);
  z-index: 10;
  pointer-events: none; /* Don't block video interactions */
  border-radius: 12px 12px 0 0;
}

/* Overlay to block clicks on Eporner banner (transparent, no color) */
.eporner-banner-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 90px; /* Covers the banner with download icon and yellow text */
  background: transparent; /* No color, completely transparent */
  z-index: 100; /* Above the iframe */
  pointer-events: auto; /* Block clicks on the banner area to prevent redirects */
}

/* Ensure iframe is below overlay */
.eporner-iframe {
  position: relative;
  z-index: 1;
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

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  pointer-events: none;
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

/* Related Videos Section */
.related-videos-section {
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.related-videos-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 20px 0;
}

.related-videos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

@media (max-width: 1200px) {
  .related-videos-grid {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 14px;
  }
}

@media (max-width: 768px) {
  .related-videos-section {
    margin-top: 24px;
    padding-top: 20px;
  }

  .related-videos-title {
    font-size: 18px;
    margin-bottom: 16px;
  }

  .related-videos-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 12px;
  }
}

@media (max-width: 480px) {
  .related-videos-section {
    margin-top: 20px;
    padding-top: 16px;
  }

  .related-videos-title {
    font-size: 16px;
    margin-bottom: 12px;
  }

  .related-videos-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 10px;
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

.share-panel {
  background: var(--dark-lighter);
  border-radius: 12px;
  padding: 20px;
  margin: 16px 0;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.share-section {
  margin-bottom: 24px;
}

.share-section:last-child {
  margin-bottom: 0;
}

.share-section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.share-section-header h3 {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.share-input-group {
  display: flex;
  gap: 8px;
  align-items: flex-start;
}

.share-input,
.share-textarea {
  flex: 1;
  padding: 10px 12px;
  background: var(--dark);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 13px;
  font-family: inherit;
  resize: none;
}

.share-input:focus,
.share-textarea:focus {
  outline: none;
  border-color: var(--primary);
}

.share-textarea {
  min-height: 80px;
  font-family: 'Courier New', monospace;
}

.copy-btn {
  padding: 10px 16px;
  background: var(--dark);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: var(--text-primary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.copy-btn:hover {
  background: var(--dark-light);
  border-color: var(--primary);
  color: var(--primary);
}

.social-share-buttons {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.social-share-btn {
  width: 44px;
  height: 44px;
  border-radius: 8px;
  background: var(--dark);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--text-primary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  padding: 0;
}

.social-share-btn:hover {
  background: var(--dark-light);
  border-color: var(--primary);
  transform: translateY(-2px);
}

.social-share-btn svg {
  width: 20px;
  height: 20px;
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

