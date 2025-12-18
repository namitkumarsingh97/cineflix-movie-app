<template>
  <router-link 
    :to="watchUrl" 
    class="youtube-video-card"
    @click="handleClick"
  >
    <div class="video-thumbnail-wrapper">
      <OptimizedImage
        :src="getThumbnail(movie)"
        :alt="movie.title"
        :loading="shouldPreloadThumbnails ? 'eager' : 'lazy'"
        :fetchpriority="shouldPreloadThumbnails ? 'high' : 'auto'"
        :blurhash="movie.blurhash"
        :sizes="'(max-width: 480px) 100vw, (max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw'"
        image-class="video-thumbnail-img"
        @error="handleThumbnailError"
      />
    </div>
    <div class="video-info-section">
      <div class="video-details">
        <h3 class="video-title-text" :title="movie.title">
          {{ movie.title }}
        </h3>
        <div class="video-meta-info">
          <span class="upload-time">{{ formatTimeAgo(movie.createdAt) }}</span>
        </div>
      </div>
    </div>
  </router-link>
</template>

<script setup>
import { computed } from "vue";
import { useNetworkQuality } from "../composables/useNetworkQuality";
import { getThumbnail } from "../utils/video";
import OptimizedImage from "./OptimizedImage.vue";

const { shouldPreloadThumbnails } = useNetworkQuality();

const props = defineProps({
	movie: {
		type: Object,
		required: true,
	},
	showChannel: {
		type: Boolean,
		default: false,
	},
});

const emit = defineEmits(["click"]);

// Generate watch URL for router-link
const watchUrl = computed(() => {
	if (!props.movie || !props.movie._id) return "/";
	return `/watch/${props.movie._id}`;
});

function handleClick(event) {
	// Allow right-click, middle-click, and modifier keys to work normally (open in new tab)
	// event.button: 0=left, 1=middle, 2=right
	if (
		event.button === 2 ||
		event.button === 1 ||
		event.ctrlKey ||
		event.metaKey ||
		event.shiftKey
	) {
		return; // Let the browser/router-link handle it naturally
	}
	// For regular left-click, emit the event
	// The router-link will handle navigation automatically
	emit("click", props.movie);
}

function handleThumbnailError(event) {
	event.target.style.display = "none";
	event.target.parentElement.style.background = "var(--gradient-hero)";
}

function formatTimeAgo(date) {
	if (!date) return "";
	const now = new Date();
	const uploadDate = new Date(date);
	const diffInSeconds = Math.floor((now - uploadDate) / 1000);

	if (diffInSeconds < 60) return "just now";
	if (diffInSeconds < 3600)
		return `${Math.floor(diffInSeconds / 60)} minutes ago`;
	if (diffInSeconds < 86400)
		return `${Math.floor(diffInSeconds / 3600)} hours ago`;
	if (diffInSeconds < 604800)
		return `${Math.floor(diffInSeconds / 86400)} days ago`;
	if (diffInSeconds < 2592000)
		return `${Math.floor(diffInSeconds / 604800)} weeks ago`;
	if (diffInSeconds < 31536000)
		return `${Math.floor(diffInSeconds / 2592000)} months ago`;
	return `${Math.floor(diffInSeconds / 31536000)} years ago`;
}

function getInitials(name) {
	if (!name) return "?";
	return name
		.split(" ")
		.map((word) => word[0])
		.join("")
		.toUpperCase()
		.slice(0, 2);
}
</script>

<style scoped>
.youtube-video-card {
  cursor: pointer;
  width: 100%;
  display: block;
  text-decoration: none;
  color: inherit;
}

.video-thumbnail-wrapper {
  position: relative;
  width: 100%;
  padding-top: 56.25%; /* 16:9 aspect ratio */
  background: var(--dark-lighter);
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 8px;
  height: 0;
}

.video-thumbnail-wrapper :deep(.optimized-image) {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.video-thumbnail-wrapper :deep(.optimized-image picture),
.video-thumbnail-wrapper :deep(.optimized-image img) {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.video-thumbnail-img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.video-info-section {
  display: flex;
  gap: 8px;
  min-height: 0;
}

.video-details {
  flex: 1;
  min-width: 0;
  width: 100%;
}

.video-title-text {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
  margin: 0 0 3px 0;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  max-height: 2.6em;
}

.video-meta-info {
  display: flex;
  flex-wrap: wrap;
  gap: 3px 6px;
  font-size: 11px;
  color: var(--text-secondary);
  line-height: 1.3;
}

.upload-time {
  display: inline-block;
}

@media (max-width: 768px) {
  .video-thumbnail-wrapper {
    border-radius: 6px;
    margin-bottom: 6px;
  }

  .video-title-text {
    font-size: 12px;
    margin-bottom: 2px;
  }
  
  .video-meta-info {
    font-size: 10px;
    gap: 2px 4px;
  }

  .video-info-section {
    gap: 6px;
  }
}
</style>

