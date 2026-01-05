import { computed, ref } from "vue";
import { usePreferences } from "./usePreferences";
import { useStarFollows } from "./useStarFollows";
import { useWatchHistory } from "./useWatchHistory";

const SESSION_KEY = "cineflix_session";
const SESSION_DURATION = 30 * 60 * 1000; // 30 minutes

/**
 * Smart recommendations composable with CF + content-based filtering
 */
export function useRecommendations() {
	const { getWatchHistory } = useWatchHistory();
	const { stars: followedStars } = useStarFollows();
	const { getPreferredCategories } = usePreferences();

	// Session tracking
	const getSession = () => {
		try {
			const sessionData = sessionStorage.getItem(SESSION_KEY);
			if (sessionData) {
				const session = JSON.parse(sessionData);
				const now = Date.now();
				// Check if session is still valid
				if (now - session.startTime < SESSION_DURATION) {
					// Ensure categories and stars are arrays
					session.categories = Array.isArray(session.categories)
						? session.categories
						: [];
					session.stars = Array.isArray(session.stars) ? session.stars : [];
					session.watchedItems = Array.isArray(session.watchedItems)
						? session.watchedItems
						: [];
					session.durations = Array.isArray(session.durations)
						? session.durations
						: [];
					return session;
				}
			}
		} catch (err) {
			console.warn("Error reading session:", err);
		}
		// Create new session
		const newSession = {
			startTime: Date.now(),
			watchedItems: [],
			interactions: [],
			categories: [],
			stars: [],
			durations: [],
		};
		try {
			sessionStorage.setItem(SESSION_KEY, JSON.stringify(newSession));
		} catch (err) {
			console.warn("Error saving session:", err);
		}
		return newSession;
	};

	const updateSession = (item) => {
		const session = getSession();
		session.watchedItems.push({
			id: item.id || item._id,
			title: item.title,
			category: item.category || item.categories?.[0],
			stars: item.stars || [],
			duration: item.duration || 0,
			watchedAt: Date.now(),
		});

		// Convert to Sets for tracking, then back to arrays
		const categoriesSet = new Set(session.categories || []);
		const starsSet = new Set(session.stars || []);

		// Track categories
		if (item.categories) {
			item.categories.forEach((cat) => categoriesSet.add(cat.toLowerCase()));
		}
		if (item.category) {
			categoriesSet.add(item.category.toLowerCase());
		}

		// Track stars
		if (item.stars) {
			item.stars.forEach((star) => starsSet.add(star.toLowerCase()));
		}

		// Track duration
		if (item.duration) {
			session.durations.push(item.duration);
		}

		// Update session with arrays
		session.categories = Array.from(categoriesSet);
		session.stars = Array.from(starsSet);

		try {
			sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
		} catch (err) {
			console.warn("Error updating session:", err);
		}
	};

	// Content-based similarity score
	const calculateContentSimilarity = (item1, item2) => {
		let score = 0;
		let factors = 0;

		// Category/tag similarity (40% weight)
		if (item1.categories && item2.categories) {
			const categories1 = new Set(item1.categories.map((c) => c.toLowerCase()));
			const categories2 = new Set(item2.categories.map((c) => c.toLowerCase()));
			const intersection = new Set(
				[...categories1].filter((c) => categories2.has(c)),
			);
			const union = new Set([...categories1, ...categories2]);
			const jaccard = union.size > 0 ? intersection.size / union.size : 0;
			score += jaccard * 0.4;
			factors += 0.4;
		} else if (item1.category && item2.category) {
			if (item1.category.toLowerCase() === item2.category.toLowerCase()) {
				score += 0.4;
			}
			factors += 0.4;
		}

		// Star/actor similarity (30% weight)
		if (item1.stars && item2.stars) {
			const stars1 = new Set(item1.stars.map((s) => s.toLowerCase()));
			const stars2 = new Set(item2.stars.map((s) => s.toLowerCase()));
			const intersection = new Set([...stars1].filter((s) => stars2.has(s)));
			const union = new Set([...stars1, ...stars2]);
			const jaccard = union.size > 0 ? intersection.size / union.size : 0;
			score += jaccard * 0.3;
			factors += 0.3;
		}

		// Duration similarity (15% weight)
		if (item1.duration && item2.duration) {
			const durationDiff = Math.abs(item1.duration - item2.duration);
			const maxDuration = Math.max(item1.duration, item2.duration);
			const similarity = maxDuration > 0 ? 1 - durationDiff / maxDuration : 0;
			score += similarity * 0.15;
			factors += 0.15;
		}

		// Title/keyword similarity (15% weight)
		if (item1.title && item2.title) {
			const words1 = new Set(item1.title.toLowerCase().split(/\s+/));
			const words2 = new Set(item2.title.toLowerCase().split(/\s+/));
			const intersection = new Set([...words1].filter((w) => words2.has(w)));
			const union = new Set([...words1, ...words2]);
			const jaccard = union.size > 0 ? intersection.size / union.size : 0;
			score += jaccard * 0.15;
			factors += 0.15;
		}

		// Normalize score
		return factors > 0 ? score / factors : 0;
	};

	// Collaborative filtering score (simplified - based on watch history)
	const calculateCFScore = (item, watchHistory) => {
		if (!watchHistory || watchHistory.length === 0) return 0;

		let totalScore = 0;
		let count = 0;

		watchHistory.forEach((watched) => {
			// Find similar items in history
			const similarity = calculateContentSimilarity(watched, item);
			// Weight by recency (more recent watches have higher weight)
			const recency = watched.watchedAt
				? Math.max(
						0,
						1 -
							(Date.now() - new Date(watched.watchedAt).getTime()) /
								(30 * 24 * 60 * 60 * 1000),
					)
				: 0.5;
			totalScore += similarity * (0.5 + recency * 0.5);
			count++;
		});

		return count > 0 ? totalScore / count : 0;
	};

	// Session-based re-ranking
	const reRankBySession = (recommendations, session) => {
		if (!session || session.watchedItems.length === 0) return recommendations;

		return recommendations
			.map((item) => {
				let sessionScore = 0;

				// Boost items from categories watched in this session
				const sessionCategories = new Set(
					(session.categories || []).map((c) => c.toLowerCase()),
				);
				if (item.categories) {
					const categoryMatch = item.categories.some((cat) =>
						sessionCategories.has(cat.toLowerCase()),
					);
					if (categoryMatch) sessionScore += 0.3;
				}

				// Boost items with stars watched in this session
				const sessionStars = new Set(
					(session.stars || []).map((s) => s.toLowerCase()),
				);
				if (item.stars) {
					const starMatch = item.stars.some((star) =>
						sessionStars.has(star.toLowerCase()),
					);
					if (starMatch) sessionScore += 0.2;
				}

				// Boost items with similar duration to session average
				if (
					session.durations &&
					session.durations.length > 0 &&
					item.duration
				) {
					const avgDuration =
						session.durations.reduce((a, b) => a + b, 0) /
						session.durations.length;
					const durationDiff = Math.abs(item.duration - avgDuration);
					const maxDuration = Math.max(item.duration, avgDuration);
					if (maxDuration > 0) {
						const durationSimilarity = 1 - durationDiff / maxDuration;
						sessionScore += durationSimilarity * 0.2;
					}
				}

				return {
					...item,
					_sessionScore: sessionScore,
					_originalScore: item._score || 0,
					_score: (item._score || 0) + sessionScore,
				};
			})
			.sort((a, b) => (b._score || 0) - (a._score || 0));
	};

	// Diversity constraints to avoid echo chambers
	const applyDiversityConstraints = (
		recommendations,
		maxPerCategory = 3,
		maxPerStar = 2,
	) => {
		const categoryCounts = new Map();
		const starCounts = new Map();
		const diversified = [];
		const remaining = [...recommendations];

		// First pass: select diverse items
		for (const item of remaining) {
			let canAdd = true;

			// Check category diversity
			if (item.categories) {
				for (const cat of item.categories) {
					const count = categoryCounts.get(cat) || 0;
					if (count >= maxPerCategory) {
						canAdd = false;
						break;
					}
				}
			}

			// Check star diversity
			if (item.stars) {
				for (const star of item.stars) {
					const count = starCounts.get(star) || 0;
					if (count >= maxPerStar) {
						canAdd = false;
						break;
					}
				}
			}

			if (canAdd) {
				diversified.push(item);

				// Update counts
				if (item.categories) {
					item.categories.forEach((cat) => {
						categoryCounts.set(cat, (categoryCounts.get(cat) || 0) + 1);
					});
				}
				if (item.stars) {
					item.stars.forEach((star) => {
						starCounts.set(star, (starCounts.get(star) || 0) + 1);
					});
				}
			}
		}

		// Second pass: add remaining items if we have space
		const remainingItems = remaining.filter(
			(item) => !diversified.includes(item),
		);
		diversified.push(
			...remainingItems.slice(
				0,
				Math.max(0, recommendations.length - diversified.length),
			),
		);

		return diversified;
	};

	// Generate "Because you watched" recommendations
	const getBecauseYouWatched = (currentItem, allItems, limit = 12) => {
		if (!currentItem || !allItems || allItems.length === 0) return [];

		const watchHistory = getWatchHistory();
		const session = getSession();

		// Calculate scores for all items
		const scored = allItems
			.filter(
				(item) => (item.id || item._id) !== (currentItem.id || currentItem._id),
			)
			.map((item) => {
				const contentScore = calculateContentSimilarity(currentItem, item);
				const cfScore = calculateCFScore(item, watchHistory);
				const combinedScore = contentScore * 0.6 + cfScore * 0.4;

				return {
					...item,
					_score: combinedScore,
					_contentScore: contentScore,
					_cfScore: cfScore,
				};
			})
			.filter((item) => item._score > 0.1) // Filter out very low similarity
			.sort((a, b) => b._score - a._score);

		// Apply session-based re-ranking
		const reRanked = reRankBySession(scored, session);

		// Apply diversity constraints
		const diversified = applyDiversityConstraints(reRanked, 3, 2);

		return diversified.slice(0, limit);
	};

	// Get trending by region/time-of-day
	const getTrendingByContext = (allItems, limit = 12) => {
		if (!allItems || allItems.length === 0) return [];

		const now = new Date();
		const hour = now.getHours();
		const dayOfWeek = now.getDay();

		// Time-of-day preferences (simplified)
		const timeOfDayMultiplier = (item) => {
			// Morning (6-12): prefer shorter content
			if (hour >= 6 && hour < 12) {
				return item.duration && item.duration < 1800 ? 1.2 : 0.9;
			}
			// Afternoon (12-18): prefer medium content
			if (hour >= 12 && hour < 18) {
				return item.duration && item.duration >= 1800 && item.duration < 3600
					? 1.2
					: 1.0;
			}
			// Evening (18-24): prefer longer content
			if (hour >= 18 && hour < 24) {
				return item.duration && item.duration >= 3600 ? 1.2 : 1.0;
			}
			// Night (0-6): prefer shorter content
			return item.duration && item.duration < 1800 ? 1.1 : 0.9;
		};

		// Region-based (simplified - would use geolocation in production)
		const regionMultiplier = (item) => {
			// Could boost content popular in user's region
			// For now, return 1.0 (no regional boost)
			return 1.0;
		};

		const watchHistory = getWatchHistory();
		const preferredCategories = getPreferredCategories();

		// Score items
		const scored = allItems
			.map((item) => {
				// Base score from views/rating
				const baseScore = (item.views || 0) * 0.0001 + (item.rating || 0) * 0.1;

				// Recency boost
				const recencyBoost =
					item.createdAt || item.uploadedAt || item.added
						? Math.max(
								0,
								1 -
									(Date.now() -
										new Date(
											item.createdAt || item.uploadedAt || item.added,
										).getTime()) /
										(7 * 24 * 60 * 60 * 1000),
							)
						: 0;

				// Preference boost
				const preferenceBoost =
					preferredCategories.length > 0 && item.categories
						? item.categories.some((cat) =>
								preferredCategories.includes(cat.toLowerCase()),
							)
							? 0.3
							: 0
						: 0;

				// Time-of-day boost
				const timeBoost = timeOfDayMultiplier(item);

				// Region boost
				const regionBoost = regionMultiplier(item);

				// CF boost
				const cfBoost = calculateCFScore(item, watchHistory) * 0.2;

				const finalScore =
					(baseScore + recencyBoost * 0.3 + preferenceBoost + cfBoost) *
					timeBoost *
					regionBoost;

				return {
					...item,
					_score: finalScore,
				};
			})
			.sort((a, b) => b._score - a._score);

		// Apply diversity
		const diversified = applyDiversityConstraints(scored, 4, 3);

		return diversified.slice(0, limit);
	};

	// Get personalized recommendations
	const getPersonalized = (allItems, limit = 12) => {
		if (!allItems || allItems.length === 0) return [];

		const watchHistory = getWatchHistory();
		const session = getSession();
		const preferredCategories = getPreferredCategories();
		const followedStarsList = followedStars.value || [];

		const scored = allItems
			.map((item) => {
				// Content-based score
				let contentScore = 0;

				// Category preference
				if (preferredCategories.length > 0 && item.categories) {
					const categoryMatch = item.categories.some((cat) =>
						preferredCategories.includes(cat.toLowerCase()),
					);
					if (categoryMatch) contentScore += 0.4;
				}

				// Star preference
				if (followedStarsList.length > 0 && item.stars) {
					const starMatch = item.stars.some((star) =>
						followedStarsList.includes(star.toLowerCase()),
					);
					if (starMatch) contentScore += 0.3;
				}

				// CF score
				const cfScore = calculateCFScore(item, watchHistory);

				// Combined score
				const combinedScore = contentScore * 0.5 + cfScore * 0.5;

				return {
					...item,
					_score: combinedScore,
					_contentScore: contentScore,
					_cfScore: cfScore,
				};
			})
			.filter((item) => item._score > 0.1)
			.sort((a, b) => b._score - a._score);

		// Session re-ranking
		const reRanked = reRankBySession(scored, session);

		// Diversity
		const diversified = applyDiversityConstraints(reRanked, 3, 2);

		return diversified.slice(0, limit);
	};

	return {
		getBecauseYouWatched,
		getTrendingByContext,
		getPersonalized,
		updateSession,
		getSession,
	};
}
