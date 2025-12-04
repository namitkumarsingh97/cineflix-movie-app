<template>
  <div class="watch-page">
    <div class="watch-container">
      <!-- Main Video Player Section -->
      <div class="watch-main">
        <!-- Video Player -->
        <div class="video-player-section">
          <div class="video-player-wrapper">
            <!-- Iframe for movies -->
            <div v-if="video && video.iframe" class="watch-iframe-container">
              <div v-html="video.iframe" class="watch-iframe-player"></div>
            </div>
            <!-- Video tag for S3 videos -->
            <video
              v-else-if="video && video.url"
              ref="videoPlayer"
              :src="video.url"
              controls
              autoplay
              class="watch-video-player"
              @loadedmetadata="handleVideoLoaded"
              @timeupdate="handleTimeUpdate"
              @play="handlePlay"
              @pause="handlePause"
            >
              Your browser does not support the video tag.
            </video>
            
            <!-- Playback Speed Control -->
            <div v-if="video && video.url && videoPlayer" class="playback-controls">
              <div class="speed-control">
                <label>{{ $t('watch.playbackSpeed') }}:</label>
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
            <Loader v-else message="Loading video..." />
          </div>

          <!-- Video Info -->
          <div class="video-info-section" v-if="video">
            <h1 class="video-title-main">{{ video.title }}</h1>
            
            <div class="video-actions-bar">
              <div class="video-stats">
                <span class="view-count-main">{{ formatViews(video.views || 0) }} {{ $tc('watch.views', video.views || 0) }}</span>
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
                  <span>{{ $t('watch.download') }}</span>
                </button>
                <button 
                  v-if="video.url" 
                  class="action-btn download-offline-btn" 
                  @click="downloadForOffline"
                  :title="$t('download.downloadForOffline')"
                >
                  <Download :size="20" />
                  <span>{{ $t('download.downloadForOffline') }}</span>
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
              <h2 class="comments-title">{{ comments.length }} {{ $tc('watch.comments', comments.length) }}</h2>
              
              <!-- Comment Form -->
              <div class="comment-form">
                <div class="comment-input-wrapper">
                  <input
                    v-model="commentAuthor"
                    type="text"
                    :placeholder="$t('watch.yourName')"
                    class="comment-author-input"
                    maxlength="50"
                  />
                  <textarea
                    v-model="commentText"
                    :placeholder="$t('watch.addComment')"
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
                    {{ submittingComment ? $t('watch.posting') : $t('watch.postComment') }}
                  </button>
                </div>
              </div>

              <!-- Comments List -->
              <div class="comments-list">
                <div v-if="loadingComments" class="comments-loading">{{ $t('common.loading') }}</div>
                <div v-else-if="comments.length === 0" class="no-comments">
                  <p>{{ $t('watch.noComments') }}</p>
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
          <template v-if="!isMovie">
            <VideoCard
              v-for="recVideo in recommendations"
              :key="recVideo.id"
              :video="recVideo"
              @click="navigateToVideo(recVideo)"
            />
          </template>
          <template v-else>
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
import { ref, onMounted, computed, watch, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { videosApi } from '../api/videos';
import { moviesApi } from '../api/movies';
import { useVideos } from '../composables/useVideos';
import { useMovies } from '../composables/useMovies';
import { useWatchHistory, useFavorites } from '../composables/useWatchHistory';
import { useDownloads } from '../composables/useDownloads';
import { useI18n } from 'vue-i18n';
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
} from 'lucide-vue-next';

const route = useRoute();
const router = useRouter();
const video = ref(null);
const loading = ref(true);
const { videos, loadVideos } = useVideos();
const { movies, loadMovies } = useMovies();

const videoId = computed(() => route.params.id);
const isMovie = ref(false);
const isLiked = ref(false);
const isDisliked = ref(false);
const comments = ref([]);
const loadingComments = ref(false);
const commentText = ref('');
const commentAuthor = ref('');
const submittingComment = ref(false);
const videoPlayer = ref(null);
const playbackSpeed = ref(1);
const { addToHistory, updateProgress } = useWatchHistory();
const { isFavorited, toggleFavorite } = useFavorites();
const { downloadForOffline: downloadOffline } = useDownloads();
const { t } = useI18n();
const isFavorite = computed(() => video.value ? isFavorited(video.value._id || video.value.id) : false);

const recommendations = computed(() => {
  if (isMovie.value) {
    // Show other movies as recommendations
    return movies.value.filter(m => m._id !== videoId.value).slice(0, 10);
  } else {
    // Show other videos as recommendations
    return videos.value.filter(v => v.id !== videoId.value).slice(0, 10);
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

async function loadVideo() {
  if (!videoId.value) return;
  
  loading.value = true;
  try {
    // Try to load as video first
    try {
      const videoResponse = await videosApi.getById(videoId.value);
      if (videoResponse.data.success) {
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
        return;
      }
    } catch (videoError) {
      // If not found as video, try as movie
    }
    
    // Try to load as movie
    try {
      const movieResponse = await moviesApi.getById(videoId.value);
      if (movieResponse.data.success || movieResponse.data) {
        video.value = movieResponse.data.data || movieResponse.data;
        isMovie.value = true;
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
      }
    } catch (movieError) {
      console.error('Error loading video/movie:', movieError);
    }
  } catch (error) {
    console.error('Error loading video:', error);
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
  router.push(`/watch/${video.id || video._id}`);
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

.watch-iframe-player iframe {
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
}

.action-btn:hover {
  background: var(--dark-lighter);
  opacity: 0.8;
}

.action-btn svg {
  width: 20px;
  height: 20px;
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

@media (max-width: 1024px) {
  .watch-container {
    flex-direction: column;
  }
  
  .watch-sidebar {
    width: 100%;
  }
  
  .recommendations-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
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
    padding: 16px;
    margin-top: 0;
    padding-top: 80px;
  }
  
  .video-title-main {
    font-size: 18px;
  }
  
  .video-actions-bar {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .action-buttons {
    width: 100%;
    justify-content: space-between;
  }
  
  .action-btn {
    flex: 1;
    justify-content: center;
  }

  .comment-form {
    padding: 12px;
  }

  .comment-item {
    padding: 12px;
  }
}
</style>

