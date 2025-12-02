<template>
  <div class="videos-page">
    <div class="videos-header">
      <h1 class="videos-title">
        <Video :size="32" />
        <span>Videos from S3</span>
      </h1>
      <p class="videos-subtitle">Watch videos directly from AWS S3 bucket</p>
    </div>

    <Loader v-if="loading" message="Loading videos..." />

    <div v-else-if="videos.length > 0" class="youtube-videos-grid">
      <VideoCard
        v-for="video in videos"
        :key="video.id"
        :video="video"
        @click="navigateToVideo"
      />
    </div>

    <div v-else class="empty-state">
      <Video :size="80" class="empty-icon" />
      <h3>No videos available</h3>
      <p>Videos will appear here once uploaded to S3 bucket</p>
    </div>

  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useVideos } from '../composables/useVideos';
import Loader from '../components/Loader.vue';
import VideoCard from '../components/VideoCard.vue';
import { Video } from 'lucide-vue-next';

const router = useRouter();
const { videos, loading, loadVideos } = useVideos();

function navigateToVideo(video) {
  router.push(`/watch/${video.id}`);
}

onMounted(() => {
  loadVideos();
});
</script>

<style scoped>
/* Styles are in global style.css - keeping existing styles from Videos.vue */
</style>

