import { computed, ref } from "vue";
import { useFavorites, useWatchHistory } from "./useWatchHistory";

/**
 * Mood-Based Video Sequencing
 * Creates intelligent playlists based on user mood, time of day, and viewing patterns
 */
export function useMoodSequencing() {
	const { getWatchHistory } = useWatchHistory();
	const { getFavorites } = useFavorites();

	const currentMood = ref(null);
	const moodPlaylist = ref([]);
	const moodHistory = ref([]);

	// Mood definitions
	const moodTypes = {
		energetic: {
			name: "Energetic",
			icon: "⚡",
			description: "High-energy, intense content",
			categories: ["hardcore", "intense", "rough", "action"],
			timeOfDay: ["evening", "night"],
			intensity: "high",
		},
		relaxed: {
			name: "Relaxed",
			icon: "🌙",
			description: "Gentle, soothing content",
			categories: ["romantic", "soft", "sensual", "massage"],
			timeOfDay: ["night", "late-night"],
			intensity: "low",
		},
		adventurous: {
			name: "Adventurous",
			icon: "🏔️",
			description: "Exploratory, diverse content",
			categories: ["outdoor", "public", "adventure", "fetish"],
			timeOfDay: ["afternoon", "evening"],
			intensity: "medium",
		},
		focused: {
			name: "Focused",
			icon: "🎯",
			description: "Specific, targeted content",
			categories: [], // User's favorite categories
			timeOfDay: ["any"],
			intensity: "medium",
		},
		nostalgic: {
			name: "Nostalgic",
			icon: "📼",
			description: "Classic, familiar content",
			categories: ["vintage", "classic", "retro"],
			timeOfDay: ["any"],
			intensity: "medium",
		},
	};

	/**
	 * Detect current mood based on various factors
	 */
	function detectMood(factors = {}) {
		const {
			timeOfDay = getTimeOfDay(),
			recentWatchHistory = getWatchHistory().slice(0, 10),
			currentCategory = null,
			userInput = null,
		} = factors;

		// If user explicitly sets mood, use that
		if (userInput && moodTypes[userInput]) {
			currentMood.value = userInput;
			return userInput;
		}

		// Analyze recent viewing patterns
		const recentCategories = recentWatchHistory
			.map((item) => item.category)
			.filter(Boolean);

		const categoryFrequency = {};
		recentCategories.forEach((cat) => {
			categoryFrequency[cat] = (categoryFrequency[cat] || 0) + 1;
		});

		// Score each mood based on factors
		const moodScores = {};

		Object.keys(moodTypes).forEach((moodKey) => {
			const mood = moodTypes[moodKey];
			let score = 0;

			// Time of day match
			if (
				mood.timeOfDay.includes(timeOfDay) ||
				mood.timeOfDay.includes("any")
			) {
				score += 3;
			}

			// Category match
			mood.categories.forEach((category) => {
				if (categoryFrequency[category]) {
					score += categoryFrequency[category] * 2;
				}
			});

			// Current category match
			if (currentCategory && mood.categories.includes(currentCategory)) {
				score += 5;
			}

			moodScores[moodKey] = score;
		});

		// Select mood with highest score
		const detectedMood = Object.keys(moodScores).reduce((a, b) =>
			moodScores[a] > moodScores[b] ? a : b,
		);

		currentMood.value = detectedMood;

		// Save to history
		moodHistory.value.push({
			mood: detectedMood,
			timestamp: new Date().toISOString(),
			factors,
		});

		return detectedMood;
	}

	/**
	 * Get time of day
	 */
	function getTimeOfDay() {
		const hour = new Date().getHours();
		if (hour >= 5 && hour < 12) return "morning";
		if (hour >= 12 && hour < 17) return "afternoon";
		if (hour >= 17 && hour < 22) return "evening";
		return "night";
	}

	/**
	 * Generate mood-based playlist
	 */
	function generateMoodPlaylist(availableVideos, options = {}) {
		const {
			mood = currentMood.value || detectMood(),
			maxVideos = 20,
			duration = null, // Target total duration in seconds
		} = options;

		if (!mood || !moodTypes[mood]) {
			console.warn("Invalid mood:", mood);
			return [];
		}

		const moodConfig = moodTypes[mood];
		const playlist = [];
		const scoredVideos = [];

		// Score each video based on mood
		availableVideos.forEach((video) => {
			let score = 0;
			const videoCategories = (video.categories || []).map((c) =>
				c.toLowerCase(),
			);
			const videoTitle = (video.title || "").toLowerCase();

			// Category match
			moodConfig.categories.forEach((category) => {
				if (videoCategories.includes(category.toLowerCase())) {
					score += 10;
				}
				if (videoTitle.includes(category.toLowerCase())) {
					score += 5;
				}
			});

			// Intensity match
			if (
				moodConfig.intensity === "high" &&
				videoCategories.some((c) =>
					["hardcore", "intense", "rough"].includes(c),
				)
			) {
				score += 8;
			}
			if (
				moodConfig.intensity === "low" &&
				videoCategories.some((c) => ["romantic", "soft", "sensual"].includes(c))
			) {
				score += 8;
			}

			// User favorites boost
			const favorites = getFavorites();
			if (favorites.some((f) => f.id === video.id || f.id === video._id)) {
				score += 15;
			}

			// Recent watch penalty (avoid showing recently watched)
			const history = getWatchHistory();
			const recentlyWatched = history
				.slice(0, 5)
				.some((h) => h.id === video.id || h.id === video._id);
			if (recentlyWatched) {
				score -= 10;
			}

			// Duration preference (if specified)
			if (duration && video.duration) {
				const idealDuration = duration / maxVideos;
				const durationDiff = Math.abs(video.duration - idealDuration);
				score -= durationDiff / 10; // Penalize videos that don't fit duration
			}

			scoredVideos.push({ video, score });
		});

		// Sort by score and select top videos
		scoredVideos
			.sort((a, b) => b.score - a.score)
			.slice(0, maxVideos)
			.forEach(({ video }) => {
				playlist.push(video);
			});

		// Ensure smooth flow between videos
		const sequencedPlaylist = optimizePlaylistFlow(playlist, mood);

		moodPlaylist.value = sequencedPlaylist;
		return sequencedPlaylist;
	}

	/**
	 * Optimize playlist flow for smooth transitions
	 */
	function optimizePlaylistFlow(playlist, mood) {
		if (playlist.length <= 1) return playlist;

		const optimized = [playlist[0]]; // Start with highest scored
		const remaining = [...playlist.slice(1)];

		while (remaining.length > 0) {
			const lastVideo = optimized[optimized.length - 1];
			const lastCategories = (lastVideo.categories || []).map((c) =>
				c.toLowerCase(),
			);

			// Find next video with smooth transition
			let bestMatch = null;
			let bestScore = -1;
			let bestIndex = -1;

			remaining.forEach((video, index) => {
				const videoCategories = (video.categories || []).map((c) =>
					c.toLowerCase(),
				);

				// Calculate transition score
				let transitionScore = 0;

				// Shared categories = smooth transition
				const sharedCategories = lastCategories.filter((c) =>
					videoCategories.includes(c),
				);
				transitionScore += sharedCategories.length * 5;

				// Similar intensity = smooth transition
				const lastIntensity = getIntensity(lastCategories);
				const videoIntensity = getIntensity(videoCategories);
				if (lastIntensity === videoIntensity) {
					transitionScore += 10;
				}

				// Gradual intensity change = smooth transition
				const intensityDiff = Math.abs(
					["low", "medium", "high"].indexOf(lastIntensity) -
						["low", "medium", "high"].indexOf(videoIntensity),
				);
				if (intensityDiff === 1) {
					transitionScore += 5;
				}

				if (transitionScore > bestScore) {
					bestScore = transitionScore;
					bestMatch = video;
					bestIndex = index;
				}
			});

			if (bestMatch) {
				optimized.push(bestMatch);
				remaining.splice(bestIndex, 1);
			} else {
				// No good transition, just add next one
				optimized.push(remaining.shift());
			}
		}

		return optimized;
	}

	/**
	 * Get intensity level from categories
	 */
	function getIntensity(categories) {
		if (categories.some((c) => ["hardcore", "intense", "rough"].includes(c))) {
			return "high";
		}
		if (categories.some((c) => ["romantic", "soft", "sensual"].includes(c))) {
			return "low";
		}
		return "medium";
	}

	/**
	 * Create "Mood Mix" - endless playlist that adapts
	 */
	function createMoodMix(availableVideos, options = {}) {
		const { initialMood = detectMood(), adaptInRealTime = true } = options;

		// Generate initial playlist
		const playlist = generateMoodPlaylist(availableVideos, {
			mood: initialMood,
			maxVideos: 30,
		});

		// If real-time adaptation is enabled, the playlist will adapt as user watches
		if (adaptInRealTime) {
			// This would be called periodically as user watches
			// For now, we return the initial playlist
		}

		return playlist;
	}

	/**
	 * Adapt playlist based on user's current viewing behavior
	 */
	function adaptPlaylist(playlist, userBehavior) {
		const {
			skippedVideos = [],
			watchedVideos = [],
			currentVideo = null,
		} = userBehavior;

		// Remove skipped videos from playlist
		const filtered = playlist.filter(
			(video) =>
				!skippedVideos.some(
					(skipped) => skipped.id === video.id || skipped.id === video._id,
				),
		);

		// Re-detect mood based on what user is actually watching
		if (watchedVideos.length > 0) {
			const newMood = detectMood({
				recentWatchHistory: watchedVideos,
				currentCategory: currentVideo?.category,
			});

			// Regenerate remaining playlist with new mood
			const remainingVideos = availableVideos.filter(
				(v) => !filtered.some((f) => f.id === v.id || f.id === v._id),
			);

			const newVideos = generateMoodPlaylist(remainingVideos, {
				mood: newMood,
				maxVideos: 10,
			});

			return [...filtered, ...newVideos];
		}

		return filtered;
	}

	/**
	 * Get mood statistics
	 */
	function getMoodStats() {
		const moodCounts = {};
		moodHistory.value.forEach((entry) => {
			moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
		});

		return {
			totalSessions: moodHistory.value.length,
			moodDistribution: moodCounts,
			mostCommonMood: Object.keys(moodCounts).reduce(
				(a, b) => (moodCounts[a] > moodCounts[b] ? a : b),
				null,
			),
		};
	}

	return {
		currentMood: computed(() => currentMood.value),
		moodPlaylist: computed(() => moodPlaylist.value),
		moodTypes: computed(() => moodTypes),
		detectMood,
		generateMoodPlaylist,
		createMoodMix,
		adaptPlaylist,
		getMoodStats,
	};
}
