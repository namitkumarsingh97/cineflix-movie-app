<template>
  <div class="creator-hub-page">
    <Loader v-if="loading" message="Loading creator hub..." />
    
    <div v-else-if="creatorHub" class="creator-hub-content">
      <!-- Creator Header -->
      <div class="creator-header">
        <div class="creator-avatar-large">
          {{ getInitials(creatorHub.name) }}
        </div>
        <div class="creator-info">
          <h1 class="creator-name">{{ creatorHub.name }}</h1>
          <p v-if="creatorHub.description" class="creator-description">{{ creatorHub.description }}</p>
          <div class="creator-stats">
            <span>{{ creatorHub.totalVideos }} videos</span>
            <span v-if="creatorHub.followerCount">{{ formatViews(creatorHub.followerCount) }} followers</span>
          </div>
        </div>
        <button
          class="follow-creator-btn"
          :class="{ active: isFollowed }"
          @click="toggleFollow"
        >
          <Star :size="18" :fill="isFollowed ? 'currentColor' : 'none'" />
          <span>{{ isFollowed ? 'Following' : 'Follow' }}</span>
        </button>
      </div>

      <!-- Latest Release Alert -->
      <div v-if="creatorHub.latestRelease" class="latest-release-alert">
        <div class="alert-icon">🎬</div>
        <div class="alert-content">
          <h3>Latest Release</h3>
          <p>{{ creatorHub.latestRelease.title }}</p>
          <span class="alert-time">{{ formatTimeAgo(creatorHub.latestRelease.createdAt || creatorHub.latestRelease.uploadedAt) }}</span>
        </div>
        <button class="watch-btn" @click="navigateToVideo(creatorHub.latestRelease)">
          Watch Now
        </button>
      </div>

      <!-- Recent Releases -->
      <section v-if="creatorHub.recentReleases.length > 0" class="releases-section">
        <h2 class="section-title">Recent Releases</h2>
        <div class="videos-grid">
          <VideoCard
            v-for="video in creatorHub.recentReleases"
            :key="video.id || video._id"
            :video="video"
            @click="navigateToVideo"
          />
          <MovieCard
            v-for="movie in creatorHub.recentReleases.filter(v => v._id)"
            :key="movie._id"
            :movie="movie"
            @click="navigateToVideo"
          />
        </div>
      </section>

      <!-- All Videos -->
      <section class="all-videos-section">
        <h2 class="section-title">All Videos ({{ creatorHub.totalVideos }})</h2>
        <div class="videos-grid">
          <VideoCard
            v-for="video in creatorHub.videos"
            :key="video.id || video._id"
            :video="video"
            @click="navigateToVideo"
          />
          <MovieCard
            v-for="movie in creatorHub.videos.filter(v => v._id)"
            :key="movie._id"
            :movie="movie"
            @click="navigateToVideo"
          />
        </div>
      </section>
    </div>

    <div v-else class="empty-state">
      <User :size="64" />
      <h3>Creator not found</h3>
      <p>This creator hub doesn't exist or has no content.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useCreators } from '../composables/useCreators';
import { useMovies } from '../composables/useMovies';
import { useEporner } from '../composables/useEporner';
import { useVideos } from '../composables/useVideos';
import VideoCard from '../components/VideoCard.vue';
import MovieCard from '../components/MovieCard.vue';
import Loader from '../components/Loader.vue';
import { Star, User } from 'lucide-vue-next';

const route = useRoute();
const router = useRouter();
const creatorId = computed(() => route.params.id);

const { getCreatorHub, followCreator, unfollowCreator, isCreatorFollowed } = useCreators();
const { movies } = useMovies();
const { videos: epornerVideos } = useEporner();
const { videos } = useVideos();

const creatorHub = ref(null);
const loading = ref(true);

const isFollowed = computed(() => {
  if (!creatorHub.value) return false;
  return isCreatorFollowed(creatorHub.value.id);
});

const formatViews = (count) => {
  if (!count) return '0';
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
  return count.toString();
};

const formatTimeAgo = (date) => {
  if (!date) return '';
  const now = new Date();
  const videoDate = new Date(date);
  const diffInSeconds = Math.floor((now - videoDate) / 1000);
  
  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  return `${Math.floor(diffInSeconds / 604800)} weeks ago`;
};

const getInitials = (name) => {
  if (!name) return '??';
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const toggleFollow = () => {
  if (!creatorHub.value) return;
  
  if (isFollowed.value) {
    unfollowCreator(creatorHub.value.id);
  } else {
    followCreator(creatorHub.value);
  }
};

const navigateToVideo = (item) => {
  if (item._id) {
    router.push(`/watch/${item._id}`);
  } else if (item.id) {
    router.push(`/watch/${item.id}?source=eporner`);
  }
};

onMounted(async () => {
  loading.value = true;
  
  // Get all videos
  const allVideos = [
    ...movies.value,
    ...epornerVideos.value,
    ...(videos.value || []),
  ];
  
  // Get creator hub
  creatorHub.value = getCreatorHub(creatorId.value, allVideos);
  
  loading.value = false;
});
</script>

<style scoped>
.creator-hub-page {
  padding: 24px;
  max-width: 1600px;
  margin: 0 auto;
}

.creator-header {
  display: flex;
  gap: 20px;
  margin-bottom: 32px;
  padding: 24px;
  background: var(--dark-light);
  border-radius: 12px;
}

.creator-avatar-large {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: var(--gradient-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  font-weight: 700;
  color: white;
  flex-shrink: 0;
}

.creator-info {
  flex: 1;
}

.creator-name {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 8px 0;
}

.creator-description {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0 0 12px 0;
}

.creator-stats {
  display: flex;
  gap: 16px;
  font-size: 14px;
  color: var(--text-secondary);
}

.follow-creator-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: var(--gradient-primary);
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
  height: fit-content;
}

.follow-creator-btn.active {
  background: var(--dark-lighter);
  color: var(--text-primary);
}

.follow-creator-btn:hover {
  opacity: 0.8;
}

.latest-release-alert {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: var(--dark-light);
  border-radius: 12px;
  margin-bottom: 32px;
  border-left: 4px solid var(--primary);
}

.alert-icon {
  font-size: 32px;
}

.alert-content {
  flex: 1;
}

.alert-content h3 {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 4px 0;
}

.alert-content p {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0 0 4px 0;
}

.alert-time {
  font-size: 12px;
  color: var(--text-secondary);
}

.watch-btn {
  padding: 10px 20px;
  background: var(--gradient-primary);
  border: none;
  border-radius: 6px;
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
}

.watch-btn:hover {
  opacity: 0.8;
}

.releases-section,
.all-videos-section {
  margin-bottom: 40px;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 20px 0;
}

.videos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: var(--text-secondary);
  gap: 16px;
}

@media (max-width: 768px) {
  .creator-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .latest-release-alert {
    flex-direction: column;
    text-align: center;
  }
  
  .videos-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 16px;
  }
}
</style>

