<template>
  <div class="modern-video-player" :class="{ 'is-fullscreen': isFullscreen, 'is-pip': isPictureInPicture }" @mouseenter="showControls" @mouseleave="hideControls" @mousemove="showControls">
    <div class="video-container" ref="videoContainer">
      <!-- Video Element -->
      <video
        ref="videoElement"
        :src="isHls ? '' : videoSrc"
        :poster="poster"
        class="video-element"
        @loadedmetadata="onLoadedMetadata"
        @timeupdate="onTimeUpdate"
        @play="onPlay"
        @pause="onPause"
        @ended="onEnded"
        @volumechange="onVolumeChange"
        @waiting="onWaiting"
        @playing="onPlaying"
        @error="onError"
        @click="togglePlayPause"
      >
        <source v-for="source in sources" :key="source.src" :src="source.src" :type="source.type" />
        Your browser does not support the video tag.
      </video>

      <!-- Loading Spinner -->
      <div v-if="isLoading" class="loading-spinner">
        <div class="spinner"></div>
      </div>

      <!-- Controls Overlay -->
      <div class="controls-overlay" :class="{ 'controls-visible': controlsVisible || !isPlaying }">
        <!-- Top Controls Bar -->
        <div class="controls-top">
          <button 
            v-if="isVRSupported" 
            class="control-btn vr-btn" 
            @click="$emit('vr-click')" 
            :title="isVRActive ? 'Exit VR' : 'Enter VR'"
          >
            <span class="vr-icon">🥽</span>
          </button>
          <button class="control-btn pip-btn" @click="togglePictureInPicture" :title="isPictureInPicture ? 'Exit Picture-in-Picture' : 'Picture-in-Picture'">
            <PictureInPicture :size="20" />
          </button>
          <button class="control-btn fullscreen-btn" @click="toggleFullscreen" :title="isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'">
            <Maximize v-if="!isFullscreen" :size="20" />
            <Minimize v-else :size="20" />
          </button>
        </div>

        <!-- Center Play Button -->
        <div class="controls-center" v-if="!isPlaying">
          <button class="play-button-large" @click="togglePlayPause">
            <Play :size="48" fill="white" />
          </button>
        </div>

        <!-- Bottom Controls Bar -->
        <div class="controls-bottom">
          <!-- Progress Bar -->
          <div class="progress-container" @mousemove="onProgressHover" @mouseleave="hidePreview" @click="seekTo">
            <div class="progress-bar" :style="{ width: progressPercentage + '%' }">
              <div class="progress-loaded" :style="{ width: loadedPercentage + '%' }"></div>
              <div class="progress-handle" :style="{ left: progressPercentage + '%' }"></div>
            </div>
            <div v-if="previewTime" class="preview-tooltip" :style="{ left: previewPosition + '%' }">
              {{ formatTime(previewTime) }}
            </div>
          </div>

          <!-- Bottom Controls -->
          <div class="controls-row">
            <div class="controls-left">
              <button class="control-btn" @click="togglePlayPause" :title="isPlaying ? 'Pause' : 'Play'">
                <Pause v-if="isPlaying" :size="20" />
                <Play v-else :size="20" />
              </button>
              
              <div class="volume-control">
                <button class="control-btn" @click="toggleMute" :title="isMuted ? 'Unmute' : 'Mute'">
                  <Volume2 v-if="!isMuted && volume > 0" :size="20" />
                  <Volume1 v-else-if="!isMuted && volume > 0" :size="20" />
                  <VolumeX v-else :size="20" />
                </button>
                <div class="volume-slider-container" @mouseenter="showVolumeSlider = true" @mouseleave="showVolumeSlider = false">
                  <input
                    type="range"
                    v-model.number="volume"
                    min="0"
                    max="1"
                    step="0.01"
                    class="volume-slider"
                    :class="{ 'slider-visible': showVolumeSlider }"
                    @input="onVolumeChange"
                  />
                </div>
              </div>

              <div class="time-display">
                <span>{{ formatTime(currentTime) }}</span>
                <span class="time-separator">/</span>
                <span>{{ formatTime(duration) }}</span>
              </div>
            </div>

            <div class="controls-right">
              <!-- Playback Speed -->
              <div class="speed-control">
                <button class="control-btn" @click="showSpeedMenu = !showSpeedMenu" :title="`Speed: ${playbackSpeed}x`">
                  <span class="speed-label">{{ playbackSpeed }}x</span>
                </button>
                <div v-if="showSpeedMenu" class="speed-menu">
                  <button
                    v-for="speed in playbackSpeeds"
                    :key="speed"
                    class="speed-option"
                    :class="{ active: playbackSpeed === speed }"
                    @click="setPlaybackSpeed(speed)"
                  >
                    {{ speed }}x
                  </button>
                </div>
              </div>

              <!-- Quality Selector (if multiple sources) -->
              <div v-if="sources.length > 1" class="quality-control">
                <button class="control-btn" @click="showQualityMenu = !showQualityMenu" :title="`Quality: ${currentQuality}`">
                  <span class="quality-label">{{ currentQuality }}</span>
                </button>
                <div v-if="showQualityMenu" class="quality-menu">
                  <button
                    v-for="source in sources"
                    :key="source.src"
                    class="quality-option"
                    :class="{ active: currentQuality === source.quality }"
                    @click="setQuality(source)"
                  >
                    {{ source.quality }}
                  </button>
                </div>
              </div>

              <!-- Settings Menu -->
              <div class="settings-control">
                <button class="control-btn" @click="showSettingsMenu = !showSettingsMenu" title="Settings">
                  <Settings :size="20" />
                </button>
                <div v-if="showSettingsMenu" class="settings-menu">
                  <div class="settings-section">
                    <label>Playback Speed</label>
                    <div class="settings-options">
                      <button
                        v-for="speed in playbackSpeeds"
                        :key="speed"
                        class="settings-option"
                        :class="{ active: playbackSpeed === speed }"
                        @click="setPlaybackSpeed(speed)"
                      >
                        {{ speed }}x
                      </button>
                    </div>
                  </div>
                  <div v-if="sources.length > 1" class="settings-section">
                    <label>Quality</label>
                    <div class="settings-options">
                      <button
                        v-for="source in sources"
                        :key="source.src"
                        class="settings-option"
                        :class="{ active: currentQuality === source.quality }"
                        @click="setQuality(source)"
                      >
                        {{ source.quality }}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
	computed,
	nextTick,
	onBeforeUnmount,
	onMounted,
	ref,
	watch,
} from "vue";

// Lazy load HLS.js only when needed (saves 1MB+ on initial load)
let Hls = null;
const loadHls = async () => {
	if (!Hls) {
		const hlsModule = await import("hls.js");
		Hls = hlsModule.default;
	}
	return Hls;
};

import {
	Maximize,
	Minimize,
	Pause,
	PictureInPicture,
	Play,
	Settings,
	Volume1,
	Volume2,
	VolumeX,
} from "lucide-vue-next";

const props = defineProps({
	src: {
		type: String,
		required: true,
	},
	poster: {
		type: String,
		default: "",
	},
	sources: {
		type: Array,
		default: () => [],
	},
	autoplay: {
		type: Boolean,
		default: false,
	},
	muted: {
		type: Boolean,
		default: false,
	},
	loop: {
		type: Boolean,
		default: false,
	},
});

const emit = defineEmits([
	"play",
	"pause",
	"ended",
	"timeupdate",
	"volumechange",
	"fullscreenchange",
	"error",
]);

const videoElement = ref(null);
const videoContainer = ref(null);
const videoSrc = computed(() => props.src);
const hlsInstance = ref(null);
const isHls = computed(() => props.isHls);

// State
const isPlaying = ref(false);
const isLoading = ref(false);
const isMuted = ref(props.muted);
const volume = ref(props.muted ? 0 : 1);
const currentTime = ref(0);
const duration = ref(0);
const loadedPercentage = ref(0);
const isFullscreen = ref(false);
const isPictureInPicture = ref(false);
const controlsVisible = ref(true);
const controlsTimeout = ref(null);
const playbackSpeed = ref(1);
const currentQuality = ref("Auto");
const showSpeedMenu = ref(false);
const showQualityMenu = ref(false);
const showSettingsMenu = ref(false);
const showVolumeSlider = ref(false);
const previewTime = ref(null);
const previewPosition = ref(0);

const playbackSpeeds = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

const progressPercentage = computed(() => {
	if (duration.value === 0) return 0;
	return (currentTime.value / duration.value) * 100;
});

// Format time helper
function formatTime(seconds) {
	if (!seconds || isNaN(seconds)) return "0:00";
	const hours = Math.floor(seconds / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);
	const secs = Math.floor(seconds % 60);

	if (hours > 0) {
		return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
	}
	return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

// Setup HLS if needed
async function setupHls() {
	if (!props.isHls || !videoElement.value || !props.src) return;

	const HlsClass = await loadHls();
	if (HlsClass.isSupported()) {
		destroyHls();
		hlsInstance.value = new HlsClass({
			enableWorker: true,
			lowLatencyMode: true,
			backBufferLength: 30,
			maxBufferLength: 6,
			maxMaxBufferLength: 10,
		});

		hlsInstance.value.loadSource(props.src);
		hlsInstance.value.attachMedia(videoElement.value);

		hlsInstance.value.on(HlsClass.Events.ERROR, (event, data) => {
			if (data.fatal) {
				switch (data.type) {
					case HlsClass.ErrorTypes.NETWORK_ERROR:
						hlsInstance.value.startLoad();
						break;
					case HlsClass.ErrorTypes.MEDIA_ERROR:
						hlsInstance.value.recoverMediaError();
						break;
					default:
						destroyHls();
						break;
				}
			}
		});
	} else if (videoElement.value.canPlayType("application/vnd.apple.mpegurl")) {
		// Safari native HLS support
		videoElement.value.src = props.src;
	}
}

function destroyHls() {
	if (hlsInstance.value) {
		hlsInstance.value.destroy();
		hlsInstance.value = null;
	}
}

// Video event handlers
function onLoadedMetadata() {
	if (videoElement.value) {
		duration.value = videoElement.value.duration;
		videoElement.value.volume = volume.value;
		videoElement.value.muted = isMuted.value;
		videoElement.value.playbackRate = playbackSpeed.value;
	}
}

function onTimeUpdate() {
	if (videoElement.value) {
		currentTime.value = videoElement.value.currentTime;
		const buffered = videoElement.value.buffered;
		if (buffered.length > 0 && duration.value > 0) {
			loadedPercentage.value =
				(buffered.end(buffered.length - 1) / duration.value) * 100;
		}
		emit("timeupdate", currentTime.value);
	}
}

function onPlay() {
	isPlaying.value = true;
	emit("play");
}

function onPause() {
	isPlaying.value = false;
	emit("pause");
}

function onEnded() {
	isPlaying.value = false;
	emit("ended");
}

function onVolumeChange() {
	if (videoElement.value) {
		volume.value = videoElement.value.volume;
		isMuted.value = videoElement.value.muted;
		emit("volumechange", { volume: volume.value, muted: isMuted.value });
	}
}

function onWaiting() {
	isLoading.value = true;
}

function onPlaying() {
	isLoading.value = false;
}

function onError(event) {
	console.error("Video playback error:", event);
	isLoading.value = false;
	if (event && event.target && event.target.error) {
		const error = event.target.error;
		console.error("Video error details:", {
			code: error.code,
			message: error.message,
		});
	}
	emit("error", event);
}

// Control functions
function togglePlayPause() {
	if (!videoElement.value) return;
	if (isPlaying.value) {
		videoElement.value.pause();
	} else {
		videoElement.value.play();
	}
}

function toggleMute() {
	if (!videoElement.value) return;
	videoElement.value.muted = !videoElement.value.muted;
	isMuted.value = videoElement.value.muted;
	if (!isMuted.value && volume.value === 0) {
		volume.value = 0.5;
		videoElement.value.volume = 0.5;
	}
}

function seekTo(event) {
	if (!videoElement.value || !duration.value) return;
	const rect = event.currentTarget.getBoundingClientRect();
	const percent = (event.clientX - rect.left) / rect.width;
	const newTime = percent * duration.value;
	videoElement.value.currentTime = newTime;
	currentTime.value = newTime;
}

function onProgressHover(event) {
	if (!duration.value) return;
	const rect = event.currentTarget.getBoundingClientRect();
	const percent = (event.clientX - rect.left) / rect.width;
	previewPosition.value = percent * 100;
	previewTime.value = percent * duration.value;
}

function hidePreview() {
	previewTime.value = null;
}

function setPlaybackSpeed(speed) {
	playbackSpeed.value = speed;
	if (videoElement.value) {
		videoElement.value.playbackRate = speed;
	}
	showSpeedMenu.value = false;
	showSettingsMenu.value = false;
}

function setQuality(source) {
	if (videoElement.value && source.src) {
		videoElement.value.src = source.src;
		currentQuality.value = source.quality || "Auto";
		videoElement.value.load();
	}
	showQualityMenu.value = false;
	showSettingsMenu.value = false;
}

async function toggleFullscreen() {
	if (!videoContainer.value) return;

	try {
		if (!isFullscreen.value) {
			if (videoContainer.value.requestFullscreen) {
				await videoContainer.value.requestFullscreen();
			} else if (videoContainer.value.webkitRequestFullscreen) {
				await videoContainer.value.webkitRequestFullscreen();
			} else if (videoContainer.value.mozRequestFullScreen) {
				await videoContainer.value.mozRequestFullScreen();
			} else if (videoContainer.value.msRequestFullscreen) {
				await videoContainer.value.msRequestFullscreen();
			}
		} else {
			if (document.exitFullscreen) {
				await document.exitFullscreen();
			} else if (document.webkitExitFullscreen) {
				await document.webkitExitFullscreen();
			} else if (document.mozCancelFullScreen) {
				await document.mozCancelFullScreen();
			} else if (document.msExitFullscreen) {
				await document.msExitFullscreen();
			}
		}
	} catch (error) {
		console.error("Fullscreen error:", error);
	}
}

async function togglePictureInPicture() {
	if (!videoElement.value) return;

	try {
		if (isPictureInPicture.value) {
			await document.exitPictureInPicture();
		} else {
			await videoElement.value.requestPictureInPicture();
		}
	} catch (error) {
		console.error("Picture-in-Picture error:", error);
	}
}

function showControls() {
	controlsVisible.value = true;
	if (controlsTimeout.value) {
		clearTimeout(controlsTimeout.value);
	}
	if (isPlaying.value) {
		controlsTimeout.value = setTimeout(() => {
			controlsVisible.value = false;
		}, 3000);
	}
}

function hideControls() {
	if (isPlaying.value) {
		controlsTimeout.value = setTimeout(() => {
			controlsVisible.value = false;
		}, 2000);
	}
}

// Fullscreen change handlers
function handleFullscreenChange() {
	isFullscreen.value = !!(
		document.fullscreenElement ||
		document.webkitFullscreenElement ||
		document.mozFullScreenElement ||
		document.msFullscreenElement
	);
	emit("fullscreenchange", isFullscreen.value);
}

function handlePictureInPictureChange() {
	isPictureInPicture.value = !!document.pictureInPictureElement;
}

// Keyboard controls
function handleKeyDown(event) {
	if (!videoElement.value) return;

	// Don't handle if user is typing in an input
	if (event.target.tagName === "INPUT" || event.target.tagName === "TEXTAREA")
		return;

	switch (event.key.toLowerCase()) {
		case " ":
		case "k":
			event.preventDefault();
			togglePlayPause();
			break;
		case "arrowleft":
			event.preventDefault();
			videoElement.value.currentTime = Math.max(0, currentTime.value - 10);
			break;
		case "arrowright":
			event.preventDefault();
			videoElement.value.currentTime = Math.min(
				duration.value,
				currentTime.value + 10,
			);
			break;
		case "arrowup":
			event.preventDefault();
			volume.value = Math.min(1, volume.value + 0.1);
			videoElement.value.volume = volume.value;
			break;
		case "arrowdown":
			event.preventDefault();
			volume.value = Math.max(0, volume.value - 0.1);
			videoElement.value.volume = volume.value;
			break;
		case "m":
			event.preventDefault();
			toggleMute();
			break;
		case "f":
			event.preventDefault();
			toggleFullscreen();
			break;
		case "p":
			event.preventDefault();
			togglePictureInPicture();
			break;
	}
}

// Watch for prop changes
watch(
	() => props.autoplay,
	(newVal) => {
		if (newVal && videoElement.value) {
			videoElement.value.play();
		}
	},
);

watch(
	() => props.muted,
	(newVal) => {
		if (videoElement.value) {
			videoElement.value.muted = newVal;
			isMuted.value = newVal;
		}
	},
);

watch(
	() => props.src,
	() => {
		if (props.isHls) {
			setupHls().catch((err) => console.error("HLS setup error:", err));
		}
	},
);

watch(
	() => props.isHls,
	() => {
		if (props.isHls) {
			setupHls().catch((err) => console.error("HLS setup error:", err));
		} else {
			destroyHls();
		}
	},
);

onMounted(() => {
	document.addEventListener("fullscreenchange", handleFullscreenChange);
	document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
	document.addEventListener("mozfullscreenchange", handleFullscreenChange);
	document.addEventListener("MSFullscreenChange", handleFullscreenChange);
	document.addEventListener(
		"enterpictureinpicture",
		handlePictureInPictureChange,
	);
	document.addEventListener(
		"leavepictureinpicture",
		handlePictureInPictureChange,
	);
	document.addEventListener("keydown", handleKeyDown);

	if (props.isHls) {
		nextTick(() => {
			setupHls().catch((err) => console.error("HLS setup error:", err));
		});
	}

	if (props.autoplay && videoElement.value) {
		nextTick(() => {
			videoElement.value?.play();
		});
	}
});

onBeforeUnmount(() => {
	destroyHls();
	document.removeEventListener("fullscreenchange", handleFullscreenChange);
	document.removeEventListener(
		"webkitfullscreenchange",
		handleFullscreenChange,
	);
	document.removeEventListener("mozfullscreenchange", handleFullscreenChange);
	document.removeEventListener("MSFullscreenChange", handleFullscreenChange);
	document.removeEventListener(
		"enterpictureinpicture",
		handlePictureInPictureChange,
	);
	document.removeEventListener(
		"leavepictureinpicture",
		handlePictureInPictureChange,
	);
	document.removeEventListener("keydown", handleKeyDown);

	if (controlsTimeout.value) {
		clearTimeout(controlsTimeout.value);
	}
});
</script>

<style scoped>
.modern-video-player {
  position: relative;
  width: 100%;
  height: 100%;
  background: #000;
  border-radius: inherit;
  overflow: hidden;
  user-select: none;
  display: block;
}

.video-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.video-element {
  width: 100%;
  height: 100%;
  object-fit: contain;
  outline: none;
}

.loading-spinner {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 10;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid rgba(255, 255, 255, 0.2);
  border-top-color: var(--primary, #ff4500);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.controls-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8) 0%, transparent 30%, transparent 70%, rgba(0, 0, 0, 0.8) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
  z-index: 20;
}

.controls-overlay.controls-visible {
  opacity: 1;
  pointer-events: all;
}

.controls-top {
  position: absolute;
  top: 16px;
  right: 16px;
  display: flex;
  gap: 8px;
  z-index: 21;
}

.controls-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 21;
}

.play-button-large {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.6);
  border: 3px solid white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.play-button-large:hover {
  background: rgba(0, 0, 0, 0.8);
  transform: scale(1.1);
}

.controls-bottom {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px;
  z-index: 21;
}

.progress-container {
  position: relative;
  width: 100%;
  height: 6px;
  margin-bottom: 12px;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

.progress-bar {
  position: relative;
  height: 100%;
  background: var(--primary, #ff4500);
  border-radius: 3px;
  transition: width 0.1s linear;
}

.progress-loaded {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: rgba(255, 255, 255, 0.4);
  border-radius: 3px;
  transition: width 0.1s linear;
}

.progress-handle {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 14px;
  height: 14px;
  background: var(--primary, #ff4500);
  border: 2px solid white;
  border-radius: 50%;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.progress-container:hover .progress-handle {
  opacity: 1;
}

.preview-tooltip {
  position: absolute;
  bottom: 20px;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  pointer-events: none;
}

.controls-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.controls-left,
.controls-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.control-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: transparent;
  border: none;
  color: white;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.control-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.volume-control {
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
}

.volume-slider-container {
  position: relative;
}

.volume-slider {
  width: 0;
  height: 4px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
  outline: none;
  transition: width 0.3s ease, opacity 0.3s ease;
  opacity: 0;
  cursor: pointer;
}

.volume-slider.slider-visible {
  width: 80px;
  opacity: 1;
}

.volume-slider::-webkit-slider-thumb {
  appearance: none;
  width: 12px;
  height: 12px;
  background: var(--primary, #ff4500);
  border-radius: 50%;
  cursor: pointer;
}

.volume-slider::-moz-range-thumb {
  width: 12px;
  height: 12px;
  background: var(--primary, #ff4500);
  border: none;
  border-radius: 50%;
  cursor: pointer;
}

.time-display {
  display: flex;
  align-items: center;
  gap: 4px;
  color: white;
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
}

.time-separator {
  opacity: 0.7;
}

.speed-control,
.quality-control,
.settings-control {
  position: relative;
}

.speed-label,
.quality-label {
  font-size: 14px;
  font-weight: 500;
  color: white;
}

.speed-menu,
.quality-menu,
.settings-menu {
  position: absolute;
  bottom: 100%;
  right: 0;
  margin-bottom: 8px;
  background: rgba(0, 0, 0, 0.95);
  border-radius: 8px;
  padding: 8px;
  min-width: 120px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
  z-index: 30;
}

.speed-option,
.quality-option {
  display: block;
  width: 100%;
  padding: 8px 12px;
  background: transparent;
  border: none;
  color: white;
  text-align: left;
  cursor: pointer;
  border-radius: 4px;
  transition: background 0.2s ease;
  font-size: 14px;
}

.speed-option:hover,
.quality-option:hover {
  background: rgba(255, 255, 255, 0.1);
}

.speed-option.active,
.quality-option.active {
  background: var(--primary, #ff4500);
  color: white;
}

.settings-menu {
  min-width: 200px;
}

.settings-section {
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.settings-section:last-child {
  border-bottom: none;
}

.settings-section label {
  display: block;
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.settings-options {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.settings-option {
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s ease;
}

.settings-option:hover {
  background: rgba(255, 255, 255, 0.2);
}

.settings-option.active {
  background: var(--primary, #ff4500);
  color: white;
}

.modern-video-player.is-fullscreen {
  border-radius: 0;
}

.modern-video-player.is-fullscreen .video-container {
  height: 100vh;
}

/* Responsive */
@media (max-width: 768px) {
  .controls-bottom {
    padding: 12px;
  }

  .control-btn {
    width: 36px;
    height: 36px;
  }

  .play-button-large {
    width: 64px;
    height: 64px;
  }

  .time-display {
    font-size: 12px;
  }

  .speed-menu,
  .quality-menu,
  .settings-menu {
    min-width: 100px;
    font-size: 13px;
  }
}
</style>

