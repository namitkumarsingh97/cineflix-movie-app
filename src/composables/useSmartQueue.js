import { computed, ref, watch } from "vue";
import { useWatchHistory } from "./useWatchHistory";

/**
 * Smart Queue - AI-powered predictive pre-loading system
 * Predicts what videos user will watch next and pre-loads them
 */
export function useSmartQueue() {
	const { getHistory } = useWatchHistory();

	// Get favorites from localStorage
	const getFavorites = () => {
		try {
			const favs = localStorage.getItem("favorites");
			return favs ? JSON.parse(favs) : [];
		} catch (error) {
			console.error("Error reading favorites:", error);
			return [];
		}
	};

	const predictedVideos = ref([]);
	const preloadingVideos = ref([]);
	const preloadCache = ref(new Map()); // Cache for pre-loaded videos
	const isPreloading = ref(false);
	const userPreferences = ref({
		favoriteCategories: [],
		watchPatterns: [],
		peakViewingTimes: [],
		averageWatchDuration: 0,
	});

	/**
	 * Analyze user behavior to predict next videos
	 */
	function analyzeUserBehavior() {
		const history = getHistory();
		const favs = getFavorites();

		// Extract favorite categories from history
		const categoryFrequency = new Map();
		const watchTimes = [];
		const viewingTimes = [];

		history.forEach((item) => {
			// Count category frequency
			if (item.category) {
				categoryFrequency.set(
					item.category,
					(categoryFrequency.get(item.category) || 0) + 1,
				);
			}

			// Track watch duration (if available)
			if (item.duration) {
				watchTimes.push(item.duration);
			}

			// Track viewing time of day
			if (item.watchedAt) {
				const hour = new Date(item.watchedAt).getHours();
				viewingTimes.push(hour);
			}
		});

		// Get top 3 favorite categories
		const topCategories = Array.from(categoryFrequency.entries())
			.sort((a, b) => b[1] - a[1])
			.slice(0, 3)
			.map(([category]) => category);

		// Calculate average watch duration
		const avgDuration =
			watchTimes.length > 0
				? watchTimes.reduce((a, b) => a + b, 0) / watchTimes.length
				: 0;

		// Find peak viewing hours
		const hourFrequency = new Map();
		viewingTimes.forEach((hour) => {
			hourFrequency.set(hour, (hourFrequency.get(hour) || 0) + 1);
		});
		const peakHours = Array.from(hourFrequency.entries())
			.sort((a, b) => b[1] - a[1])
			.slice(0, 3)
			.map(([hour]) => hour);

		userPreferences.value = {
			favoriteCategories: topCategories,
			watchPatterns: history.slice(-10), // Last 10 watched items
			peakViewingTimes: peakHours,
			averageWatchDuration: avgDuration,
		};
	}

	/**
	 * Predict next videos user will watch
	 * @param {Object} currentVideo - Currently watching video
	 * @param {Array} availableVideos - Pool of available videos
	 * @param {number} count - Number of videos to predict (default: 3)
	 */
	function predictNextVideos(currentVideo, availableVideos, count = 3) {
		if (!currentVideo || !availableVideos || availableVideos.length === 0) {
			return [];
		}

		analyzeUserBehavior();

		const predictions = [];
		const scoredVideos = availableVideos.map((video) => {
			let score = 0;

			// Score based on category match
			if (currentVideo.categories && video.categories) {
				const commonCategories = currentVideo.categories.filter((cat) =>
					video.categories.includes(cat),
				);
				score += commonCategories.length * 10;
			}

			// Score based on user's favorite categories
			if (
				video.category &&
				userPreferences.value.favoriteCategories.includes(video.category)
			) {
				score += 15;
			}

			// Score based on similar tags
			if (currentVideo.tags && video.tags) {
				const commonTags = currentVideo.tags.filter(
					(tag) => video.tags && video.tags.includes(tag),
				);
				score += commonTags.length * 5;
			}

			// Score based on recent watch patterns
			const recentPattern = userPreferences.value.watchPatterns.find(
				(item) => item.category === video.category,
			);
			if (recentPattern) {
				score += 8;
			}

			// Score based on popularity (views)
			if (video.views) {
				score += Math.log10(video.views + 1) * 2;
			}

			// Penalty for already watched videos
			const history = getHistory();
			if (
				history.some((item) => item.id === video.id || item.id === video._id)
			) {
				score -= 5;
			}

			// Bonus for favorites
			const favs = getFavorites();
			if (favs.some((fav) => fav.id === video.id || fav.id === video._id)) {
				score += 20;
			}

			return { video, score };
		});

		// Sort by score and get top predictions
		scoredVideos
			.sort((a, b) => b.score - a.score)
			.slice(0, count)
			.forEach(({ video }) => {
				predictions.push(video);
			});

		predictedVideos.value = predictions;
		return predictions;
	}

	/**
	 * Pre-load video metadata and prepare for instant playback
	 * @param {Object} video - Video to pre-load
	 */
	async function preloadVideo(video) {
		if (!video || !video.url) return;

		// Check if already cached
		if (preloadCache.value.has(video.id || video._id)) {
			return preloadCache.value.get(video.id || video._id);
		}

		try {
			isPreloading.value = true;

			// Pre-fetch video metadata
			const videoData = {
				id: video.id || video._id,
				url: video.url,
				thumbnail: video.thumbnail,
				title: video.title,
				duration: video.duration,
				preloadedAt: Date.now(),
			};

			// For direct video URLs, create a link element to preload
			if (
				video.url &&
				(video.url.endsWith(".mp4") ||
					video.url.endsWith(".webm") ||
					video.url.includes(".m3u8"))
			) {
				const link = document.createElement("link");
				link.rel = "prefetch";
				link.href = video.url;
				link.as = "video";
				document.head.appendChild(link);
			}

			// Cache the video data
			preloadCache.value.set(video.id || video._id, videoData);
			preloadingVideos.value.push(videoData);

			return videoData;
		} catch (error) {
			console.error("Error preloading video:", error);
			return null;
		} finally {
			isPreloading.value = false;
		}
	}

	/**
	 * Pre-load predicted videos
	 * @param {Array} videos - Videos to pre-load
	 */
	async function preloadPredictedVideos(videos) {
		if (!videos || videos.length === 0) return;

		// Pre-load up to 3 videos (to avoid excessive bandwidth usage)
		const videosToPreload = videos.slice(0, 3);

		// Check user's network quality preference
		const networkQuality = navigator.connection?.effectiveType || "4g";
		const shouldPreload =
			networkQuality !== "slow-2g" && networkQuality !== "2g";

		if (!shouldPreload) {
			console.log("Skipping preload due to slow network");
			return;
		}

		// Pre-load videos sequentially to avoid overwhelming the network
		for (const video of videosToPreload) {
			await preloadVideo(video);
			// Small delay between preloads
			await new Promise((resolve) => setTimeout(resolve, 500));
		}
	}

	/**
	 * Get pre-loaded video if available
	 * @param {string} videoId - Video ID
	 */
	function getPreloadedVideo(videoId) {
		return preloadCache.value.get(videoId);
	}

	/**
	 * Clear preload cache (useful for memory management)
	 */
	function clearPreloadCache() {
		preloadCache.value.clear();
		preloadingVideos.value = [];
	}

	/**
	 * Initialize smart queue when video starts playing
	 * @param {Object} currentVideo - Currently playing video
	 * @param {Array} availableVideos - Available videos pool
	 */
	async function initializeSmartQueue(currentVideo, availableVideos) {
		if (!currentVideo || !availableVideos) return;

		// Predict next videos
		const predictions = predictNextVideos(currentVideo, availableVideos, 3);

		// Pre-load predicted videos
		await preloadPredictedVideos(predictions);
	}

	return {
		predictedVideos: computed(() => predictedVideos.value),
		preloadingVideos: computed(() => preloadingVideos.value),
		isPreloading: computed(() => isPreloading.value),
		userPreferences: computed(() => userPreferences.value),
		predictNextVideos,
		preloadVideo,
		preloadPredictedVideos,
		getPreloadedVideo,
		clearPreloadCache,
		initializeSmartQueue,
		analyzeUserBehavior,
	};
}
