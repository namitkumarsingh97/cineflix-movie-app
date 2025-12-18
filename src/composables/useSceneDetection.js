import { computed, ref } from "vue";
import { useFavorites, useWatchHistory } from "./useWatchHistory";

/**
 * AI Scene Detection & Auto-Skip
 * Advanced scene detection with smart skip functionality
 */
export function useSceneDetection() {
	const { getWatchHistory } = useWatchHistory();
	const { getFavorites } = useFavorites();

	const detectedScenes = ref([]);
	const scenePreferences = ref({
		autoSkipTo: null, // 'action', 'climax', 'foreplay', null
		skipForeplay: false,
		skipIntro: true,
		preferredScenes: [], // Scene indices user prefers
		skipPatterns: [], // Patterns of what user skips
	});

	/**
	 * Detect scenes in a video using AI/ML (simulated for now)
	 * In production, this would use computer vision API
	 */
	function detectScenes(video, options = {}) {
		if (!video || !video.duration) {
			detectedScenes.value = [];
			return [];
		}

		const {
			minSceneDuration = 30, // Minimum 30 seconds per scene
			maxScenes = 20,
			useAI = true,
		} = options;

		const duration = video.duration;
		const scenes = [];

		if (useAI) {
			// Simulate AI-based scene detection
			// In production, this would call a computer vision API
			scenes.push(
				...simulateAISceneDetection(
					video,
					duration,
					minSceneDuration,
					maxScenes,
				),
			);
		} else {
			// Fallback: time-based scene detection
			scenes.push(
				...timeBasedSceneDetection(video, duration, minSceneDuration),
			);
		}

		// Sort scenes by start time
		scenes.sort((a, b) => a.startTime - b.startTime);

		detectedScenes.value = scenes;
		return scenes;
	}

	/**
	 * Simulate AI scene detection (would use ML model in production)
	 */
	function simulateAISceneDetection(video, duration, minDuration, maxScenes) {
		const scenes = [];
		const categories = video.categories || [];
		const title = (video.title || "").toLowerCase();

		// Detect scene types based on video metadata
		const hasForeplay =
			title.includes("foreplay") ||
			categories.some((c) =>
				["romantic", "soft", "teasing"].includes(c.toLowerCase()),
			);
		const hasAction =
			title.includes("action") ||
			categories.some((c) =>
				["hardcore", "intense", "rough"].includes(c.toLowerCase()),
			);
		const hasClimax =
			title.includes("climax") ||
			categories.some((c) =>
				["climax", "finish", "ending"].includes(c.toLowerCase()),
			);

		let currentTime = 0;
		let sceneIndex = 0;

		// Opening/Intro scene (0-10% of video)
		if (duration > 60) {
			const introEnd = Math.min(duration * 0.1, 120);
			scenes.push({
				id: `scene_${sceneIndex++}`,
				startTime: 0,
				endTime: introEnd,
				duration: introEnd,
				type: "intro",
				label: "Introduction",
				intensity: "low",
				skipRecommended: scenePreferences.value.skipIntro,
				thumbnail: generateSceneThumbnail(video, introEnd / 2),
			});
			currentTime = introEnd;
		}

		// Foreplay scene (if detected)
		if (hasForeplay && currentTime < duration * 0.3) {
			const foreplayEnd = Math.min(
				currentTime + duration * 0.2,
				duration * 0.3,
			);
			scenes.push({
				id: `scene_${sceneIndex++}`,
				startTime: currentTime,
				endTime: foreplayEnd,
				duration: foreplayEnd - currentTime,
				type: "foreplay",
				label: "Foreplay",
				intensity: "medium",
				skipRecommended: scenePreferences.value.skipForeplay,
				thumbnail: generateSceneThumbnail(
					video,
					(currentTime + foreplayEnd) / 2,
				),
			});
			currentTime = foreplayEnd;
		}

		// Main action scenes (30-80% of video)
		const actionStart = currentTime;
		const actionEnd = duration * 0.8;
		const actionDuration = actionEnd - actionStart;

		if (actionDuration > minDuration) {
			// Split into multiple action scenes
			const numActionScenes = Math.min(
				Math.floor(actionDuration / (minDuration * 2)),
				maxScenes - sceneIndex - 2, // Reserve space for climax
			);

			const sceneDuration = actionDuration / numActionScenes;

			for (let i = 0; i < numActionScenes && currentTime < actionEnd; i++) {
				const sceneEnd = Math.min(currentTime + sceneDuration, actionEnd);
				scenes.push({
					id: `scene_${sceneIndex++}`,
					startTime: currentTime,
					endTime: sceneEnd,
					duration: sceneEnd - currentTime,
					type: hasAction ? "action" : "main",
					label: hasAction ? `Action Scene ${i + 1}` : `Scene ${i + 1}`,
					intensity: hasAction ? "high" : "medium",
					skipRecommended: false,
					thumbnail: generateSceneThumbnail(
						video,
						(currentTime + sceneEnd) / 2,
					),
				});
				currentTime = sceneEnd;
			}
		}

		// Climax/Finale scene (last 20% of video)
		if (currentTime < duration && duration - currentTime > minDuration) {
			scenes.push({
				id: `scene_${sceneIndex++}`,
				startTime: currentTime,
				endTime: duration,
				duration: duration - currentTime,
				type: hasClimax ? "climax" : "finale",
				label: hasClimax ? "Climax" : "Finale",
				intensity: "high",
				skipRecommended: false,
				thumbnail: generateSceneThumbnail(video, (currentTime + duration) / 2),
			});
		}

		return scenes;
	}

	/**
	 * Time-based scene detection (fallback)
	 */
	function timeBasedSceneDetection(video, duration, minDuration) {
		const scenes = [];
		const sceneDuration = Math.max(minDuration, duration / 10); // ~10 scenes
		let currentTime = 0;
		let sceneIndex = 0;

		while (currentTime < duration) {
			const sceneEnd = Math.min(currentTime + sceneDuration, duration);
			scenes.push({
				id: `scene_${sceneIndex++}`,
				startTime: currentTime,
				endTime: sceneEnd,
				duration: sceneEnd - currentTime,
				type: "generic",
				label: `Scene ${sceneIndex}`,
				intensity: "medium",
				skipRecommended: false,
				thumbnail: generateSceneThumbnail(video, (currentTime + sceneEnd) / 2),
			});
			currentTime = sceneEnd;
		}

		return scenes;
	}

	/**
	 * Generate scene thumbnail
	 */
	function generateSceneThumbnail(video, time) {
		if (video.thumbnail) {
			// Try to get frame at specific time
			return `${video.thumbnail}?t=${Math.floor(time)}`;
		}
		return video.thumbnail || null;
	}

	/**
	 * Analyze user skip patterns to learn preferences
	 */
	function analyzeSkipPatterns() {
		const history = getWatchHistory();
		const skipPatterns = [];

		// Analyze which scenes users typically skip
		history.forEach((item) => {
			if (item.skipData) {
				skipPatterns.push({
					videoId: item.id,
					skippedScenes: item.skipData.skippedScenes || [],
					watchedScenes: item.skipData.watchedScenes || [],
				});
			}
		});

		// Update preferences based on patterns
		const skipCounts = {
			intro: 0,
			foreplay: 0,
			action: 0,
			climax: 0,
		};

		skipPatterns.forEach((pattern) => {
			pattern.skippedScenes.forEach((sceneType) => {
				if (Object.hasOwn(skipCounts, sceneType)) {
					skipCounts[sceneType]++;
				}
			});
		});

		// Auto-update preferences if user consistently skips certain scenes
		if (skipCounts.intro > skipPatterns.length * 0.7) {
			scenePreferences.value.skipIntro = true;
		}
		if (skipCounts.foreplay > skipPatterns.length * 0.7) {
			scenePreferences.value.skipForeplay = true;
		}

		return skipPatterns;
	}

	/**
	 * Get recommended skip time based on preferences
	 */
	function getRecommendedSkipTime(video) {
		if (!detectedScenes.value.length) {
			detectScenes(video);
		}

		const scenes = detectedScenes.value;

		// If user wants to skip to action
		if (scenePreferences.value.autoSkipTo === "action") {
			const actionScene = scenes.find(
				(s) => s.type === "action" || s.intensity === "high",
			);
			if (actionScene) {
				return actionScene.startTime;
			}
		}

		// If user wants to skip to climax
		if (scenePreferences.value.autoSkipTo === "climax") {
			const climaxScene = scenes.find((s) => s.type === "climax");
			if (climaxScene) {
				return climaxScene.startTime;
			}
		}

		// Skip intro if enabled
		if (scenePreferences.value.skipIntro) {
			const introScene = scenes.find((s) => s.type === "intro");
			if (introScene) {
				return introScene.endTime;
			}
		}

		// Skip foreplay if enabled
		if (scenePreferences.value.skipForeplay) {
			const foreplayScene = scenes.find((s) => s.type === "foreplay");
			if (foreplayScene) {
				return foreplayScene.endTime;
			}
		}

		return null;
	}

	/**
	 * Create highlight reel from best scenes
	 */
	function createHighlightReel(video, maxDuration = 300) {
		if (!detectedScenes.value.length) {
			detectScenes(video);
		}

		const scenes = detectedScenes.value;

		// Prioritize high-intensity scenes
		const highIntensityScenes = scenes
			.filter((s) => s.intensity === "high")
			.sort((a, b) => b.duration - a.duration);

		// If not enough high-intensity, add medium-intensity
		const selectedScenes = [...highIntensityScenes];
		if (selectedScenes.reduce((sum, s) => sum + s.duration, 0) < maxDuration) {
			const mediumScenes = scenes
				.filter((s) => s.intensity === "medium" && !selectedScenes.includes(s))
				.sort((a, b) => b.duration - a.duration);

			selectedScenes.push(...mediumScenes);
		}

		// Limit total duration
		let totalDuration = 0;
		const highlightReel = [];
		for (const scene of selectedScenes) {
			if (totalDuration + scene.duration <= maxDuration) {
				highlightReel.push(scene);
				totalDuration += scene.duration;
			}
		}

		return highlightReel.sort((a, b) => a.startTime - b.startTime);
	}

	/**
	 * Set user preferences
	 */
	function setPreferences(preferences) {
		scenePreferences.value = {
			...scenePreferences.value,
			...preferences,
		};

		// Save to localStorage
		try {
			localStorage.setItem(
				"scenePreferences",
				JSON.stringify(scenePreferences.value),
			);
		} catch (error) {
			console.error("Error saving scene preferences:", error);
		}
	}

	/**
	 * Load preferences from localStorage
	 */
	function loadPreferences() {
		try {
			const saved = localStorage.getItem("scenePreferences");
			if (saved) {
				scenePreferences.value = {
					...scenePreferences.value,
					...JSON.parse(saved),
				};
			}
		} catch (error) {
			console.error("Error loading scene preferences:", error);
		}
	}

	// Load preferences on initialization
	loadPreferences();

	return {
		detectedScenes: computed(() => detectedScenes.value),
		scenePreferences: computed(() => scenePreferences.value),
		detectScenes,
		analyzeSkipPatterns,
		getRecommendedSkipTime,
		createHighlightReel,
		setPreferences,
		loadPreferences,
	};
}
